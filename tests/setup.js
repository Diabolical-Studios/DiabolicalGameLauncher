// Mock electron modules
jest.mock('electron', () => ({
    app: {
        getPath: jest.fn(),
        getVersion: jest.fn(),
    },
    BrowserWindow: {
        getFocusedWindow: jest.fn(),
        fromWebContents: jest.fn(),
    },
    Menu: {
        buildFromTemplate: jest.fn(),
    },
    shell: {
        showItemInFolder: jest.fn(),
        openExternal: jest.fn(),
    },
}));

// Mock fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    rmSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
    join: jest.fn((...args) => args.join('/')),
    resolve: jest.fn((...args) => args.join('/')),
}));

// Mock dotenv
jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

// Mock electron-dl
jest.mock('electron-dl', () => ({
    download: jest.fn(),
}));

// Mock extract-zip
jest.mock('extract-zip', () => jest.fn());

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(),
})); 