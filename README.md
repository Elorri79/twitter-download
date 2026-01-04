# 🎮 Elorri Video Downloader

Una aplicación web premium para descargar vídeos de Twitter/X con un minijuego de Pac-Man integrado para amenizar la espera.

![Screenshot](https://img.shields.io/badge/Node.js-v25.2.1-green)
![Screenshot](https://img.shields.io/badge/Express-4.19.2-blue)
![Screenshot](https://img.shields.io/badge/yt--dlp-2025.12.08-red)

## ✨ Características

- 🎬 **Descarga vídeos de Twitter/X** en máxima calidad
- 🎮 **Minijuego de Pac-Man** jugable mientras esperas la descarga
- 🎨 **Interfaz premium** con diseño oscuro y efectos glassmorphism
- 🔄 **Procesamiento inteligente** con FFmpeg para máxima compatibilidad
- 📱 **Responsive** - funciona en desktop y móvil

## 🚀 Instalación

### Requisitos previos

- Node.js (v14 o superior)
- FFmpeg instalado en el sistema
- `curl` o `wget`

### Pasos

1. Clona el repositorio:
```bash
git clone https://github.com/TU_USUARIO/twitter-downloader.git
cd twitter-downloader
```

2. Instala las dependencias:
```bash
npm install
```

3. El binario de `yt-dlp` se descargará automáticamente en la carpeta `bin/` al ejecutar por primera vez.

4. Inicia el servidor:
```bash
npm start
```

5. Abre tu navegador en `http://localhost:3000`

## 🎯 Uso

1. Copia el enlace de cualquier tweet que contenga un vídeo
2. Pégalo en el campo de entrada
3. Haz clic en **"Descargar"**
4. ¡Juega al Pac-Man mientras esperas! 🕹️
5. El vídeo se descargará automáticamente cuando esté listo

### Controles del juego

- **← → ↑ ↓** - Mover a Pac-Man
- Evita los fantasmas 👻
- Come todos los puntos para ganar 🟡

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express** - Servidor web
- **yt-dlp** - Motor de descarga de vídeos
- **FFmpeg** - Procesamiento y conversión de vídeo

### Frontend
- **HTML5 Canvas** - Renderizado del juego
- **Vanilla JavaScript** - Lógica del cliente
- **CSS3** - Estilos premium con animaciones

## 📁 Estructura del proyecto

```
twitter-downloader/
├── bin/                    # Binario de yt-dlp
├── public/                 # Archivos del frontend
│   ├── index.html         # Estructura HTML
│   ├── style.css          # Estilos premium
│   └── client.js          # Lógica del cliente + juego
├── temp/                   # Archivos temporales de descarga
├── server.js              # Servidor Express
├── package.json           # Dependencias
└── README.md              # Este archivo
```

## 🎨 Capturas de pantalla

La interfaz cuenta con:
- Fondo animado con blobs de colores
- Efectos glassmorphism en las tarjetas
- Animaciones suaves y micro-interacciones
- Minijuego retro de Pac-Man totalmente funcional

## 🤝 Créditos

**Creado por Elorri79**

Con **Gemini 3 Flash** & **Claude Sonnet 4.5** usando **Antigravity**

## 📝 Licencia

MIT License - siéntete libre de usar este proyecto como quieras.

## 🐛 Problemas conocidos

- Los vídeos privados o protegidos no se pueden descargar
- Algunos vídeos muy largos pueden tardar más en procesarse

## 💡 Mejoras futuras

- [ ] Soporte para descargas por lotes
- [ ] Selección de calidad de vídeo
- [ ] Más minijuegos (Snake, Tetris, etc.)
- [ ] Historial de descargas
- [ ] Modo claro/oscuro

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
