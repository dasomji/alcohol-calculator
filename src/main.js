// State management
class AppState {
    static instance = null;
    selectedHour = null;
    bacChartInstance = null;
    promillDescriptions = null;

    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }
        AppState.instance = this;
    }

    static getInstance() {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }

    setSelectedHour(hour) {
        this.selectedHour = hour;
    }

    getSelectedHour() {
        return this.selectedHour;
    }
}

// Storage utilities
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function getLocalStorage(key) {
    return localStorage.getItem(key);
}

// Export state instance
export const state = AppState.getInstance();

// Import other modules
import * as user from './modules/user.js';
import * as drinks from './modules/drinks.js';
import * as chart from './modules/chart.js';
import * as clockDisplay from './modules/clockDisplay.js';
import * as menu from './modules/menu.js';

// Shared state
export let selectedHour = null;
export let bacChartInstance = null;
export let promillDescriptions = null;

document.addEventListener('DOMContentLoaded', async () => {
    await chart.loadPromillDescriptions();
    user.loadUserData();
    drinks.loadDrinkData();
    drinks.loadDrinkOptions();
    clockDisplay.updateClockDisplay();
    chart.calculateBAC();
    user.initializeSliders();
    chart.toggleChartExplainer();
    menu.initializeMenu();

    // Add event listeners to clock numbers
    document.querySelectorAll('.clock-number').forEach(element => {
        element.addEventListener('click', (e) => {
            const hour = parseInt(e.target.textContent);
            clockDisplay.openDrinkPopup(hour);
        });
    });
});

// Make necessary functions available to the global scope for HTML event handlers
window.openUserInfoPopup = user.openUserInfoPopup;
window.closePopup = menu.closePopup;
window.openDrinkPopup = clockDisplay.openDrinkPopup;
window.saveUserInfo = user.saveUserInfo;
window.clearDrinkData = drinks.clearDrinkData;
window.closeMobilePopup = menu.closeMobilePopup;
