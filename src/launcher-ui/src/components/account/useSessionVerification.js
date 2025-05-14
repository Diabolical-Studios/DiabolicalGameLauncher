import { useEffect } from 'react';
import Cookies from 'js-cookie';

export const useSessionVerification = () => {
  useEffect(() => {
    const verifySession = async () => {
      const sessionID = Cookies.get('sessionID');
      if (!sessionID) {
        // Use proper logout sequence
        Cookies.remove('username');
        Cookies.remove('sessionID');
        Cookies.remove('githubID');
        window.location.reload();
        return;
      }

      try {
        const response = await fetch('/verify-session', {
          method: 'GET',
          headers: { sessionid: sessionID },
        });

        if (!response.ok) {
          // Use proper logout sequence
          Cookies.remove('username');
          Cookies.remove('sessionID');
          Cookies.remove('githubID');
          window.location.reload();
          return;
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        // Use proper logout sequence
        Cookies.remove('username');
        Cookies.remove('sessionID');
        Cookies.remove('githubID');
        window.location.reload();
      }
    };

    // Run verification in background
    verifySession();
  }, []);

  // Don't block rendering while verifying
  return { isVerifying: false };
};
