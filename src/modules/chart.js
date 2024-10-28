import { getLocalStorage } from '../main.js';
import { showMobilePopup } from './menu.js';

let bacChartInstance = null;
let promillDescriptions = null;

export async function loadPromillDescriptions() {
    try {
        const response = await fetch('assets/promill-description.json');
        promillDescriptions = await response.json();
    } catch (error) {
        console.error('Error loading promill descriptions:', error);
    }
}

export function calculateBAC() {
    const userData = localStorage.getItem('userData');
    const drinkData = localStorage.getItem('drinkData');
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

export function updateHighestBAC(highestBAC) {
    const highestBACElement = document.getElementById('highest-bac');
    const highestBACValueElement = document.getElementById('highest-bac-value');

    if (highestBAC > 0) {
        highestBACValueElement.textContent = highestBAC.toFixed(2);
        highestBACElement.classList.remove('hidden');
    } else {
        highestBACElement.classList.add('hidden');
    }
}

export function updateBACTable(bacTable) {
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
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '‰ Alkohol'
                    },
                    grid: {
                        display: false
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
    renderDrinkPictograms();
}

function renderDrinkPictograms() {
    const drinkData = localStorage.getItem('drinkData');
    if (drinkData) {
        const drinks = JSON.parse(drinkData);

        fetch('assets/drinks.json')
            .then(response => response.json())
            .then(drinkTypes => {
                console.log('Drink types loaded:', drinkTypes);

                bacChartInstance.options.animation.onComplete = () => {
                    const ctx = bacChartInstance.ctx;
                    const chartArea = bacChartInstance.chartArea;

                    Object.entries(drinks).forEach(([hour, drinkList]) => {
                        const xPos = bacChartInstance.scales.x.getPixelForValue(hour + ':00');
                        let yPos = chartArea.bottom;
                        const stackOffset = 20;

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
