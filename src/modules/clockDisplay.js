import { state } from './state.js';
import { deleteDrink } from './drinks.js';

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
            fetch('drinks.json')
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
    state.setSelectedHour(hour);
    const popup = document.getElementById('drink-popup');
    popup.classList.add('active');
}

export function closeDrinkPopup() {
    const popup = document.getElementById('drink-popup');
    popup.classList.remove('active');
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
