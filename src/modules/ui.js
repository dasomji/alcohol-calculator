import { state } from './state.js';
import { deleteDrink } from './drinks.js';

export function openUserInfoPopup() {
    const popup = document.getElementById('user-info-popup');
    popup.classList.add('active');
}

export function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}

export function openDrinkPopup(hour) {
    state.setSelectedHour(hour);
    const popup = document.getElementById('drink-popup');
    popup.classList.add('active');
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

export function showDesktopTooltip(event, description) {
    const tooltip = document.getElementById('desktop-tooltip');
    tooltip.innerHTML = `<h3>${description.title}</h3><p>${description.description}</p>`;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

export function hideDesktopTooltip() {
    const tooltip = document.getElementById('desktop-tooltip');
    tooltip.style.display = 'none';
}

export function showMobilePopup(description) {
    const popup = document.getElementById('mobile-popup');
    const popupContent = document.getElementById("mobile-popup-content");
    popupContent.innerHTML = `<h3>${description.title}</h3><p>${description.description}</p>`;
    popup.classList.add('active');
}

export function closeMobilePopup() {
    const popup = document.getElementById('mobile-popup');
    popup.classList.remove('active');
}

export function initializeSliders() {
    const sliders = ['weight', 'height', 'age'];
    sliders.forEach(slider => {
        const rangeInput = document.getElementById(`${slider}-slider`);
        const numberInput = document.getElementById(slider);

        rangeInput.addEventListener('input', () => {
            numberInput.value = rangeInput.value;
        });

        numberInput.addEventListener('input', () => {
            rangeInput.value = numberInput.value;
        });
    });
    console.log("initialised")
}

export function toggleChartExplainer() {
    const chartExplainer = document.getElementById('chart-explainer');
    const highestBAC = document.getElementById('highest-bac');
    const drinkData = localStorage.getItem('drinkData');
    const drinks = drinkData ? JSON.parse(drinkData) : {};

    if (Object.keys(drinks).length > 0) {
        chartExplainer.classList.remove('hidden');
        highestBAC.classList.remove('hidden');
    } else {
        chartExplainer.classList.add('hidden');
        highestBAC.classList.add('hidden');
    }
}
