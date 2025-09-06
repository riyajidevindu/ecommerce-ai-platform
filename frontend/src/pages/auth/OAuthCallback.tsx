import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { setAuthToken, getCurrentUser } from '@/services/api';
import { LoadingState } from '@/components/common/LoadingState';

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth(); // Assuming a function to handle token login

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('access_token');

      if (accessToken) {
        await loginWithToken(accessToken);
        navigate('/dashboard', { replace: true });
      } else {
        // Handle error: No token found
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [location, navigate, loginWithToken]);

  return <LoadingState />;
};

export default OAuthCallback;
