import { i18n } from '../i18n/languageManager.js';

export function generateQRCode() {
    const qrcodeContainer = document.getElementById('qrcode');
    if (qrcodeContainer.firstChild) {
        return; // QR code already exists, no need to regenerate
    }

    const rootUrl = window.location.origin; // Get the root URL
    new QRCode(qrcodeContainer, {
        text: rootUrl,
        width: 128,
        height: 128
    });
}

export function initializeMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const slideMenu = document.getElementById('slide-menu');
    let qrCodeGenerated = false;

    menuToggle.addEventListener('click', () => {
        slideMenu.classList.toggle('active');
        if (!qrCodeGenerated) {
            generateQRCode();
            qrCodeGenerated = true;
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!slideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            slideMenu.classList.remove('active');
        }
    });

    // Add click handlers for flag buttons
    document.querySelectorAll('.flag-button').forEach(button => {
        // Set initial active state
        button.classList.toggle('active', button.dataset.lang === i18n.currentLanguage);

        button.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            i18n.setLanguage(lang);

            // Update active state
            document.querySelectorAll('.flag-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
        });
    });
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


