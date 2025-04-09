const axios = require('axios');
const { pingDatabase } = require('../src/js/database');
const { getMainWindow } = require('../src/js/windowManager');

// Mock dependencies
jest.mock('axios');
jest.mock('../src/js/windowManager');

describe('Database', () => {
    let mockWindow;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window manager for all tests
        mockWindow = {
            webContents: {
                send: jest.fn(),
            },
        };
        getMainWindow.mockReturnValue(mockWindow);
    });

    describe('pingDatabase', () => {
        it('should handle successful database ping', async () => {
            const url = 'http://example.com';
            const mockResponse = { status: 200 };

            // Mock axios response
            axios.get.mockResolvedValue(mockResponse);

            await pingDatabase(url);

            // Verify axios was called
            expect(axios.get).toHaveBeenCalledWith(url);

            // Verify success status was sent
            expect(mockWindow.webContents.send).toHaveBeenCalledWith(
                'db-status',
                'rgb(72, 216, 24)'
            );
        });

        it('should handle failed database ping', async () => {
            const url = 'http://example.com';
            const mockResponse = { status: 500 };

            // Mock axios response
            axios.get.mockResolvedValue(mockResponse);

            await pingDatabase(url);

            // Verify axios was called
            expect(axios.get).toHaveBeenCalledWith(url);

            // Verify error status was sent
            expect(mockWindow.webContents.send).toHaveBeenCalledWith(
                'db-status',
                'red'
            );
        });

        it('should handle network errors', async () => {
            const url = 'http://example.com';
            const error = new Error('Network error');

            // Mock axios error
            axios.get.mockRejectedValue(error);

            await pingDatabase(url);

            // Verify axios was called
            expect(axios.get).toHaveBeenCalledWith(url);

            // Verify error status was sent
            expect(mockWindow.webContents.send).toHaveBeenCalledWith(
                'db-status',
                'red'
            );
        });
    });
}); 