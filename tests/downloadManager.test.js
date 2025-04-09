const fs = require('fs');
const path = require('path');
const { downloadGame, extractZip } = require('../src/js/downloadManager');
const { diabolicalLauncherPath } = require('../src/js/settings');
const { getLatestGameVersion } = require('../src/js/versionChecker');
const { getMainWindow } = require('../src/js/windowManager');

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('../src/js/versionChecker');
jest.mock('../src/js/windowManager');
jest.mock('electron-dl', () => ({
    download: jest.fn(),
}));
jest.mock('extract-zip', () => jest.fn());

describe('Download Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window manager for all tests
        getMainWindow.mockReturnValue({
            webContents: {
                send: jest.fn(),
            },
        });
    });

    describe('downloadGame', () => {
        it('should handle successful game download and extraction', async () => {
            const event = { sender: { send: jest.fn() } };
            const gameId = 'test-game';
            const latestVersion = '1.0.0';
            const latestVersionUrl = 'http://example.com/game.zip';
            const savePath = '/path/to/downloaded.zip';
            const extractPath = path.join(diabolicalLauncherPath, gameId);

            // Mock version checker
            getLatestGameVersion.mockResolvedValue({
                latestVersion,
                latestVersionUrl,
            });

            // Mock download
            const mockDownload = {
                getSavePath: () => savePath,
            };
            require('electron-dl').download.mockResolvedValue(mockDownload);

            // Mock extraction
            require('extract-zip').mockResolvedValue(undefined);

            await downloadGame(event, gameId);

            // Verify download was initiated
            expect(require('electron-dl').download).toHaveBeenCalledWith(
                expect.any(Object),
                latestVersionUrl,
                expect.objectContaining({
                    directory: diabolicalLauncherPath,
                })
            );

            // Verify extraction was performed
            expect(require('extract-zip')).toHaveBeenCalledWith(
                savePath,
                expect.objectContaining({ dir: extractPath })
            );

            // Verify version file was written
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.any(String),
                JSON.stringify({ version: latestVersion })
            );

            // Verify success messages were sent
            expect(event.sender.send).toHaveBeenCalledWith('download-complete', gameId);
        });

        it('should handle download errors gracefully', async () => {
            const event = { sender: { send: jest.fn() } };
            const gameId = 'test-game';
            const error = new Error('Download failed');

            // Mock version checker
            getLatestGameVersion.mockResolvedValue({
                latestVersion: '1.0.0',
                latestVersionUrl: 'http://example.com/game.zip',
            });

            // Mock download to fail
            require('electron-dl').download.mockRejectedValue(error);

            try {
                await downloadGame(event, gameId);
                throw new Error('Expected error was not thrown');
            } catch (err) {
                expect(err).toBe(error);
            }

            // Verify error was handled
            expect(event.sender.send).toHaveBeenCalledWith(
                'download-error',
                gameId,
                error.message
            );
        });

        it('should handle missing version information', async () => {
            const event = { sender: { send: jest.fn() } };
            const gameId = 'test-game';

            // Mock version checker to return no version info
            getLatestGameVersion.mockResolvedValue({
                latestVersion: null,
                latestVersionUrl: null,
            });

            try {
                await downloadGame(event, gameId);
                throw new Error('Expected error was not thrown');
            } catch (err) {
                expect(err.message).toBe('Latest version information is missing.');
            }

            // Verify notification was shown
            expect(getMainWindow().webContents.send).toHaveBeenCalledWith(
                'show-notification',
                expect.objectContaining({
                    title: 'Game Unavailable',
                    body: 'Please try again later',
                })
            );
        });
    });

    describe('extractZip', () => {
        it('should handle successful extraction', async () => {
            const event = { sender: { send: jest.fn() } };
            const gameId = 'test-game';
            const zipPath = '/path/to/game.zip';
            const extractPath = path.join(diabolicalLauncherPath, gameId);

            // Mock successful extraction
            require('extract-zip').mockResolvedValue(undefined);

            const result = await extractZip(zipPath, gameId, event);

            // Verify extraction was performed
            expect(require('extract-zip')).toHaveBeenCalledWith(
                zipPath,
                expect.objectContaining({ dir: extractPath })
            );

            // Verify zip was deleted
            expect(fs.unlinkSync).toHaveBeenCalledWith(zipPath);

            // Verify success message was sent
            expect(event.sender.send).toHaveBeenCalledWith('download-complete', gameId);

            // Verify correct path was returned
            expect(result).toBe(extractPath);
        });

        it('should handle extraction errors', async () => {
            const event = { sender: { send: jest.fn() } };
            const gameId = 'test-game';
            const zipPath = '/path/to/game.zip';
            const error = new Error('Extraction failed');

            // Mock failed extraction
            require('extract-zip').mockRejectedValue(error);

            try {
                await extractZip(zipPath, gameId, event);
                throw new Error('Expected error was not thrown');
            } catch (err) {
                expect(err).toBe(error);
            }

            // Verify error was handled
            expect(event.sender.send).toHaveBeenCalledWith(
                'download-error',
                gameId,
                'Extraction failed'
            );
        });
    });
}); 