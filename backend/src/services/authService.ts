import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  static async register(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'email',
        subscription: {
          create: {
            planId: 'free',
            status: 'ACTIVE'
          }
        }
      },
      include: { subscription: true }
    });

    // Create session token
    const token = this.generateToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    return { user, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    return { user, token };
  }

  static async loginOrRegisterOAuth(provider: string, providerId: string, email: string, name: string, avatar?: string) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { AND: [{ provider }, { providerId }] }
        ]
      },
      include: { subscription: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          provider,
          providerId,
          emailVerified: true,
          subscription: {
            create: {
              planId: 'free',
              status: 'ACTIVE'
            }
          }
        },
        include: { subscription: true }
      });
    }

    const token = this.generateToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    return { user, token };
  }

  static async logout(token: string) {
    await prisma.session.deleteMany({ where: { token } });
  }

  private static generateToken(user: any) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }
}