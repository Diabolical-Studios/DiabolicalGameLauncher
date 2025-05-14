import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';
import AccountDashboard from '../components/account/AccountDashboard';
import LoginScreen from '../components/account/LoginScreen';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

const saveInstallationPair = (installationId, accessToken) => {
  let count = 1;
  while (Cookies.get(`githubInstallationId${count}`)) count++;

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  Cookies.set(`githubInstallationId${count}`, installationId, {
    secure: true,
    sameSite: 'Strict',
    expires: expiresAt,
  });

  Cookies.set(`githubAccessToken${count}`, accessToken, {
    secure: true,
    sameSite: 'Strict',
    expires: expiresAt,
  });
};

export const getAllInstallationPairs = () => {
  const pairs = [];
  let count = 1;

  while (true) {
    const installationId = Cookies.get(`githubInstallationId${count}`);
    const accessToken = Cookies.get(`githubAccessToken${count}`);

    if (!installationId || !accessToken) break;

    pairs.push({ installationId, accessToken });
    count++;
  }

  return pairs;
};

export default function AccountPage() {
  const [username, setUsername] = useState(Cookies.get('username') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('sessionID'));
  const [checkingSession, setCheckingSession] = useState(true);
  const location = useLocation();

  const cookieOptions = React.useMemo(() => ({ expires: 7, secure: true, sameSite: 'Strict' }), []);

  useEffect(() => {
    const handleSession = async () => {
      // First, check for auth callback parameters
      const params = new URLSearchParams(location.search);
      const sessionIDParam = params.get('sessionID');
      const usernameParam = params.get('username');
      const githubIdParam = params.get('githubID');

      if (sessionIDParam && usernameParam && githubIdParam) {
        // Handle auth callback
        Cookies.set('sessionID', sessionIDParam, cookieOptions);
        Cookies.set('username', usernameParam, cookieOptions);
        Cookies.set('githubID', githubIdParam, cookieOptions);

        setUsername(usernameParam);
        setIsLoggedIn(true);
        setCheckingSession(false);

        // Clear the URL parameters after setting cookies
        window.history.replaceState({}, document.title, '/account');
        return;
      }

      // If no auth callback, verify existing session
      const sessionID = Cookies.get('sessionID');
      if (!sessionID) {
        setCheckingSession(false);
        setIsLoggedIn(false);
        return;
      }

      try {
        const res = await fetch('/verify-session', {
          method: 'GET',
          headers: { sessionid: sessionID },
        });

        if (!res.ok) {
          Cookies.remove('sessionID');
          Cookies.remove('username');
          Cookies.remove('githubID');
          setUsername('');
          setIsLoggedIn(false);
        } else {
          await res.json();
          setIsLoggedIn(true);
        }
      } catch (error) {
        Cookies.remove('sessionID');
        Cookies.remove('username');
        Cookies.remove('githubID');
        setUsername('');
        setIsLoggedIn(false);
      } finally {
        setCheckingSession(false);
      }
    };

    handleSession();
  }, [location.search, cookieOptions]);

  useEffect(() => {
    if (
      window.api &&
      window.electronAPI &&
      typeof window.electronAPI.onProtocolData === 'function'
    ) {
      window.electronAPI.onProtocolData((action, data) => {
        if (action === 'auth') {
          // Use provider from data
          const provider = data && data.provider ? data.provider.toLowerCase() : 'unknown';

          let protocolName = 'OAuth';
          switch (provider) {
            case 'patreon':
              protocolName = 'Patreon OAuth';
              break;
            case 'github':
              protocolName = 'GitHub OAuth';
              break;
            case 'steam':
              protocolName = 'Steam OAuth';
              break;
            case 'discord':
              protocolName = 'Discord OAuth';
              break;
            default:
              protocolName = 'OAuth';
          }

          if (window.electronAPI) {
            window.electronAPI.showCustomNotification(protocolName, 'Successfully Authorized!');
          }

          // Handle each provider's data
          switch (provider) {
            case 'github':
              Cookies.set('sessionID', data.sessionID, cookieOptions);
              Cookies.set('username', data.username, cookieOptions);
              Cookies.set('githubID', data.githubID, cookieOptions);
              setUsername(data.username);
              setIsLoggedIn(true);
              window.dispatchEvent(new Event('external-auth-success'));
              break;
            case 'patreon':
              if (data.code) {
                Cookies.set('patreonAuthCode', data.code, cookieOptions);
              }
              window.dispatchEvent(new Event('external-auth-success'));
              break;
            case 'steam':
              // Handle Steam-specific logic here
              window.dispatchEvent(new Event('external-auth-success'));
              break;
            case 'discord':
              // Handle Discord-specific logic here
              window.dispatchEvent(new Event('external-auth-success'));
              break;
            default:
              // Handle unknown or generic OAuth
              window.dispatchEvent(new Event('external-auth-success'));
              break;
          }
        }
        if (action === 'github-app') {
          if (window.electronAPI) {
            window.electronAPI.showCustomNotification('GitHub App', 'Successfully authorized!');
          }
          // Find if this installation exists and update it
          let found = false;
          let count = 1;
          while (Cookies.get(`githubInstallationId${count}`)) {
            if (Cookies.get(`githubInstallationId${count}`) === data.githubInstallationId) {
              // Update existing installation with new token
              Cookies.set(`githubAccessToken${count}`, data.githubAccessToken, cookieOptions);
              found = true;
              break;
            }
            count++;
          }

          // If not found, save as new installation
          if (!found) {
            saveInstallationPair(data.githubInstallationId, data.githubAccessToken);
          }
        }
      });
    }
  }, [cookieOptions]);

  if (checkingSession) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            isLoggedIn ? (
              <Navigate to="/account/dashboard" replace />
            ) : (
              <Navigate to="/account/login" replace />
            )
          }
        />
        <Route
          path="login"
          element={isLoggedIn ? <Navigate to="/account/dashboard" replace /> : <LoginScreen />}
        />
        <Route
          path="dashboard/*"
          element={
            isLoggedIn ? (
              <AccountDashboard username={username} />
            ) : (
              <Navigate to="/account/login" replace />
            )
          }
        />
      </Route>
    </Routes>
  );
}
