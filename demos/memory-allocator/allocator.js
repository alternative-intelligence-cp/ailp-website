// Memory Allocator Visualizer
// Educational demo showing how memory allocators work

class MemoryAllocator {
    constructor(totalSize) {
        this.totalSize = totalSize;
        this.blocks = [{ start: 0, size: totalSize, allocated: false, id: null }];
        this.allocations = [];
        this.nextId = 1;
        this.strategy = 'first-fit';
        this.lastSearchIndex = 0;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
        this.lastSearchIndex = 0;
    }

    allocate(size) {
        let blockIndex = -1;

        switch (this.strategy) {
            case 'first-fit':
                blockIndex = this.firstFit(size);
                break;
            case 'best-fit':
                blockIndex = this.bestFit(size);
                break;
            case 'worst-fit':
                blockIndex = this.worstFit(size);
                break;
            case 'next-fit':
                blockIndex = this.nextFit(size);
                break;
        }

        if (blockIndex === -1) {
            return null; // Allocation failed
        }

        const block = this.blocks[blockIndex];
        const allocationId = this.nextId++;

        // If block is exact size, mark it allocated
        if (block.size === size) {
            block.allocated = true;
            block.id = allocationId;
        } else {
            // Split the block
            const newBlock = {
                start: block.start,
                size: size,
                allocated: true,
                id: allocationId
            };

            block.start += size;
            block.size -= size;

            this.blocks.splice(blockIndex, 0, newBlock);
        }

        this.allocations.push({
            id: allocationId,
            size: size,
            freed: false,
            timestamp: Date.now()
        });

        this.lastSearchIndex = blockIndex;
        return allocationId;
    }

    free(allocationId) {
        const blockIndex = this.blocks.findIndex(b => b.id === allocationId);
        if (blockIndex === -1) return false;

        const block = this.blocks[blockIndex];
        block.allocated = false;
        block.id = null;

        // Mark allocation as freed
        const allocation = this.allocations.find(a => a.id === allocationId);
        if (allocation) {
            allocation.freed = true;
        }

        // Merge with adjacent free blocks
        this.mergeAdjacentFreeBlocks();

        return true;
    }

    mergeAdjacentFreeBlocks() {
        for (let i = 0; i < this.blocks.length - 1; i++) {
            const current = this.blocks[i];
            const next = this.blocks[i + 1];

            if (!current.allocated && !next.allocated) {
                current.size += next.size;
                this.blocks.splice(i + 1, 1);
                i--; // Check again from same position
            }
        }
    }

    firstFit(size) {
        return this.blocks.findIndex(b => !b.allocated && b.size >= size);
    }

    bestFit(size) {
        let bestIndex = -1;
        let bestSize = Infinity;

        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            if (!block.allocated && block.size >= size && block.size < bestSize) {
                bestSize = block.size;
                bestIndex = i;
            }
        }

        return bestIndex;
    }

    worstFit(size) {
        let worstIndex = -1;
        let worstSize = -1;

        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            if (!block.allocated && block.size >= size && block.size > worstSize) {
                worstSize = block.size;
                worstIndex = i;
            }
        }

        return worstIndex;
    }

    nextFit(size) {
        const startIndex = this.lastSearchIndex;
        let currentIndex = startIndex;

        do {
            const block = this.blocks[currentIndex];
            if (!block.allocated && block.size >= size) {
                return currentIndex;
            }

            currentIndex = (currentIndex + 1) % this.blocks.length;
        } while (currentIndex !== startIndex);

        return -1;
    }

    defragment() {
        // Move all allocated blocks to the beginning
        this.blocks.sort((a, b) => {
            if (a.allocated && !b.allocated) return -1;
            if (!a.allocated && b.allocated) return 1;
            return a.start - b.start;
        });

        // Recalculate start positions
        let currentStart = 0;
        for (const block of this.blocks) {
            block.start = currentStart;
            currentStart += block.size;
        }

        // Merge all free blocks at the end
        this.mergeAdjacentFreeBlocks();
    }

    getStats() {
        const totalAllocated = this.blocks
            .filter(b => b.allocated)
            .reduce((sum, b) => sum + b.size, 0);

        const totalFree = this.blocks
            .filter(b => !b.allocated)
            .reduce((sum, b) => sum + b.size, 0);

        const freeBlocks = this.blocks.filter(b => !b.allocated);
        const largestFreeBlock = freeBlocks.length > 0
            ? Math.max(...freeBlocks.map(b => b.size))
            : 0;

        // Fragmentation: (largest free - total free) / total free
        const fragmentation = totalFree > 0
            ? ((totalFree - largestFreeBlock) / totalFree) * 100
            : 0;

        return {
            totalSize: this.totalSize,
            allocated: totalAllocated,
            free: totalFree,
            fragmentation: fragmentation,
            allocations: this.allocations.filter(a => !a.freed).length,
            freeBlocks: freeBlocks.length
        };
    }

    reset(newSize) {
        this.totalSize = newSize || this.totalSize;
        this.blocks = [{ start: 0, size: this.totalSize, allocated: false, id: null }];
        this.allocations = [];
        this.nextId = 1;
        this.lastSearchIndex = 0;
    }
}

// UI Controller
class AllocatorUI {
    constructor() {
        this.allocator = new MemoryAllocator(1024);
        this.blockSize = 16; // Visual block size
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Strategy selection
        document.querySelectorAll('.strategy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.strategy-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.allocator.setStrategy(btn.dataset.strategy);
            });
        });

        // Pool size slider
        const poolSizeSlider = document.getElementById('pool-size');
        const poolSizeValue = document.getElementById('pool-size-value');
        poolSizeSlider.addEventListener('input', () => {
            poolSizeValue.textContent = `${poolSizeSlider.value} bytes`;
        });
        poolSizeSlider.addEventListener('change', () => {
            this.allocator.reset(parseInt(poolSizeSlider.value));
            this.render();
        });

        // Allocation size slider
        const allocSizeSlider = document.getElementById('alloc-size');
        const allocSizeValue = document.getElementById('alloc-size-value');
        allocSizeSlider.addEventListener('input', () => {
            allocSizeValue.textContent = `${allocSizeSlider.value} bytes`;
        });

        // Buttons
        document.getElementById('allocate-btn').addEventListener('click', () => {
            const size = parseInt(document.getElementById('alloc-size').value);
            const id = this.allocator.allocate(size);
            if (id === null) {
                this.showNotification('Allocation failed! Not enough free memory.', 'error');
            } else {
                this.showNotification(`Allocated ${size} bytes (ID: ${id})`, 'success');
            }
            this.render();
        });

        document.getElementById('free-random-btn').addEventListener('click', () => {
            const activeAllocs = this.allocator.allocations.filter(a => !a.freed);
            if (activeAllocs.length === 0) {
                this.showNotification('No allocations to free!', 'error');
                return;
            }

            const randomAlloc = activeAllocs[Math.floor(Math.random() * activeAllocs.length)];
            this.allocator.free(randomAlloc.id);
            this.showNotification(`Freed allocation ${randomAlloc.id} (${randomAlloc.size} bytes)`, 'success');
            this.render();
        });

        document.getElementById('defrag-btn').addEventListener('click', () => {
            this.allocator.defragment();
            this.showNotification('Memory defragmented!', 'success');
            this.render();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.allocator.reset();
            this.showNotification('Memory reset!', 'success');
            this.render();
        });
    }

    render() {
        this.renderMemoryGrid();
        this.renderStats();
        this.renderAllocationList();
    }

    renderMemoryGrid() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';

        const blocksPerRow = 32;
        const totalBlocks = Math.ceil(this.allocator.totalSize / this.blockSize);

        let currentBlockIndex = 0;
        let row = null;

        for (const memBlock of this.allocator.blocks) {
            const numBlocks = Math.ceil(memBlock.size / this.blockSize);

            for (let i = 0; i < numBlocks; i++) {
                if (currentBlockIndex % blocksPerRow === 0) {
                    row = document.createElement('div');
                    row.className = 'memory-row';
                    grid.appendChild(row);
                }

                const block = document.createElement('div');
                block.className = 'memory-block';

                if (memBlock.allocated) {
                    block.classList.add('allocated');
                    block.textContent = memBlock.id;
                } else if (memBlock.size < parseInt(document.getElementById('alloc-size').value)) {
                    block.classList.add('fragmented');
                } else {
                    block.classList.add('free');
                }

                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = memBlock.allocated
                    ? `ID: ${memBlock.id}, ${memBlock.size}B allocated`
                    : `${memBlock.size}B free`;
                block.appendChild(tooltip);

                // Click to free
                if (memBlock.allocated) {
                    block.style.cursor = 'pointer';
                    block.addEventListener('click', () => {
                        this.allocator.free(memBlock.id);
                        this.showNotification(`Freed allocation ${memBlock.id}`, 'success');
                        this.render();
                    });
                }

                row.appendChild(block);
                currentBlockIndex++;
            }
        }
    }

    renderStats() {
        const stats = this.allocator.getStats();

        document.getElementById('stat-total').textContent = `${stats.totalSize} B`;
        document.getElementById('stat-used').textContent = `${stats.allocated} B`;
        document.getElementById('stat-free').textContent = `${stats.free} B`;
        document.getElementById('stat-frag').textContent = `${stats.fragmentation.toFixed(1)}%`;
        document.getElementById('stat-allocs').textContent = stats.allocations;
        document.getElementById('stat-blocks').textContent = stats.freeBlocks;
    }

    renderAllocationList() {
        const list = document.getElementById('allocation-list');
        list.innerHTML = '';

        if (this.allocator.allocations.length === 0) {
            list.innerHTML = '<p style="color: #aaa; text-align: center; padding: 20px;">No allocations yet</p>';
            return;
        }

        // Show most recent first
        const sortedAllocs = [...this.allocator.allocations].reverse();

        for (const alloc of sortedAllocs) {
            const item = document.createElement('div');
            item.className = `allocation-item ${alloc.freed ? 'freed' : 'active'}`;
            item.style.borderLeftColor = alloc.freed ? '#e74c3c' : '#667eea';

            item.innerHTML = `
                <div>
                    <strong>ID ${alloc.id}</strong> - ${alloc.size} bytes
                    ${alloc.freed ? '<span style="color: #e74c3c;"> (FREED)</span>' : ''}
                </div>
                ${!alloc.freed ? `<button class="danger" style="padding: 5px 12px; font-size: 0.9em;" onclick="allocatorUI.allocator.free(${alloc.id}); allocatorUI.render();">Free</button>` : ''}
            `;

            list.appendChild(item);
        }
    }

    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'error' ? '#e74c3c' : '#00b894'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
}

// Initialize when page loads
let allocatorUI;
window.addEventListener('DOMContentLoaded', () => {
    allocatorUI = new AllocatorUI();
});
