import { updateClockDisplay } from './clockDisplay.js';
import { calculateBAC } from './chart.js';
import { toggleChartExplainer } from './chart.js';
import { getLocalStorage } from './storage.js';
import { state } from './state.js';
import { closePopup } from './menu.js';

export async function saveDrink(hour, drinkType, percentAlcohol, quantity) {
    let drinkData = JSON.parse(localStorage.getItem('drinkData') || '{}');
    if (!drinkData[hour]) {
        drinkData[hour] = [];
    }
    drinkData[hour].push({ drinkType, percentAlcohol, quantity });
    localStorage.setItem('drinkData', JSON.stringify(drinkData));
    closePopup('drink-popup');
    await updateClockDisplay();
    calculateBAC();
    toggleChartExplainer();
}

export function clearDrinkData() {
    localStorage.removeItem('drinkData');
    toggleChartExplainer();
    updateClockDisplay();
    calculateBAC();
}

export function loadDrinkData() {
    const drinkData = localStorage.getItem('drinkData');
    if (drinkData) {
        updateClockDisplay();
    }
}

export function selectDrink(drink) {
    const hour = state.getSelectedHour();
    saveDrink(hour, drink.name, drink.percentAlcohol, drink.volume);
    closePopup('drink-popup');
}

export async function loadDrinkOptions() {
    try {
        const response = await fetch('drinks.json');
        const drinks = await response.json();

        const drinkPopup = document.getElementById('drinks-container');
        drinkPopup.innerHTML = ''; // Clear existing content

        drinks.forEach(drink => {
            const drinkDiv = document.createElement('div');
            drinkDiv.classList.add('drink-option');
            drinkDiv.addEventListener('click', () => selectDrink(drink));

            const drinkImage = document.createElement('img');
            drinkImage.src = drink.imageUrl;
            drinkImage.alt = drink.name;

            const drinkInfoDiv = document.createElement('div');
            drinkInfoDiv.classList.add('drink-info');
            const drinkName = document.createElement('p');
            drinkName.textContent = drink.name;
            drinkName.id = 'drink-name';
            const drinkDetails = document.createElement('p');
            drinkDetails.textContent = `${drink.percentAlcohol}%, ${drink.volume}ml`;

            const bacIncrease = calculateBACIncrease(drink);
            const bacIncreaseP = document.createElement('p');
            bacIncreaseP.textContent = `+${bacIncrease.toFixed(3)}‰`;
            bacIncreaseP.classList.add('bac-increase');

            drinkInfoDiv.appendChild(drinkName);
            drinkInfoDiv.appendChild(drinkDetails);
            drinkInfoDiv.appendChild(bacIncreaseP);

            drinkDiv.appendChild(drinkImage);
            drinkDiv.appendChild(drinkInfoDiv);

            drinkPopup.appendChild(drinkDiv);
        });
    } catch (error) {
        console.error('Error loading drink options:', error);
    }
}

export function calculateBACIncrease(drink) {
    const userData = getLocalStorage('userData');
    if (!userData) {
        console.log('No user data found.');
        return 0;
    }

    const { gender, weight, height, age } = JSON.parse(userData);
    let r;
    let TBW;

    if (gender === 'male') {
        TBW = 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight;
    } else {
        TBW = -2.097 + 0.1069 * height + 0.2466 * weight;
    }
    r = TBW / weight;

    const alcoholMass = (drink.volume * 0.001 * drink.percentAlcohol * 0.789) / 100;
    const bacIncrease = (alcoholMass / (r * weight)) * 1000 * 0.8;

    return bacIncrease;
}

export function deleteDrink(hour, index) {
    let drinkData = JSON.parse(localStorage.getItem('drinkData'));
    drinkData[hour].splice(index, 1);

    if (drinkData[hour].length === 0) {
        delete drinkData[hour];
    }

    localStorage.setItem('drinkData', JSON.stringify(drinkData));
    updateClockDisplay();
    calculateBAC();
    toggleChartExplainer();

    // Refresh the modal
    const drinks = drinkData[hour] || [];
    fetch('drinks.json')
        .then(response => response.json())
        .then(drinkTypes => {
            showDrinkListModal(hour, drinks, drinkTypes);
        });
}
