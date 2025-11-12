import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        products: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive data
    const { password, ...userProfile } = user;

    res.json({ user: userProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar },
      include: { subscription: true }
    });

    // Remove sensitive data
    const { password, ...userProfile } = user;

    res.json({
      message: 'Profile updated successfully',
      user: userProfile
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;