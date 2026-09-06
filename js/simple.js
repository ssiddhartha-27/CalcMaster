/**
 * CalcMaster Suite - Simple Calculator Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    const historyManager = new HistoryManager('calc_history_simple');
    const mathEngine = new MathEngine();

    // DOM Elements
    const displayMain = document.getElementById('display-main');
    const displayHistory = document.getElementById('display-history');
    const copyBtn = document.getElementById('btn-copy');
    const historyDrawer = document.getElementById('history-drawer');
    const historyList = document.getElementById('history-list');
    const toggleHistoryBtn = document.getElementById('btn-history-toggle');
    const closeHistoryBtn = document.getElementById('btn-close-history');
    const clearHistoryBtn = document.getElementById('btn-clear-history');
    const clearBtn = document.getElementById('btn-clear');

    // State Variables
    let currentInput = '0';
    let previousInput = null;
    let currentOperator = null;
    let waitingForSecondOperand = false;
    let lastEvaluatedExpr = '';

    // Update Display
    function updateDisplay() {
        displayMain.textContent = currentInput;
        
        // Auto-scale font size if number is very long
        if (currentInput.length > 11) {
            displayMain.style.fontSize = '1.6rem';
        } else if (currentInput.length > 8) {
            displayMain.style.fontSize = '2rem';
        } else {
            displayMain.style.fontSize = '2.5rem';
        }

        if (previousInput !== null && currentOperator) {
            displayHistory.textContent = `${previousInput} ${currentOperator}`;
        } else if (lastEvaluatedExpr) {
            displayHistory.textContent = lastEvaluatedExpr;
        } else {
            displayHistory.textContent = '';
        }

        // Update Clear button label (C vs AC)
        if (clearBtn) {
            clearBtn.textContent = (currentInput !== '0' || previousInput !== null) ? 'C' : 'AC';
        }

        // Highlight active operator button
        document.querySelectorAll('.calc-btn.btn-op').forEach(btn => {
            const op = btn.getAttribute('data-op');
            if (op && op === currentOperator && waitingForSecondOperand) {
                btn.classList.add('active-op');
            } else {
                btn.classList.remove('active-op');
            }
        });
    }

    // Input Digit
    function inputDigit(digit) {
        window.soundManager.playClick('default');
        if (waitingForSecondOperand) {
            currentInput = digit;
            waitingForSecondOperand = false;
        } else {
            currentInput = currentInput === '0' ? digit : currentInput + digit;
        }
        lastEvaluatedExpr = '';
        updateDisplay();
    }

    // Input Decimal
    function inputDecimal() {
        window.soundManager.playClick('default');
        if (waitingForSecondOperand) {
            currentInput = '0.';
            waitingForSecondOperand = false;
            updateDisplay();
            return;
        }
        if (!currentInput.includes('.')) {
            currentInput += '.';
            updateDisplay();
        }
    }

    // Toggle Sign (+/-)
    function toggleSign() {
        window.soundManager.playClick('default');
        if (currentInput === '0' || currentInput === 'Error') return;
        if (currentInput.startsWith('-')) {
            currentInput = currentInput.slice(1);
        } else {
            currentInput = '-' + currentInput;
        }
        updateDisplay();
    }

    // Percentage Calculation
    function inputPercent() {
        window.soundManager.playClick('operator');
        const num = parseFloat(currentInput);
        if (isNaN(num)) return;

        if (previousInput !== null && (currentOperator === '+' || currentOperator === '-')) {
            // e.g. 200 + 10% -> 10% of 200 = 20
            const base = parseFloat(previousInput);
            const percentVal = (base * num) / 100;
            currentInput = mathEngine.formatResult(percentVal);
        } else {
            // Standard percent: 50% = 0.5
            currentInput = mathEngine.formatResult(num / 100);
        }
        updateDisplay();
    }

    // Perform Calculation
    function calculate(first, second, operator) {
        const a = parseFloat(first);
        const b = parseFloat(second);
        if (isNaN(a) || isNaN(b)) return 'Error';

        let res;
        switch (operator) {
            case '+': res = a + b; break;
            case '−':
            case '-': res = a - b; break;
            case '×':
            case '*': res = a * b; break;
            case '÷':
            case '/':
                if (b === 0) return 'Cannot divide by 0';
                res = a / b;
                break;
            default: return b;
        }

        return mathEngine.formatResult(res);
    }

    // Handle Operator (+, -, *, /)
    function handleOperator(nextOp) {
        window.soundManager.playClick('operator');
        const inputValue = currentInput;

        if (previousInput === null) {
            previousInput = inputValue;
        } else if (currentOperator && !waitingForSecondOperand) {
            const result = calculate(previousInput, inputValue, currentOperator);
            if (result === 'Error' || result.includes('Cannot divide')) {
                currentInput = result;
                previousInput = null;
                currentOperator = null;
                updateDisplay();
                return;
            }
            previousInput = result;
            currentInput = result;
        }

        waitingForSecondOperand = true;
        currentOperator = nextOp;
        updateDisplay();
    }

    // Handle Equals (=)
    function handleEquals() {
        window.soundManager.playClick('equals');
        if (previousInput === null || !currentOperator) return;

        const result = calculate(previousInput, currentInput, currentOperator);
        const fullExpr = `${previousInput} ${currentOperator} ${currentInput} =`;

        if (result !== 'Error' && !result.includes('Cannot divide')) {
            historyManager.addItem(fullExpr, result);
            renderHistory();
        }

        lastEvaluatedExpr = fullExpr;
        currentInput = result;
        previousInput = null;
        currentOperator = null;
        waitingForSecondOperand = true;
        updateDisplay();
    }

    // Clear (C / AC)
    function handleClear() {
        window.soundManager.playClick('action');
        if (currentInput !== '0') {
            currentInput = '0';
        } else {
            previousInput = null;
            currentOperator = null;
            waitingForSecondOperand = false;
            lastEvaluatedExpr = '';
        }
        updateDisplay();
    }

    // Backspace (Delete last digit)
    function handleBackspace() {
        window.soundManager.playClick('default');
        if (waitingForSecondOperand || currentInput === 'Error' || currentInput.includes('Cannot divide')) {
            currentInput = '0';
        } else if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '-' || currentInput === '') currentInput = '0';
        } else {
            currentInput = '0';
        }
        updateDisplay();
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
            <div class="history-item" data-res="${item.result}">
                <div class="history-item-expr">${item.expression}</div>
                <div class="history-item-res">${item.result}</div>
                <div class="history-item-time">${item.time}</div>
            </div>
        `).join('');

        // Click to recall
        historyList.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const res = el.getAttribute('data-res');
                if (res) {
                    currentInput = res;
                    waitingForSecondOperand = false;
                    updateDisplay();
                    historyDrawer.classList.remove('open');
                    showToast('Value loaded from history', 'info', 1500);
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
            copyToClipboard(currentInput, 'Result copied!');
        });
    }

    // Button Click Delegation
    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const digit = btn.getAttribute('data-num');
            const op = btn.getAttribute('data-op');
            const action = btn.getAttribute('data-action');

            if (digit !== null) {
                inputDigit(digit);
            } else if (op) {
                handleOperator(op);
            } else if (action) {
                switch (action) {
                    case 'clear': handleClear(); break;
                    case 'backspace': handleBackspace(); break;
                    case 'equals': handleEquals(); break;
                    case 'decimal': inputDecimal(); break;
                    case 'toggle-sign': toggleSign(); break;
                    case 'percent': inputPercent(); break;
                }
            }
        });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        // Prevent interfering when typing in inputs/modals
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        let matchedBtn = null;

        if (e.key >= '0' && e.key <= '9') {
            inputDigit(e.key);
            matchedBtn = document.querySelector(`.calc-btn[data-num="${e.key}"]`);
        } else if (e.key === '.') {
            inputDecimal();
            matchedBtn = document.querySelector('.calc-btn[data-action="decimal"]');
        } else if (e.key === '+') {
            handleOperator('+');
            matchedBtn = document.querySelector('.calc-btn[data-op="+"]');
        } else if (e.key === '-') {
            handleOperator('−');
            matchedBtn = document.querySelector('.calc-btn[data-op="−"]');
        } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
            handleOperator('×');
            matchedBtn = document.querySelector('.calc-btn[data-op="×"]');
        } else if (e.key === '/') {
            e.preventDefault();
            handleOperator('÷');
            matchedBtn = document.querySelector('.calc-btn[data-op="÷"]');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            handleEquals();
            matchedBtn = document.querySelector('.calc-btn[data-action="equals"]');
        } else if (e.key === 'Backspace') {
            handleBackspace();
            matchedBtn = document.querySelector('.calc-btn[data-action="backspace"]');
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            handleClear();
            matchedBtn = document.querySelector('.calc-btn[data-action="clear"]');
        } else if (e.key === '%') {
            inputPercent();
            matchedBtn = document.querySelector('.calc-btn[data-action="percent"]');
        }

        if (matchedBtn) {
            matchedBtn.classList.add('btn-pressed');
            setTimeout(() => matchedBtn.classList.remove('btn-pressed'), 120);
        }
    });

    // Initial render
    renderHistory();
    updateDisplay();
});

