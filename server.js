const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const YT_DLP_PATH = path.join(__dirname, 'bin', 'yt-dlp');
const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

app.post('/api/download', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Processing URL: ${url}`);

    const id = crypto.randomBytes(8).toString('hex');
    const tempRawPath = path.join(TEMP_DIR, `${id}_raw.mp4`);
    const tempFinalPath = path.join(TEMP_DIR, `${id}_final.mp4`);

    console.log(`Step 1: Downloading raw video for ${url}`);

    // Download with yt-dlp
    const ytDlp = spawn(YT_DLP_PATH, [
        '-o', tempRawPath,
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--no-playlist',
        url
    ]);

    let errorOutput = '';
    ytDlp.stderr.on('data', (data) => errorOutput += data.toString());

    ytDlp.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(tempRawPath)) {
            console.error(`yt-dlp error: ${errorOutput}`);
            return res.status(500).json({ error: 'Fallo al descargar de Twitter. Es posible que el enlace no sea válido o el vídeo sea privado.' });
        }

        console.log(`Step 2: Normalizing video for VLC compatibility`);

        // Use FFmpeg to force a VERY compatible format
        // -vcodec libx264: most compatible video codec
        // -acodec aac: standard audio
        // -pix_fmt yuv420p: essential for compatibility with many players
        // -profile:v main -level:v 3.1: standard profile for broad devices
        // -movflags +faststart: puts metadata at the beginning of the file
        const ffmpeg = spawn('ffmpeg', [
            '-i', tempRawPath,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-pix_fmt', 'yuv420p',
            '-profile:v', 'main',
            '-level:v', '3.1',
            '-movflags', '+faststart',
            '-y',
            tempFinalPath
        ]);

        ffmpeg.on('close', (ffCode) => {
            // Clean up raw file immediately
            fs.unlink(tempRawPath, () => { });

            if (ffCode !== 0) {
                console.error('FFmpeg normalization failed');
                return res.status(500).json({ error: 'Error al procesar el vídeo para compatibilidad.' });
            }

            // Get original filename
            const getFileName = spawn(YT_DLP_PATH, ['--get-filename', '-o', '%(title)s.%(ext)s', url]);
            let originalName = 'video.mp4';

            getFileName.stdout.on('data', (data) => originalName = data.toString().trim());
            getFileName.on('close', () => {
                const safeFilename = originalName.replace(/[^\x20-\x7E]/g, '') || 'video.mp4';
                const encodedFilename = encodeURIComponent(originalName).replace(/['()]/g, escape).replace(/\*/g, '%2A');

                res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`);
                res.setHeader('Content-Type', 'video/mp4');

                const fileStream = fs.createReadStream(tempFinalPath);
                fileStream.pipe(res);

                fileStream.on('end', () => {
                    fs.unlink(tempFinalPath, (err) => {
                        if (err) console.error(`Error deleting final temp file: ${err}`);
                    });
                });
            });
        });
    });
});


// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
