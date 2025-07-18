/**
 * OCR to Excel Converter
 * Main application script with refactored code structure
 */

// Application state
const AppState = {
    currentImageFile: null,
    ocrResult: '',
    tableData: [],
    
    // DOM elements cache
    elements: {
        uploadSection: null,
        previewSection: null,
        processingSection: null,
        resultsSection: null,
        tableContainer: null,
        fileInput: null,
        previewImage: null,
        ocrText: null,
        progressText: null,
        progressFill: null,
        languageSelect: null,
        psmSelect: null,
        autoConvertMode: null,
        tableHead: null,
        tableBody: null
    },
    
    // Initialize DOM elements
    initElements() {
        console.log('Initializing DOM elements...');
        
        this.elements.uploadSection = document.getElementById('uploadSection');
        this.elements.previewSection = document.getElementById('previewSection');
        this.elements.processingSection = document.getElementById('processingSection');
        this.elements.resultsSection = document.getElementById('resultsSection');
        this.elements.tableContainer = document.getElementById('tableContainer');
        this.elements.fileInput = document.getElementById('fileInput');
        this.elements.previewImage = document.getElementById('previewImage');
        this.elements.ocrText = document.getElementById('ocrText');
        this.elements.progressText = document.getElementById('progressText');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.languageSelect = document.getElementById('languageSelect');
        this.elements.psmSelect = document.getElementById('psmSelect');
        this.elements.autoConvertMode = document.getElementById('autoConvertMode');
        this.elements.imageQuality = document.getElementById('imageQuality');
        this.elements.tableHead = document.getElementById('tableHead');
        this.elements.tableBody = document.getElementById('tableBody');
        
        // Check if all elements are found
        const missingElements = [];
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                missingElements.push(key);
            }
        });
        
        if (missingElements.length > 0) {
            console.error('Missing DOM elements:', missingElements);
            alert('Error: Some DOM elements are missing. Please check the HTML structure.');
            return false;
        }
        
        console.log('All DOM elements initialized successfully');
        return true;
    }
};

// UI Controller
const UIController = {
    showSection(sectionName) {
        console.log('Showing section:', sectionName);
        
        const sections = ['uploadSection', 'previewSection', 'processingSection', 'resultsSection'];
        sections.forEach(section => {
            const element = AppState.elements[section];
            if (element) {
                element.style.display = section === sectionName ? 'block' : 'none';
            } else {
                console.warn(`Section element not found: ${section}`);
            }
        });
    },
    
    showTable(show = true) {
        if (AppState.elements.tableContainer) {
            AppState.elements.tableContainer.style.display = show ? 'block' : 'none';
        } else {
            console.warn('Table container not found');
        }
    },
    
    updateProgress(progress, text) {
        if (AppState.elements.progressText) {
            AppState.elements.progressText.textContent = text;
        }
        
        if (AppState.elements.progressFill) {
            AppState.elements.progressFill.style.width = `${progress}%`;
        }
    },
    
    displayImage(src) {
        if (AppState.elements.previewImage) {
            AppState.elements.previewImage.src = src;
        } else {
            console.warn('Preview image element not found');
        }
    },
    
    displayOCRText(text) {
        if (AppState.elements.ocrText) {
            AppState.elements.ocrText.textContent = text;
        } else {
            console.warn('OCR text element not found');
        }
    },
    
    showMessage(message, type = 'info') {
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(`${icon} ${message}`);
    }
};

// File handler
const FileHandler = {
    handleFileSelect(file) {
        console.log('File selected:', file);
        
        if (!file) {
            UIController.showMessage('Tidak ada file yang dipilih!', 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            UIController.showMessage('File harus berupa gambar!', 'error');
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            UIController.showMessage('Ukuran file terlalu besar! Maksimal 10MB.', 'error');
            return;
        }
        
        AppState.currentImageFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            console.log('File loaded successfully');
            UIController.displayImage(e.target.result);
            UIController.showSection('previewSection');
        };
        
        reader.onerror = (e) => {
            console.error('File reading error:', e);
            UIController.showMessage('Gagal membaca file!', 'error');
        };
        
        reader.readAsDataURL(file);
    },
    
    setupDragAndDrop() {
        const uploadSection = AppState.elements.uploadSection;
        
        if (!uploadSection) {
            console.error('Upload section not found');
            return;
        }
        
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });
        
        uploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
        
        if (AppState.elements.fileInput) {
            AppState.elements.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }
    }
};

// OCR processor dengan preprocessing untuk akurasi yang lebih baik
const OCRProcessor = {
    async processImage() {
        console.log('Starting OCR process...');
        
        if (!AppState.currentImageFile) {
            UIController.showMessage('Tidak ada file yang dipilih!', 'error');
            return;
        }
        
        console.log('File selected:', AppState.currentImageFile.name);
        
        UIController.showSection('processingSection');
        
        const language = AppState.elements.languageSelect.value;
        const psm = AppState.elements.psmSelect.value;
        
        console.log('OCR Settings:', { language, psm });
        
        try {
            // Step 1: Get quality settings
            const qualityMode = AppState.elements.imageQuality ? AppState.elements.imageQuality.value : 'auto';
            
            // Step 2: Preprocess image for better OCR accuracy
            UIController.updateProgress(10, 'Memproses gambar...');
            const preprocessedImage = await ImageProcessor.preprocessImage(
                AppState.currentImageFile,
                ImageProcessor.getOptimalSettings(AppState.currentImageFile, qualityMode)
            );
            
            // Step 3: Enhanced OCR configuration
            UIController.updateProgress(20, 'Memulai OCR...');
            
            const ocrConfig = {
                logger: (m) => this.handleProgress(m),
                tessedit_pageseg_mode: psm,
                tessedit_char_whitelist: '', // Allow all characters
                tessedit_ocr_engine_mode: 2, // Use LSTM OCR engine
                preserve_interword_spaces: '1',
                tessedit_create_hocr: '1',
                tessedit_create_tsv: '1',
                // Additional parameters for better accuracy
                tessedit_do_invert: '0',
                tessedit_write_images: '0',
                user_defined_dpi: '300',
                textord_really_old_xheight: '1',
                textord_min_linesize: '0.25',
                // Language-specific optimizations
                ...(language.includes('ind') && {
                    tessedit_char_blacklist: '~`@#$%^&*()_+=[]{}|\\:";\'<>?,./¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'
                })
            };
            
            console.log('Starting Tesseract recognition with enhanced settings...');
            
            // Step 3: Run OCR with preprocessed image
            const result = await Tesseract.recognize(
                preprocessedImage,
                language,
                ocrConfig
            );
            
            console.log('OCR completed. Text length:', result.data.text.length);
            console.log('OCR confidence:', result.data.confidence);
            
            // Step 4: Post-process the text
            const processedText = this.postProcessText(result.data.text, language);
            AppState.ocrResult = processedText;
            
            // Step 5: Display results with confidence info
            const confidenceText = result.data.confidence ? 
                `\n\n--- Info OCR ---\nTingkat Kepercayaan: ${result.data.confidence.toFixed(1)}%\nJumlah Kata: ${processedText.split(/\s+/).length}\nJumlah Karakter: ${processedText.length}` : '';
            
            UIController.displayOCRText(processedText + confidenceText);
            UIController.showSection('resultsSection');
            
            // Show success message with confidence
            const confidenceMsg = result.data.confidence > 80 ? 
                'Akurasi Tinggi! ✨' : 
                result.data.confidence > 60 ? 
                'Akurasi Sedang 📝' : 
                'Akurasi Rendah ⚠️ (Pertimbangkan untuk menggunakan gambar yang lebih jelas)';
            
            UIController.showMessage(`OCR berhasil diproses! ${confidenceMsg}`, 'success');
            
        } catch (error) {
            console.error('OCR Error:', error);
            UIController.showMessage(`Terjadi kesalahan saat memproses OCR: ${error.message}`, 'error');
            UIController.showSection('previewSection');
        }
    },
    
    // Post-process text untuk memperbaiki hasil OCR
    postProcessText(text, language) {
        let processedText = text;
        
        // Fix common OCR errors
        const commonFixes = {
            // Angka yang sering salah
            'O': '0',  // O -> 0 in numbers
            'l': '1',  // l -> 1 in numbers
            'I': '1',  // I -> 1 in numbers
            'S': '5',  // S -> 5 in numbers (context-dependent)
            'G': '6',  // G -> 6 in numbers (context-dependent)
            'B': '8',  // B -> 8 in numbers (context-dependent)
            
            // Karakter yang sering salah
            'rn': 'm',  // rn -> m
            'cl': 'd',  // cl -> d
            'ii': 'n',  // ii -> n
            'vv': 'w',  // vv -> w
            
            // Tanda baca
            ',': '.',   // Context-dependent
            ';': ':',   // Context-dependent
            '!': '1',   // Context-dependent
        };
        
        // Apply fixes based on context
        processedText = this.applyContextualFixes(processedText, language);
        
        // Clean up extra spaces
        processedText = processedText.replace(/\s+/g, ' ').trim();
        
        // Fix line breaks
        processedText = processedText.replace(/\n\s*\n/g, '\n');
        
        return processedText;
    },
    
    // Apply contextual fixes based on surrounding text
    applyContextualFixes(text, language) {
        let fixedText = text;
        
        // Fix numbers context
        fixedText = fixedText.replace(/\b[O](\d)/g, '0$1'); // O followed by digit -> 0
        fixedText = fixedText.replace(/(\d)[O]\b/g, '$10'); // digit followed by O -> 0
        fixedText = fixedText.replace(/\b[l](\d)/g, '1$1'); // l followed by digit -> 1
        fixedText = fixedText.replace(/(\d)[l]\b/g, '$11'); // digit followed by l -> 1
        
        // Fix common Indonesian words if language includes 'ind'
        if (language.includes('ind')) {
            const indonesianFixes = {
                'dalarn': 'dalam',
                'yaltu': 'yaitu',
                'adaiah': 'adalah',
                'scbagai': 'sebagai',
                'tcntang': 'tentang',
                'mcreka': 'mereka',
                'dcngan': 'dengan',
                'tcrhadap': 'terhadap',
                'mcnjadi': 'menjadi',
                'mcmiliki': 'memiliki'
            };
            
            Object.entries(indonesianFixes).forEach(([wrong, correct]) => {
                const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
                fixedText = fixedText.replace(regex, correct);
            });
        }
        
        // Fix common English words if language includes 'eng'
        if (language.includes('eng')) {
            const englishFixes = {
                'thc': 'the',
                'anc': 'and',
                'witl': 'with',
                'frorn': 'from',
                'thal': 'that',
                'havc': 'have',
                'bccn': 'been',
                'wcre': 'were',
                'thcy': 'they',
                'somc': 'some'
            };
            
            Object.entries(englishFixes).forEach(([wrong, correct]) => {
                const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
                fixedText = fixedText.replace(regex, correct);
            });
        }
        
        return fixedText;
    },
    
    handleProgress(m) {
        console.log('Progress:', m);
        
        if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            UIController.updateProgress(progress, `Mengenali teks... ${progress}%`);
        } else if (m.status === 'loading tesseract core') {
            UIController.updateProgress(25, 'Memuat Tesseract core...');
        } else if (m.status === 'initializing tesseract') {
            UIController.updateProgress(40, 'Inisialisasi Tesseract...');
        } else if (m.status === 'loading language traineddata') {
            UIController.updateProgress(60, 'Memuat data bahasa...');
        } else if (m.status === 'initializing api') {
            UIController.updateProgress(80, 'Inisialisasi API...');
        } else {
            UIController.updateProgress(0, `${m.status}...`);
        }
    }
};

// Data parser
const DataParser = {
    parseToTable() {
        if (!AppState.ocrResult) {
            UIController.showMessage('Tidak ada hasil OCR untuk diparse!', 'error');
            return;
        }
        
        const mode = AppState.elements.autoConvertMode.value;
        const lines = AppState.ocrResult.split('\n').filter(line => line.trim() !== '');
        
        let result;
        switch(mode) {
            case 'smart':
                result = this.smartDetection(lines);
                break;
            case 'table':
                result = this.forceTableMode(lines);
                break;
            case 'list':
                result = this.forceListMode(lines);
                break;
            case 'invoice':
                result = this.invoiceMode(lines);
                break;
            default:
                result = this.smartDetection(lines);
        }
        
        if (result.data.length > 0) {
            AppState.tableData = [result.headers, ...result.data];
            TableRenderer.displayTable(result.headers, result.data);
            UIController.showMessage('Data berhasil diparse ke tabel!', 'success');
        } else {
            UIController.showMessage('Tidak dapat mendeteksi struktur data yang valid!', 'error');
        }
    },
    
    smartDetection(lines) {
        let result = this.forceTableMode(lines);
        if (result.data.length > 0) return result;
        
        result = this.invoiceMode(lines);
        if (result.data.length > 0) return result;
        
        return this.forceListMode(lines);
    },
    
    forceTableMode(lines) {
        const headers = [];
        const data = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const separators = [/\s{2,}/, /\t/, /\|/, /;/, /,(?=\s)/];
            
            for (const separator of separators) {
                if (line.match(separator)) {
                    const cells = line.split(separator)
                        .map(cell => cell.trim())
                        .filter(cell => cell);
                    
                    if (cells.length > 1) {
                        if (headers.length === 0) {
                            headers.push(...cells);
                        } else if (cells.length === headers.length) {
                            data.push(cells);
                        }
                        break;
                    }
                }
            }
        }
        
        return {
            headers: headers.length > 0 ? headers : ['Kolom 1', 'Kolom 2'],
            data: data
        };
    },
    
    forceListMode(lines) {
        const headers = ['No', 'Item', 'Deskripsi'];
        const data = [];
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                const parts = line.split(/[:|-]/).map(part => part.trim());
                
                if (parts.length >= 2) {
                    data.push([index + 1, parts[0], parts.slice(1).join(' - ')]);
                } else {
                    data.push([index + 1, line.trim(), '']);
                }
            }
        });
        
        return { headers, data };
    },
    
    invoiceMode(lines) {
        const headers = ['Item', 'Quantity', 'Price', 'Total'];
        const data = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            const numbers = trimmed.match(/\d+[.,]?\d*/g);
            
            if (numbers && numbers.length >= 2) {
                const text = trimmed.replace(/\d+[.,]?\d*/g, '').trim();
                const cleanText = text.replace(/\s+/g, ' ');
                
                if (numbers.length === 2) {
                    data.push([cleanText, numbers[0], numbers[1], numbers[1]]);
                } else if (numbers.length >= 3) {
                    data.push([cleanText, numbers[0], numbers[1], numbers[2]]);
                }
            }
        });
        
        return { headers, data };
    }
};

// Table renderer
const TableRenderer = {
    displayTable(headers, data) {
        const tableHead = AppState.elements.tableHead;
        const tableBody = AppState.elements.tableBody;
        
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        
        // Create header
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);
        
        // Create body
        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
        
        UIController.showTable(true);
    }
};

// Excel exporter
const ExcelExporter = {
    autoConvertToExcel() {
        if (!AppState.ocrResult) {
            UIController.showMessage('Tidak ada hasil OCR untuk dikonversi!', 'error');
            return;
        }
        
        const mode = AppState.elements.autoConvertMode.value;
        const lines = AppState.ocrResult.split('\n').filter(line => line.trim() !== '');
        
        let result;
        switch(mode) {
            case 'smart':
                result = DataParser.smartDetection(lines);
                break;
            case 'table':
                result = DataParser.forceTableMode(lines);
                break;
            case 'list':
                result = DataParser.forceListMode(lines);
                break;
            case 'invoice':
                result = DataParser.invoiceMode(lines);
                break;
            default:
                result = DataParser.smartDetection(lines);
        }
        
        if (result.data.length > 0) {
            AppState.tableData = [result.headers, ...result.data];
            this.downloadExcel(true);
            TableRenderer.displayTable(result.headers, result.data);
        } else {
            UIController.showMessage('Tidak dapat mendeteksi struktur data yang valid!', 'error');
        }
    },
    
    downloadExcel(isAutoConvert = false) {
        if (AppState.tableData.length === 0) {
            UIController.showMessage('Tidak ada data tabel untuk didownload!', 'error');
            return;
        }
        
        const ws = XLSX.utils.aoa_to_sheet(AppState.tableData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'OCR Data');
        
        // Auto-fit columns
        const colWidths = [];
        AppState.tableData.forEach(row => {
            row.forEach((cell, index) => {
                const cellLength = cell.toString().length;
                if (!colWidths[index] || cellLength > colWidths[index]) {
                    colWidths[index] = cellLength + 2;
                }
            });
        });
        ws['!cols'] = colWidths.map(width => ({ wch: width }));
        
        const prefix = isAutoConvert ? 'auto_convert' : 'ocr_data';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `${prefix}_${timestamp}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        UIController.showMessage(`File Excel berhasil dibuat: ${fileName}`, 'success');
    }
};

// App utilities
const AppUtils = {
    editText() {
        const currentText = AppState.elements.ocrText.textContent;
        const newText = prompt('Edit teks OCR:', currentText);
        if (newText !== null) {
            AppState.ocrResult = newText;
            UIController.displayOCRText(newText);
        }
    },
    
    resetApp() {
        AppState.currentImageFile = null;
        AppState.ocrResult = '';
        AppState.tableData = [];
        
        UIController.showSection('uploadSection');
        UIController.showTable(false);
        
        AppState.elements.fileInput.value = '';
        AppState.elements.ocrText.textContent = '';
        AppState.elements.progressFill.style.width = '0%';
        
        UIController.showMessage('Aplikasi telah di-reset!', 'info');
    }
};

// Image preprocessing utilities untuk meningkatkan akurasi OCR
const ImageProcessor = {
    // Preprocess image untuk OCR yang lebih akurat
    preprocessImage(file, options = {}) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Set canvas size
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw original image
                ctx.drawImage(img, 0, 0);
                
                // Apply preprocessing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const processedData = this.applyFilters(imageData, options);
                
                // Put processed image back
                ctx.putImageData(processedData, 0, 0);
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                }, 'image/png', 1.0);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    },
    
    // Apply various filters to improve OCR accuracy
    applyFilters(imageData, options = {}) {
        const {
            contrast = 1.5,
            brightness = 1.1,
            threshold = 128,
            denoise = true,
            sharpen = true
        } = options;
        
        const data = imageData.data;
        
        // Step 1: Adjust contrast and brightness
        for (let i = 0; i < data.length; i += 4) {
            // Apply contrast and brightness
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));     // Red
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness)); // Green
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness)); // Blue
        }
        
        // Step 2: Convert to grayscale and apply threshold
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const binary = gray > threshold ? 255 : 0;
            
            data[i] = binary;     // Red
            data[i + 1] = binary; // Green
            data[i + 2] = binary; // Blue
            // Alpha remains unchanged
        }
        
        // Step 3: Apply denoising if enabled
        if (denoise) {
            this.applyMedianFilter(imageData);
        }
        
        return imageData;
    },
    
    // Simple median filter for noise reduction
    applyMedianFilter(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const newData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const pixels = [];
                
                // Get 3x3 neighborhood
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        pixels.push(data[idx]); // Use red channel for grayscale
                    }
                }
                
                // Sort and get median
                pixels.sort((a, b) => a - b);
                const median = pixels[4]; // Middle value of 9 pixels
                
                const idx = (y * width + x) * 4;
                newData[idx] = median;     // Red
                newData[idx + 1] = median; // Green
                newData[idx + 2] = median; // Blue
            }
        }
        
        // Copy back to original data
        for (let i = 0; i < data.length; i++) {
            data[i] = newData[i];
        }
    },
    
    // Get optimal preprocessing settings based on image characteristics
    getOptimalSettings(file, qualityMode = 'auto') {
        let settings = {
            contrast: 1.5,
            brightness: 1.1,
            threshold: 128,
            denoise: true,
            sharpen: false
        };
        
        // Adjust based on quality mode
        switch (qualityMode) {
            case 'high':
                settings = {
                    contrast: 2.0,
                    brightness: 1.2,
                    threshold: 140,
                    denoise: true,
                    sharpen: true
                };
                break;
                
            case 'low':
                settings = {
                    contrast: 1.8,
                    brightness: 1.3,
                    threshold: 110,
                    denoise: true,
                    sharpen: false
                };
                break;
                
            case 'handwritten':
                settings = {
                    contrast: 1.3,
                    brightness: 1.0,
                    threshold: 120,
                    denoise: false,
                    sharpen: false
                };
                break;
                
            case 'auto':
            default:
                // Auto-detect based on file characteristics
                if (file.size > 2 * 1024 * 1024) { // > 2MB
                    settings.contrast = 1.3;
                    settings.denoise = true;
                } else if (file.size < 500 * 1024) { // < 500KB
                    settings.contrast = 1.8;
                    settings.brightness = 1.2;
                    settings.threshold = 135;
                }
                break;
        }
        
        return settings;
    }
};

// Application initialization
const App = {
    init() {
        console.log('Initializing OCR to Excel App...');
        
        // Check if required libraries are loaded
        if (typeof Tesseract === 'undefined') {
            console.error('Tesseract.js not loaded');
            alert('Error: Tesseract.js library tidak terpasang. Silakan periksa koneksi internet.');
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            console.error('XLSX library not loaded');
            alert('Error: XLSX library tidak terpasang. Silakan periksa koneksi internet.');
            return;
        }
        
        // Initialize DOM elements
        if (!AppState.initElements()) {
            return;
        }
        
        // Setup event listeners
        FileHandler.setupDragAndDrop();
        this.setupEventListeners();
        
        console.log('OCR to Excel App initialized successfully!');
    },
    
    setupEventListeners() {
        // File input button
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                if (AppState.elements.fileInput) {
                    AppState.elements.fileInput.click();
                } else {
                    console.error('File input element not found');
                }
            });
        } else {
            console.error('Upload button not found');
        }
    }
};

// Global functions for onclick handlers (keeping backward compatibility)
window.handleFileSelect = function(file) {
    FileHandler.handleFileSelect(file);
};

window.processImage = function() {
    console.log('processImage called');
    OCRProcessor.processImage();
};

window.autoConvertToExcel = function() {
    ExcelExporter.autoConvertToExcel();
};

window.parseToTable = function() {
    DataParser.parseToTable();
};

window.downloadExcel = function() {
    ExcelExporter.downloadExcel();
};

window.editText = function() {
    AppUtils.editText();
};

window.processAnother = function() {
    AppUtils.resetApp();
};

window.resetApp = function() {
    AppUtils.resetApp();
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Wait a bit to ensure all external scripts are loaded
    setTimeout(() => {
        App.init();
    }, 100);
});

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    console.log('Window loaded');
    
    // Only init if not already initialized
    if (!AppState.elements.uploadSection) {
        setTimeout(() => {
            App.init();
        }, 100);
    }
});
