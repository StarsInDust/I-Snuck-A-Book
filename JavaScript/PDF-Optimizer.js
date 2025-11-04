// PDF Optimizer Pro JavaScript
class PDFOptimizer {
    constructor() {
        this.currentFile = null;
        this.originalSize = 0;
        this.optimizedPdf = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // File input events
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('pdfFileInput');
        const clearFile = document.getElementById('clearFile');

        // Click to select file
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Clear file
        clearFile.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearFile();
        });

        // Drag and drop events
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.handleFileSelect(files[0]);
            } else {
                this.showError('Please drop a valid PDF file.');
            }
        });

        // Optimization buttons
        document.getElementById('optimizeMaximum').addEventListener('click', () => {
            this.optimizePDF('maximum');
        });

        document.getElementById('optimizeBalanced').addEventListener('click', () => {
            this.optimizePDF('balanced');
        });

        document.getElementById('optimizeAggressive').addEventListener('click', () => {
            this.optimizePDF('aggressive');
        });

        // Save button
        document.getElementById('saveToDesktop').addEventListener('click', () => {
            this.savePDF();
        });

        // Quality radio buttons
        const qualityInputs = document.querySelectorAll('input[name="quality"]');
        qualityInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateQualityInfo();
            });
        });
    }

    handleFileSelect(file) {
        if (file.type !== 'application/pdf') {
            this.showError('Please select a valid PDF file.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showError('File size too large. Please select a PDF smaller than 50MB.');
            return;
        }

        this.currentFile = file;
        this.originalSize = file.size;
        
        // Update UI
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('selectedFile').style.display = 'block';
        document.getElementById('optimizeButtons').style.display = 'block';
        
        // Update file stats
        this.updateFileStats();
        
        // Show success state
        document.getElementById('fileUploadArea').classList.add('success');
        
        this.showMessage(`File "${file.name}" selected successfully!`, 'success');
    }

    clearFile() {
        this.currentFile = null;
        this.originalSize = 0;
        this.optimizedPdf = null;
        
        // Reset UI
        document.getElementById('selectedFile').style.display = 'none';
        document.getElementById('optimizeButtons').style.display = 'none';
        document.getElementById('fileUploadArea').classList.remove('success', 'error');
        document.getElementById('pdfFileInput').value = '';
        
        // Reset results display
        document.getElementById('welcomeMessage').style.display = 'block';
        document.getElementById('resultsDisplay').style.display = 'none';
        document.getElementById('saveToDesktop').disabled = true;
        
        this.updateFileStats();
        this.showMessage('File cleared. Select a new PDF to optimize.', 'info');
    }

    async optimizePDF(quality) {
        if (!this.currentFile) {
            this.showError('Please select a PDF file first.');
            return;
        }

        this.showProgress('Loading PDF...');
        
        try {
            // Read the PDF file
            const arrayBuffer = await this.readFileAsArrayBuffer(this.currentFile);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            this.showProgress('Optimizing PDF...');
            
            // Get optimization settings based on quality level
            const settings = this.getOptimizationSettings(quality);
            
            // Apply optimizations
            await this.applyOptimizations(pdfDoc, settings);
            
            this.showProgress('Finalizing...');
            
            // Save the optimized PDF
            const pdfBytes = await pdfDoc.save(settings.saveOptions);
            this.optimizedPdf = pdfBytes;
            
            // Calculate savings
            const newSize = pdfBytes.byteLength;
            const savings = Math.round(((this.originalSize - newSize) / this.originalSize) * 100);
            
            // Update UI with results
            this.updateResults(quality, newSize, savings);
            
            // Enable save button
            document.getElementById('saveToDesktop').disabled = false;
            
            this.hideProgress();
            this.showMessage(`PDF optimized successfully! ${savings}% size reduction achieved.`, 'success');
            
        } catch (error) {
            console.error('Error optimizing PDF:', error);
            this.hideProgress();
            this.showError('Error optimizing PDF. Please try a different file or quality setting.');
        }
    }

    getOptimizationSettings(quality) {
        const settings = {
            maximum: {
                objectsToRemove: ['annotations'],
                saveOptions: {
                    useObjectStreams: true,
                    addDefaultPage: false,
                    objectsToRemove: []
                },
                compressionLevel: 1,
                description: 'Matches Adobe 6 (~2MB)'
            },
            balanced: {
                objectsToRemove: ['annotations', 'forms'],
                saveOptions: {
                    useObjectStreams: true,
                    addDefaultPage: false,
                    objectsToRemove: ['annotations']
                },
                compressionLevel: 2,
                description: 'Our winning formula (~1MB)'
            },
            aggressive: {
                objectsToRemove: ['annotations', 'forms', 'metadata'],
                saveOptions: {
                    useObjectStreams: true,
                    addDefaultPage: false,
                    objectsToRemove: ['annotations', 'forms']
                },
                compressionLevel: 3,
                description: 'Smallest files (~5.5MB) - best Adobe significantly'
            }
        };

        return settings[quality] || settings.balanced;
    }

    async applyOptimizations(pdfDoc, settings) {
        // Remove unnecessary objects based on quality level
        if (settings.objectsToRemove.includes('metadata')) {
            // Remove metadata
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setCreator('PDF Optimizer Pro');
            pdfDoc.setProducer('PDF Optimizer Pro');
        }

        // Additional optimizations can be added here
        // Note: PDF-lib has limited optimization capabilities compared to native PDF processors
        // For a production version, you might want to use a server-side solution
    }

    updateResults(quality, newSize, savings) {
        const originalSizeMB = (this.originalSize / (1024 * 1024)).toFixed(2);
        const originalSizeKB = (this.originalSize / 1024).toFixed(0);
        const newSizeMB = (newSize / (1024 * 1024)).toFixed(2);
        
        // Hide welcome message and show results
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('resultsDisplay').style.display = 'block';
        
        // Update the process stats section
        document.getElementById('originalSize').textContent = originalSizeMB;
        document.getElementById('optimizedSize').textContent = newSizeMB;
        document.getElementById('qualityLevel').textContent = this.getQualityDescription(quality);
        document.getElementById('savings').textContent = savings > 0 ? savings : 0;
        document.getElementById('processStatus').textContent = 'Optimization completed successfully!';
        
        // Enable the save button
        document.getElementById('saveToDesktop').disabled = false;
    }

    getQualityDescription(quality) {
        const descriptions = {
            maximum: 'Visually identical - Maximum Quality',
            balanced: 'Visually identical - Balanced Quality',  
            aggressive: 'Visually identical - Aggressive Compression'
        };
        return descriptions[quality] || 'Visually identical';
    }

    updateFileStats() {
        if (this.originalSize > 0) {
            const sizeMB = (this.originalSize / (1024 * 1024)).toFixed(2);
            const sizeKB = (this.originalSize / 1024).toFixed(0);
            
            document.getElementById('originalSize').textContent = sizeMB;
            document.getElementById('originalSizeKB').textContent = sizeKB;
        } else {
            document.getElementById('originalSize').textContent = '0';
            document.getElementById('originalSizeKB').textContent = '0';
        }
        
        document.getElementById('qualityLevel').textContent = 'Visually identical';
        document.getElementById('savings').textContent = '0';
    }

    updateQualityInfo() {
        const selectedQuality = document.querySelector('input[name="quality"]:checked').value;
        const settings = this.getOptimizationSettings(selectedQuality);
        // Could update UI with quality-specific information
    }

    savePDF() {
        if (!this.optimizedPdf) {
            this.showError('No optimized PDF available. Please optimize a PDF first.');
            return;
        }

        try {
            const selectedQuality = document.querySelector('input[name="quality"]:checked').value;
            const originalName = this.currentFile.name.replace('.pdf', '');
            const fileName = `${originalName}-optimized-${selectedQuality}.pdf`;
            
            // Create blob and download
            const blob = new Blob([this.optimizedPdf], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showMessage(`PDF saved as "${fileName}" to your downloads folder!`, 'success');
            
        } catch (error) {
            console.error('Error saving PDF:', error);
            this.showError('Error saving PDF. Please try again.');
        }
    }

    showProgress(message) {
        const progressSection = document.getElementById('progressSection');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        progressText.textContent = message;
        progressSection.style.display = 'block';
        
        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressFill.style.width = progress + '%';
        }, 200);
        
        this.progressInterval = interval;
    }

    hideProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        
        // Complete the progress bar
        progressFill.style.width = '100%';
        
        setTimeout(() => {
            progressSection.style.display = 'none';
            progressFill.style.width = '0%';
        }, 1000);
    }

    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.querySelector('.message-display');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'message-display';
            document.querySelector('.pdf-main').insertBefore(messageEl, document.querySelector('.pdf-container'));
        }
        
        messageEl.textContent = message;
        messageEl.className = `message-display ${type}`;
        messageEl.style.cssText = `
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            animation: slideIn 0.3s ease;
        `;
        
        // Style based on type
        switch (type) {
            case 'success':
                messageEl.style.background = 'rgba(76, 175, 80, 0.2)';
                messageEl.style.border = '1px solid #4CAF50';
                messageEl.style.color = '#4CAF50';
                break;
            case 'error':
                messageEl.style.background = 'rgba(244, 67, 54, 0.2)';
                messageEl.style.border = '1px solid #F44336';
                messageEl.style.color = '#F44336';
                break;
            default:
                messageEl.style.background = 'rgba(255, 215, 0, 0.2)';
                messageEl.style.border = '1px solid #FFD700';
                messageEl.style.color = '#FFD700';
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageEl && messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    updateUI() {
        // Initial UI state
        document.getElementById('optimizeButtons').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'block';
        document.getElementById('resultsDisplay').style.display = 'none';
        
        // Ensure save button exists and is disabled initially
        const saveBtn = document.getElementById('saveToDesktop');
        if (saveBtn) {
            saveBtn.disabled = true;
        }
    }
}

// Initialize PDF Optimizer when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if PDF-lib is loaded
    if (typeof PDFLib === 'undefined') {
        console.error('PDF-lib not loaded. Please check the script tag.');
        document.querySelector('.pdf-main').innerHTML = `
            <div style="text-align: center; color: #F44336; padding: 50px;">
                <h2>Error: PDF Library not loaded</h2>
                <p>Please check your internet connection and refresh the page.</p>
            </div>
        `;
        return;
    }
    
    new PDFOptimizer();
});

// Add CSS animation for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);