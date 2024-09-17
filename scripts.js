document.addEventListener('DOMContentLoaded', async () => {
    await loadPromillDescriptions();
    loadUserData();
    loadDrinkData();
    loadDrinkOptions();
    updateClockDisplay();
    calculateBAC();
    initializeSliders();
    toggleChartExplainer();
});

function openUserInfoPopup() {
    const popup = document.getElementById('user-info-popup');
    popup.classList.add('active');
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}

async function saveDrink(hour, drinkType, percentAlcohol, quantity) {
    let drinkData = getCookie('drinkData');
    drinkData = drinkData ? JSON.parse(drinkData) : {};
    if (!drinkData[hour]) {
        drinkData[hour] = [];
    }
    drinkData[hour].push({ drinkType, percentAlcohol, quantity });
    document.cookie = `drinkData=${JSON.stringify(drinkData)}; path=/;`;
    closePopup('drink-popup');
    await updateClockDisplay();
    calculateBAC();
    toggleChartExplainer();
}

function clearCookie() {
    document.cookie = "drinkData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toggleChartExplainer();
    updateClockDisplay();
    calculateBAC();
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
    loadDrinkOptions();
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
            gender: 'female',
            weight: 40,
            height: 150,
            age: 14
        });
        document.cookie = `userData=${userData}; path=/;`;
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

function updateClockDisplay() {
    return new Promise((resolve) => {
        const clockContainer = document.getElementById('clock');
        const clearButton = document.querySelector('.clear-button');

        // Clear existing pictograms
        const existingPictograms = clockContainer.querySelectorAll('.drink-group');
        existingPictograms.forEach(pictogram => pictogram.remove());

        const drinkData = getCookie('drinkData');
        if (drinkData) {
            const data = JSON.parse(drinkData);

            // Get the clock dimensions
            const clockRect = clockContainer.getBoundingClientRect();
            const clockSize = Math.min(clockRect.width, clockRect.height);

            // Calculate the radius for positioning drinks
            const radius = (clockSize / 2) * 1.3; // 30% outside the clock face

            let maxBottom = 0;

            // Load drink types from drinks.json
            fetch('drinks.json')
                .then(response => response.json())
                .then(drinkTypes => {
                    Object.entries(data).forEach(([hour, drinks]) => {
                        const drinkGroup = document.createElement('div');
                        drinkGroup.classList.add('drink-group');

                        drinks.forEach((drink, index) => {
                            const drinkType = drinkTypes.find(type => type.name === drink.drinkType);
                            if (drinkType) {
                                const pictogram = document.createElement('span');
                                pictogram.classList.add('drink-pictogram');
                                pictogram.textContent = drinkType.pictogram;
                                drinkGroup.appendChild(pictogram);
                            }
                        });

                        // Position the drink group
                        const angle = (parseInt(hour) - 3) * 30 * (Math.PI / 180); // Convert to radians
                        const x = Math.cos(angle) * radius + (clockSize / 2);
                        const y = Math.sin(angle) * radius + (clockSize / 2);

                        drinkGroup.style.left = `${x}px`;
                        drinkGroup.style.top = `${y}px`;
                        drinkGroup.style.transform = 'translate(-50%, -50%)';

                        clockContainer.appendChild(drinkGroup);

                        // Update maxBottom
                        const rect = drinkGroup.getBoundingClientRect();
                        maxBottom = Math.max(maxBottom, rect.bottom - clockRect.top);
                    });

                    // Adjust the margin of the clear button
                    const extraMargin = Math.max(0, maxBottom - clockSize);
                    clearButton.style.marginTop = `${extraMargin}px`;
                })
                .catch(error => console.error('Error loading drink types:', error))
                .finally(() => resolve());
        } else {
            clearButton.style.marginTop = '0px';
            resolve();
        }
    });
}

function calculateBAC() {
    const userData = getCookie('userData');
    const drinkData = getCookie('drinkData');
    if (!userData || !drinkData) {
        console.log('No user data or drink data found.');
        updateBACTable([]);
        updateHighestBAC(0);
        return;
    }

    const { gender, weight, height, age } = JSON.parse(userData);
    const drinks = JSON.parse(drinkData);

    console.log('User Data:', { gender, weight, height, age });
    console.log('Drink Data:', drinks);

    const beta = 0.15;
    let totalAlcohol = 0;
    let r;
    let TBW;
    let highestBAC = 0;

    if (gender === 'male') {
        TBW = 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight;
    } else {
        TBW = -2.097 + 0.1069 * height + 0.2466 * weight;
    }
    r = TBW / weight;

    console.log('Total Body Water (TBW):', TBW);
    console.log('Ratio (r):', r);

    const bacTable = [];
    const hours = [...Array(24).keys()].map(i => (i + 18) % 24);
    console.log(hours);
    hours.forEach(hour => {
        if (drinks[hour]) {
            drinks[hour].forEach(drink => {
                const quantity = parseInt(drink.quantity);
                const percentAlcohol = parseFloat(drink.percentAlcohol);
                const alcoholMass = (quantity * 0.001 * percentAlcohol * 0.789) / 100;

                totalAlcohol += alcoholMass;
            });
        }

        const bac = (totalAlcohol / (r * weight)) * 1000 * 0.8;
        const totalBAC = Math.max(bac, 0);
        if (totalBAC > highestBAC) {
            highestBAC = totalBAC;
        }
        bacTable.push({ time: `${hour}:00`, bac: totalBAC });

        if (bac > 0) {
            const reducedBAC = totalBAC - beta;
            const reducedTotalAlcohol = (reducedBAC / 1000 / 0.8) * (r * weight);
            totalAlcohol = Math.max(reducedTotalAlcohol, 0);
        }

        console.log('Hour:', hour, 'Total Alcohol:', totalAlcohol, 'BAC:', totalBAC);
    });

    console.log('BAC Table:', bacTable);
    updateBACTable(bacTable);
    updateHighestBAC(highestBAC);
}

function updateHighestBAC(highestBAC) {
    const highestBACElement = document.getElementById('highest-bac');
    const highestBACValueElement = document.getElementById('highest-bac-value');

    if (highestBAC > 0) {
        highestBACValueElement.textContent = highestBAC.toFixed(2);
        highestBACElement.classList.remove('hidden');
    } else {
        highestBACElement.classList.add('hidden');
    }
}

let bacChartInstance = null;

async function loadPromillDescriptions() {
    try {
        const response = await fetch('promill-description.json');
        promillDescriptions = await response.json();
    } catch (error) {
        console.error('Error loading promill descriptions:', error);
    }
}

function updateBACTable(bacTable) {
    if (bacTable.length === 0) {
        // Clear the existing chart if there's no data
        if (bacChartInstance) {
            bacChartInstance.destroy();
            bacChartInstance = null;
        }
        return;
    }
    // Find the first and last index where BAC > 0
    let firstIndex = bacTable.findIndex(entry => entry.bac > 0);
    let lastIndex = bacTable.length - 1 - [...bacTable].reverse().findIndex(entry => entry.bac > 0);

    // Include one data point before the first and one after the last BAC > 0
    firstIndex = Math.max(firstIndex - 1, 0);
    lastIndex = Math.min(lastIndex + 1, bacTable.length - 1);

    // Filter the bacTable to include only the relevant data points
    const filteredBacTable = bacTable.slice(firstIndex, lastIndex + 1);

    const ctx = document.getElementById('bacChart').getContext('2d');
    const labels = filteredBacTable.map(entry => entry.time);

    // Create datasets for different BAC ranges
    const datasets = [];
    promillDescriptions.forEach((range, index) => {
        const data = filteredBacTable.map(entry => {
            if (entry.bac <= range.promill) {
                return entry.bac;
            } else {
                return null;
            }
        });

        const colors = [
            '#dbe1e6',
            '#c7d3db',
            '#a3b8c2',
            '#7f94a3',
            '#6b7f8d',
            '#576a77',
            '#435561',
            '#2f404b',
            '#1b2b35',
            '#07161f'
        ];
        const color = colors[index % colors.length];

        datasets.push({
            label: range.title,
            data: data,
            backgroundColor: color,
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 1,
            fill: true,
            spanGaps: false,
            tension: 0.4
        });
    });

    // Destroy the existing chart instance if it exists
    if (bacChartInstance) {
        bacChartInstance.destroy();
    }

    // Create a new chart instance
    bacChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Uhrzeit'
                    },
                    grid: {
                        display: false // Hide x-axis grid
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '‰ Alkohol'
                    },
                    grid: {
                        display: false // Hide x-axis grid
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const description = promillDescriptions[context.datasetIndex].description;
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}‰\n${description}`;
                        }
                    }
                }
            },
            onHover: (event, elements) => {
                const chart = bacChartInstance;
                const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
                const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
                const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);

                for (let i = 0; i < datasets.length; i++) {
                    if (dataY <= datasets[i].data[Math.floor(dataX)]) {
                        if (!('ontouchstart' in window)) {
                            showDesktopTooltip(event, promillDescriptions[i]);
                        }
                        return;
                    }
                }
                if (!('ontouchstart' in window)) {
                    hideDesktopTooltip();
                }
            },
            onClick: (event, elements) => {
                if ('ontouchstart' in window) {
                    const chart = bacChartInstance;
                    const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
                    const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
                    const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);

                    for (let i = 0; i < datasets.length; i++) {
                        if (dataY <= datasets[i].data[Math.floor(dataX)]) {
                            showMobilePopup(promillDescriptions[i]);
                            return;
                        }
                    }
                }
            }
        }
    });

    // Render drink pictograms on the chart
    const drinkData = getCookie('drinkData');
    if (drinkData) {
        const drinks = JSON.parse(drinkData);

        // Load drink data from drinks.json
        fetch('drinks.json')
            .then(response => response.json())
            .then(drinkTypes => {
                console.log('Drink types loaded:', drinkTypes);

                // Wait for the chart animation to finish
                bacChartInstance.options.animation.onComplete = () => {
                    const ctx = bacChartInstance.ctx;
                    const chartArea = bacChartInstance.chartArea;

                    // Iterate over the drink data and render pictograms
                    Object.entries(drinks).forEach(([hour, drinkList]) => {
                        const xPos = bacChartInstance.scales.x.getPixelForValue(hour + ':00');
                        let yPos = chartArea.bottom;
                        const stackOffset = 20; // Vertical space between stacked drinks

                        if (xPos >= chartArea.left && xPos <= chartArea.right) {
                            drinkList.forEach((drink, index) => {
                                const drinkType = drinkTypes.find(type => type.name === drink.drinkType);
                                if (drinkType) {
                                    const pictogram = drinkType.pictogram;

                                    ctx.save();
                                    ctx.font = '1rem Arial';
                                    ctx.fillStyle = 'black';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'bottom';
                                    ctx.fillText(pictogram, xPos, yPos - (index * stackOffset));
                                    ctx.restore();
                                } else {
                                    console.log(`Drink type not found for: ${drink.drinkType}`);
                                }
                            });
                        }
                    });
                };
            })
            .catch(error => {
                console.error('Error loading drink types:', error);
            });
    } else {
        console.log('No drink data found');
    }
}

function selectDrink(drink) {
    saveDrink(selectedHour, drink.name, drink.percentAlcohol, drink.volume);
    closePopup('drink-popup');
}

function calculateBACIncrease(drink) {
    const userData = getCookie('userData');
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

async function loadDrinkOptions() {
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

function showDesktopTooltip(event, description) {
    const tooltip = document.getElementById('desktop-tooltip');
    tooltip.innerHTML = `<h3>${description.title}</h3><p>${description.description}</p>`;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

function hideDesktopTooltip() {
    const tooltip = document.getElementById('desktop-tooltip');
    tooltip.style.display = 'none';
}

function showMobilePopup(description) {
    const popup = document.getElementById('mobile-popup');
    const popupContent = document.getElementById("mobile-popup-content");
    popupContent.innerHTML = `<h3>${description.title}</h3><p>${description.description}</p>`;
    popup.classList.add('active');
}

function closeMobilePopup() {
    const popup = document.getElementById('mobile-popup');
    popup.classList.remove('active');
}

function initializeSliders() {
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

function toggleChartExplainer() {
    const chartExplainer = document.getElementById('chart-explainer');
    const highestBAC = document.getElementById('highest-bac');
    const drinkData = getCookie('drinkData');
    const drinks = drinkData ? JSON.parse(drinkData) : {};

    if (Object.keys(drinks).length > 0) {
        chartExplainer.classList.remove('hidden');
        highestBAC.classList.remove('hidden');
    } else {
        chartExplainer.classList.add('hidden');
        highestBAC.classList.add('hidden');
    }
}