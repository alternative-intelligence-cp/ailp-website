// Git Command Visualizer
// Interactive visualization of Git operations

class GitRepo {
    constructor() {
        this.commits = [];
        this.branches = {};
        this.head = 'main';
        this.commitCounter = 0;
        this.stash = [];
    }

    createCommit(message, branch, parents = null) {
        const commit = {
            id: `c${this.commitCounter++}`,
            hash: this.generateHash(),
            message: message,
            branch: branch,
            parents: parents || (this.branches[branch] ? [this.branches[branch]] : []),
            timestamp: Date.now()
        };
        this.commits.push(commit);
        this.branches[branch] = commit.id;
        return commit;
    }

    generateHash() {
        return Math.random().toString(36).substring(2, 9);
    }

    getCurrentCommit() {
        return this.commits.find(c => c.id === this.branches[this.head]);
    }

    findCommit(id) {
        return this.commits.find(c => c.id === id);
    }

    getBranchTip(branch) {
        return this.branches[branch];
    }
}

class GitVisualizer {
    constructor() {
        this.canvas = document.getElementById('gitCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.repo = new GitRepo();
        this.commandLog = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.loadScenario('basic');
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.draw();
    }

    loadScenario(scenario) {
        this.repo = new GitRepo();
        this.commandLog = [];
        
        switch(scenario) {
            case 'basic':
                this.setupBasicScenario();
                break;
            case 'conflict':
                this.setupConflictScenario();
                break;
            case 'hotfix':
                this.setupHotfixScenario();
                break;
            case 'complex':
                this.setupComplexScenario();
                break;
        }
        
        this.updateDisplay();
        this.logCommand('Loaded scenario', `Initialized ${scenario} scenario`);
    }

    setupBasicScenario() {
        // Main branch
        this.repo.createCommit('Initial commit', 'main', []);
        this.repo.createCommit('Add README', 'main');
        this.repo.createCommit('Setup project structure', 'main');
        
        // Feature branch diverges
        const featureStart = this.repo.getBranchTip('main');
        this.repo.branches['feature'] = featureStart;
        this.repo.createCommit('Start feature development', 'feature');
        this.repo.createCommit('Implement feature logic', 'feature');
        
        // Main continues
        this.repo.head = 'main';
        this.repo.createCommit('Fix bug in production', 'main');
    }

    setupConflictScenario() {
        this.repo.createCommit('Initial commit', 'main', []);
        this.repo.createCommit('Add config.js', 'main');
        
        const featureStart = this.repo.getBranchTip('main');
        this.repo.branches['feature'] = featureStart;
        
        this.repo.createCommit('Update config - feature way', 'feature');
        this.repo.head = 'main';
        this.repo.createCommit('Update config - main way', 'main');
    }

    setupHotfixScenario() {
        this.repo.createCommit('v1.0 release', 'main', []);
        this.repo.createCommit('v1.1 development', 'main');
        
        const featureStart = this.repo.getBranchTip('main');
        this.repo.branches['feature'] = featureStart;
        this.repo.createCommit('New feature WIP', 'feature');
        
        const hotfixStart = this.repo.commits[0].id; // From v1.0
        this.repo.branches['hotfix'] = hotfixStart;
        this.repo.createCommit('Critical security fix', 'hotfix');
    }

    setupComplexScenario() {
        this.repo.createCommit('Initial commit', 'main', []);
        this.repo.createCommit('Add core features', 'main');
        
        const featureStart = this.repo.getBranchTip('main');
        this.repo.branches['feature-a'] = featureStart;
        this.repo.branches['feature-b'] = featureStart;
        
        this.repo.createCommit('Feature A progress', 'feature-a');
        this.repo.createCommit('Feature B progress', 'feature-b');
        this.repo.createCommit('Main continues', 'main');
        this.repo.createCommit('Feature A done', 'feature-a');
    }

    gitCommand(command, arg) {
        switch(command) {
            case 'commit':
                this.doCommit();
                break;
            case 'checkout':
                this.doCheckout(arg);
                break;
            case 'branch':
                this.doBranch(arg);
                break;
            case 'merge':
                this.doMerge(arg);
                break;
            case 'rebase':
                this.doRebase(arg);
                break;
            case 'reset':
                this.doReset(arg);
                break;
            case 'cherry-pick':
                this.doCherryPick();
                break;
            case 'amend':
                this.doAmend();
                break;
            case 'revert':
                this.doRevert();
                break;
            case 'stash':
                this.doStash();
                break;
            case 'stash-pop':
                this.doStashPop();
                break;
        }
        this.updateDisplay();
    }

    doCommit() {
        const msg = `New commit on ${this.repo.head}`;
        this.repo.createCommit(msg, this.repo.head);
        this.logCommand(`git commit -m "${msg}"`, `Created new commit on ${this.repo.head}`);
    }

    doCheckout(branch) {
        if (this.repo.branches[branch]) {
            this.repo.head = branch;
            this.logCommand(`git checkout ${branch}`, `Switched to branch '${branch}'`);
        } else {
            this.logCommand(`git checkout ${branch}`, `Error: branch '${branch}' does not exist`, true);
        }
    }

    doBranch(name) {
        if (!this.repo.branches[name]) {
            this.repo.branches[name] = this.repo.getBranchTip(this.repo.head);
            this.logCommand(`git branch ${name}`, `Created new branch '${name}' from ${this.repo.head}`);
        } else {
            this.logCommand(`git branch ${name}`, `Error: branch '${name}' already exists`, true);
        }
    }

    doMerge(branch) {
        if (!this.repo.branches[branch]) {
            this.logCommand(`git merge ${branch}`, `Error: branch '${branch}' does not exist`, true);
            return;
        }

        const currentTip = this.repo.getBranchTip(this.repo.head);
        const mergeTip = this.repo.getBranchTip(branch);
        
        const mergeCommit = this.repo.createCommit(
            `Merge branch '${branch}' into ${this.repo.head}`,
            this.repo.head,
            [currentTip, mergeTip]
        );
        
        this.logCommand(
            `git merge ${branch}`,
            `Merged ${branch} into ${this.repo.head} (merge commit: ${mergeCommit.hash})`
        );
    }

    doRebase(targetBranch) {
        if (!this.repo.branches[targetBranch]) {
            this.logCommand(`git rebase ${targetBranch}`, `Error: branch '${targetBranch}' does not exist`, true);
            return;
        }

        // Find commits unique to current branch
        const currentBranch = this.repo.head;
        const currentTip = this.repo.getBranchTip(currentBranch);
        const targetTip = this.repo.getBranchTip(targetBranch);
        
        // Simplified: just move the branch pointer
        this.repo.branches[currentBranch] = targetTip;
        
        // Create new commits on top
        const newCommit = this.repo.createCommit(
            `Rebased commit from ${currentBranch}`,
            currentBranch
        );
        
        this.logCommand(
            `git rebase ${targetBranch}`,
            `Rebased ${currentBranch} onto ${targetBranch} (commits replayed)`
        );
    }

    doReset(mode) {
        const current = this.repo.getCurrentCommit();
        if (!current || !current.parents.length) {
            this.logCommand(`git reset --${mode} HEAD~1`, `Error: no parent commit to reset to`, true);
            return;
        }

        const parent = current.parents[0];
        this.repo.branches[this.repo.head] = parent;
        
        this.logCommand(
            `git reset --${mode} HEAD~1`,
            `Reset ${this.repo.head} to ${parent} (${mode === 'hard' ? 'working directory updated' : 'index preserved'})`
        );
    }

    doCherryPick() {
        // Find a commit from another branch
        const otherBranches = Object.keys(this.repo.branches).filter(b => b !== this.repo.head);
        if (!otherBranches.length) {
            this.logCommand(`git cherry-pick`, `No other branches to cherry-pick from`, true);
            return;
        }

        const targetBranch = otherBranches[0];
        const commitToPick = this.repo.getBranchTip(targetBranch);
        const pickedCommit = this.repo.findCommit(commitToPick);
        
        if (pickedCommit) {
            this.repo.createCommit(`Cherry-picked: ${pickedCommit.message}`, this.repo.head);
            this.logCommand(
                `git cherry-pick ${pickedCommit.hash}`,
                `Applied commit ${pickedCommit.hash} to ${this.repo.head}`
            );
        }
    }

    doAmend() {
        const current = this.repo.getCurrentCommit();
        if (current) {
            current.message = current.message + ' (amended)';
            current.hash = this.repo.generateHash();
            this.logCommand(`git commit --amend`, `Amended last commit: ${current.hash}`);
        }
    }

    doRevert() {
        const current = this.repo.getCurrentCommit();
        if (current) {
            this.repo.createCommit(`Revert "${current.message}"`, this.repo.head);
            this.logCommand(
                `git revert HEAD`,
                `Created revert commit for ${current.hash}`
            );
        }
    }

    doStash() {
        this.repo.stash.push({ message: 'Stashed changes', timestamp: Date.now() });
        this.logCommand(`git stash`, `Saved working directory to stash (${this.repo.stash.length} items)`);
    }

    doStashPop() {
        if (this.repo.stash.length) {
            const stashed = this.repo.stash.pop();
            this.logCommand(`git stash pop`, `Applied and dropped stash@{0}`);
        } else {
            this.logCommand(`git stash pop`, `Error: no stash entries found`, true);
        }
    }

    logCommand(command, description, isError = false) {
        this.commandLog.unshift({ command, description, isError, timestamp: Date.now() });
        if (this.commandLog.length > 20) this.commandLog.pop();
        
        const logContainer = document.getElementById('commandLog');
        logContainer.innerHTML = this.commandLog.map(entry => `
            <div class="command-entry" style="${entry.isError ? 'border-left-color: #ff4a4a;' : ''}">
                <div class="cmd">${entry.command}</div>
                <div class="desc">${entry.description}</div>
            </div>
        `).join('');
    }

    updateDisplay() {
        this.draw();
        this.updateBranchInfo();
    }

    updateBranchInfo() {
        const branchInfo = document.getElementById('branchInfo');
        branchInfo.innerHTML = Object.keys(this.repo.branches).map(branch => {
            const isCurrent = branch === this.repo.head;
            return `<div class="branch-badge ${isCurrent ? 'current' : ''}">
                ${isCurrent ? '* ' : ''}${branch}
            </div>`;
        }).join('');
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!this.repo.commits.length) return;
        
        // Layout commits
        const layout = this.calculateLayout();
        
        // Draw connections
        ctx.lineWidth = 2;
        this.repo.commits.forEach(commit => {
            const pos = layout[commit.id];
            if (!pos) return;
            
            commit.parents.forEach(parentId => {
                const parentPos = layout[parentId];
                if (!parentPos) return;
                
                ctx.strokeStyle = this.getBranchColor(commit.branch);
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(parentPos.x, parentPos.y);
                ctx.stroke();
            });
        });
        
        // Draw commits
        this.repo.commits.forEach(commit => {
            const pos = layout[commit.id];
            if (!pos) return;
            
            const isHead = this.repo.getBranchTip(this.repo.head) === commit.id;
            const radius = isHead ? 12 : 10;
            
            // Commit circle
            ctx.fillStyle = this.getBranchColor(commit.branch);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // HEAD indicator
            if (isHead) {
                ctx.strokeStyle = '#ff4aff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 3, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Commit hash
            ctx.fillStyle = '#e0e0e0';
            ctx.font = '10px Courier New';
            ctx.fillText(commit.hash, pos.x + 15, pos.y - 5);
            
            // Commit message
            ctx.fillStyle = '#aaa';
            ctx.font = '9px Courier New';
            const shortMsg = commit.message.length > 30 ? commit.message.substring(0, 27) + '...' : commit.message;
            ctx.fillText(shortMsg, pos.x + 15, pos.y + 8);
        });
        
        // Draw branch labels
        Object.keys(this.repo.branches).forEach((branch, index) => {
            const commitId = this.repo.branches[branch];
            const pos = layout[commitId];
            if (!pos) return;
            
            const y = 30 + index * 25;
            ctx.fillStyle = this.getBranchColor(branch);
            ctx.font = 'bold 12px Courier New';
            ctx.fillText(`● ${branch}`, 20, y);
        });
    }

    calculateLayout() {
        const layout = {};
        const branchLanes = {};
        let laneCounter = 0;
        
        // Assign lanes to branches
        Object.keys(this.repo.branches).forEach(branch => {
            if (!branchLanes[branch]) {
                branchLanes[branch] = laneCounter++;
            }
        });
        
        // Position commits
        this.repo.commits.forEach((commit, index) => {
            const lane = branchLanes[commit.branch] || 0;
            layout[commit.id] = {
                x: 100 + index * 80,
                y: 150 + lane * 80
            };
        });
        
        return layout;
    }

    getBranchColor(branch) {
        const colors = {
            'main': '#4aff88',
            'master': '#4aff88',
            'feature': '#4a9eff',
            'feature-a': '#4a9eff',
            'feature-b': '#8a4aff',
            'hotfix': '#ff4a4a',
            'develop': '#ffaa4a'
        };
        return colors[branch] || '#aaaaaa';
    }
}

// Global instance
let visualizer;

function loadScenario() {
    const scenario = document.getElementById('scenarioSelect').value;
    visualizer.loadScenario(scenario);
}

function gitCommand(cmd, arg) {
    visualizer.gitCommand(cmd, arg);
}

// Initialize
window.addEventListener('load', () => {
    visualizer = new GitVisualizer();
});
