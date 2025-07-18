# OCR ke Excel - Local Server Guide

## 🏠 Menjalankan Aplikasi Secara Lokal

### Metode 1: Python Server (Recommended)
```bash
# Buka terminal/command prompt di folder aplikasi
cd "c:\Users\fajar.yulianto\Documents\OCR\OCR-Apps-main"

# Jalankan server Python
python -m http.server 8000

# Buka browser dan akses: http://localhost:8000
```

### Metode 2: Node.js Server
```bash
# Install http-server globally
npm install -g http-server

# Jalankan server
http-server -p 8080

# Buka browser dan akses: http://localhost:8080
```

### Metode 3: VS Code Live Server
1. Install extension "Live Server" di VS Code
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

## 🌐 Hosting Gratis (Recommended)

### Option 1: Netlify (Termudah)
1. Zip semua file aplikasi
2. Buka [netlify.com](https://netlify.com)
3. Drag & drop file zip ke Netlify
4. Aplikasi langsung online!

### Option 2: GitHub Pages
1. Upload ke GitHub repository
2. Aktifkan GitHub Pages di Settings
3. Akses via `https://username.github.io/repository-name`

### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Jalankan: `vercel`
3. Follow instruksi deployment

## 🚀 Quick Start
1. **Untuk Testing Lokal**: Double-click `start-server.bat`
2. **Untuk Production**: Upload ke Netlify

## 📋 Keuntungan Hosting:
- ✅ Tidak ada CORS issues
- ✅ Akses dari mana saja
- ✅ Bisa dibagikan ke orang lain
- ✅ Performance lebih baik
- ✅ SSL/HTTPS otomatis

## 💡 Tips:
- Aplikasi ini pure client-side, jadi aman di-hosting di static hosting
- Semua processing dilakukan di browser user
- Tidak memerlukan server backend
