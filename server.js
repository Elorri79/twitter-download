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

        // Send the file directly without FFmpeg processing
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

        const fileStream = fs.createReadStream(tempRawPath);
        fileStream.pipe(res);

        fileStream.on('end', () => {
            fs.unlink(tempRawPath, (err) => {
                if (err) console.error(`Error deleting temp file: ${err}`);
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
