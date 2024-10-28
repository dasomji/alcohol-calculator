import { getLocalStorage } from '../main.js';
import { closePopup } from './menu.js';
import { loadDrinkOptions } from './drinkingClock.js';

export function saveUserInfo() {
    const gender = document.getElementById('gender').value;
    const weight = Number(document.getElementById('weight').value);
    const height = Number(document.getElementById('height').value);
    const age = Number(document.getElementById('age').value);
    const userInfo = { gender, weight, height, age };
    localStorage.setItem('userData', JSON.stringify(userInfo));
    closePopup('user-info-popup');
    updateUserInfoDisplay();
    loadDrinkOptions();
}

export function loadUserData() {
    let userData = getLocalStorage('userData');
    if (!userData) {
        // Set default values
        userData = JSON.stringify({
            gender: 'female',
            weight: 40,
            height: 150,
            age: 14
        });
        localStorage.setItem('userData', userData);
    }

    const { gender, weight, height, age } = JSON.parse(userData);
    document.getElementById('gender').value = gender;
    document.getElementById('weight').value = weight;
    document.getElementById('weight-slider').value = weight;
    document.getElementById('height').value = height;
    document.getElementById('height-slider').value = height;
    document.getElementById('age').value = age;
    document.getElementById('age-slider').value = age;
    updateUserInfoDisplay();
}

export function updateUserInfoDisplay() {
    const userData = getLocalStorage('userData');
    if (userData) {
        const { gender, weight, height, age } = JSON.parse(userData);
        let displayGender;
        switch (gender) {
            case 'male':
                displayGender = 'Mann';
                break;
            case 'female':
                displayGender = 'Frau';
                break;
            case 'inter':
                displayGender = 'Inter';
                break;
            default:
                displayGender = gender;
        }
        document.getElementById('user-info').innerText = `${displayGender} / ${weight}kg / ${height}cm / ${age} Jahre`;
    }
}

export function openUserInfoPopup() {
    const popup = document.getElementById('user-info-popup');
    popup.classList.add('active');
}

export function closeUserInfoPopup() {
    const popup = document.getElementById('user-info-popup');
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
}
