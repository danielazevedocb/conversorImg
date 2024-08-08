const updateProgress = (percentage) => {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    progressBar.value = percentage;
    progressText.textContent = `${percentage}%`;
};

document.getElementById('select-images').addEventListener('click', async () => {
    console.log('Select Images button clicked');
    try {
        const filePaths = await window.electron.openFileDialog();
        console.log('Selected file paths:', filePaths);
        window.filePaths = filePaths; 
    } catch (error) {
        console.error('Failed to open file dialog:', error);
    }
});

document.getElementById('convert-images').addEventListener('click', async () => {
    if (!window.filePaths || window.filePaths.length === 0) {
        alert('Selecione imagens primeiro.');
        return;
    }

    updateProgress(0);

    
    window.electron.onConversionProgress((percentage) => {
        updateProgress(percentage);
    });

    try {
        const outputDir = await window.electron.convertImages(window.filePaths);
        alert(`Imagens convertidas e salvas em ${outputDir}`);
    } catch (error) {
        console.error('Failed to convert images:', error);
    }
});
