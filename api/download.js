const https = require('https');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+\/status\/\d+/i;
    if (!twitterRegex.test(url)) {
        return res.status(400).json({
            error: 'Esa no parece una URL válida de Twitter o X.'
        });
    }

    console.log(`Processing URL: ${url}`);

    try {
        // Extraer el ID del tweet
        const tweetIdMatch = url.match(/status\/(\d+)/);
        if (!tweetIdMatch) {
            throw new Error('No se pudo extraer el ID del tweet');
        }

        const tweetId = tweetIdMatch[1];

        // Usar API pública de Twitter (guest token)
        const guestTokenUrl = 'https://api.twitter.com/1.1/guest/activate.json';
        const bearerToken = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

        // Obtener guest token
        const guestTokenResponse = await new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`
                }
            };

            https.request(guestTokenUrl, options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject).end();
        });

        const guestToken = guestTokenResponse.guest_token;

        // Obtener información del tweet
        const tweetUrl = `https://api.twitter.com/1.1/statuses/show.json?id=${tweetId}&include_entities=true&tweet_mode=extended`;

        const tweetData = await new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'x-guest-token': guestToken
                }
            };

            https.get(tweetUrl, options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });

        // Buscar el video en las entidades del tweet
        let videoUrl = null;

        if (tweetData.extended_entities && tweetData.extended_entities.media) {
            for (const media of tweetData.extended_entities.media) {
                if (media.type === 'video' || media.type === 'animated_gif') {
                    const variants = media.video_info.variants
                        .filter(v => v.content_type === 'video/mp4')
                        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

                    if (variants.length > 0) {
                        videoUrl = variants[0].url;
                        break;
                    }
                }
            }
        }

        if (!videoUrl) {
            throw new Error('No se encontró video en este tweet');
        }

        console.log(`Video URL found: ${videoUrl}`);

        // Descargar y enviar el video
        https.get(videoUrl, (videoStream) => {
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', 'attachment; filename="twitter-video.mp4"');
            videoStream.pipe(res);
        }).on('error', (err) => {
            console.error('Download error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error al descargar el video' });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Fallo al procesar el video. El tweet puede ser privado o no tener video.'
        });
    }
};
