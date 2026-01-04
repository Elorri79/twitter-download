# 🎮 Elorri Video Downloader

A premium web application to download Twitter/X videos with an integrated Pac-Man minigame to make waiting fun.

![Screenshot](https://img.shields.io/badge/Node.js-v25.2.1-green)
![Screenshot](https://img.shields.io/badge/Express-4.19.2-blue)
![Screenshot](https://img.shields.io/badge/yt--dlp-2025.12.08-red)

## ✨ Features

- 🎬 **Download Twitter/X videos** in maximum quality
- 🎮 **Playable Pac-Man minigame** while waiting for downloads
- 🎨 **Premium interface** with dark design and glassmorphism effects
- 🔄 **Smart processing** with FFmpeg for maximum compatibility
- 📱 **Responsive** - works on desktop and mobile

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on the system
- `curl` or `wget`

### Steps

1. Clone the repository:
```bash
git clone https://github.com/Elorri79/twitter-download.git
cd twitter-download
```

2. Install dependencies:
```bash
npm install
```

3. The `yt-dlp` binary will be automatically downloaded to the `bin/` folder on first run.

4. Start the server:
```bash
npm start
```

5. Open your browser at `http://localhost:3000`

## 🎯 Usage

1. Copy the link of any tweet containing a video
2. Paste it into the input field
3. Click **"Descargar"** (Download)
4. Play Pac-Man while you wait! 🕹️
5. The video will download automatically when ready

### Game Controls

- **← → ↑ ↓** - Move Pac-Man
- Avoid the ghosts 👻
- Eat all the dots to win 🟡

## 🛠️ Technologies

### Backend
- **Node.js** + **Express** - Web server
- **yt-dlp** - Video download engine
- **FFmpeg** - Video processing and conversion

### Frontend
- **HTML5 Canvas** - Game rendering
- **Vanilla JavaScript** - Client logic
- **CSS3** - Premium styles with animations

## 📁 Project Structure

```
twitter-downloader/
├── bin/                    # yt-dlp binary
├── public/                 # Frontend files
│   ├── index.html         # HTML structure
│   ├── style.css          # Premium styles
│   └── client.js          # Client logic + game
├── temp/                   # Temporary download files
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md              # This file
```

## 🎨 Screenshots

The interface features:
- Animated background with color blobs
- Glassmorphism effects on cards
- Smooth animations and micro-interactions
- Fully functional retro Pac-Man minigame

## 🤝 Credits

**Created by Elorri79**

With **Gemini 3 Flash** & **Claude Sonnet 4.5** using **Antigravity**

## 📝 License

MIT License - feel free to use this project however you want.

## 🐛 Known Issues

- Private or protected videos cannot be downloaded
- Some very long videos may take longer to process

## 💡 Future Improvements

- [ ] Batch download support
- [ ] Video quality selection
- [ ] More minigames (Snake, Tetris, etc.)
- [ ] Download history
- [ ] Light/dark mode toggle

---

⭐ If you like this project, give it a star on GitHub!
