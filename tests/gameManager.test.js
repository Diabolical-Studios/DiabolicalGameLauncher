const fs = require('fs');
const path = require('path');
const { uninstallGame, getInstalledGames, showContextMenu } = require('../src/js/gameManager');
const { diabolicalLauncherPath } = require('../src/js/settings');

// Mock fs module
jest.mock('fs');
jest.mock('electron', () => {
    const mockMenu = {
        popup: jest.fn()
    };
    return {
        Menu: {
            buildFromTemplate: jest.fn(() => mockMenu),
        },
        shell: {
            showItemInFolder: jest.fn(),
        },
        BrowserWindow: {
            fromWebContents: jest.fn(() => ({
                webContents: {}
            })),
        },
    };
});

describe('Game Manager', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('getInstalledGames', () => {
        it('should return empty array when launcher path does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            const games = getInstalledGames();
            expect(games).toEqual([]);
            expect(fs.mkdirSync).toHaveBeenCalledWith(diabolicalLauncherPath, { recursive: true });
        });

        it('should return list of installed games', () => {
            fs.existsSync.mockReturnValue(true);
            const mockDirs = [
                { name: 'game1', isDirectory: () => true },
                { name: 'game2', isDirectory: () => true },
                { name: 'file.txt', isDirectory: () => false },
            ];
            fs.readdirSync.mockReturnValue(mockDirs);

            const games = getInstalledGames();
            expect(games).toEqual(['game1', 'game2']);
        });

        it('should handle readdirSync errors gracefully', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockImplementation(() => {
                throw new Error('Read error');
            });

            const games = getInstalledGames();
            expect(games).toEqual([]);
        });
    });

    describe('uninstallGame', () => {
        it('should remove game directory when it exists', () => {
            const gameId = 'test-game';
            const gamePath = path.join(diabolicalLauncherPath, gameId);
            fs.existsSync.mockReturnValue(true);

            uninstallGame(gameId);
            expect(fs.rmSync).toHaveBeenCalledWith(gamePath, { recursive: true });
        });

        it('should handle non-existent game gracefully', () => {
            const gameId = 'non-existent-game';
            fs.existsSync.mockReturnValue(false);

            uninstallGame(gameId);
            expect(fs.rmSync).not.toHaveBeenCalled();
        });
    });

    describe('showContextMenu', () => {
        it('should show appropriate menu for installed game', () => {
            const event = { sender: {} };
            const gameId = 'installed-game';
            const position = { x: 100, y: 100 };
            fs.existsSync.mockReturnValue(true);

            showContextMenu(event, gameId, position);
            
            const mockMenu = require('electron').Menu.buildFromTemplate();
            expect(mockMenu.popup).toHaveBeenCalledWith({
                window: expect.any(Object),
                x: position.x,
                y: position.y
            });
        });

        it('should show appropriate menu for non-installed game', () => {
            const event = { sender: {} };
            const gameId = 'non-installed-game';
            const position = { x: 100, y: 100 };
            fs.existsSync.mockReturnValue(false);

            showContextMenu(event, gameId, position);
            
            const mockMenu = require('electron').Menu.buildFromTemplate();
            expect(mockMenu.popup).toHaveBeenCalledWith({
                window: expect.any(Object),
                x: position.x,
                y: position.y
            });
        });
    });
}); 