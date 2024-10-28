import * as storage from './modules/storage.js';
import * as user from './modules/user.js';
import * as drinks from './modules/drinks.js';
import * as chart from './modules/chart.js';
import * as ui from './modules/ui.js';
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
    ui.initializeSliders();
    ui.toggleChartExplainer();
    menu.initializeMenu();

    // Add event listeners to clock numbers
    document.querySelectorAll('.clock-number').forEach(element => {
        element.addEventListener('click', (e) => {
            const hour = parseInt(e.target.textContent);
            ui.openDrinkPopup(hour);
        });
    });
});

// Make necessary functions available to the global scope for HTML event handlers
window.openUserInfoPopup = ui.openUserInfoPopup;
window.closePopup = ui.closePopup;
window.openDrinkPopup = ui.openDrinkPopup;
window.saveUserInfo = user.saveUserInfo;
window.clearDrinkData = drinks.clearDrinkData;
window.closeMobilePopup = ui.closeMobilePopup;
