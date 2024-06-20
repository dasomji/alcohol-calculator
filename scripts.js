document.addEventListener('DOMContentLoaded', () => {
    console.log("hello")
    loadUserData();
    loadDrinkData();
    // updateBACBar();
    loadDrinkOptions();
});

function updateBACBar() {
    console.log("There is no bar yet")
}

function openUserInfoPopup() {
    const popup = document.getElementById('user-info-popup');
    popup.classList.add('active');
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}

function saveDrink(hour, drinkType, percentAlcohol, quantity) {
    let drinkData = getCookie('drinkData');
    drinkData = drinkData ? JSON.parse(drinkData) : {};
    if (!drinkData[hour]) {
        drinkData[hour] = [];
    }
    drinkData[hour].push({ drinkType, percentAlcohol, quantity });
    document.cookie = `drinkData=${JSON.stringify(drinkData)}; path=/;`;
    closePopup('drink-popup');
    updateClockDisplay();
    updateBACBar();
    calculateBAC();
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
    const age = document.getElementById('age').value;
    const userInfo = { gender, weight, height, age };
    document.cookie = `userData=${JSON.stringify(userInfo)}; path=/;`;
    closePopup('user-info-popup');
    updateUserInfoDisplay();
    updateBACBar();
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function loadUserData() {
    let userData = getCookie('userData');
    if (!userData) {
        // Set default values
        userData = JSON.stringify({
            gender: 'male',
            weight: 80,
            height: 172,
            age: 30
        });
        document.cookie = `userData=${userData}; path=/;`;
    }

    const { gender, weight, height, age } = JSON.parse(userData);
    document.getElementById('gender').value = gender;
    document.getElementById('weight').value = weight;
    document.getElementById('height').value = height;
    document.getElementById('age').value = age;
    updateUserInfoDisplay();
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
        const { gender, weight, height, age } = JSON.parse(userData);
        document.getElementById('user-info').innerText = `${gender} / ${weight}kg / ${height}cm / ${age} years`;
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
                const percentCell = document.createElement('td');
                const volumeCell = document.createElement('td');

                // Format the hour to display as "9:00" or "8:00"
                const formattedHour = `${hour}:00`;

                timeCell.textContent = formattedHour;
                typeCell.textContent = drink.drinkType;
                percentCell.textContent = drink.percentAlcohol; // Assuming percentAlcohol is stored in drink data
                volumeCell.textContent = drink.quantity; // Assuming quantity is the volume in ml

                row.appendChild(timeCell);
                row.appendChild(typeCell);
                row.appendChild(percentCell);
                row.appendChild(volumeCell);
                tableBody.appendChild(row);
            });
        }
    }
}

function calculateBAC() {
    const userData = getCookie('userData');
    const drinkData = getCookie('drinkData');
    if (!userData || !drinkData) {
        console.log('No user data or drink data found.');
        return 0;
    }

    const { gender, weight, height, age } = JSON.parse(userData);
    const drinks = JSON.parse(drinkData);

    console.log('User Data:', { gender, weight, height, age });
    console.log('Drink Data:', drinks);

    const beta = 0.015;
    let totalBAC = 0;
    let totalAlcohol = 0;
    let r;
    let TBW; // Declare TBW outside the if-else blocks

    if (gender === 'male') {
        TBW = 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight;
        r = TBW / weight;
    } else {
        TBW = -2.097 + 0.1069 * height + 0.2466 * weight;
        r = TBW / weight;
    }

    console.log('Total Body Water (TBW):', TBW);
    console.log('Ratio (r):', r);

    const bacTable = [];
    const currentHour = new Date().getHours();

    for (let hour = 0; hour <= currentHour; hour++) {
        if (drinks[hour]) {
            drinks[hour].forEach(drink => {
                const quantity = parseInt(drink.quantity);
                const percentAlcohol = parseFloat(drink.percentAlcohol);
                const alcoholMass = (quantity * percentAlcohol * 0.789) / 100; // 0.789 is the density of ethanol in g/ml

                totalAlcohol += alcoholMass;
            });
        }

        const timeElapsed = currentHour - hour;
        const bac = (totalAlcohol / (r * weight)) - (beta * timeElapsed);
        totalBAC = Math.max(bac, 0); // BAC cannot be negative

        console.log('Hour:', hour, 'Total Alcohol:', totalAlcohol, 'Time Elapsed:', timeElapsed, 'BAC:', totalBAC);

        bacTable.push({ time: `${hour}:00`, bac: totalBAC.toFixed(3) });
    }

    console.log('BAC Table:', bacTable);

    updateBACTable(bacTable);
    return totalBAC;
}

function updateBACTable(bacTable) {
    const tableBody = document.querySelector('#bac-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    bacTable.forEach(entry => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        const bacCell = document.createElement('td');

        timeCell.textContent = entry.time;
        bacCell.textContent = entry.bac;

        row.appendChild(timeCell);
        row.appendChild(bacCell);
        tableBody.appendChild(row);
    });
}

function clearCookie() {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "drinkData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

function selectDrink(drink) {
    saveDrink(selectedHour, drink.name, drink.percentAlcohol, drink.volume);
    closePopup('drink-popup');
}


async function loadDrinkOptions() {
    try {
        const response = await fetch('drinks.json');
        const drinks = await response.json();

        const drinkPopup = document.getElementById('drinks-container');
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
            const drinkDetails = document.createElement('p');
            drinkDetails.textContent = `${drink.percentAlcohol}%, ${drink.volume}ml`;

            drinkInfoDiv.appendChild(drinkName);
            drinkInfoDiv.appendChild(drinkDetails);

            drinkDiv.appendChild(drinkImage);
            drinkDiv.appendChild(drinkInfoDiv);

            drinkPopup.insertBefore(drinkDiv, drinkPopup.lastElementChild);
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