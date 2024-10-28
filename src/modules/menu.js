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

// Generic popup close function that can be used by any module
export function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}
