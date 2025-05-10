import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import { Box, Stack, Tooltip, Zoom } from '@mui/material';

const StatusBar = () => {
  const [appVersion, setAppVersion] = useState('');
  const [message, setMessage] = useState('Diabolical Launcher');

  const [statuses, setStatuses] = useState({
    diabolicalOracleBucket: 'gray',
    diabolicalApi: 'gray',
    diabolicalLauncher: 'gray',
    diabolicalGithub: 'gray',
    diabolicalCloudflareBucket: 'gray',
  });

  useEffect(() => {
    if (window.versions) {
      window.versions.getAppVersion().then(version => {
        // hostname will be…
        //   localhost:8888           ← npm start (live-reload dev)
        //   dev.launcher…            ← packaged "dev" build
        //   launcher…                ← packaged production build
        const host = window.location.hostname; // "localhost" | "dev.launcher.diabolical.studio" | "launcher.diabolical.studio"
        const isDev = host === 'localhost' || host.startsWith('dev.');
        setAppVersion(`${isDev ? 'beta' : 'v'}${version}`); // "dev0.3.1"  or  "v0.3.1"
      });
    }

    // Simulate async status fetches
    const checkStatus = async () => {
      const realPing = async url => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // Optional: timeout after 3s

          clearTimeout(timeoutId);
          return true; // If we reach here, it's considered up
        } catch {
          return false;
        }
      };

      const [
        diabolicalOracleBucket,
        diabolicalApi,
        diabolicalLauncher,
        diabolicalGithub,
        diabolicalCloudflareBucket,
      ] = await Promise.all([
        realPing('https://objectstorage.eu-frankfurt-1.oraclecloud.com/...'),
        realPing('https://api.diabolical.studio'),
        realPing('https://launcher.diabolical.studio'),
        realPing('https://github.com/Diabolical-Studios/DiabolicalGameLauncher/'),
        realPing('https://diabolical.services'),
      ]);

      const newStatuses = {
        diabolicalOracleBucket: diabolicalOracleBucket ? 'green' : 'red',
        diabolicalApi: diabolicalApi ? 'green' : 'red',
        diabolicalLauncher: diabolicalLauncher ? 'green' : 'red',
        diabolicalGithub: diabolicalGithub ? 'green' : 'red',
        diabolicalCloudflareBucket: diabolicalCloudflareBucket ? 'green' : 'red',
      };

      setStatuses(newStatuses);
    };

    checkStatus();

    if (window.api) {
      window.api.onDbStatusChange(color => {
        console.log(`Received new status color: ${color}`);
      });

      window.api.onUpdateMessage(msg => {
        console.log(`Received new message: ${msg}`);
        setMessage(msg);
      });
    }
  }, []);

  const allUp = Object.values(statuses).every(color => color === 'green');
  const allDown = Object.values(statuses).every(color => color === 'red');

  let mainColor = 'gray';
  if (allUp) mainColor = 'green';
  else if (allDown) mainColor = 'red';
  else mainColor = 'yellow';

  return (
    <Zoom
      in={true}
      timeout={200}
      style={{
        transitionDelay: '150ms',
      }}
    >
      <div>
        <div
          className={
            'hover-effect flex position-relative align-center items-center h-fit p-3 border rounded-sm gap-3 cursor-pointer backdrop-blur'
          }
          style={{
            borderColor: colors.border,
            maxWidth: '800px',
          }}
          title={window.location.href}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
        >
          <div id="message" style={{ whiteSpace: 'nowrap', color: colors.text }}>
            {message}
          </div>

          <Tooltip
            title={
              <Stack spacing={1} sx={{ padding: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={10}
                    height={10}
                    borderRadius="50%"
                    bgcolor={statuses.diabolicalOracleBucket}
                  />
                  <span>Oracle Bucket</span>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={10} height={10} borderRadius="50%" bgcolor={statuses.diabolicalApi} />
                  <span>Diabolical Api</span>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={10}
                    height={10}
                    borderRadius="50%"
                    bgcolor={statuses.diabolicalLauncher}
                  />
                  <span>Diabolical Launcher</span>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={10}
                    height={10}
                    borderRadius="50%"
                    bgcolor={statuses.diabolicalGithub}
                  />
                  <span>Diabolical Github</span>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={10}
                    height={10}
                    borderRadius="50%"
                    bgcolor={statuses.diabolicalCloudflareBucket}
                  />
                  <span>Cloudflare Bucket</span>
                </Box>
              </Stack>
            }
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: '#212121', // ← your custom background
                  color: '#ffffff', // ← optional: text color
                  border: '1px solid #333', // ← optional: border
                  fontSize: '14px',
                },
              },
              arrow: {
                sx: {
                  color: '#212121',
                },
              },
            }}
          >
            <div
              className={'w-3 h-3 rounded-xl'}
              style={{
                backgroundColor: mainColor,
                animation: 'blink 2s infinite',
                boxShadow: `0 0 12px ${mainColor}`,
              }}
            ></div>
          </Tooltip>

          <span style={{ color: colors.text }} id="launcher-version-number">
            {appVersion}
          </span>
        </div>
      </div>
    </Zoom>
  );
};

export default StatusBar;
