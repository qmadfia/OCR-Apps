# OCR ke Excel - Panduan Troubleshooting

## 🔧 Perbaikan Error "worker.load is not a function"

### ✅ Solusi yang Telah Diterapkan:
1. **Update Tesseract.js ke v5.0.5**
   - Versi lama (4.1.1) menggunakan API yang berbeda
   - Versi baru (5.0.5) menggunakan `Tesseract.recognize()` langsung

2. **Perbaikan API Usage**
   ```javascript
   // OLD API (v4.x) - SALAH
   const worker = Tesseract.createWorker();
   await worker.load();
   await worker.loadLanguage('eng');
   await worker.initialize('eng');
   
   // NEW API (v5.x) - BENAR
   const result = await Tesseract.recognize(
       file,
       'eng',
       { logger: m => console.log(m) }
   );
   ```

### 🚀 Cara Testing:

#### 1. Test dengan Debug File
```bash
# Buka debug.html untuk test sederhana
file:///path/to/debug.html
```

#### 2. Test dengan Local Server
```bash
# Gunakan start-server.bat atau manual:
python -m http.server 8000
# Buka: http://localhost:8000
```

#### 3. Test dengan Gambar yang Jelas
- Gunakan gambar dengan teks yang jelas
- Pastikan kontras tinggi (hitam-putih)
- Resolusi yang cukup (minimal 300 DPI)

### 📋 Langkah Troubleshooting:

1. **Buka Browser Console** (F12)
2. **Check Error Messages**
3. **Verify Library Loading**:
   ```javascript
   console.log(typeof Tesseract); // Should be "object"
   console.log(Tesseract.recognize); // Should be function
   ```

### 🔍 Kemungkinan Masalah Lain:

#### A. Network Issues
- **Penyebab**: CDN tidak dapat diakses
- **Solusi**: Coba server lokal atau hosting

#### B. CORS Policy
- **Penyebab**: File protocol restrictions
- **Solusi**: Gunakan HTTP server

#### C. Memory Issues
- **Penyebab**: File gambar terlalu besar
- **Solusi**: Resize gambar < 5MB

#### D. Browser Compatibility
- **Penyebab**: Browser lama
- **Solusi**: Update browser atau gunakan Chrome/Firefox

### 🎯 Verifikasi Perbaikan:

1. **Library Loading**: Check console log
2. **File Upload**: Drag/drop atau click button
3. **OCR Process**: Check progress bar
4. **Result Display**: Text muncul di hasil

### 💡 Tips Optimasi:

1. **Gambar yang Baik**:
   - Teks horizontal
   - Latar belakang putih
   - Teks hitam/gelap
   - Tidak blur

2. **Pengaturan OCR**:
   - Bahasa: Pilih sesuai konten
   - Mode: "Otomatis" untuk umum
   - Auto Convert: "Smart Detection"

3. **Performance**:
   - Hindari file > 5MB
   - Tutup tab lain saat processing
   - Gunakan koneksi internet stabil

### 📞 Jika Masih Error:

1. **Check Console** untuk error detail
2. **Test dengan debug.html** untuk isolasi masalah
3. **Coba gambar yang berbeda**
4. **Gunakan browser yang berbeda**
5. **Check koneksi internet**

---

## 🚀 Quick Fix Command:

```bash
# Clone atau download ulang jika perlu
git clone [repository-url]
cd OCR-Apps-main

# Start server
python -m http.server 8000

# Buka browser
http://localhost:8000
```

**Status**: ✅ Error "worker.load is not a function" telah diperbaiki dengan update ke Tesseract.js v5.0.5