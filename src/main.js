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
    clearDrinkData
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
    initializeMenu();

    if (hasClock) {
        await initializeChart();
        initializeUser();
        initializeDrinkingClock();
    }

    initializeEventListeners();
    i18n.updatePageContent();
}

async function initializeContentPage() {
    initializeMenu();
    initializeEventListeners();
    i18n.updatePageContent();
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
}

function initializeEventListeners() {
    document.querySelectorAll('.clock-number').forEach(element => {
        element.addEventListener('click', (e) => {
            const hour = parseInt(e.target.textContent);
            openDrinkPopup(hour);
        });
    });
}

// Generic popup close function
function closePopup(popupId) {
    document.getElementById(popupId)?.classList.remove('active');
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export necessary functions and objects
export const state = AppState.getInstance();
export const { getCookie, getLocalStorage } = storage;
export { closePopup };

// Global scope assignments for HTML event handlers
Object.assign(window, {
    openUserInfoPopup,
    openDrinkPopup,
    saveUserInfo,
    clearDrinkData,
    closeMobileInfoPopup,
    closePopup
});
