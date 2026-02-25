// Import other modules
import {
    loadUserData,
    initializeSliders,
    openUserInfoPopup,
    saveUserInfo
} from './modules/user.js';

import {
    loadDrinkData,
    loadDrinkOptions,
    updateClockDisplay,
    openDrinkPopup,
    clearDrinkData,
    updateClearButtonVisibility
} from './modules/drinkingClock.js';

import {
    loadPromillDescriptions,
    calculateBAC,
    toggleChartExplainer,
    closeMobileInfoPopup
} from './modules/chart.js';

import {
    initializeMenu
} from './modules/menu.js';

import { i18n } from './i18n/languageManager.js';

class AppState {
    static #instance = null;

    constructor() {
        this.selectedHour = null;
        this.bacChartInstance = null;
        this.promillDescriptions = null;
    }

    setSelectedHour(hour) {
        this.selectedHour = hour;
    }

    getSelectedHour() {
        return this.selectedHour;
    }

    static getInstance() {
        if (!AppState.#instance) {
            AppState.#instance = new AppState();
        }
        return AppState.#instance;
    }
}

// Storage utilities
const storage = {
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    },

    getLocalStorage(key) {
        return localStorage.getItem(key);
    }
};

// Initialize application components
async function initializeApp() {
    const hasClock = document.getElementById('clock-container');
    await initializeMenu();

    if (hasClock) {
        await initializeChart();
        initializeUser();
        initializeDrinkingClock();
        checkOnboarding();
    }

    initializeEventListeners();
    i18n.updatePageContent();
}

function checkOnboarding() {
    if (!localStorage.getItem('onboardingComplete')) {
        const banner = document.getElementById('onboarding-banner');
        if (banner) banner.classList.remove('hidden');
        openUserInfoPopup();
    }
}

async function initializeChart() {
    await loadPromillDescriptions();
    calculateBAC();
    toggleChartExplainer();
}

function initializeUser() {
    loadUserData();
    initializeSliders();
}

function initializeDrinkingClock() {
    loadDrinkData();
    loadDrinkOptions();
    updateClockDisplay();
    updateClearButtonVisibility();
}

function initializeEventListeners() {
    document.querySelectorAll('.clock-number').forEach(element => {
        element.addEventListener('click', (e) => {
            const hour = parseInt(e.target.textContent);
            openDrinkPopup(hour);
        });
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const hour = parseInt(e.target.textContent);
                openDrinkPopup(hour);
            }
        });
    });

    // Keyboard support for profile pill
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openUserInfoPopup();
            }
        });
    }

    // Close all popups when clicking the backdrop
    document.getElementById('popup-backdrop')?.addEventListener('click', () => {
        document.querySelectorAll('.popup.active').forEach(popup => {
            popup.classList.remove('active');
        });
        hideBackdrop();
    });
}

// Backdrop management
function showBackdrop() {
    document.getElementById('popup-backdrop')?.classList.add('active');
}

function hideBackdrop() {
    document.getElementById('popup-backdrop')?.classList.remove('active');
}

// Generic popup close function
function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove('active');
        if (!document.querySelector('.popup.active')) {
            hideBackdrop();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export necessary functions and objects
export const state = AppState.getInstance();
export const { getCookie, getLocalStorage } = storage;
export { closePopup, showBackdrop };

// Global scope assignments for HTML event handlers
Object.assign(window, {
    openUserInfoPopup,
    openDrinkPopup,
    saveUserInfo,
    clearDrinkData,
    closeMobileInfoPopup,
    closePopup
});
