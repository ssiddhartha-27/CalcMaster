# CalcMaster Suite 🧮

A modern, responsive, zero-dependency web calculator application featuring both **Simple** and **Scientific** calculation modes, connected through a landing interface.

---

## 🌟 Overview & Architecture

CalcMaster is structured into three clean pages:

1. **Mode Chooser Landing Page (`index.html`)**:
   - Modern visual interface presenting both calculator modes.
   - Interactive preview cards with descriptions and feature tags.
   - Global dark/light theme toggle and audio sound effects toggle.

2. **Simple Calculator (`simple.html`)**:
   - Optimized for fast, everyday arithmetic (addition, subtraction, multiplication, division).
   - Percentage calculations (`%`), sign negation (`±`), keypad backspace (`⌫`), and clear operations (`C` / `AC`).
   - Calculation history drawer with timestamp and single-click recall.
   - Copy-to-clipboard functionality with toast notifications.
   - Convenient mode switcher link at the bottom.

3. **Scientific Calculator (`scientific.html`)**:
   - High-precision recursive-descent math parser engine (`js/math-engine.js`).
   - **Trigonometric Functions**: `sin`, `cos`, `tan` with `DEG` (Degrees) and `RAD` (Radians) mode toggling.
   - **Inverse Functions**: `sin⁻¹` (`asin`), `cos⁻¹` (`acos`), `tan⁻¹` (`atan`) via the `2nd` key.
   - **Hyperbolic Functions**: `sinh`, `cosh`, `tanh`.
   - **Logarithms & Exponents**: `ln`, `log₁₀`, `log₂`, `x²`, `x³`, `xʸ`, `eˣ`, `10ˣ`.
   - **Roots**: Square root (`√x`), Cube root (`∛x`).
   - **Constants & Operators**: `π` (Pi), `e` (Euler's number), Factorial (`n!`), Reciprocal (`1/x`), Absolute value (`|x|`), Scientific notation (`EXP` / `EE`).
   - **Memory Registers**: `MC` (Clear), `MR` (Recall), `M+` (Add), `M-` (Subtract), `MS` (Store) with an active `M` badge.
   - **Implicit Multiplication**: Supports `2π`, `3(4+5)`, `2sin(30)`.
   - **Real-time Live Preview**: Displays live results as formulas are entered.
   - Calculation history log and quick switcher to Simple mode.

---

## 🚀 How to Run

Because the web application is built with standard HTML5, CSS3, and modern Vanilla JavaScript with **zero external dependencies**:

### Option 1: Direct File Open
Simply double-click `index.html` in File Explorer or open it in any web browser (Chrome, Edge, Firefox, Safari):
```
file:///C:/Users/SIDDHU/Dir/index.html
```

### Option 2: Local HTTP Server (Python)
Run a local web server using Python:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option 3: Local HTTP Server (Node.js)
```bash
npx serve .
```

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Simple Calculator | Scientific Calculator |
| :--- | :--- | :--- |
| `0` – `9` | Digits | Digits |
| `.` | Decimal point | Decimal point |
| `+`, `-`, `*`, `/` | Arithmetic operations | `+`, `−`, `×`, `÷` |
| `Enter` or `=` | Calculate result | Evaluate expression |
| `Backspace` | Delete last digit | Delete last character/token |
| `Escape` or `c` | Clear display | All Clear (`AC`) |
| `%` | Percentage calculation | Percentage / Modulo |
| `^` | — | Power (`xʸ`) |
| `(` and `)` | — | Parentheses |
| `!` | — | Factorial (`n!`) |
| `p` or `P` | — | Insert `π` |
| `e` | — | Insert `e` |

---

## 🧪 Automated Testing

A comprehensive Node.js test suite (`test_suite.js`) validates all 76 requirements including file linkages, arithmetic accuracy, floating-point precision rounding (e.g. `0.1 + 0.2 = 0.3`), trigonometry in degrees and radians, implicit multiplication, factorials, memory registers, and mathematical domain errors.

To run tests:
```bash
node test_suite.js
```

---

## 📁 Project File Structure

```
c:\Users\SIDDHU\Dir\
├── index.html            # Landing page / mode chooser
├── simple.html           # Simple calculator page
├── scientific.html       # Scientific calculator page
├── test_suite.js         # Automated test verification suite
├── README.md             # Project documentation
├── css\
│   ├── common.css        # Shared variables, themes, navbar, drawer, toasts
│   ├── landing.css       # Landing page hero, cards & comparison table
│   ├── simple.css        # Simple calculator keypad & display styles
│   └── scientific.css    # Scientific calculator 8-column grid & indicators
└── js\
    ├── common.js         # Theme manager, Web Audio sound FX, history manager
    ├── math-engine.js    # Scientific tokenizer, AST/recursive-descent evaluator
    ├── simple.js         # Simple calculator state machine & keyboard listener
    └── scientific.js     # Scientific calculator UI controller & shortcuts
```

