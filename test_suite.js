/**
 * CalcMaster Suite - Comprehensive Verification Test Suite
 */

const fs = require('fs');
const path = require('path');
const MathEngine = require('./js/math-engine.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        passedTests++;
        console.log(`  ✓ PASS: ${message}`);
    } else {
        failedTests++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

function assertClose(actual, expected, message, tolerance = 1e-9) {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
        passedTests++;
        console.log(`  ✓ PASS: ${message} (Actual: ${actual}, Expected: ${expected})`);
    } else {
        failedTests++;
        console.error(`  ✗ FAIL: ${message} (Actual: ${actual}, Expected: ${expected}, Diff: ${diff})`);
    }
}

function assertThrows(fn, message) {
    try {
        fn();
        failedTests++;
        console.error(`  ✗ FAIL (did not throw): ${message}`);
    } catch (e) {
        passedTests++;
        console.log(`  ✓ PASS (threw as expected): ${message} -> "${e.message}"`);
    }
}

console.log('====================================================');
console.log('TEST SUITE 1: FILE SYSTEM & LINKAGE INTEGRITY');
console.log('====================================================');

const baseDir = __dirname;
const requiredFiles = [
    'index.html',
    'simple.html',
    'scientific.html',
    'css/common.css',
    'css/landing.css',
    'css/simple.css',
    'css/scientific.css',
    'js/common.js',
    'js/math-engine.js',
    'js/simple.js',
    'js/scientific.js'
];

requiredFiles.forEach(file => {
    const fullPath = path.join(baseDir, file);
    assert(fs.existsSync(fullPath), `File exists: ${file}`);
});

// Check HTML Links
const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="simple.html"'), 'index.html contains redirect link to simple.html');
assert(indexHtml.includes('href="scientific.html"'), 'index.html contains redirect link to scientific.html');

const simpleHtml = fs.readFileSync(path.join(baseDir, 'simple.html'), 'utf8');
assert(simpleHtml.includes('href="index.html"'), 'simple.html contains link back to index.html');
assert(simpleHtml.includes('href="scientific.html"'), 'simple.html contains switcher link to scientific.html');

const scientificHtml = fs.readFileSync(path.join(baseDir, 'scientific.html'), 'utf8');
assert(scientificHtml.includes('href="index.html"'), 'scientific.html contains link back to index.html');
assert(scientificHtml.includes('href="simple.html"'), 'scientific.html contains switcher link to simple.html');

console.log('\n====================================================');
console.log('TEST SUITE 2: BASIC ARITHMETIC & PRECISION');
console.log('====================================================');

const engine = new MathEngine();

assertClose(engine.evaluate('15 + 27'), 42, '15 + 27 = 42');
assertClose(engine.evaluate('100 - 37'), 63, '100 - 37 = 63');
assertClose(engine.evaluate('12 * 11'), 132, '12 * 11 = 132');
assertClose(engine.evaluate('144 / 12'), 12, '144 / 12 = 12');
assertClose(engine.evaluate('2 + 3 * 4'), 14, 'Operator precedence: 2 + 3 * 4 = 14');
assertClose(engine.evaluate('(2 + 3) * 4'), 20, 'Parentheses precedence: (2 + 3) * 4 = 20');
assertClose(engine.evaluate('10 - 4 - 2'), 4, 'Left associativity: 10 - 4 - 2 = 4');

// Floating point precision test
const decSum = engine.evaluate('0.1 + 0.2');
assert(engine.formatResult(decSum) === '0.3', 'Float precision 0.1 + 0.2 formats to exactly 0.3');

console.log('\n====================================================');
console.log('TEST SUITE 3: PERCENTAGES & FACTORIALS');
console.log('====================================================');

assertClose(engine.evaluate('50%'), 0.5, '50% = 0.5');
assertClose(engine.evaluate('250 * 20%'), 50, '250 * 20% = 50');
assertClose(engine.evaluate('0!'), 1, '0! = 1');
assertClose(engine.evaluate('1!'), 1, '1! = 1');
assertClose(engine.evaluate('5!'), 120, '5! = 120');
assertClose(engine.evaluate('6!'), 720, '6! = 720');

console.log('\n====================================================');
console.log('TEST SUITE 4: EXPONENTIATION & ROOTS');
console.log('====================================================');

assertClose(engine.evaluate('2^3'), 8, '2^3 = 8');
assertClose(engine.evaluate('2^3^2'), 512, 'Right-associative power: 2^(3^2) = 512');
assertClose(engine.evaluate('sqrt(144)'), 12, 'sqrt(144) = 12');
assertClose(engine.evaluate('√(81)'), 9, '√(81) = 9');
assertClose(engine.evaluate('cbrt(125)'), 5, 'cbrt(125) = 5');
assertClose(engine.evaluate('∛(216)'), 6, '∛(216) = 6');

console.log('\n====================================================');
console.log('TEST SUITE 5: TRIGONOMETRY (DEGREE & RADIAN MODES)');
console.log('====================================================');

engine.setAngleMode('DEG');
assertClose(engine.evaluate('sin(0)'), 0, 'sin(0°) = 0');
assertClose(engine.evaluate('sin(30)'), 0.5, 'sin(30°) = 0.5');
assertClose(engine.evaluate('sin(90)'), 1, 'sin(90°) = 1');
assertClose(engine.evaluate('sin(180)'), 0, 'sin(180°) = 0');
assertClose(engine.evaluate('sin(270)'), -1, 'sin(270°) = -1');

assertClose(engine.evaluate('cos(0)'), 1, 'cos(0°) = 1');
assertClose(engine.evaluate('cos(60)'), 0.5, 'cos(60°) = 0.5');
assertClose(engine.evaluate('cos(90)'), 0, 'cos(90°) = 0');
assertClose(engine.evaluate('cos(180)'), -1, 'cos(180°) = -1');

assertClose(engine.evaluate('tan(0)'), 0, 'tan(0°) = 0');
assertClose(engine.evaluate('tan(45)'), 1, 'tan(45°) = 1');

assertClose(engine.evaluate('asin(0.5)'), 30, 'asin(0.5) in DEG = 30°');
assertClose(engine.evaluate('acos(0.5)'), 60, 'acos(0.5) in DEG = 60°');
assertClose(engine.evaluate('atan(1)'), 45, 'atan(1) in DEG = 45°');

engine.setAngleMode('RAD');
assertClose(engine.evaluate('sin(pi / 2)'), 1, 'sin(π / 2) in RAD = 1');
assertClose(engine.evaluate('cos(pi)'), -1, 'cos(π) in RAD = -1');
assertClose(engine.evaluate('asin(1)'), Math.PI / 2, 'asin(1) in RAD = π / 2');

console.log('\n====================================================');
console.log('TEST SUITE 6: LOGARITHMS, CONSTANTS & IMPLICIT MULTIPLICATION');
console.log('====================================================');

assertClose(engine.evaluate('ln(e)'), 1, 'ln(e) = 1');
assertClose(engine.evaluate('log(1000)'), 3, 'log10(1000) = 3');
assertClose(engine.evaluate('log2(32)'), 5, 'log2(32) = 5');

// Implicit multiplication
assertClose(engine.evaluate('2pi'), 2 * Math.PI, 'Implicit mult: 2pi = 2 * π');
assertClose(engine.evaluate('3(4 + 5)'), 27, 'Implicit mult: 3(4 + 5) = 27');
assertClose(engine.evaluate('(2)(3)'), 6, 'Implicit mult: (2)(3) = 6');
engine.setAngleMode('DEG');
assertClose(engine.evaluate('4sin(30)'), 2, 'Implicit mult: 4sin(30°) = 2');

console.log('\n====================================================');
console.log('TEST SUITE 7: SCIENTIFIC NOTATION (EXP)');
console.log('====================================================');

assertClose(engine.evaluate('3 EXP 4'), 30000, '3 EXP 4 = 30,000');
assertClose(engine.evaluate('2.5e3'), 2500, '2.5e3 = 2,500');

console.log('\n====================================================');
console.log('TEST SUITE 8: MEMORY MANAGEMENT');
console.log('====================================================');

engine.memoryClear();
assert(engine.memoryRecall() === 0, 'Memory initially 0');
assert(!engine.hasMemory(), 'hasMemory() returns false when 0');

engine.memoryAdd(45);
assert(engine.memoryRecall() === 45, 'M+ adds 45');
assert(engine.hasMemory(), 'hasMemory() returns true after M+');

engine.memorySubtract(15);
assert(engine.memoryRecall() === 30, 'M- subtracts 15 -> 30');

engine.memoryStore(100);
assert(engine.memoryRecall() === 100, 'MS stores 100');

engine.memoryClear();
assert(engine.memoryRecall() === 0, 'MC clears memory back to 0');

console.log('\n====================================================');
console.log('TEST SUITE 9: ERROR HANDLING & DOMAIN SAFETY');
console.log('====================================================');

assertThrows(() => engine.evaluate('10 / 0'), 'Division by zero throws error');
assertThrows(() => engine.evaluate('sqrt(-16)'), 'Square root of negative throws error');
assertThrows(() => engine.evaluate('ln(-1)'), 'ln of negative throws error');
assertThrows(() => engine.evaluate('log(0)'), 'log of zero throws error');
assertThrows(() => engine.evaluate('asin(2)'), 'asin outside [-1, 1] throws error');
engine.setAngleMode('DEG');
assertThrows(() => engine.evaluate('tan(90)'), 'tan(90°) in DEG throws asymptote error');

console.log('\n====================================================');
console.log('TEST RESULTS SUMMARY');
console.log('====================================================');
console.log(`Total Passed: ${passedTests}`);
console.log(`Total Failed: ${failedTests}`);

if (failedTests > 0) {
    process.exit(1);
} else {
    console.log('ALL 45+ TESTS PASSED SUCCESSFULLY! 🎉');
}

