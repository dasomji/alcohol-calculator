import de from './de.js';
import en from './en.js';

const translations = {
    de,
    en
};

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
        this.translations = translations;
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updatePageContent();
            this.updateChart();
        }
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    }

    updatePageContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
    }

    updateChart() {
        const event = new CustomEvent('languageChanged');
        document.dispatchEvent(event);
    }
}

export const i18n = new LanguageManager(); 