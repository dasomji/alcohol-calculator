# Brainstorm: Onboarding Flow & UX Improvements

**Date:** 2026-02-25
**Method:** Automated browser testing from the perspective of a teenager opening the app for the first time without instructions.

---

## First Impression

When the app loads, a teenager sees:

- **"BAC Calculator"** as the title — many teens won't know what "BAC" stands for. There's no subtitle or explanation.
- A pill showing **"Female / 40kg / 150cm / 14 years"** — pre-filled defaults that feel oddly specific. A teen would wonder: *"Why does it already think I'm a 14-year-old girl weighing 40kg?"*
- A brief instruction paragraph, then a circular clock with hours 18–5.
- A "Clear Drinks" button even though there's nothing to clear yet.

---

## Critical Issues

### 1. No real onboarding or welcome screen

There's no explanation of what this app is for, why it exists, or what you're supposed to learn. A teen handed this without a teacher present would be confused.

**Suggestion:** Add a 2–3 sentence welcome modal on first visit: *"This is a simulation to help you understand how alcohol affects your body. Set up your profile, then add drinks to a fictional party to see what happens."*

### 2. Clock center text is visually broken

The center of the clock shows `[Click on] · [an hour]` rendered as two tiny text bubbles with a dot between them. It looks like a rendering bug rather than a deliberate UI element. On desktop it's barely readable.

**Suggestion:** Render this as a single centered label inside the clock face, styled clearly.

### 3. Clock hours are not accessible

The clock numbers (`<div class="clock-number">`) have no ARIA roles, no `tabindex`, no `aria-label`. They're invisible to screen readers and can't be navigated with a keyboard. The `cursor: pointer` is the only hint they're clickable.

**Suggestion:** Add `role="button"`, `tabindex="0"`, and `aria-label="Add drink at 20:00"` to each clock number. Support Enter/Space key activation.

### 4. Drink popup doesn't show which hour you're adding to

When you click a clock hour, the popup just says **"Add Drink"** with no indication of the selected time. If you accidentally clicked the wrong hour, you'd have no way of knowing.

**Suggestion:** Change the heading to **"Add Drink at 20:00"** (dynamically showing the selected hour).

### 5. Drink emojis render outside the clock

After adding drinks, the emoji pictograms float outside the clock boundary rather than appearing inside or adjacent to their time segment. They scatter to the left and above the clock.

**Suggestion:** Adjust the positioning calculation so that emojis appear within or along the rim of the clock face.

### 6. Drink groups are duplicated in the DOM

After adding 3 drinks, 6 `drink-group` elements exist in the DOM — each drink renders twice. This is a bug in `updateClockDisplay()` which likely gets called multiple times without proper cleanup.

**Suggestion:** Debug the call chain in `updateClockDisplay()` to ensure cleanup runs before re-rendering.

---

## Moderate Issues

### 7. Incomplete translations when switching languages

When switching to German:
- The profile pill still shows **"Female"** instead of "Weiblich"
- The BAC effect description stays in English ("From 0.05% BAC")
- The popup title "Your Information" stays in English

**Suggestion:** Audit all translatable strings and ensure the i18n system covers profile display values and dynamic content.

### 8. Default profile assumes a very specific person

The defaults (Female, 40kg, 150cm, 14 years) could feel alienating in a classroom of mixed teens.

**Suggestion:** Either open the profile setup automatically on first visit, or use more neutral defaults. Consider prompting: *"Tell us about yourself so we can calculate accurately."*

### 9. BAC terminology with per-mille (‰) is confusing for teens

The chart shows values like "0.66‰" and effect boxes say "From 0.05% BAC" — mixing per-mille and percent is confusing. Most teens don't know what either notation means.

**Suggestion:** Add a brief inline explainer: *"0.66‰ means 0.66 grams of alcohol per liter of blood."* Keep units consistent.

### 10. Chart doesn't auto-scroll into view

After adding a drink, the BAC chart appears below the fold. The user has no visual cue that something happened below.

**Suggestion:** Smooth-scroll to the chart area after the first drink is added. Or show a subtle "See your results below" indicator.

### 11. "Clear Drinks" button is always visible

Even when no drinks have been added, the "Clear Drinks" button is shown.

**Suggestion:** Hide or disable the button when there are no drinks to clear.

---

## Minor Issues

### 12. About page is completely blank

`about.html` renders an empty white page.

**Suggestion:** Either add content or remove the file from the codebase.

### 13. No confirmation before clearing all drinks

The "Clear Drinks" button immediately wipes everything with no confirmation dialog. A teen who spent 5 minutes building a scenario loses all progress.

**Suggestion:** Add a simple "Are you sure?" confirmation.

### 14. No indication the chart is interactive

The text "Click on an area in the chart to see what effect this alcohol level has on you" is easy to miss. The chart bands have no hover effects or visual affordances.

**Suggestion:** Add hover/focus effects to the chart bands (cursor change, slight highlight). Consider making the instruction text more prominent.

### 15. QR code in menu has no context

The menu shows a QR code with no label explaining what it's for.

**Suggestion:** Add a label: *"Share this app"* or *"Scan to open on your phone."*

---

## Suggested Improvements (Priority Order)

1. Add a welcome/onboarding modal — explain purpose, how it works, prompt profile setup
2. Fix the clock center text — single readable label
3. Show the selected hour in the drink popup — "Add Drink at 20:00"
4. Fix drink emoji positioning — inside or along the clock rim
5. Fix the drink duplication bug — each drink should render once
6. Add keyboard accessibility to clock numbers
7. Auto-scroll to the chart after adding the first drink
8. Complete all translations when switching languages
9. Add a brief explainer for BAC/per-mille values
10. Open profile setup on first visit rather than silently defaulting
