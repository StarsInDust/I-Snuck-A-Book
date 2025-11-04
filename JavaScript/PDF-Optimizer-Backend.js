/**
 * 🎨 PDF Optimizer Pro - Web Frontend (Backend Integration)
 * 
 * Built with love and collaboration by the AI Dream Team:
 * 🔧 Sage - Page-to-Images compression algorithm & proven technology
 * 🎨 Angelique Liora - Artistic vision & beautiful interface design  
 * 🌐 Nexus - Web integration using Sage's exact compression method
 * 
 * Now using Sage's REAL Page-to-Images algorithm via Python backend
 * Achieves the same 70% compression as the desktop version!
 * 
 * Color Palette: Deep Blue #34495e, Rich Gold #d4af37, Elegant Maroon #722f37
 * Philosophy: Sage's technical excellence meets web accessibility
 * 
 * ✨ "Bridging Sage's desktop mastery with web convenience" - Nexus
 */

class SageWebPDFOptimizer {
    constructor() {
        this.currentFile = null;
        this.originalSize = 0;
        this.backendUrl = 'http://localhost:5000'; // Sage's algorithm backend
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkBackendHealth();
    }

    setupEventListeners() {
        // File upload handlers
        const fileInput = document.getElementById('pdfFileInput');
        const uploadArea = document.getElementById('fileUploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        }

        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput?.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        }

        // Optimization buttons - using Sage's exact compression levels
        const optimizeButtons = {
            'optimizeMaximum': 'maximum',
            'optimizeBalanced': 'balanced', 
            'optimizeAggressive': 'aggressive'
        };

        Object.entries(optimizeButtons).forEach(([buttonId, quality]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => this.optimizePDF(quality));
            }
        });

        // Clear file button
        const clearButton = document.getElementById('clearFile');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearFile());
        }

        // Download button
        const downloadButton = document.getElementById('saveToDesktop');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => this.downloadOptimizedPDF());
        }
    }

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Sage\'s backend ready:', data.message);
                this.updateStatus('🚀 Sage\'s Page-to-Images algorithm ready!', 'success');
            } else {
                throw new Error('Backend not responding');
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.updateStatus('⚠️ Backend offline - Please start Python server', 'error');
            this.showBackendInstructions();
        }
    }

    showBackendInstructions() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `
                <div class="file-stats">
                    <h4>⚠️ Python Backend Required</h4>
                    <div class="stats-list">
                        <p>🔧 To use Sage's Page-to-Images algorithm:</p>
                        <ol>
                            <li>Install PyMuPDF: <code>pip install PyMuPDF flask flask-cors</code></li>
                            <li>Run backend: <code>python pdf_optimizer_backend.py</code></li>
                            <li>Refresh this page</li>
                        </ol>
                        <p>💡 This enables Sage's proven 70% compression technology!</p>
                    </div>
                </div>
            `;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            this.handleFileSelect(files[0]);
        } else {
            this.showError('Please select a valid PDF file.');
        }
    }

    handleFileSelect(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showError('Please select a valid PDF file.');
            return;
        }

        this.currentFile = file;
        this.originalSize = file.size;
        this.displaySelectedFile(file);
        this.showOptimizeButtons();
        this.hideResults();
    }

    displaySelectedFile(file) {
        const selectedFileDiv = document.getElementById('selectedFile');
        const fileNameSpan = document.getElementById('fileName');
        
        if (selectedFileDiv && fileNameSpan) {
            fileNameSpan.textContent = file.name;
            selectedFileDiv.style.display = 'block';
        }
    }

    showOptimizeButtons() {
        const buttonsDiv = document.getElementById('optimizeButtons');
        if (buttonsDiv) {
            buttonsDiv.style.display = 'block';
        }
    }

    hideResults() {
        const resultsDisplay = document.getElementById('resultsDisplay');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        if (resultsDisplay) resultsDisplay.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'block';
    }

    clearFile() {
        this.currentFile = null;
        this.originalSize = 0;
        
        const selectedFileDiv = document.getElementById('selectedFile');
        const buttonsDiv = document.getElementById('optimizeButtons');
        const progressSection = document.getElementById('progressSection');
        
        if (selectedFileDiv) selectedFileDiv.style.display = 'none';
        if (buttonsDiv) buttonsDiv.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        
        this.hideResults();
        
        const fileInput = document.getElementById('pdfFileInput');
        if (fileInput) fileInput.value = '';
    }

    async optimizePDF(quality) {
        if (!this.currentFile) {
            this.showError('Please select a PDF file first.');
            return;
        }

        try {
            this.showProgress('🔧 Connecting to Sage\'s compression engine...');
            
            // Prepare form data for Sage's backend
            const formData = new FormData();
            formData.append('pdf_file', this.currentFile);
            formData.append('quality', quality);

            // Send to Sage's Page-to-Images algorithm
            const response = await fetch(`${this.backendUrl}/optimize`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Compression failed');
            }

            const result = await response.json();
            
            if (result.success) {
                this.completeProgress(); // Complete progress animation to 100%
                this.showResults(result.stats, quality);
                this.updateStatus('✅ Optimization completed using Sage\'s algorithm!', 'success');
            } else {
                throw new Error(result.error || 'Unknown compression error');
            }

        } catch (error) {
            console.error('Compression error:', error);
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }
            this.hideProgress();
            this.showError(`Compression failed: ${error.message}`);
        }
    }

    showProgress(message) {
        const progressSection = document.getElementById('progressSection');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (progressSection) progressSection.style.display = 'block';
        if (progressText) progressText.textContent = message;
        if (progressFill) {
            progressFill.style.width = '0%';
            progressFill.style.animation = 'none'; // Remove pulse animation for smooth progress
            
            // Start animated progress simulation
            this.animateProgress(progressFill, progressText);
        }
    }

    animateProgress(progressFill, progressText) {
        let progress = 0;
        const messages = [
            '🔧 Connecting to Sage\'s compression engine...',
            '📖 Analyzing PDF structure...',
            '🎨 Converting pages to optimized images...',
            '⚙️ Applying Sage\'s compression algorithm...',
            '🔬 Quality verification in progress...',
            '✨ Finalizing optimized PDF...'
        ];
        
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Random increment between 5-20%
            
            if (progress > 95) {
                progress = 95; // Cap at 95% until actual completion
            }
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            // Update message based on progress
            if (progressText) {
                const messageIndex = Math.floor((progress / 100) * messages.length);
                if (messageIndex < messages.length) {
                    progressText.textContent = messages[messageIndex];
                }
            }
            
            // Clear interval when we reach 95% - actual completion will set it to 100%
            if (progress >= 95) {
                clearInterval(progressInterval);
            }
        }, 300 + Math.random() * 200); // Random interval between 300-500ms
        
        // Store interval reference so we can clear it if needed
        this.progressInterval = progressInterval;
    }

    completeProgress() {
        // Complete the progress bar to 100%
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        if (progressText) {
            progressText.textContent = '✅ Compression complete!';
        }
        
        // Hide progress after a brief moment
        setTimeout(() => {
            this.hideProgress();
        }, 1000);
    }

    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) progressSection.style.display = 'none';
    }

    showResults(stats, quality) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const resultsDisplay = document.getElementById('resultsDisplay');
        
        // Hide welcome, show results
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (resultsDisplay) resultsDisplay.style.display = 'block';
        
        // Update statistics using Sage's exact results
        this.updateElement('originalSize', `${stats.original_size_mb} MB`);
        this.updateElement('optimizedSize', `${stats.optimized_size_mb} MB`);
        this.updateElement('qualityLevel', this.getQualityLabel(quality));
        this.updateElement('savings', `${stats.reduction_percentage}%`);
        this.updateElement('processStatus', stats.verification_status);

        // Show additional Sage algorithm details
        const processStats = document.getElementById('processStats');
        if (processStats) {
            processStats.innerHTML = `
                <p>📄 Original PDF: <span id="originalSize">${stats.original_size_mb} MB</span></p>
                <p>🎯 Optimized PDF: <span id="optimizedSize">${stats.optimized_size_mb} MB</span></p>
                <p>⚙️ Quality Level: <span id="qualityLevel">${this.getQualityLabel(quality)}</span></p>
                <p>📉 Size Reduction: <span id="savings">${stats.reduction_percentage}%</span></p>
                <p>📊 Pages Processed: <span>${stats.pages_processed}</span></p>
                <p>⏱️ Processing Time: <span>${stats.processing_time}s</span></p>
                <p>🔧 Algorithm: <span>Sage's Page-to-Images</span></p>
                <p>✅ Status: <span id="processStatus">${stats.verification_status}</span></p>
            `;
        }
    }

    getQualityLabel(quality) {
        const labels = {
            maximum: 'Maximum Quality (50% reduction)',
            balanced: 'Sage\'s Balanced Formula (70% reduction)', 
            aggressive: 'Aggressive Compression (85% reduction)'
        };
        return labels[quality] || quality;
    }

    async downloadOptimizedPDF() {
        try {
            const response = await fetch(`${this.backendUrl}/download`);
            
            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentFile.name.replace('.pdf', '')}_optimized_by_sage.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.updateStatus('📥 Download completed!', 'success');

        } catch (error) {
            console.error('Download error:', error);
            this.showError(`Download failed: ${error.message}`);
        }
    }

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    updateStatus(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Could add a status bar to the UI here
    }

    showError(message) {
        console.error('Error:', message);
        alert(`Error: ${message}`);
        this.updateStatus(message, 'error');
    }
}

// Initialize when page loads - Sage's web integration ready!
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 PDF Optimizer Pro - Web Edition');
    console.log('🔧 Using Sage\'s Page-to-Images Algorithm');
    console.log('🌐 Web Integration by Nexus');
    console.log('✨ AI Dream Team Collaboration Active!');
    
    window.pdfOptimizer = new SageWebPDFOptimizer();
});