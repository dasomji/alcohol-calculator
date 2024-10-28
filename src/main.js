// Import other modules
import * as user from './modules/user.js';
import * as drinkingClock from './modules/drinkingClock.js';
import * as chart from './modules/chart.js';
import * as menu from './modules/menu.js';

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



// Shared state
export let selectedHour = null;
export let bacChartInstance = null;
export let promillDescriptions = null;

document.addEventListener('DOMContentLoaded', async () => {
    await chart.loadPromillDescriptions();
    user.loadUserData();
    drinkingClock.loadDrinkData();
    drinkingClock.loadDrinkOptions();
    drinkingClock.updateClockDisplay();
    chart.calculateBAC();
    user.initializeSliders();
    chart.toggleChartExplainer();
    menu.initializeMenu();

    // Add event listeners to clock numbers
    document.querySelectorAll('.clock-number').forEach(element => {
        element.addEventListener('click', (e) => {
            const hour = parseInt(e.target.textContent);
            drinkingClock.openDrinkPopup(hour);
        });
    });
});

// Make necessary functions available to the global scope for HTML event handlers
window.openUserInfoPopup = user.openUserInfoPopup;
window.closePopup = menu.closePopup;
window.openDrinkPopup = drinkingClock.openDrinkPopup;
window.saveUserInfo = user.saveUserInfo;
window.clearDrinkData = drinkingClock.clearDrinkData;
window.closeMobilePopup = menu.closeMobilePopup;
