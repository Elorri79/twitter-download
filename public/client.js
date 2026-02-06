document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    const statusMessage = document.getElementById('statusMessage');
    const btnText = downloadBtn.querySelector('.btn-text');
    const pacmanGame = document.getElementById('pacmanGame');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');

    let isDownloading = false;
    let gameActive = false;
    let score = 0;

    // Pac-Man Game Logic
    const CELL_SIZE = 20;
    const GRID_WIDTH = 20;
    const GRID_HEIGHT = 20;

    let pacman = { x: 1, y: 1, direction: 'right', nextDirection: 'right' };
    let ghosts = [
        { x: 18, y: 1, color: '#FF0000', direction: 'left' },
        { x: 1, y: 18, color: '#FFB8FF', direction: 'right' },
        { x: 18, y: 18, color: '#00FFFF', direction: 'up' }
    ];
    let dots = [];
    let walls = [];

    // Generate maze
    function generateMaze() {
        walls = [];
        dots = [];

        // Border walls
        for (let x = 0; x < GRID_WIDTH; x++) {
            walls.push({ x, y: 0 });
            walls.push({ x, y: GRID_HEIGHT - 1 });
        }
        for (let y = 0; y < GRID_HEIGHT; y++) {
            walls.push({ x: 0, y });
            walls.push({ x: GRID_WIDTH - 1, y });
        }

        // Internal walls (simple pattern)
        for (let x = 3; x < GRID_WIDTH - 3; x += 4) {
            for (let y = 3; y < GRID_HEIGHT - 3; y += 4) {
                walls.push({ x, y });
                walls.push({ x: x + 1, y });
                walls.push({ x, y: y + 1 });
            }
        }

        // Generate dots
        for (let x = 1; x < GRID_WIDTH - 1; x++) {
            for (let y = 1; y < GRID_HEIGHT - 1; y++) {
                if (!isWall(x, y) && !(x === pacman.x && y === pacman.y)) {
                    dots.push({ x, y });
                }
            }
        }
    }

    function isWall(x, y) {
        return walls.some(w => w.x === x && w.y === y);
    }

    function drawGame() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw walls
        ctx.fillStyle = '#1d9bf0';
        walls.forEach(wall => {
            ctx.fillRect(wall.x * CELL_SIZE, wall.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });

        // Draw dots
        ctx.fillStyle = '#FFD700';
        dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x * CELL_SIZE + CELL_SIZE / 2, dot.y * CELL_SIZE + CELL_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Pac-Man
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        const pacX = pacman.x * CELL_SIZE + CELL_SIZE / 2;
        const pacY = pacman.y * CELL_SIZE + CELL_SIZE / 2;
        const mouthAngle = Math.PI / 6;
        const rotation = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[pacman.direction];
        ctx.arc(pacX, pacY, CELL_SIZE / 2 - 2, rotation + mouthAngle, rotation - mouthAngle);
        ctx.lineTo(pacX, pacY);
        ctx.fill();

        // Draw ghosts
        ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.color;
            const gx = ghost.x * CELL_SIZE;
            const gy = ghost.y * CELL_SIZE;

            // Ghost body
            ctx.beginPath();
            ctx.arc(gx + CELL_SIZE / 2, gy + CELL_SIZE / 2, CELL_SIZE / 2 - 2, Math.PI, 0);
            ctx.lineTo(gx + CELL_SIZE - 2, gy + CELL_SIZE);
            ctx.lineTo(gx + 2, gy + CELL_SIZE);
            ctx.fill();

            // Ghost eyes
            ctx.fillStyle = '#FFF';
            ctx.fillRect(gx + 5, gy + 6, 4, 6);
            ctx.fillRect(gx + 11, gy + 6, 4, 6);
            ctx.fillStyle = '#000';
            ctx.fillRect(gx + 6, gy + 8, 2, 3);
            ctx.fillRect(gx + 12, gy + 8, 2, 3);
        });
    }

    function canMove(x, y) {
        return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && !isWall(x, y);
    }

    function updateGame() {
        if (!gameActive) return;

        // Try to change direction
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        const nextDir = directions[pacman.nextDirection];
        if (canMove(pacman.x + nextDir.x, pacman.y + nextDir.y)) {
            pacman.direction = pacman.nextDirection;
        }

        // Move Pac-Man
        const dir = directions[pacman.direction];
        const newX = pacman.x + dir.x;
        const newY = pacman.y + dir.y;

        if (canMove(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;

            // Eat dots
            const dotIndex = dots.findIndex(d => d.x === pacman.x && d.y === pacman.y);
            if (dotIndex !== -1) {
                dots.splice(dotIndex, 1);
                score += 10;
                scoreDisplay.textContent = score;
            }
        }

        // Move ghosts (simple AI)
        ghosts.forEach(ghost => {
            const possibleDirs = ['up', 'down', 'left', 'right'].filter(d => {
                const delta = directions[d];
                return canMove(ghost.x + delta.x, ghost.y + delta.y);
            });

            if (possibleDirs.length > 0) {
                // 70% chance to move toward Pac-Man, 30% random
                if (Math.random() < 0.7) {
                    const dx = pacman.x - ghost.x;
                    const dy = pacman.y - ghost.y;
                    const preferredDir = Math.abs(dx) > Math.abs(dy)
                        ? (dx > 0 ? 'right' : 'left')
                        : (dy > 0 ? 'down' : 'up');

                    if (possibleDirs.includes(preferredDir)) {
                        ghost.direction = preferredDir;
                    } else {
                        ghost.direction = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    }
                } else {
                    ghost.direction = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                }
            }

            const gDir = directions[ghost.direction];
            ghost.x += gDir.x;
            ghost.y += gDir.y;

            // Check collision with Pac-Man
            if (ghost.x === pacman.x && ghost.y === pacman.y) {
                stopGame();
                if (isDownloading) {
                    setStatus('¡Te atraparon! Nueva partida en 1 segundo...', 'error');
                    setTimeout(restartGameIfDownloading, 1000);
                } else {
                    setStatus('¡Te atraparon! Puntuación final: ' + score, 'error');
                }
            }
        });

        // Check win condition
        if (dots.length === 0) {
            stopGame();
            if (isDownloading) {
                setStatus('¡Ganaste! Siguiente partida en 1 segundo...', 'success');
                setTimeout(restartGameIfDownloading, 1000);
            } else {
                setStatus('¡Ganaste! Puntuación: ' + score, 'success');
            }
        }

        drawGame();
    }

    function startGame() {
        gameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
        pacman = { x: 1, y: 1, direction: 'right', nextDirection: 'right' };
        ghosts = [
            { x: 18, y: 1, color: '#FF0000', direction: 'left' },
            { x: 1, y: 18, color: '#FFB8FF', direction: 'right' },
            { x: 18, y: 18, color: '#00FFFF', direction: 'up' }
        ];
        generateMaze();
        drawGame();
        gameInterval = setInterval(updateGame, 150);
    }

    function stopGame() {
        gameActive = false;
        if (gameInterval) clearInterval(gameInterval);
    }

    function restartGameIfDownloading() {
        if (isDownloading && !gameActive) {
            // Restart game automatically while downloading
            startGame();
            setStatus('¡Siguiente partida! Puntuación: ' + score, 'success');
        }
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        const key = e.key;
        if (key === 'ArrowUp') pacman.nextDirection = 'up';
        else if (key === 'ArrowDown') pacman.nextDirection = 'down';
        else if (key === 'ArrowLeft') pacman.nextDirection = 'left';
        else if (key === 'ArrowRight') pacman.nextDirection = 'right';
    });

    let gameInterval;

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
            // Clear button functionality
            videoUrl.value = '';
            downloadBtn.disabled = false;
            btnText.textContent = 'Descargar';
            isDownloading = false;
            stopGame();
            pacmanGame.classList.add('hidden');
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

            // Show game
            pacmanGame.classList.remove('hidden');
            startGame();
            setStatus('Descargando... ¡Juega mientras esperas!', 'success');

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

            // Get filename from Content-Disposition header if possible
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

            stopGame();
            setStatus('¡Descarga completada! Puntuación: ' + score, 'success');
        } catch (error) {
            console.error(error);
            stopGame();
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
