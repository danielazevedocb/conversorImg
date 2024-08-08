const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
    convertImages: (filePaths) => ipcRenderer.invoke('convert-images', filePaths),
    onConversionProgress: (callback) => ipcRenderer.on('conversion-progress', (event, percentage) => callback(percentage))
});
