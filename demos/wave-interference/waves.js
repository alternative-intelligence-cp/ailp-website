/**
 * Wave Interference Simulator
 * Educational tool to visualize wave superposition and interference patterns
 * Part of AILP Educational Demos
 */

class WaveSimulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Wave parameters
        this.sources = [];
        this.numSources = 2;
        this.frequency = Math.PI; // Tesla frequency (π Hz)
        this.wavelength = 50;
        this.amplitude = 1.0;
        this.phase = 0;
        this.time = 0;
        this.mode = '2d'; // '2d', '1d', 'balanced'
        
        // Display options
        this.showSources = true;
        this.animate = true;
        this.showGrid = false;
        
        // Performance tracking
        this.lastFrameTime = performance.now();
        this.fps = 60;
        this.frameCount = 0;
        this.fpsUpdateTime = performance.now();
        
        // Animation
        this.animationId = null;
        
        this.initializeSources();
    }
    
    initializeSources() {
        this.sources = [];
        const spacing = this.width / (this.numSources + 1);
        
        for (let i = 0; i < this.numSources; i++) {
            this.sources.push({
                x: spacing * (i + 1),
                y: this.height / 2,
                phase: i === 0 ? 0 : this.phase * Math.PI / 180,
                amplitude: this.amplitude
            });
        }
    }
    
    // Calculate wave value at a point from all sources
    calculateWaveAt(x, y, time) {
        let totalAmplitude = 0;
        
        for (const source of this.sources) {
            const dx = x - source.x;
            const dy = y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Wave equation: A * sin(k*r - ω*t + φ)
            const k = (2 * Math.PI) / this.wavelength; // wave number
            const omega = 2 * Math.PI * this.frequency; // angular frequency
            
            // Calculate wave value with distance-based attenuation
            const attenuation = 1 / (1 + distance * 0.001); // Gradual falloff
            const waveValue = source.amplitude * Math.sin(k * distance - omega * time + source.phase) * attenuation;
            
            totalAmplitude += waveValue;
        }
        
        return totalAmplitude;
    }
    
    // Convert wave amplitude to color
    amplitudeToColor(amplitude, mode) {
        if (mode === 'balanced') {
            // Balanced ternary: -1 (red), 0 (black), +1 (blue)
            if (amplitude > 0.33) return `rgb(0, ${Math.floor(amplitude * 255)}, 255)`;
            if (amplitude < -0.33) return `rgb(255, ${Math.floor(-amplitude * 255)}, 0)`;
            return 'rgb(20, 20, 20)';
        }
        
        // Standard color mapping: blue (negative) to yellow to red (positive)
        const normalized = (amplitude + this.amplitude * this.numSources) / (2 * this.amplitude * this.numSources);
        const clamped = Math.max(0, Math.min(1, normalized));
        
        // Create smooth gradient from blue to cyan to yellow to red
        let r, g, b;
        if (clamped < 0.25) {
            // Dark blue to blue
            const t = clamped * 4;
            r = 0;
            g = 0;
            b = Math.floor(51 + 204 * t);
        } else if (clamped < 0.5) {
            // Blue to cyan
            const t = (clamped - 0.25) * 4;
            r = 0;
            g = Math.floor(255 * t);
            b = 255;
        } else if (clamped < 0.75) {
            // Cyan to yellow
            const t = (clamped - 0.5) * 4;
            r = Math.floor(255 * t);
            g = 255;
            b = Math.floor(255 * (1 - t));
        } else {
            // Yellow to red
            const t = (clamped - 0.75) * 4;
            r = 255;
            g = Math.floor(255 * (1 - t));
            b = 0;
        }
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Render 2D ripple interference pattern
    render2D() {
        const resolution = 2; // Pixels per calculation (higher = faster but less detail)
        
        // Create image data for fast rendering
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        for (let y = 0; y < this.height; y += resolution) {
            for (let x = 0; x < this.width; x += resolution) {
                const amplitude = this.calculateWaveAt(x, y, this.time);
                const color = this.amplitudeToColor(amplitude, this.mode);
                
                // Parse RGB values
                const rgb = color.match(/\d+/g).map(Number);
                
                // Fill resolution x resolution block
                for (let dy = 0; dy < resolution && y + dy < this.height; dy++) {
                    for (let dx = 0; dx < resolution && x + dx < this.width; dx++) {
                        const idx = ((y + dy) * this.width + (x + dx)) * 4;
                        data[idx] = rgb[0];
                        data[idx + 1] = rgb[1];
                        data[idx + 2] = rgb[2];
                        data[idx + 3] = 255;
                    }
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        
        // Draw grid if enabled
        if (this.showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            for (let x = 0; x < this.width; x += this.wavelength) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y < this.height; y += this.wavelength) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
            }
        }
        
        // Draw sources
        if (this.showSources) {
            for (const source of this.sources) {
                // Pulsing circle at source
                const pulse = Math.sin(2 * Math.PI * this.frequency * this.time) * 0.5 + 0.5;
                
                this.ctx.beginPath();
                this.ctx.arc(source.x, source.y, 8 + pulse * 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + pulse * 0.5})`;
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(source.x, source.y, 4, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgb(255, 215, 0)';
                this.ctx.fill();
                
                // Label
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '12px monospace';
                this.ctx.fillText(`S${this.sources.indexOf(source) + 1}`, source.x + 12, source.y - 10);
            }
        }
    }
    
    // Render 1D wave view
    render1D() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid
        if (this.showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            // Horizontal center line
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height / 2);
            this.ctx.lineTo(this.width, this.height / 2);
            this.ctx.stroke();
        }
        
        const centerY = this.height / 2;
        const scale = this.height / 6;
        
        // Draw individual waves from each source
        this.sources.forEach((source, idx) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `hsla(${idx * 120}, 70%, 60%, 0.4)`;
            this.ctx.lineWidth = 2;
            
            for (let x = 0; x < this.width; x++) {
                const k = (2 * Math.PI) / this.wavelength;
                const omega = 2 * Math.PI * this.frequency;
                const wave = source.amplitude * Math.sin(k * x - omega * this.time + source.phase);
                const y = centerY - wave * scale;
                
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        });
        
        // Draw interference pattern (sum)
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgb(255, 215, 0)';
        this.ctx.lineWidth = 3;
        
        for (let x = 0; x < this.width; x++) {
            let totalWave = 0;
            
            for (const source of this.sources) {
                const k = (2 * Math.PI) / this.wavelength;
                const omega = 2 * Math.PI * this.frequency;
                totalWave += source.amplitude * Math.sin(k * x - omega * this.time + source.phase);
            }
            
            const y = centerY - totalWave * scale;
            
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Labels
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Individual Waves (faded)', 10, 20);
        this.ctx.fillText('Interference Pattern (bright)', 10, 40);
    }
    
    render() {
        if (this.mode === '1d') {
            this.render1D();
        } else {
            this.render2D();
        }
        
        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now - this.fpsUpdateTime > 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = now;
        }
    }
    
    animate() {
        if (this.animate) {
            const now = performance.now();
            const delta = (now - this.lastFrameTime) / 1000;
            this.time += delta * 0.5; // Slow down animation a bit
            this.lastFrameTime = now;
        }
        
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.animationId === null) {
            this.lastFrameTime = performance.now();
            this.animate();
        }
    }
    
    stop() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    reset() {
        this.time = 0;
        this.initializeSources();
        this.render();
    }
    
    setNumSources(num) {
        this.numSources = num;
        this.initializeSources();
    }
    
    setMode(mode) {
        this.mode = mode;
        this.render();
    }
}

// UI Controller
class WaveUI {
    constructor() {
        this.canvas = document.getElementById('wave-canvas');
        this.simulator = new WaveSimulator(this.canvas);
        
        this.initControls();
        this.initModeSelector();
        this.initPresets();
        this.updateStats();
        
        this.simulator.start();
        
        // Update stats periodically
        setInterval(() => this.updateStats(), 100);
    }
    
    initControls() {
        // Number of sources
        const sourcesSlider = document.getElementById('sources');
        const sourcesValue = document.getElementById('sources-value');
        sourcesSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            sourcesValue.textContent = value;
            this.simulator.setNumSources(value);
        });
        
        // Frequency
        const freqSlider = document.getElementById('frequency');
        const freqValue = document.getElementById('freq-value');
        freqSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            freqValue.textContent = value.toFixed(2) + ' Hz';
            this.simulator.frequency = value;
        });
        
        // Wavelength
        const wavelengthSlider = document.getElementById('wavelength');
        const wavelengthValue = document.getElementById('wavelength-value');
        wavelengthSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            wavelengthValue.textContent = value + ' px';
            this.simulator.wavelength = value;
        });
        
        // Amplitude
        const amplitudeSlider = document.getElementById('amplitude');
        const amplitudeValue = document.getElementById('amplitude-value');
        amplitudeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            amplitudeValue.textContent = value.toFixed(1);
            this.simulator.amplitude = value;
            this.simulator.initializeSources();
        });
        
        // Phase
        const phaseSlider = document.getElementById('phase');
        const phaseValue = document.getElementById('phase-value');
        phaseSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            phaseValue.textContent = value + '°';
            this.simulator.phase = value;
            this.simulator.initializeSources();
        });
        
        // Checkboxes
        document.getElementById('show-sources').addEventListener('change', (e) => {
            this.simulator.showSources = e.target.checked;
        });
        
        document.getElementById('animate').addEventListener('change', (e) => {
            this.simulator.animate = e.target.checked;
        });
        
        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.simulator.showGrid = e.target.checked;
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.simulator.reset();
        });
    }
    
    initModeSelector() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.simulator.setMode(btn.dataset.mode);
            });
        });
    }
    
    initPresets() {
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadPreset(btn.dataset.preset);
            });
        });
    }
    
    loadPreset(preset) {
        switch (preset) {
            case 'double-slit':
                this.setValues({ sources: 2, frequency: 3.14, wavelength: 40, amplitude: 1.0, phase: 0 });
                this.simulator.setMode('2d');
                break;
            
            case 'beats':
                this.setValues({ sources: 2, frequency: 3.0, wavelength: 50, amplitude: 1.0, phase: 90 });
                this.simulator.setMode('1d');
                break;
            
            case 'standing':
                this.setValues({ sources: 2, frequency: 4.0, wavelength: 60, amplitude: 1.0, phase: 180 });
                this.simulator.setMode('1d');
                break;
            
            case 'interference':
                this.setValues({ sources: 3, frequency: 3.14, wavelength: 50, amplitude: 1.0, phase: 120 });
                this.simulator.setMode('2d');
                break;
            
            case 'quantum':
                this.setValues({ sources: 1, frequency: 5.0, wavelength: 30, amplitude: 1.5, phase: 0 });
                this.simulator.setMode('2d');
                break;
        }
        
        // Update mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.simulator.mode) {
                btn.classList.add('active');
            }
        });
    }
    
    setValues(values) {
        if (values.sources !== undefined) {
            document.getElementById('sources').value = values.sources;
            document.getElementById('sources-value').textContent = values.sources;
            this.simulator.setNumSources(values.sources);
        }
        
        if (values.frequency !== undefined) {
            document.getElementById('frequency').value = values.frequency;
            document.getElementById('freq-value').textContent = values.frequency.toFixed(2) + ' Hz';
            this.simulator.frequency = values.frequency;
        }
        
        if (values.wavelength !== undefined) {
            document.getElementById('wavelength').value = values.wavelength;
            document.getElementById('wavelength-value').textContent = values.wavelength + ' px';
            this.simulator.wavelength = values.wavelength;
        }
        
        if (values.amplitude !== undefined) {
            document.getElementById('amplitude').value = values.amplitude;
            document.getElementById('amplitude-value').textContent = values.amplitude.toFixed(1);
            this.simulator.amplitude = values.amplitude;
        }
        
        if (values.phase !== undefined) {
            document.getElementById('phase').value = values.phase;
            document.getElementById('phase-value').textContent = values.phase + '°';
            this.simulator.phase = values.phase;
        }
        
        this.simulator.initializeSources();
    }
    
    updateStats() {
        document.getElementById('fps').textContent = this.simulator.fps + ' FPS';
        
        const waveSpeed = (this.simulator.frequency * this.simulator.wavelength).toFixed(0);
        document.getElementById('wave-speed').textContent = waveSpeed + ' px/s';
        
        const interferenceType = this.simulator.numSources > 1 ? 
            'Constructive & Destructive' : 'Single Source';
        document.getElementById('interference-type').textContent = interferenceType;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WaveUI();
});
