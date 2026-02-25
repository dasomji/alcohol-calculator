---
title: "feat: Onboarding Flow & UX Improvements"
type: feat
status: active
date: 2026-02-25
origin: documentation/brainstorm-onboarding-ux.md
---

# Onboarding Flow & UX Improvements

## Overview

Implement 15 UX improvements for the BAC Calculator educational app, ranging from a first-visit onboarding flow to bug fixes, accessibility, translation completeness, and visual polish. The app is used in school workshops to teach teenagers about alcohol's effects on the body.

## Problem Statement / Motivation

A brainstorm session (see brainstorm: `documentation/brainstorm-onboarding-ux.md`) tested the app from the perspective of a teenager opening it for the first time without instructions. It found: no explanation of what the app is for, broken visual elements, inaccessible clock controls, incomplete translations, and several bugs. The app fails at its primary educational goal if a student can't understand how to use it independently.

## Proposed Solution

Implement improvements in 4 tiers, prioritizing bug fixes and foundational changes before features and polish. Designed as a single coordinated flow where first-visit users get a welcome message inside the profile popup, and all subsequent changes build on a clean, bug-free foundation.

## Key Design Decisions

These decisions resolve ambiguities identified during spec analysis:

1. **Onboarding = enhanced profile popup, not a separate modal.** Issues #1 and #10 are merged into a single flow: on first visit, auto-open the existing profile popup with a welcome header ("This is a simulation to help you understand how alcohol affects your body. Set up your profile to get started."). Uses `localStorage.setItem('onboardingComplete', 'true')` as the flag. Silent defaults are still written so BAC calculations work if dismissed.

2. **Dynamic drink popup heading managed manually, not via i18n interpolation.** The heading "Add Drink at 20:00" is set in `openDrinkPopup()` JS code, removing the `data-i18n` attribute. A helper formats the translated string. Keeps the i18n system simple.

3. **Drink emojis positioned inside the clock** at ~0.85x radius, near their corresponding hour number.

4. **Keep the existing 2-tap clear confirmation.** It's already a solid mobile-friendly pattern. No modal replacement needed.

5. **Auto-scroll only on first drink addition per session.** Prevents disorientation when rapidly adding multiple drinks.

6. **Remove blank about.html.** The menu link is already commented out.

7. **Cache drinks.json** in a module-level variable instead of fetching it on every render/delete call. Not in the original 15 issues but prevents race conditions and improves reliability.

## Technical Considerations

### Architecture
- Vanilla HTML/CSS/JS with ES modules. No build tools or framework.
- All state in `localStorage` (`userData`, `drinkData`, `language`, new: `onboardingComplete`).
- Single `popup-backdrop` shared by all popups. Popups toggled via `.active` class.
- i18n via `LanguageManager` singleton with `data-i18n` attributes + manual JS updates.
- Chart.js for BAC line chart.

### Key Files to Modify
- `index.html` — clock number attributes, popup heading, onboarding text, clear button visibility
- `src/main.js` — onboarding check in `initializeApp()`, keyboard event handlers, scroll logic
- `src/modules/drinkingClock.js` — fix duplication bug, emoji positioning, drink popup heading, drinks.json caching, clear button visibility, deleteDrink localStorage bug
- `src/modules/user.js` — first-visit detection, add `calculateBAC()` call after profile save, listen to `languageChanged` event
- `src/modules/chart.js` — hover effects on chart bands, BAC explainer rendering
- `src/i18n/de.js` and `src/i18n/en.js` — fix duplicate `chart` key, add onboarding strings, QR label, BAC explainer text
- `src/styles.css` — clock center text, clear button hide/show transitions, onboarding styling
- `src/modules/menu.js` — QR code label

### Pre-existing Bugs to Fix (discovered during analysis)
- **`deleteDrink()` doesn't save after removing empty hour key** — `delete drinkData[hour]` modifies local variable but doesn't write back to localStorage. Empty arrays persist.
- **Duplicate `chart` key in en.js and de.js** — second definition overwrites first. Merge into one object.
- **`saveUserInfo()` doesn't recalculate BAC chart** — chart stays stale until next drink add/remove.
- **Double `closePopup` call** in `selectDrink` + `saveDrink` — harmless but indicates confused ownership.
- **Age slider min=18 but default age=14** — slider shows 18 when stored value is 14.

## Implementation Tiers

### Tier 1: Bug Fixes & Foundation (do first)

#### 1a. Fix drink duplication bug (Issue #5)
**Files:** `src/modules/drinkingClock.js`
- Root cause: `loadDrinkData()` calls `updateClockDisplay()`, then `initializeDrinkingClock()` in main.js also calls `updateClockDisplay()`. Two rapid calls cause a fetch race condition.
- Fix: Remove the redundant `updateClockDisplay()` call from `loadDrinkData()`. Add drinks.json caching (fetch once, store in module variable).
- Also fix: `deleteDrink()` must `localStorage.setItem` after `delete drinkData[hour]`.

#### 1b. Fix clock center text (Issue #2)
**Files:** `index.html`, `src/styles.css`, `src/modules/drinkingClock.js`
- Replace the two `.clock-hand` divs + `.middle-dot` with a single centered `<div class="clock-label">` containing translated text (e.g., "Click on an hour").
- Add `data-i18n="clock.clickPrompt"` attribute.
- Style as a single readable label: centered in clock face, appropriate font size, subtle pulse animation.
- Keep the existing logic that hides it when drinks are present (`hidden-hand` class becomes `hidden-label`).

#### 1c. Fix duplicate i18n `chart` key
**Files:** `src/i18n/en.js`, `src/i18n/de.js`
- Merge the two `chart` objects into one containing all keys: `alcohol`, `time`, `highestBac`, `explainer`.

#### 1d. Fix `saveUserInfo()` to recalculate BAC
**Files:** `src/modules/user.js`
- Add `calculateBAC()` call after saving profile data so the chart updates immediately.

### Tier 2: Core UX Improvements

#### 2a. Onboarding / first-visit profile setup (Issues #1 + #10)
**Files:** `index.html`, `src/main.js`, `src/modules/user.js`, `src/i18n/en.js`, `src/i18n/de.js`, `src/styles.css`
- In `initializeApp()`, check `localStorage.getItem('onboardingComplete')`.
- If not set: add a welcome banner/header inside the `#user-info-popup` explaining the app's purpose, then auto-open the popup.
- On `saveUserInfo()`, set `localStorage.setItem('onboardingComplete', 'true')`.
- Add i18n keys for the welcome text in both languages.
- If user dismisses without saving, defaults remain. The flag is NOT set, so the popup will open again next visit.

#### 2b. Show selected hour in drink popup (Issue #3)
**Files:** `src/modules/drinkingClock.js`, `index.html`, `src/i18n/en.js`, `src/i18n/de.js`
- In `openDrinkPopup(hour)`, set the popup heading to "Add Drink at {hour}:00" using the current language.
- Remove `data-i18n` from the heading element. Manage text in JS.
- Add translation keys: `drinks.addDrinkAt` with a placeholder pattern, or just construct the string: `${i18n.t('drinks.addDrink')} — ${hour}:00`.

#### 2c. Fix drink emoji positioning (Issue #4)
**Files:** `src/modules/drinkingClock.js`
- Change radius multiplier from `1.3` to ~`0.85` so emojis appear inside the clock face near their hour.
- Test across clock positions (18-5) and screen sizes.
- May need to adjust emoji size on small screens to prevent overlap.

#### 2d. Complete translations (Issue #8)
**Files:** `src/modules/user.js`, `src/modules/drinkingClock.js`, `src/i18n/en.js`, `src/i18n/de.js`
- Call `updateUserInfoDisplay()` when `languageChanged` event fires.
- Translate drink names in `showDrinkListModal()` using i18n.
- Audit all manually constructed strings for untranslated fragments.
- Ensure promill-description content uses consistent units per language.

### Tier 3: Accessibility & Interaction

#### 3a. Keyboard accessibility for clock numbers (Issue #6)
**Files:** `index.html`, `src/main.js`
- Add to each `.clock-number` div: `role="button"`, `tabindex="0"`, `aria-label="Add drink at {hour}:00"`.
- Add `keydown` event listener for Enter and Space keys that triggers the same `openDrinkPopup(hour)` as click.
- Also add `role="button"` and `tabindex="0"` to the profile pill `#user-info` div.
- Add `aria-live="polite"` region near clear button for the 2-tap confirmation state change announcement.

#### 3b. Auto-scroll to chart (Issue #7)
**Files:** `src/modules/drinkingClock.js` or `src/main.js`
- After `saveDrink()` completes and chart renders, check a session flag `hasScrolledToChart`.
- If false, `document.getElementById('bacChart-container').scrollIntoView({ behavior: 'smooth' })`.
- Set the flag to true. Reset on page load (not persisted to localStorage).
- Use a small delay (~300ms) to ensure chart has rendered.

#### 3c. BAC/per-mille explainer (Issue #9)
**Files:** `index.html`, `src/modules/chart.js`, `src/i18n/en.js`, `src/i18n/de.js`, `src/styles.css`
- Add a brief educational sentence below the "Highest BAC" display: "X.XX per-mille means X.XX grams of alcohol per liter of blood."
- Translated via i18n. Shown/hidden alongside the highest BAC display.

### Tier 4: Polish & Minor Fixes

#### 4a. Hide clear button when no drinks (Issue #11)
**Files:** `src/modules/drinkingClock.js`, `src/styles.css`
- Add/remove a `.hidden` class on the clear button based on whether `drinkData` has any drinks.
- Check in `updateClockDisplay()`, `clearDrinkData()`, and `deleteDrink()`.
- Use opacity/visibility transition for smooth appearance.

#### 4b. Chart band hover effects (Issue #14)
**Files:** `src/modules/chart.js`, `src/styles.css`
- Add `cursor: pointer` to the chart canvas via CSS.
- Enhance the existing `onHover` callback to slightly brighten the hovered band's background color. Use Chart.js dataset manipulation to temporarily adjust the `backgroundColor` alpha.

#### 4c. QR code label (Issue #15)
**Files:** `index.html` (or inline menu HTML), `src/i18n/en.js`, `src/i18n/de.js`
- Add a `<p data-i18n="menu.qrLabel">` below the QR code element.
- Translation: EN "Scan to open on your phone" / DE "QR-Code scannen, um die App auf dem Handy zu offnen".

#### 4d. Remove blank about page (Issue #12)
**Files:** `about.html` (delete)
- Delete the empty `about.html` file. The menu link to it is already commented out.

## Acceptance Criteria

### Tier 1 (Bugs)
- [x] Adding drinks does not create duplicate `.drink-group` DOM elements
- [x] Clock center shows a single, readable prompt label
- [x] `chart.explainer` and `chart.highestBac` i18n keys resolve correctly in both languages
- [x] Changing profile weight/gender immediately updates the BAC chart
- [x] Deleting the last drink at an hour properly cleans up localStorage

### Tier 2 (Core UX)
- [x] First-time visitor sees profile popup with welcome explanation on page load
- [x] Returning visitor does not see onboarding popup
- [x] Dismissing onboarding without saving still allows app to function with defaults
- [x] Drink popup heading shows the selected hour (e.g., "Add Drink at 20:00")
- [x] Drink emojis appear inside or along the rim of the clock face, not outside it
- [x] Switching language updates: profile pill, drink names, popup headings, chart labels

### Tier 3 (Accessibility & Interaction)
- [x] Clock numbers are focusable via Tab key and activatable via Enter/Space
- [x] Clock numbers have descriptive `aria-label` attributes
- [x] After adding the first drink, the page scrolls smoothly to the BAC chart
- [x] A brief educational explanation of per-mille is visible near the chart

### Tier 4 (Polish)
- [x] Clear button is hidden when no drinks exist, appears when drinks are added
- [x] Chart bands show a visual change on hover (cursor + subtle highlight)
- [x] QR code in menu has a descriptive translated label
- [x] `about.html` is removed from the codebase

## Success Metrics

- A student opening the app for the first time can understand its purpose and set up their profile without teacher guidance
- All interactive elements are keyboard-accessible
- Language switching produces a fully translated interface with no English fragments in German mode
- No console errors or visual glitches during normal usage flow

## Dependencies & Risks

- **No build tools:** All changes are to raw HTML/CSS/JS files. No compilation step to worry about, but also no linting or type checking to catch errors.
- **Chart.js customization:** Issue #14 (hover effects) may require a custom Chart.js plugin. If too complex, degrade to cursor change only.
- **drinks.json caching:** Caching introduces a module-level dependency. If the file changes at runtime (unlikely for a static app), stale data would be shown. Acceptable trade-off.
- **Test coverage:** No automated tests exist. All changes must be verified via manual browser testing.

## Sources & References

- **Origin brainstorm:** [documentation/brainstorm-onboarding-ux.md](documentation/brainstorm-onboarding-ux.md) — all 15 issues and priority ordering carried forward. Key decisions: welcome modal on first visit, fix clock text, show hour in popup, fix emoji positioning, keyboard accessibility.
- Key files: `src/main.js:69` (initializeApp), `src/modules/drinkingClock.js:5-68` (updateClockDisplay), `src/modules/drinkingClock.js:71-80` (openDrinkPopup), `src/modules/user.js:17-38` (loadUserData), `src/modules/chart.js:108-253` (updateBACTable)
- Clock positioning CSS: `src/styles.css:319-433`
- Popup system: `src/main.js:108-135`, `src/styles.css:490-537`
