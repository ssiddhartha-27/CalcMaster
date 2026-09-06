/**
 * CalcMaster Suite - Scientific Calculator Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const mathEngine = new MathEngine();
    const historyManager = new HistoryManager('calc_history_scientific');

    // DOM Elements
    const exprDisplay = document.getElementById('sci-expression');
    const resultDisplay = document.getElementById('sci-main-result');
    const livePreview = document.getElementById('sci-live-preview');
    const degRadBadge = document.getElementById('indicator-degrad');
    const degRadBtn = document.getElementById('btn-degrad-toggle');
    const invBtn = document.getElementById('btn-inv-toggle');
    const invBadge = document.getElementById('badge-inv');
    const memoryBadge = document.getElementById('badge-memory');
    const copyBtn = document.getElementById('btn-copy');
    const historyDrawer = document.getElementById('history-drawer');
    const historyList = document.getElementById('history-list');
    const toggleHistoryBtn = document.getElementById('btn-history-toggle');
    const closeHistoryBtn = document.getElementById('btn-close-history');
    const clearHistoryBtn = document.getElementById('btn-clear-history');

    // State
    let expression = '';
    let isResultCalculated = false;
    let isInverse = false;

    // Initialize Angle Mode
    function updateAngleModeUI() {
        const mode = mathEngine.getAngleMode();
        if (degRadBadge) degRadBadge.textContent = mode;
        if (degRadBtn) degRadBtn.textContent = mode;
        const miniDeg = document.getElementById('mini-deg-badge');
        const miniRad = document.getElementById('mini-rad-badge');
        if (miniDeg) miniDeg.classList.toggle('on', mode === 'DEG');
        if (miniRad) miniRad.classList.toggle('on', mode === 'RAD');
        updateLivePreview();
    }

    // Toggle Angle Mode (DEG <-> RAD)
    function toggleAngleMode() {
        window.soundManager.playClick('operator');
        const nextMode = mathEngine.getAngleMode() === 'DEG' ? 'RAD' : 'DEG';
        mathEngine.setAngleMode(nextMode);
        updateAngleModeUI();
        showToast(`Angle Mode: ${nextMode}`, 'info', 1200);
    }

    // Toggle 2nd / Inverse Mode
    function toggleInverseMode() {
        window.soundManager.playClick('operator');
        isInverse = !isInverse;
        if (invBtn) invBtn.classList.toggle('active-toggle', isInverse);
        if (invBadge) invBadge.classList.toggle('on', isInverse);

        // Update function button labels & data attributes
        const invMappings = [
            { id: 'btn-sin', normal: 'sin', inv: 'sin⁻¹', normalFunc: 'sin(', invFunc: 'asin(' },
            { id: 'btn-cos', normal: 'cos', inv: 'cos⁻¹', normalFunc: 'cos(', invFunc: 'acos(' },
            { id: 'btn-tan', normal: 'tan', inv: 'tan⁻¹', normalFunc: 'tan(', invFunc: 'atan(' },
            { id: 'btn-ln', normal: 'ln', inv: 'eˣ', normalFunc: 'ln(', invFunc: 'e^(' },
            { id: 'btn-log', normal: 'log', inv: '10ˣ', normalFunc: 'log(', invFunc: '10^(' },
            { id: 'btn-sqr', normal: 'x²', inv: 'x³', normalFunc: '^2', invFunc: '^3' },
            { id: 'btn-sqrt', normal: '√x', inv: '∛x', normalFunc: '√(', invFunc: '∛(' }
        ];

        invMappings.forEach(item => {
            const btn = document.getElementById(item.id);
            if (btn) {
                btn.innerHTML = isInverse ? item.inv : item.normal;
                btn.setAttribute('data-insert', isInverse ? item.invFunc : item.normalFunc);
            }
        });
    }

    // Memory Indicator update
    function updateMemoryUI() {
        const hasMem = mathEngine.hasMemory();
        if (memoryBadge) memoryBadge.classList.toggle('on', hasMem);
    }

    // Update Display
    function updateDisplay() {
        exprDisplay.textContent = expression || '0';
        exprDisplay.scrollLeft = exprDisplay.scrollWidth;
        updateLivePreview();
    }

    // Live Evaluation Preview
    function updateLivePreview() {
        if (!expression || expression === '0' || isResultCalculated) {
            livePreview.textContent = '';
            return;
        }

        try {
            const tempRes = mathEngine.evaluate(expression);
            if (tempRes !== undefined && !isNaN(tempRes) && isFinite(tempRes)) {
                livePreview.textContent = `= ${mathEngine.formatResult(tempRes)}`;
            } else {
                livePreview.textContent = '';
            }
        } catch (e) {
            livePreview.textContent = '';
        }
    }

    // Insert Text into Expression
    function insert(text) {
        window.soundManager.playClick('default');
        
        // If result was just calculated
        if (isResultCalculated) {
            // If typing an operator, chain with previous answer
            if (['+', '−', '-', '×', '*', '÷', '/', '^', '%'].includes(text.trim())) {
                expression = 'Ans ' + text;
            } else {
                expression = text;
            }
            isResultCalculated = false;
        } else {
            if (expression === '0' && !text.startsWith('.')) {
                expression = text;
            } else {
                expression += text;
            }
        }

        updateDisplay();
    }

    // Handle Clear / All Clear
    function handleAllClear() {
        window.soundManager.playClick('action');
        expression = '';
        resultDisplay.textContent = '0';
        livePreview.textContent = '';
        isResultCalculated = false;
        updateDisplay();
    }

    // Smart Backspace
    function handleBackspace() {
        window.soundManager.playClick('default');
        if (isResultCalculated) {
            handleAllClear();
            return;
        }

        if (expression.length === 0) return;

        // Check for multi-character tokens to delete cleanly: e.g. "sin(", "asin(", "log(", "Ans"
        const tokens = ['asin(', 'acos(', 'atan(', 'sinh(', 'cosh(', 'tanh(', 'cbrt(', 'sqrt(', 'log2(', 'log(', 'sin(', 'cos(', 'tan(', 'ln(', 'Ans', 'e^(', '10^('];
        let tokenDeleted = false;

        for (const tok of tokens) {
            if (expression.endsWith(tok)) {
                expression = expression.slice(0, -tok.length);
                tokenDeleted = true;
                break;
            }
        }

        if (!tokenDeleted) {
            expression = expression.slice(0, -1);
        }

        if (expression === '') expression = '0';
        updateDisplay();
    }

    // Toggle Sign (±)
    function toggleSign() {
        window.soundManager.playClick('default');
        if (isResultCalculated) {
            const currentVal = resultDisplay.textContent;
            if (currentVal && currentVal !== '0' && !isNaN(parseFloat(currentVal))) {
                expression = `-( ${currentVal} )`;
                isResultCalculated = false;
                updateDisplay();
            }
            return;
        }

        if (!expression || expression === '0') {
            expression = '-';
        } else if (expression.startsWith('-(') && expression.endsWith(')')) {
            expression = expression.slice(2, -1);
        } else {
            expression = `-(${expression})`;
        }
        updateDisplay();
    }

    // Evaluate Final Result
    function handleEvaluate() {
        window.soundManager.playClick('equals');
        if (!expression || expression === '0') return;

        try {
            const num = mathEngine.evaluate(expression);
            const formatted = mathEngine.formatResult(num);

            resultDisplay.textContent = formatted;
            livePreview.textContent = '';

            // Add to history
            const historyExpr = `${expression} =`;
            historyManager.addItem(historyExpr, formatted);
            renderHistory();

            isResultCalculated = true;
        } catch (err) {
            resultDisplay.textContent = err.message || 'Syntax Error';
            showToast(err.message || 'Syntax Error', 'error', 2500);
        }
    }

    // Memory Actions
    function handleMemory(action) {
        window.soundManager.playClick('operator');
        try {
            let currentVal = isResultCalculated ? 
                parseFloat(resultDisplay.textContent) : 
                mathEngine.evaluate(expression || '0');

            switch (action) {
                case 'mc':
                    mathEngine.memoryClear();
                    showToast('Memory Cleared (0)', 'info', 1500);
                    break;
                case 'mr':
                    const memVal = mathEngine.memoryRecall();
                    insert(mathEngine.formatResult(memVal));
                    showToast(`Memory Recalled: ${mathEngine.formatResult(memVal)}`, 'info', 1500);
                    break;
                case 'm+':
                    mathEngine.memoryAdd(currentVal);
                    showToast(`Added to Memory: ${mathEngine.formatResult(currentVal)}`, 'info', 1500);
                    break;
                case 'm-':
                    mathEngine.memorySubtract(currentVal);
                    showToast(`Subtracted from Memory: ${mathEngine.formatResult(currentVal)}`, 'info', 1500);
                    break;
                case 'ms':
                    mathEngine.memoryStore(currentVal);
                    showToast(`Stored in Memory: ${mathEngine.formatResult(currentVal)}`, 'info', 1500);
                    break;
            }
            updateMemoryUI();
        } catch (e) {
            showToast('Invalid Memory Action', 'error', 1500);
        }
    }

    // History UI Management
    function renderHistory() {
        if (!historyList) return;
        const items = historyManager.getItems();
        if (items.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet.</div>';
            return;
        }

        historyList.innerHTML = items.map(item => `
            <div class="history-item" data-expr="${encodeURIComponent(item.expression)}" data-res="${item.result}">
                <div class="history-item-expr">${item.expression}</div>
                <div class="history-item-res">${item.result}</div>
                <div class="history-item-time">${item.time}</div>
            </div>
        `).join('');

        historyList.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const res = el.getAttribute('data-res');
                if (res) {
                    insert(res);
                    historyDrawer.classList.remove('open');
                    showToast('Result loaded from history', 'info', 1500);
                }
            });
        });
    }

    if (toggleHistoryBtn && historyDrawer) {
        toggleHistoryBtn.addEventListener('click', () => {
            renderHistory();
            historyDrawer.classList.toggle('open');
        });
    }

    if (closeHistoryBtn && historyDrawer) {
        closeHistoryBtn.addEventListener('click', () => {
            historyDrawer.classList.remove('open');
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            historyManager.clear();
            renderHistory();
            showToast('History cleared', 'info', 1500);
        });
    }

    // Copy Button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(resultDisplay.textContent, 'Result copied!');
        });
    }

    // Angle mode badge click
    if (degRadBadge) degRadBadge.addEventListener('click', toggleAngleMode);
    if (degRadBtn) degRadBtn.addEventListener('click', toggleAngleMode);
    const miniDegEl = document.getElementById('mini-deg-badge');
    const miniRadEl = document.getElementById('mini-rad-badge');
    if (miniDegEl) {
        miniDegEl.style.cursor = 'pointer';
        miniDegEl.addEventListener('click', () => {
            if (mathEngine.getAngleMode() !== 'DEG') toggleAngleMode();
        });
    }
    if (miniRadEl) {
        miniRadEl.style.cursor = 'pointer';
        miniRadEl.addEventListener('click', () => {
            if (mathEngine.getAngleMode() !== 'RAD') toggleAngleMode();
        });
    }

    // Inverse mode button
    if (invBtn) invBtn.addEventListener('click', toggleInverseMode);

    // Keypad Button Delegation
    document.querySelectorAll('.sci-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const insertVal = btn.getAttribute('data-insert');
            const action = btn.getAttribute('data-action');
            const mem = btn.getAttribute('data-mem');

            if (insertVal !== null) {
                insert(insertVal);
            } else if (mem) {
                handleMemory(mem);
            } else if (action) {
                switch (action) {
                    case 'all-clear': handleAllClear(); break;
                    case 'backspace': handleBackspace(); break;
                    case 'evaluate': handleEvaluate(); break;
                    case 'toggle-sign': toggleSign(); break;
                    case 'degrad': toggleAngleMode(); break;
                    case 'inv': toggleInverseMode(); break;
                }
            }
        });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        let matchedBtn = null;

        if (e.key >= '0' && e.key <= '9') {
            insert(e.key);
            matchedBtn = document.querySelector(`.sci-btn[data-insert="${e.key}"]`);
        } else if (e.key === '.') {
            insert('.');
            matchedBtn = document.querySelector('.sci-btn[data-insert="."]');
        } else if (e.key === '+') {
            insert(' + ');
            matchedBtn = document.querySelector('.sci-btn[data-insert=" + "]');
        } else if (e.key === '-') {
            insert(' - ');
            matchedBtn = document.querySelector('.sci-btn[data-insert=" - "]');
        } else if (e.key === '*' || e.key === 'x') {
            insert(' × ');
            matchedBtn = document.querySelector('.sci-btn[data-insert=" × "]');
        } else if (e.key === '/') {
            e.preventDefault();
            insert(' ÷ ');
            matchedBtn = document.querySelector('.sci-btn[data-insert=" ÷ "]');
        } else if (e.key === '^') {
            insert('^');
            matchedBtn = document.querySelector('.sci-btn[data-insert="^"]');
        } else if (e.key === '(' || e.key === ')') {
            insert(e.key);
            matchedBtn = document.querySelector(`.sci-btn[data-insert="${e.key}"]`);
        } else if (e.key === '!') {
            insert('!');
            matchedBtn = document.querySelector('.sci-btn[data-insert="!"]');
        } else if (e.key === '%') {
            insert('%');
            matchedBtn = document.querySelector('.sci-btn[data-insert="%"]');
        } else if (e.key === 'p' || e.key === 'P') {
            insert('π');
            matchedBtn = document.querySelector('.sci-btn[data-insert="π"]');
        } else if (e.key === 'e') {
            insert('e');
            matchedBtn = document.querySelector('.sci-btn[data-insert="e"]');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            handleEvaluate();
            matchedBtn = document.querySelector('.sci-btn[data-action="evaluate"]');
        } else if (e.key === 'Backspace') {
            handleBackspace();
            matchedBtn = document.querySelector('.sci-btn[data-action="backspace"]');
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            handleAllClear();
            matchedBtn = document.querySelector('.sci-btn[data-action="all-clear"]');
        }

        if (matchedBtn) {
            matchedBtn.classList.add('btn-pressed');
            setTimeout(() => matchedBtn.classList.remove('btn-pressed'), 120);
        }
    });

    // Initial setup
    updateAngleModeUI();
    updateMemoryUI();
    renderHistory();
    updateDisplay();
});
