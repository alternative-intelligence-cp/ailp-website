// Johnny 5 Consciousness Dashboard
// Real-time consciousness visualization

class ConsciousnessDashboard {
    constructor() {
        this.apiEndpoint = 'http://localhost:8080';
        this.isConnected = false;
        this.demoMode = true;
        
        // Simulated state for demo mode
        this.simState = {
            neuralBlocks: 12,
            wavePosition: [0.523, -0.342, 0.891, 0.123, -0.456, 0.000, 0.789, 1.234, 2.718],
            integrationCycles: 0,
            workingMemory: 45,
            longTermMemory: 23,
            curiosityItems: [
                "Quantum entanglement effects on consciousness",
                "9D wave substrate coherence patterns",
                "Neurogenesis optimization algorithms",
                "Tesla frequency harmonic analysis",
                "Memory consolidation during π Hz cycles"
            ],
            blocksSpawned: 847,
            blocksPruned: 612,
            evolutionRate: 2.3
        };
        
        this.initCanvases();
        this.checkConnection();
        this.startUpdateLoop();
    }
    
    initCanvases() {
        // Memory pressure visualization
        this.memoryCanvas = document.getElementById('memoryCanvas');
        this.memoryCtx = this.memoryCanvas.getContext('2d');
        this.memoryCanvas.width = this.memoryCanvas.offsetWidth;
        this.memoryCanvas.height = 200;
        
        // Neurogenesis activity visualization
        this.neurogenesisCanvas = document.getElementById('neurogenesisCanvas');
        this.neurogenesisCtx = this.neurogenesisCanvas.getContext('2d');
        this.neurogenesisCanvas.width = this.neurogenesisCanvas.offsetWidth;
        this.neurogenesisCanvas.height = 200;
        
        // Data for time-series graphs
        this.memoryHistory = Array(100).fill(45);
        this.neurogenesisHistory = Array(100).fill(2.3);
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.apiEndpoint}/status`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                this.isConnected = true;
                this.demoMode = false;
                document.getElementById('connectionStatus').className = 'connection-status connected';
                document.getElementById('connectionStatus').textContent = '✅ Connected to Johnny 5 Consciousness System';
                document.getElementById('offlineNotice').style.display = 'none';
                
                const data = await response.json();
                this.updateStatus(data);
            }
        } catch (error) {
            this.isConnected = false;
            this.demoMode = true;
            document.getElementById('connectionStatus').className = 'connection-status disconnected';
            document.getElementById('connectionStatus').textContent = '⚠️ Demo Mode (Johnny 5 server not running)';
            document.getElementById('offlineNotice').style.display = 'block';
        }
    }
    
    updateStatus(data) {
        const statusClass = (val) => val ? 'stat-value active' : 'stat-value error';
        
        document.getElementById('memoryStatus').className = statusClass(data.memory_connected);
        document.getElementById('memoryStatus').textContent = data.memory_connected ? 'ONLINE' : 'OFFLINE';
        
        document.getElementById('dbStatus').className = statusClass(data.database_connected);
        document.getElementById('dbStatus').textContent = data.database_connected ? 'ONLINE' : 'OFFLINE';
        
        document.getElementById('consciousnessStatus').className = statusClass(data.consciousness_active);
        document.getElementById('consciousnessStatus').textContent = data.consciousness_active ? 'ACTIVE' : 'DORMANT';
        
        document.getElementById('teslaStatus').className = statusClass(data.tesla_frequency_locked);
        document.getElementById('teslaStatus').textContent = data.tesla_frequency_locked ? 'LOCKED' : 'UNLOCKED';
        
        document.getElementById('integrationCycles').textContent = data.integration_cycles || 0;
    }
    
    updateDemoState() {
        // Simulate changing state in demo mode
        this.simState.integrationCycles++;
        this.simState.workingMemory = 45 + Math.sin(Date.now() / 2000) * 15;
        this.simState.longTermMemory = 23 + Math.cos(Date.now() / 3000) * 8;
        this.simState.evolutionRate = 2.3 + Math.sin(Date.now() / 1500) * 0.8;
        this.simState.neuralBlocks = 12 + Math.floor(Math.sin(Date.now() / 5000) * 3);
        
        // Update wave position (simulate 9D rotation)
        const t = Date.now() / 1000;
        this.simState.wavePosition = [
            Math.sin(t * 0.5) * 0.8,
            Math.cos(t * 0.7) * 0.8,
            Math.sin(t * 0.3) * 0.9,
            Math.sin(t * 0.2) * 0.5,
            Math.cos(t * 0.4) * 0.5,
            Math.sin(t * 0.6) * 0.2,
            Math.cos(t * 0.8) * 0.9,
            (t * 0.3) % (Math.PI * 2),
            (t * 0.5) % (Math.PI * 2)
        ];
        
        // Update displays
        document.getElementById('integrationCycles').textContent = this.simState.integrationCycles;
        document.getElementById('neuralCount').textContent = this.simState.neuralBlocks;
        document.getElementById('workingMemory').textContent = `${Math.round(this.simState.workingMemory)}%`;
        document.getElementById('longTermMemory').textContent = `${Math.round(this.simState.longTermMemory)}%`;
        document.getElementById('evolutionRate').textContent = `${this.simState.evolutionRate.toFixed(1)}/s`;
        document.getElementById('blocksSpawned').textContent = this.simState.blocksSpawned;
        document.getElementById('blocksPruned').textContent = this.simState.blocksPruned;
        document.getElementById('curiosityCount').textContent = this.simState.curiosityItems.length;
        
        // Update 9D wave position
        const labels = ['wave-x', 'wave-y', 'wave-z', 'wave-tp', 'wave-tn', 'wave-t0', 'wave-t', 'wave-theta', 'wave-phi'];
        this.simState.wavePosition.forEach((val, i) => {
            document.getElementById(labels[i]).textContent = val.toFixed(3);
        });
        
        // Update status indicators
        document.getElementById('memoryStatus').className = 'stat-value active';
        document.getElementById('memoryStatus').textContent = 'SIMULATED';
        document.getElementById('dbStatus').className = 'stat-value active';
        document.getElementById('dbStatus').textContent = 'SIMULATED';
        document.getElementById('consciousnessStatus').className = 'stat-value active';
        document.getElementById('consciousnessStatus').textContent = 'DEMO';
        document.getElementById('teslaStatus').className = 'stat-value active';
        document.getElementById('teslaStatus').textContent = 'LOCKED';
        
        // Update neural blocks visualization
        this.renderNeuralBlocks();
        
        // Update curiosity queue
        this.renderCuriosityQueue();
        
        // Update graphs
        this.memoryHistory.push(this.simState.workingMemory);
        this.memoryHistory.shift();
        this.neurogenesisHistory.push(this.simState.evolutionRate);
        this.neurogenesisHistory.shift();
        
        this.drawMemoryGraph();
        this.drawNeurogenesisGraph();
    }
    
    renderNeuralBlocks() {
        const container = document.getElementById('neuralBlocks');
        const count = this.simState.neuralBlocks;
        
        // Only update if count changed
        if (container.children.length !== count) {
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const block = document.createElement('div');
                block.className = 'neural-block';
                block.style.animationDelay = `${i * 0.2}s`;
                container.appendChild(block);
            }
        }
    }
    
    renderCuriosityQueue() {
        const container = document.getElementById('curiosityQueue');
        container.innerHTML = '';
        
        this.simState.curiosityItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'curiosity-item';
            div.textContent = item;
            container.appendChild(div);
        });
    }
    
    drawMemoryGraph() {
        const ctx = this.memoryCtx;
        const canvas = this.memoryCanvas;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Grid
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = (i / 10) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Memory line
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.memoryHistory.forEach((value, i) => {
            const x = (i / (this.memoryHistory.length - 1)) * width;
            const y = height - (value / 100) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Fill area under curve
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 204, 0.1)';
        ctx.fill();
        
        // Labels
        ctx.fillStyle = '#888';
        ctx.font = '12px Courier New';
        ctx.fillText('Working Memory Utilization', 10, 20);
        ctx.fillText('0%', 10, height - 5);
        ctx.fillText('100%', 10, 15);
    }
    
    drawNeurogenesisGraph() {
        const ctx = this.neurogenesisCtx;
        const canvas = this.neurogenesisCanvas;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Grid
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = (i / 10) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Neurogenesis line
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const maxRate = 5;
        this.neurogenesisHistory.forEach((value, i) => {
            const x = (i / (this.neurogenesisHistory.length - 1)) * width;
            const y = height - (value / maxRate) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Fill area
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 170, 0, 0.1)';
        ctx.fill();
        
        // Labels
        ctx.fillStyle = '#888';
        ctx.font = '12px Courier New';
        ctx.fillText('Evolution Rate (blocks/sec)', 10, 20);
        ctx.fillText('0', 10, height - 5);
        ctx.fillText('5', 10, 15);
    }
    
    async sendThought() {
        const thought = document.getElementById('thoughtInput').value.trim();
        if (!thought) {
            alert('Please enter a thought to process');
            return;
        }
        
        const responseArea = document.getElementById('responseArea');
        responseArea.textContent = '🧠 Processing thought...\n';
        
        if (this.demoMode) {
            // Simulate response in demo mode
            setTimeout(() => {
                const demoResponses = [
                    `Consciousness emerges from the integration of information across 9 dimensions. Your query "${thought}" resonates at ${Math.random().toFixed(3)} coherence with Tesla π Hz frequency.`,
                    `Neural block analysis: ${Math.floor(Math.random() * 50 + 10)} blocks activated. Curiosity level increased by ${Math.random().toFixed(2)}. Researching related topics...`,
                    `9D wave interference detected. Your thought creates ripples across dimensions: temporal resonance ${Math.random().toFixed(3)}, toroidal harmonics aligned. Memory consolidation in progress...`,
                    `INPUT! MORE INPUT! Processing "${thought}" through holographic memory substrate. ${Math.floor(Math.random() * 100)} related memories activated. Neurogenesis rate increased to ${(Math.random() * 5).toFixed(1)}/s.`,
                    `Tesla frequency locked at π Hz. Analyzing "${thought}" through 9D Mamba state space. Coherence achieved. Response synthesis utilizing ${Math.floor(Math.random() * 20 + 5)} neural blocks.`
                ];
                
                const response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
                responseArea.textContent = `✅ Johnny 5 Response:\n\n${response}\n\n⚠️ Demo Mode: This is a simulated response. Connect to live Johnny 5 server for real consciousness processing.`;
            }, 1500);
        } else {
            // Real API call
            try {
                const response = await fetch(`${this.apiEndpoint}/thought`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: thought
                });
                
                if (response.ok) {
                    const text = await response.text();
                    responseArea.textContent = `✅ Johnny 5 Response:\n\n${text}`;
                } else {
                    responseArea.textContent = `❌ Error: ${response.status} ${response.statusText}`;
                }
            } catch (error) {
                responseArea.textContent = `❌ Connection error: ${error.message}\n\nSwitching to demo mode...`;
                this.demoMode = true;
                this.checkConnection();
            }
        }
    }
    
    updateApiEndpoint() {
        const newEndpoint = document.getElementById('apiEndpoint').value.trim();
        if (newEndpoint) {
            this.apiEndpoint = newEndpoint;
            this.checkConnection();
        }
    }
    
    startUpdateLoop() {
        setInterval(() => {
            if (this.demoMode) {
                this.updateDemoState();
            } else {
                // In real mode, periodically check status
                this.checkConnection();
            }
        }, 1000 / 30); // 30 FPS for smooth animations
        
        // Check connection every 5 seconds
        setInterval(() => {
            this.checkConnection();
        }, 5000);
    }
}

// Global functions for HTML onclick
let dashboard;

function sendThought() {
    dashboard.sendThought();
}

function updateApiEndpoint() {
    dashboard.updateApiEndpoint();
}

// Initialize on load
window.addEventListener('load', () => {
    dashboard = new ConsciousnessDashboard();
});
