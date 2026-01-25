// Regex Playground
// Interactive regex testing and visualization

class RegexPlayground {
    constructor() {
        this.patterns = [
            {
                name: 'Email Address',
                regex: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
                test: 'user@example.com, test.email+tag@domain.co.uk, invalid@'
            },
            {
                name: 'Phone Number (US)',
                regex: '\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})',
                test: '(555) 123-4567, 555-123-4567, 555.123.4567, 5551234567'
            },
            {
                name: 'URL/Website',
                regex: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)',
                test: 'https://example.com, http://www.site.org/path?query=value'
            },
            {
                name: 'IP Address (IPv4)',
                regex: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
                test: '192.168.1.1, 10.0.0.255, 256.1.1.1 (invalid), 8.8.8.8'
            },
            {
                name: 'Hex Color',
                regex: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
                test: '#ffffff, #000, #FF5733, #12345G (invalid)'
            },
            {
                name: 'Date (YYYY-MM-DD)',
                regex: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])',
                test: '2026-01-25, 2025-12-31, 2024-13-40 (invalid)'
            },
            {
                name: 'Time (24h)',
                regex: '([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?',
                test: '23:59:59, 12:30, 9:05, 25:00 (invalid)'
            },
            {
                name: 'Username',
                regex: '^[a-zA-Z0-9_-]{3,16}$',
                test: 'user_name, test-123, ab (too short), this_is_way_too_long_username'
            },
            {
                name: 'Markdown Link',
                regex: '\\[([^\\]]+)\\]\\(([^\\)]+)\\)',
                test: '[Click here](https://example.com) [Another link](url)'
            },
            {
                name: 'HTML Tag',
                regex: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
                test: '<div>content</div>, <img src="pic.jpg" />, <p class="test">text</p>'
            },
            {
                name: 'Credit Card',
                regex: '\\b(?:\\d{4}[- ]?){3}\\d{4}\\b',
                test: '4111-1111-1111-1111, 4111 1111 1111 1111, 4111111111111111'
            },
            {
                name: 'Git Commit Hash',
                regex: '\\b[0-9a-f]{7,40}\\b',
                test: 'abc123f, 1234567890abcdef, commit: a1b2c3d'
            }
        ];

        this.init();
    }

    init() {
        this.renderPatternLibrary();
        this.setupEventListeners();
        this.test();
    }

    renderPatternLibrary() {
        const container = document.getElementById('patternLibrary');
        container.innerHTML = this.patterns.map(pattern => `
            <div class="pattern-item" onclick="regexPlayground.loadPattern('${this.escapeHtml(pattern.regex)}', '${this.escapeHtml(pattern.test)}')">
                <div class="pattern-name">${pattern.name}</div>
                <div class="pattern-regex">/${pattern.regex}/g</div>
            </div>
        `).join('');
    }

    loadPattern(regex, testText) {
        document.getElementById('regexPattern').value = this.unescapeHtml(regex);
        document.getElementById('testString').value = this.unescapeHtml(testText);
        this.test();
    }

    setupEventListeners() {
        const pattern = document.getElementById('regexPattern');
        const testString = document.getElementById('testString');
        const flagG = document.getElementById('flagG');
        const flagI = document.getElementById('flagI');
        const flagM = document.getElementById('flagM');

        [pattern, testString, flagG, flagI, flagM].forEach(el => {
            el.addEventListener('input', () => this.test());
            el.addEventListener('change', () => this.test());
        });
    }

    test() {
        const patternText = document.getElementById('regexPattern').value;
        const testString = document.getElementById('testString').value;
        const resultsContainer = document.getElementById('resultsContainer');

        if (!patternText) {
            resultsContainer.innerHTML = '<div class="explanation"><h4>💡 Enter a regex pattern to begin</h4><p>Try selecting a pattern from the library on the left, or write your own!</p></div>';
            return;
        }

        try {
            const flags = this.getFlags();
            const regex = new RegExp(patternText, flags);
            
            const matches = [];
            let match;

            if (flags.includes('g')) {
                while ((match = regex.exec(testString)) !== null) {
                    matches.push({
                        text: match[0],
                        index: match.index,
                        groups: match.slice(1),
                        fullMatch: match
                    });
                    // Prevent infinite loop
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                }
            } else {
                match = regex.exec(testString);
                if (match) {
                    matches.push({
                        text: match[0],
                        index: match.index,
                        groups: match.slice(1),
                        fullMatch: match
                    });
                }
            }

            this.renderResults(testString, matches, regex, patternText);
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="error">
                    <strong>❌ Invalid Regular Expression</strong><br>
                    ${error.message}
                </div>
            `;
        }
    }

    getFlags() {
        let flags = '';
        if (document.getElementById('flagG').checked) flags += 'g';
        if (document.getElementById('flagI').checked) flags += 'i';
        if (document.getElementById('flagM').checked) flags += 'm';
        return flags;
    }

    renderResults(testString, matches, regex, patternText) {
        const resultsContainer = document.getElementById('resultsContainer');
        
        if (matches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="results">
                    <h3>No Matches Found</h3>
                    <div class="highlighted-text">${this.escapeHtml(testString)}</div>
                </div>
            `;
            return;
        }

        const highlighted = this.highlightMatches(testString, matches);
        const explanation = this.explainPattern(patternText);
        
        resultsContainer.innerHTML = `
            <div class="explanation">
                <h4>🔍 Pattern Breakdown</h4>
                ${explanation}
            </div>

            <div class="results">
                <h3>✅ Found ${matches.length} Match${matches.length !== 1 ? 'es' : ''}</h3>
                
                <div class="highlighted-text">${highlighted}</div>

                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-value">${matches.length}</div>
                        <div class="stat-label">Total Matches</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${Math.max(...matches.map(m => m.groups.length))}</div>
                        <div class="stat-label">Capture Groups</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${testString.length}</div>
                        <div class="stat-label">String Length</div>
                    </div>
                </div>

                <div class="matches-list">
                    ${matches.map((match, i) => `
                        <div class="match-item">
                            <div class="match-text">Match ${i + 1}: "${this.escapeHtml(match.text)}"</div>
                            <div class="match-info">
                                Position: ${match.index} - ${match.index + match.text.length}
                                ${match.groups.length > 0 ? `<br>Groups: ${match.groups.map((g, gi) => `<span style="color: ${this.getGroupColor(gi)}">${g || '(empty)'}</span>`).join(', ')}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    highlightMatches(text, matches) {
        if (matches.length === 0) return this.escapeHtml(text);

        let result = '';
        let lastIndex = 0;

        // Sort matches by index
        matches.sort((a, b) => a.index - b.index);

        matches.forEach(match => {
            // Add text before match
            result += this.escapeHtml(text.substring(lastIndex, match.index));
            
            // Add highlighted match
            result += `<span class="match">${this.escapeHtml(match.text)}</span>`;
            
            lastIndex = match.index + match.text.length;
        });

        // Add remaining text
        result += this.escapeHtml(text.substring(lastIndex));

        return result;
    }

    explainPattern(pattern) {
        const explanations = [];
        
        // Simple pattern breakdown
        if (pattern.includes('\\d')) explanations.push('<div class="explanation-item"><span class="explanation-part">\\d</span> - Matches any digit (0-9)</div>');
        if (pattern.includes('\\w')) explanations.push('<div class="explanation-item"><span class="explanation-part">\\w</span> - Matches word characters (a-z, A-Z, 0-9, _)</div>');
        if (pattern.includes('\\s')) explanations.push('<div class="explanation-item"><span class="explanation-part">\\s</span> - Matches whitespace (space, tab, newline)</div>');
        if (pattern.includes('+')) explanations.push('<div class="explanation-item"><span class="explanation-part">+</span> - Matches 1 or more of the preceding element</div>');
        if (pattern.includes('*')) explanations.push('<div class="explanation-item"><span class="explanation-part">*</span> - Matches 0 or more of the preceding element</div>');
        if (pattern.includes('?')) explanations.push('<div class="explanation-item"><span class="explanation-part">?</span> - Matches 0 or 1 of the preceding element</div>');
        if (pattern.includes('^')) explanations.push('<div class="explanation-item"><span class="explanation-part">^</span> - Matches start of line</div>');
        if (pattern.includes('$')) explanations.push('<div class="explanation-item"><span class="explanation-part">$</span> - Matches end of line</div>');
        if (pattern.includes('\\b')) explanations.push('<div class="explanation-item"><span class="explanation-part">\\b</span> - Matches word boundary</div>');
        if (pattern.includes('.')) explanations.push('<div class="explanation-item"><span class="explanation-part">.</span> - Matches any character (except newline)</div>');
        if (pattern.match(/\[.*?\]/)) explanations.push('<div class="explanation-item"><span class="explanation-part">[...]</span> - Character class (matches any character inside)</div>');
        if (pattern.match(/\(.*?\)/)) explanations.push('<div class="explanation-item"><span class="explanation-part">(...)</span> - Capture group (saves the match)</div>');
        if (pattern.includes('|')) explanations.push('<div class="explanation-item"><span class="explanation-part">|</span> - Alternation (OR operator)</div>');
        if (pattern.match(/\{.*?\}/)) explanations.push('<div class="explanation-item"><span class="explanation-part">{n,m}</span> - Quantifier (matches between n and m times)</div>');

        if (explanations.length === 0) {
            return '<div class="explanation-item">Pattern uses literal characters or advanced features</div>';
        }

        return explanations.join('');
    }

    getGroupColor(index) {
        const colors = ['#ff6b6b', '#ffb84d', '#48dbfb', '#a29bfe', '#fd79a8'];
        return colors[index % colors.length];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    unescapeHtml(text) {
        const div = document.createElement('div');
        div.innerHTML = text;
        return div.textContent;
    }
}

// Global instance
let regexPlayground;

window.addEventListener('load', () => {
    regexPlayground = new RegexPlayground();
});
