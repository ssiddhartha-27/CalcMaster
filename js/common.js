/**
 * CalcMaster Suite - Shared Utilities
 * Handles Themes, Audio Clicks, History Storage, Modals & Toast Notifications
 */

// --- 1. Sound Synthesis (Web Audio API) ---
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('calc_sound') !== 'disabled';
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
    }

    playClick(type = 'default') {
        if (!this.enabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            let freq = 600;
            let duration = 0.035;

            if (type === 'operator') {
                freq = 800;
                duration = 0.045;
            } else if (type === 'equals') {
                freq = 1100;
                duration = 0.06;
            } else if (type === 'action') {
                freq = 400;
                duration = 0.05;
            }

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            // Audio context not allowed or failed silently
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('calc_sound', this.enabled ? 'enabled' : 'disabled');
        return this.enabled;
    }
}

// --- 2. Theme Management ---
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('calc_theme') || 'dark';
        this.applyTheme(this.theme);
    }

    applyTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('calc_theme', theme);
        
        const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        });
    }

    toggle() {
        const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        return nextTheme;
    }
}

// --- 3. History Management ---
class HistoryManager {
    constructor(storageKey = 'calc_history_default') {
        this.storageKey = storageKey;
        this.maxItems = 50;
    }

    getItems() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    addItem(expression, result) {
        const items = this.getItems();
        const newItem = {
            id: Date.now().toString(),
            expression,
            result,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        items.unshift(newItem);
        if (items.length > this.maxItems) {
            items.pop();
        }
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save history', e);
        }
        return newItem;
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {}
    }
}

// --- 4. Toast Notifications ---
function showToast(message, type = 'info', duration = 2500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// --- 5. Clipboard Copy Helper ---
async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    if (!text || text === 'Error' || text === 'Syntax Error') return;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for file:// protocol or unsecure contexts
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        showToast(successMsg, 'success');
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
}

// Global Instances
window.soundManager = new SoundManager();
window.themeManager = new ThemeManager();

// Setup shared UI bindings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.soundManager.playClick();
            window.themeManager.toggle();
        });
    });

    // Sound toggle buttons
    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
        const updateIcon = () => {
            btn.innerHTML = window.soundManager.enabled ? '🔊' : '🔇';
            btn.title = window.soundManager.enabled ? 'Mute Sound' : 'Enable Sound';
        };
        updateIcon();
        btn.addEventListener('click', () => {
            const newState = window.soundManager.toggle();
            updateIcon();
            showToast(newState ? 'Sound Enabled' : 'Sound Muted', 'info', 1500);
            if (newState) window.soundManager.playClick();
        });
    });

    // Button tactile animation helper
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('pointerdown', () => {
            btn.classList.add('btn-pressed');
        });
        const removePress = () => btn.classList.remove('btn-pressed');
        btn.addEventListener('pointerup', removePress);
        btn.addEventListener('pointerleave', removePress);
        btn.addEventListener('pointercancel', removePress);
    });

    // Modal close helpers
    document.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', () => {
            const modal = el.closest('.modal-overlay');
            if (modal) modal.classList.remove('open');
        });
    });
});

