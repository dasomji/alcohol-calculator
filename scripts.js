document.addEventListener('DOMContentLoaded', () => {
    console.log("hello");
    loadUserData();
    loadDrinkData();
    updateBACBar();
    loadDrinkOptions();
    console.log("hello");
});

function openUserInfoPopup() {
    // Show user info popup
    const popup = document.getElementById('user-info-popup');
    popup.classList.add('active');
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

// function updateBACBar() {
//     const bac = calculateBAC();
//     const bacBar = document.getElementById('bac-bar');
//     if (bac <= 0.5) {
//         bacBar.style.backgroundColor = 'green';
//     } else if (bac <= 1) {
//         bacBar.style.backgroundColor = 'yellow';
//     } else if (bac <= 1.5) {
//         bacBar.style.backgroundColor = 'darkyellow';
//     } else if (bac <= 2.5) {
//         bacBar.style.backgroundColor = 'orange';
//     } else if (bac <= 3) {
//         bacBar.style.backgroundColor = 'lightred';
//     } else {
//         bacBar.style.backgroundColor = 'darkred';
//     }
// }

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
    const tableBody = document.querySelector('#drinks-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    if (drinkData) {
        const data = JSON.parse(drinkData);
        for (const hour in data) {
            const drinks = data[hour];
            drinks.forEach(drink => {
                const row = document.createElement('tr');
                const timeCell = document.createElement('td');
                const typeCell = document.createElement('td');

                timeCell.textContent = hour;
                typeCell.textContent = drink.drinkType;

                row.appendChild(timeCell);
                row.appendChild(typeCell);
                tableBody.appendChild(row);
            });
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

function clearCookie() {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "drinkData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

function selectDrink(drinkType) {
    saveDrink(selectedHour, drinkType, 1); // Assuming quantity is 1 for each click
    closePopup('drink-popup');
}


async function loadDrinkOptions() {
    try {
        console.log('Loading drink options...');
        const response = await fetch('drinks.json');
        console.log('Response:', response);
        const drinks = await response.json();
        console.log('Drinks:', drinks);

        const drinkPopup = document.getElementById('drink-popup');
        console.log('Drink Popup:', drinkPopup);
        drinks.forEach(drink => {
            const drinkButton = document.createElement('button');
            drinkButton.textContent = drink.name;
            drinkButton.addEventListener('click', () => selectDrink(drink.name));
            drinkPopup.insertBefore(drinkButton, drinkPopup.lastElementChild);
            console.log('Added drink button:', drinkButton);
        });
    } catch (error) {
        console.error('Error loading drink options:', error);
    }
}

// function updateBACBar() {
//     const bac = calculateBAC();
//     const bacBar = document.getElementById('bac-bar');
//     if (bac <= 0.5) {
//         bacBar.style.backgroundColor = 'green';
//     } else if (bac <= 1) {
//         bacBar.style.backgroundColor = 'yellow';
//     } else if (bac <= 1.5) {
//         bacBar.style.backgroundColor = 'darkyellow';
//     } else if (bac <= 2.5) {
//         bacBar.style.backgroundColor = 'orange';
//     } else if (bac <= 3) {
//         bacBar.style.backgroundColor = 'lightred';
//     } else {
//         bacBar.style.backgroundColor = 'darkred';
//     }
// }