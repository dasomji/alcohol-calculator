export class AppState {
    static instance = null;
    selectedHour = null;
    bacChartInstance = null;
    promillDescriptions = null;

    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }
        AppState.instance = this;
    }

    static getInstance() {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }

    setSelectedHour(hour) {
        this.selectedHour = hour;
    }

    getSelectedHour() {
        return this.selectedHour;
    }
}

export const state = AppState.getInstance();