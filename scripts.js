document.addEventListener('DOMContentLoaded', () => {
    initializeClock();
    loadUserData();
    loadDrinkData();
    updateBACBar();
});

// function initializeClock() {
//     const clock = document.getElementById('clock');
//     for (let i = 1; i <= 12; i++) {
//         const number = document.createElement('div');
//         number.className = 'clock-number';
//         number.innerText = i;
//         number.style.transform = `rotate(${i * 30}deg) translate(120px) rotate(-${i * 30}deg)`;
//         number.onclick = () => openDrinkPopup(i);
//         clock.appendChild(number);
//     }
// }

function openUserInfoPopup() {
    // Show user info popup
}

function openDrinkPopup(hour) {
    // Show drink selection popup for the specified hour
}

function loadUserData() {
    // Load user data from cookie
}

function loadDrinkData() {
    // Load drink data from cookie
}

function updateBACBar() {
    // Calculate BAC and update the BAC bar color
}

function clearCookie() {
    // Clear the cookie and reload the page
}

function openUserInfoPopup() {
    const popup = document.getElementById('user-info-popup');
    popup.classList.add('active');
}

function openDrinkPopup(hour) {
    const popup = document.getElementById('drink-popup');
    popup.classList.add('active');
    // Store the selected hour in a global variable or data attribute
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}

function saveUserInfo() {
    // Save user info to cookie
    closePopup('user-info-popup');
    updateBACBar();
}

function saveDrink(hour, drinkType, quantity) {
    // Save drink data to cookie
    closePopup('drink-popup');
    updateBACBar();
}

function calculateBAC() {
    // Implement the Widmark formula to calculate BAC
    // Return the calculated BAC value
}

function updateBACBar() {
    const bac = calculateBAC();
    const bacBar = document.getElementById('bac-bar');
    if (bac <= 0.5) {
        bacBar.style.backgroundColor = 'green';
    } else if (bac <= 1) {
        bacBar.style.backgroundColor = 'yellow';
    } else if (bac <= 1.5) {
        bacBar.style.backgroundColor = 'darkyellow';
    } else if (bac <= 2.5) {
        bacBar.style.backgroundColor = 'orange';
    } else if (bac <= 3) {
        bacBar.style.backgroundColor = 'lightred';
    } else {
        bacBar.style.backgroundColor = 'darkred';
    }
}

function clearCookie() {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "drinkData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

let selectedHour = null;

function openDrinkPopup(hour) {
    selectedHour = hour;
    const popup = document.getElementById('drink-popup');
    popup.classList.add('active');
}

function saveUserInfo() {
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const userInfo = { gender, weight, height };
    document.cookie = `userData=${JSON.stringify(userInfo)}; path=/;`;
    closePopup('user-info-popup');
    updateUserInfoDisplay();
    updateBACBar();
}

function saveDrink(hour, drinkType, quantity) {
    let drinkData = getCookie('drinkData');
    drinkData = drinkData ? JSON.parse(drinkData) : {};
    if (!drinkData[hour]) {
        drinkData[hour] = [];
    }
    drinkData[hour].push({ drinkType, quantity });
    document.cookie = `drinkData=${JSON.stringify(drinkData)}; path=/;`;
    closePopup('drink-popup');
    updateClockDisplay();
    updateBACBar();
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function loadUserData() {
    const userData = getCookie('userData');
    if (userData) {
        const { gender, weight, height } = JSON.parse(userData);
        document.getElementById('gender').value = gender;
        document.getElementById('weight').value = weight;
        document.getElementById('height').value = height;
        updateUserInfoDisplay();
    }
}

function loadDrinkData() {
    const drinkData = getCookie('drinkData');
    if (drinkData) {
        updateClockDisplay();
    }
}

function updateUserInfoDisplay() {
    const userData = getCookie('userData');
    if (userData) {
        const { gender, weight, height } = JSON.parse(userData);
        document.getElementById('user-info').innerText = `${gender} / ${weight}kg / ${height}cm`;
    }
}

function updateClockDisplay() {
    const drinkData = getCookie('drinkData');
    if (drinkData) {
        const data = JSON.parse(drinkData);
        for (const hour in data) {
            const drinks = data[hour];
            const numberElement = document.querySelector(`.clock-number:nth-child(${hour})`);
            numberElement.innerHTML = `${hour}<br>${drinks.map(d => d.drinkType === 'beer' ? '🍺' : '🍷').join('')}`;
        }
    }
}

function calculateBAC() {
    const userData = getCookie('userData');
    const drinkData = getCookie('drinkData');
    if (!userData || !drinkData) return 0;

    const { gender, weight } = JSON.parse(userData);
    const drinks = JSON.parse(drinkData);

    let totalAlcohol = 0;
    for (const hour in drinks) {
        drinks[hour].forEach(drink => {
            const quantity = parseInt(drink.quantity);
            if (drink.drinkType === 'beer') {
                totalAlcohol += quantity * 14; // Approximate grams of alcohol in a beer
            } else if (drink.drinkType === 'wine') {
                totalAlcohol += quantity * 20; // Approximate grams of alcohol in a wine
            }
        });
    }

    const r = gender === 'male' ? 0.68 : 0.55;
    const bac = (totalAlcohol / (weight * r)) * 100;
    return bac;
}

function updateBACBar() {
    const bac = calculateBAC();
    const bacBar = document.getElementById('bac-bar');
    if (bac <= 0.5) {
        bacBar.style.backgroundColor = 'green';
    } else if (bac <= 1) {
        bacBar.style.backgroundColor = 'yellow';
    } else if (bac <= 1.5) {
        bacBar.style.backgroundColor = 'darkyellow';
    } else if (bac <= 2.5) {
        bacBar.style.backgroundColor = 'orange';
    } else if (bac <= 3) {
        bacBar.style.backgroundColor = 'lightred';
    } else {
        bacBar.style.backgroundColor = 'darkred';
    }
}

function clearCookie() {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "drinkData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}