document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    const statusMessage = document.getElementById('statusMessage');
    const btnText = downloadBtn.querySelector('.btn-text');

    let isDownloading = false;

    const setStatus = (msg, type = '') => {
        statusMessage.textContent = msg;
        statusMessage.className = 'status-message';
        if (type) statusMessage.classList.add(type);
        statusMessage.classList.remove('hidden');
    };

    const hideStatus = () => {
        statusMessage.classList.add('hidden');
    };

    downloadBtn.addEventListener('click', async () => {
        if (isDownloading) {
            videoUrl.value = '';
            downloadBtn.disabled = false;
            btnText.textContent = 'Descargar';
            isDownloading = false;
            hideStatus();
            return;
        }

        const url = videoUrl.value.trim();

        if (!url) {
            setStatus('Por favor, introduce una URL de Twitter.', 'error');
            return;
        }

        if (!url.includes('twitter.com') && !url.includes('x.com')) {
            setStatus('Esa no parece una URL válida de Twitter o X.', 'error');
            return;
        }

        try {
            isDownloading = true;
            btnText.textContent = 'Limpiar';
            hideStatus();
            setStatus('Descargando vídeo...', 'success');

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la descarga');
            }

            // Get filename
            const disposition = response.headers.get('Content-Disposition');
            let filename = 'twitter-video.mp4';
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            setStatus('¡Descarga completada!', 'success');
            isDownloading = false;
            btnText.textContent = 'Descargar';
        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error.message, 'error');
            isDownloading = false;
            btnText.textContent = 'Descargar';
        }
    });

    // Permitir pulsar Enter
    videoUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isDownloading) {
            downloadBtn.click();
        }
    });
});
