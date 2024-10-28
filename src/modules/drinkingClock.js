import { calculateBAC, toggleChartExplainer } from './chart.js';
import { getLocalStorage, state, closePopup } from '../main.js';

export function updateClockDisplay() {
    return new Promise((resolve) => {
        const clockContainer = document.getElementById('clock');
        const clearButton = document.querySelector('.clear-button');

        // Clear existing pictograms
        const existingPictograms = clockContainer.querySelectorAll('.drink-group');
        existingPictograms.forEach(pictogram => pictogram.remove());

        const drinkData = localStorage.getItem('drinkData');
        if (drinkData) {
            const data = JSON.parse(drinkData);

            // Load drink data from drinks.json
            fetch('assets/drinks.json')
                .then(response => response.json())
                .then(drinkTypes => {
                    Object.entries(data).forEach(([hour, drinks]) => {
                        const drinkGroup = document.createElement('div');
                        drinkGroup.classList.add('drink-group');
                        drinkGroup.addEventListener('click', () => showDrinkListModal(hour, drinks, drinkTypes));

                        drinks.forEach(drink => {
                            const drinkType = drinkTypes.find(type => type.name === drink.drinkType);
                            if (drinkType) {
                                const pictogram = document.createElement('span');
                                pictogram.classList.add('drink-pictogram');
                                pictogram.textContent = drinkType.pictogram;
                                drinkGroup.appendChild(pictogram);
                            }
                        });

                        const angle = (parseInt(hour) - 3) * 30 * (Math.PI / 180);
                        const clockSize = clockContainer.offsetWidth;
                        const radius = (clockSize / 2) * 1.3;
                        const x = Math.cos(angle) * radius + (clockSize / 2);
                        const y = Math.sin(angle) * radius + (clockSize / 2);

                        drinkGroup.style.left = `${x}px`;
                        drinkGroup.style.top = `${y}px`;
                        drinkGroup.style.transform = 'translate(-50%, -50%)';

                        clockContainer.appendChild(drinkGroup);
                    });

                    // Adjust the margin of the clear button
                    const maxBottom = Math.max(...Array.from(clockContainer.querySelectorAll('.drink-group')).map(el => el.offsetTop + el.offsetHeight));
                    const extraMargin = Math.max(0, maxBottom - clockContainer.offsetHeight);
                    clearButton.style.marginTop = `${extraMargin}px`;

                    resolve();
                })
                .catch(error => {
                    console.error('Error loading drink types:', error);
                    resolve();
                });
        } else {
            clearButton.style.marginTop = '0px';
            resolve();
        }
    });
}

export function openDrinkPopup(hour) {
    if (state && typeof hour === 'number') {
        state.setSelectedHour(hour);
        const popup = document.getElementById('drink-popup');
        popup.classList.add('active');
    } else {
        console.error('Invalid hour or state not initialized');
    }
}

export function showDrinkListModal(hour, drinks, drinkTypes) {
    const modal = document.getElementById('drink-list-modal');
    const timeSpan = document.getElementById('drink-list-time');
    const drinkList = document.getElementById('drink-list');

    timeSpan.textContent = `${hour}:00`;
    drinkList.innerHTML = '';

    drinks.forEach((drink, index) => {
        const drinkType = drinkTypes.find(type => type.name === drink.drinkType);
        if (drinkType) {
            const listItem = document.createElement('li');
            listItem.textContent = `${drinkType.name} ${drinkType.pictogram}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteDrink(hour, index);

            listItem.appendChild(deleteButton);
            drinkList.appendChild(listItem);
        }
    });

    modal.classList.add('active');
}

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
        const response = await fetch('assets/drinks.json');
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


    localStorage.setItem('drinkData', JSON.stringify(drinkData));
    updateClockDisplay();
    calculateBAC();
    toggleChartExplainer();

    if (drinkData[hour].length === 0) {
        delete drinkData[hour];
        closePopup("drink-list-modal");
        return
    }
    // Refresh the modal
    const drinks = drinkData[hour] || [];
    fetch('assets/drinks.json')
        .then(response => response.json())
        .then(drinkTypes => {
            showDrinkListModal(hour, drinks, drinkTypes);
        });
}
