/**
 * CalcMaster Suite - Robust Scientific Math Engine
 * Complete tokenizer, recursive-descent parser, evaluator, and precision formatter.
 * Compatible with both Browser and Node.js environments.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else {
        root.MathEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    class MathEngine {
        constructor() {
            this.angleMode = 'DEG'; // 'DEG' or 'RAD'
            this.lastAnswer = 0;
            this.memory = 0;
        }

        setAngleMode(mode) {
            if (mode === 'DEG' || mode === 'RAD') {
                this.angleMode = mode;
            }
        }

        getAngleMode() {
            return this.angleMode;
        }

        // Memory Operations
        memoryClear() {
            this.memory = 0;
            return this.memory;
        }

        memoryRecall() {
            return this.memory;
        }

        memoryAdd(val) {
            const num = parseFloat(val);
            if (!isNaN(num)) this.memory += num;
            return this.memory;
        }

        memorySubtract(val) {
            const num = parseFloat(val);
            if (!isNaN(num)) this.memory -= num;
            return this.memory;
        }

        memoryStore(val) {
            const num = parseFloat(val);
            if (!isNaN(num)) this.memory = num;
            return this.memory;
        }

        hasMemory() {
            return this.memory !== 0;
        }

        // Clean Trigonometry Helpers with DEG/RAD support
        toRadians(deg) {
            return deg * (Math.PI / 180);
        }

        toDegrees(rad) {
            return rad * (180 / Math.PI);
        }

        sin(x) {
            if (this.angleMode === 'DEG') {
                // Handle exact periodic points
                const normalized = ((x % 360) + 360) % 360;
                if (normalized === 0 || normalized === 180) return 0;
                if (normalized === 90) return 1;
                if (normalized === 270) return -1;
                if (normalized === 30 || normalized === 150) return 0.5;
                if (normalized === 210 || normalized === 330) return -0.5;
                return Math.sin(this.toRadians(x));
            }
            return Math.sin(x);
        }

        cos(x) {
            if (this.angleMode === 'DEG') {
                const normalized = ((x % 360) + 360) % 360;
                if (normalized === 90 || normalized === 270) return 0;
                if (normalized === 0) return 1;
                if (normalized === 180) return -1;
                if (normalized === 60 || normalized === 300) return 0.5;
                if (normalized === 120 || normalized === 240) return -0.5;
                return Math.cos(this.toRadians(x));
            }
            return Math.cos(x);
        }

        tan(x) {
            if (this.angleMode === 'DEG') {
                const normalized = ((x % 360) + 360) % 360;
                if (normalized === 90 || normalized === 270) {
                    throw new Error('Tangent undefined at 90°/270°');
                }
                if (normalized === 0 || normalized === 180) return 0;
                if (normalized === 45 || normalized === 225) return 1;
                if (normalized === 135 || normalized === 315) return -1;
                return Math.tan(this.toRadians(x));
            }
            const c = Math.cos(x);
            if (Math.abs(c) < 1e-15) throw new Error('Tangent undefined');
            return Math.tan(x);
        }

        asin(x) {
            if (x < -1 || x > 1) throw new Error('Invalid asin domain [-1, 1]');
            const res = Math.asin(x);
            return this.angleMode === 'DEG' ? this.toDegrees(res) : res;
        }

        acos(x) {
            if (x < -1 || x > 1) throw new Error('Invalid acos domain [-1, 1]');
            const res = Math.acos(x);
            return this.angleMode === 'DEG' ? this.toDegrees(res) : res;
        }

        atan(x) {
            const res = Math.atan(x);
            return this.angleMode === 'DEG' ? this.toDegrees(res) : res;
        }

        sinh(x) {
            return Math.sinh(x);
        }

        cosh(x) {
            return Math.cosh(x);
        }

        tanh(x) {
            return Math.tanh(x);
        }

        asinh(x) {
            return Math.asinh(x);
        }

        acosh(x) {
            if (x < 1) throw new Error('Invalid acosh domain [1, ∞)');
            return Math.acosh(x);
        }

        atanh(x) {
            if (x <= -1 || x >= 1) throw new Error('Invalid atanh domain (-1, 1)');
            return Math.atanh(x);
        }

        // Factorial function
        factorial(n) {
            if (n < 0) throw new Error('Factorial of negative number undefined');
            if (n % 1 !== 0) throw new Error('Factorial of non-integer undefined');
            if (n > 170) return Infinity; // JS overflow
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        // Precision & Formatting Helper
        formatResult(num) {
            if (typeof num !== 'number') return String(num);
            if (isNaN(num)) return 'Error';
            if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

            // Clean near-zero or near-integer values caused by floating point precision
            if (Math.abs(num) < 1e-14 && Math.abs(num) > 0) return '0';

            // Check if it's very close to an integer (e.g. 0.30000000000000004 -> 0.3)
            const roundedPrecision = parseFloat(num.toPrecision(12));
            if (Math.abs(roundedPrecision) >= 1e15 || (Math.abs(roundedPrecision) < 1e-6 && roundedPrecision !== 0)) {
                return roundedPrecision.toExponential().replace('e+', 'e');
            }

            // Standard clean display
            return String(roundedPrecision);
        }

        // --- TOKENIZER ---
        tokenize(input) {
            if (!input || typeof input !== 'string') return [];

            // Replace display symbols with standard symbols
            let clean = input
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/π/g, 'pi')
                .replace(/√\s*\(/g, 'sqrt(')
                .replace(/∛\s*\(/g, 'cbrt(')
                .replace(/√/g, 'sqrt')
                .replace(/∛/g, 'cbrt')
                .replace(/Ans/g, String(this.lastAnswer))
                .trim();

            const tokens = [];
            let i = 0;

            const isDigit = (c) => c >= '0' && c <= '9';
            const isAlpha = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

            while (i < clean.length) {
                const char = clean[i];

                if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
                    i++;
                    continue;
                }

                // Number (integer, decimal, exponential e.g., 1.2e-4 or 1e5)
                if (isDigit(char) || (char === '.' && isDigit(clean[i + 1]))) {
                    let numStr = '';
                    while (i < clean.length && (isDigit(clean[i]) || clean[i] === '.')) {
                        numStr += clean[i];
                        i++;
                    }
                    // Handle scientific notation directly in number literal: e.g. 5e-2 or 3E+4
                    if (i < clean.length && (clean[i] === 'e' || clean[i] === 'E')) {
                        const nextChar = clean[i + 1];
                        const afterSign = clean[i + 2];
                        if (isDigit(nextChar) || ((nextChar === '+' || nextChar === '-') && isDigit(afterSign))) {
                            numStr += clean[i];
                            i++;
                            if (clean[i] === '+' || clean[i] === '-') {
                                numStr += clean[i];
                                i++;
                            }
                            while (i < clean.length && isDigit(clean[i])) {
                                numStr += clean[i];
                                i++;
                            }
                        }
                    }
                    tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
                    continue;
                }

                // Word: identifiers for functions (sin, cos, log, ln, sqrt, etc.) or constants (pi, e)
                if (isAlpha(char)) {
                    let word = '';
                    while (i < clean.length && (isAlpha(clean[i]) || isDigit(clean[i]))) {
                        word += clean[i];
                        i++;
                    }
                    word = word.toLowerCase();

                    if (word === 'pi') {
                        tokens.push({ type: 'NUMBER', value: Math.PI });
                    } else if (word === 'e') {
                        tokens.push({ type: 'NUMBER', value: Math.E });
                    } else if (word === 'exp') {
                        tokens.push({ type: 'OPERATOR', value: 'exp_op' }); // scientific notation e.g. 2 EXP 3
                    } else {
                        tokens.push({ type: 'FUNCTION', value: word });
                    }
                    continue;
                }

                // Operators & delimiters
                if (['+', '-', '*', '/', '%', '^', '!', '(', ')', ','].includes(char)) {
                    if (char === '(') {
                        tokens.push({ type: 'LPAREN', value: '(' });
                    } else if (char === ')') {
                        tokens.push({ type: 'RPAREN', value: ')' });
                    } else if (char === '!') {
                        tokens.push({ type: 'POSTFIX', value: '!' });
                    } else if (char === '%') {
                        // In calculators, % can be postfix (e.g. 50% = 0.5) or modulo
                        tokens.push({ type: 'POSTFIX', value: '%' });
                    } else {
                        tokens.push({ type: 'OPERATOR', value: char });
                    }
                    i++;
                    continue;
                }

                throw new Error(`Unexpected character: '${char}'`);
            }

            // Insert implicit multiplications:
            // 1. NUMBER followed by LPAREN: 2(3) -> 2 * (3)
            // 2. RPAREN followed by LPAREN: (2)(3) -> (2) * (3)
            // 3. RPAREN followed by NUMBER: (2)3 -> (2) * 3
            // 4. NUMBER followed by FUNCTION: 2sin(30) -> 2 * sin(30)
            // 5. RPAREN followed by FUNCTION: (2)sin(30) -> (2) * sin(30)
            // 6. POSTFIX followed by NUMBER/LPAREN/FUNCTION: 5! 2 -> 5! * 2
            const processed = [];
            for (let j = 0; j < tokens.length; j++) {
                const current = tokens[j];
                const next = tokens[j + 1];
                processed.push(current);

                if (!next) continue;

                const currIsNumOrRparenOrPostfix =
                    current.type === 'NUMBER' ||
                    current.type === 'RPAREN' ||
                    current.type === 'POSTFIX';

                const nextIsNumOrLparenOrFunc =
                    next.type === 'NUMBER' ||
                    next.type === 'LPAREN' ||
                    next.type === 'FUNCTION';

                if (currIsNumOrRparenOrPostfix && nextIsNumOrLparenOrFunc) {
                    // Implicit multiplication
                    processed.push({ type: 'OPERATOR', value: '*' });
                }
            }

            return processed;
        }

        // --- RECURSIVE DESCENT PARSER & EVALUATOR ---
        evaluate(expressionStr) {
            if (!expressionStr || expressionStr.trim() === '') return 0;

            const tokens = this.tokenize(expressionStr);
            if (tokens.length === 0) return 0;

            let pos = 0;

            const peek = () => tokens[pos];
            const consume = () => tokens[pos++];

            // Auto-balance open parentheses if trailing
            let openParenCount = 0;
            tokens.forEach(t => {
                if (t.type === 'LPAREN') openParenCount++;
                if (t.type === 'RPAREN') openParenCount--;
            });
            while (openParenCount > 0) {
                tokens.push({ type: 'RPAREN', value: ')' });
                openParenCount--;
            }

            // Grammar hierarchy:
            // parseExpression -> parseTerm ( ('+' | '-') parseTerm )*
            // parseTerm       -> parsePower ( ('*' | '/' | 'exp_op') parsePower )*
            // parsePower      -> parseUnary ( '^' parseUnary )* (right-associative)
            // parseUnary      -> ('+' | '-') parseUnary | parsePostfix
            // parsePostfix    -> parsePrimary ('!' | '%')*
            // parsePrimary    -> NUMBER | '(' parseExpression ')' | FUNCTION '(' parseArgs ')' | FUNCTION parsePower

            const parseExpression = () => {
                let left = parseTerm();
                while (peek() && peek().type === 'OPERATOR' && (peek().value === '+' || peek().value === '-')) {
                    const op = consume().value;
                    const right = parseTerm();
                    if (op === '+') left = left + right;
                    else if (op === '-') left = left - right;
                }
                return left;
            };

            const parseTerm = () => {
                let left = parsePower();
                while (peek() && (
                    (peek().type === 'OPERATOR' && (peek().value === '*' || peek().value === '/' || peek().value === 'exp_op'))
                )) {
                    const op = consume().value;
                    const right = parsePower();
                    if (op === '*') {
                        left = left * right;
                    } else if (op === '/') {
                        if (right === 0) throw new Error('Cannot divide by zero');
                        left = left / right;
                    } else if (op === 'exp_op') {
                        // Scientific EXP notation: left * 10^right
                        left = left * Math.pow(10, right);
                    }
                }
                return left;
            };

            const parsePower = () => {
                let base = parseUnary();
                if (peek() && peek().type === 'OPERATOR' && peek().value === '^') {
                    consume(); // consume '^'
                    // Exponentiation is right-associative: 2 ^ 3 ^ 2 = 2 ^ (3 ^ 2)
                    const exponent = parsePower();
                    if (base < 0 && exponent % 1 !== 0) {
                        throw new Error('Complex result (negative base with fractional exponent)');
                    }
                    base = Math.pow(base, exponent);
                }
                return base;
            };

            const parseUnary = () => {
                if (peek() && peek().type === 'OPERATOR') {
                    const op = peek().value;
                    if (op === '+') {
                        consume();
                        return parseUnary();
                    }
                    if (op === '-') {
                        consume();
                        return -parseUnary();
                    }
                }
                return parsePostfix();
            };

            const parsePostfix = () => {
                let value = parsePrimary();
                while (peek() && peek().type === 'POSTFIX') {
                    const post = consume().value;
                    if (post === '!') {
                        value = this.factorial(value);
                    } else if (post === '%') {
                        value = value / 100;
                    }
                }
                return value;
            };

            const parsePrimary = () => {
                const token = peek();
                if (!token) throw new Error('Unexpected end of expression');

                // Number
                if (token.type === 'NUMBER') {
                    consume();
                    return token.value;
                }

                // Subexpression: ( expr )
                if (token.type === 'LPAREN') {
                    consume(); // consume '('
                    const value = parseExpression();
                    if (!peek() || peek().type !== 'RPAREN') {
                        throw new Error('Missing closing parenthesis');
                    }
                    consume(); // consume ')'
                    return value;
                }

                // Function: func(arg) or func arg
                if (token.type === 'FUNCTION') {
                    const funcName = consume().value;
                    let arg;

                    if (peek() && peek().type === 'LPAREN') {
                        consume(); // consume '('
                        arg = parseExpression();
                        if (!peek() || peek().type !== 'RPAREN') {
                            throw new Error(`Missing closing parenthesis for ${funcName}`);
                        }
                        consume(); // consume ')'
                    } else {
                        // Implicit arg: e.g. sin 30 or sqrt 9
                        arg = parsePower();
                    }

                    return this.applyFunction(funcName, arg);
                }

                throw new Error(`Unexpected token: ${token.value}`);
            };

            const result = parseExpression();

            if (pos < tokens.length) {
                throw new Error(`Unexpected token at position ${pos}: ${tokens[pos].value}`);
            }

            this.lastAnswer = result;
            return result;
        }

        applyFunction(funcName, arg) {
            switch (funcName) {
                case 'sin': return this.sin(arg);
                case 'cos': return this.cos(arg);
                case 'tan': return this.tan(arg);
                case 'asin': return this.asin(arg);
                case 'acos': return this.acos(arg);
                case 'atan': return this.atan(arg);
                case 'sinh': return this.sinh(arg);
                case 'cosh': return this.cosh(arg);
                case 'tanh': return this.tanh(arg);
                case 'asinh': return this.asinh(arg);
                case 'acosh': return this.acosh(arg);
                case 'atanh': return this.atanh(arg);
                case 'sqrt':
                    if (arg < 0) throw new Error('Square root of negative number');
                    return Math.sqrt(arg);
                case 'cbrt': return Math.cbrt(arg);
                case 'ln':
                    if (arg <= 0) throw new Error('ln of non-positive number');
                    return Math.log(arg);
                case 'log':
                case 'log10':
                    if (arg <= 0) throw new Error('log10 of non-positive number');
                    return Math.log10 ? Math.log10(arg) : Math.log(arg) / Math.LN10;
                case 'log2':
                    if (arg <= 0) throw new Error('log2 of non-positive number');
                    return Math.log2 ? Math.log2(arg) : Math.log(arg) / Math.LN2;
                case 'abs': return Math.abs(arg);
                case 'floor': return Math.floor(arg);
                case 'ceil': return Math.ceil(arg);
                case 'round': return Math.round(arg);
                case 'exp': return Math.exp(arg);
                default:
                    throw new Error(`Unknown function: ${funcName}`);
            }
        }
    }

    return MathEngine;
}));

