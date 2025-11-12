import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark text-white">
      <div>Processing authentication...</div>
    </div>
  );
};

export default AuthCallbackPage;