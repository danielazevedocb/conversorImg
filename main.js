const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

ipcMain.handle('dialog:openFile', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
            ]
        });
        console.log('Selected file paths:', result.filePaths);
        return result.filePaths;
    } catch (error) {
        console.error('Failed to open file dialog:', error);
        throw error;
    }
});

ipcMain.handle('convert-images', async (event, filePaths) => {
    const outputDir = `C:\\converted_${Date.now()}`;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    let progress = 0;
    const totalFiles = filePaths.length;

    for (const filePath of filePaths) {
        const fileName = path.basename(filePath);
        const outputFilePath = path.join(outputDir, fileName);

        try {
            await sharp(filePath)
                .resize(310, 410)
                .toFile(outputFilePath);
            progress += 1;
            const percentage = Math.round((progress / totalFiles) * 100);
            console.log(`Conversion progress: ${percentage}%`);
            mainWindow.webContents.send('conversion-progress', percentage);
        } catch (error) {
            console.error(`Failed to process file ${filePath}:`, error);
        }
    }

    return outputDir;
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
