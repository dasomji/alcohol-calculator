---
title: "fix: Clock drink positioning"
type: fix
status: completed
date: 2026-02-25
origin: docs/brainstorms/2026-02-25-clock-drink-positioning-brainstorm.md
---

# fix: Clock Drink Positioning

## Overview

Drink pictograms are placed at wrong positions on the drinking clock because the JS angle formula doesn't match the CSS angle formula. Drinks should appear **outside** the clock circle, next to their corresponding hour number.

## Problem Statement

The CSS positions clock numbers using `(nth-child + 6) * 30deg` (rotation from top, clockwise). The JS positions drinks using `(hour - 3) * 30deg` (standard 12-hour math angle). These produce completely different angles for the party hours (18-23, 0-5), causing every drink to land in the wrong place.

Additionally, the JS radius (`0.85 * clockSize/2`) doesn't match the CSS radius (`translateY(400%)` on a `10%`-wide element = `0.80 * clockSize/2`), and drinks are placed _inside_ the clock when they should be _outside_.

(see brainstorm: docs/brainstorms/2026-02-25-clock-drink-positioning-brainstorm.md)

## Proposed Solution

**Read actual DOM positions** of `.clock-number` elements and place drink groups at a larger radius along the same radial line — outside the clock circle.

### Implementation Steps

#### 1. Add `data-hour` attributes to clock number HTML

**File:** `index.html` (lines 63-75)

Add `data-hour="N"` to each `.clock-number` element so JS can reliably map hour keys to DOM elements without parsing `textContent`.

```html
<div class="clock-number" data-hour="18">18</div>
```

#### 2. Fix the positioning formula in `updateClockDisplay()`

**File:** `src/modules/drinkingClock.js` (lines 48-58)

Replace the broken angle calculation with DOM position reading:

1. Get the clock center: `clockEl.getBoundingClientRect()` center point
2. For each hour with drinks, find the matching `.clock-number[data-hour="N"]` element
3. Get that element's center via `getBoundingClientRect()`
4. Compute the angle from clock center to number center
5. Place the drink group at a **larger radius** (e.g., `1.25x` the number's distance from center) along the same radial line — positioning it outside the clock

This approach automatically stays in sync with CSS and works at any clock size.

#### 3. Wrap positioning in `requestAnimationFrame`

Ensure at least one layout pass has completed before reading DOM positions, so CSS transforms are fully applied.

#### 4. Add debounced resize handler

**File:** `src/modules/drinkingClock.js` or `src/main.js`

Add a debounced (250ms) `resize` event listener that re-calls `updateClockDisplay()` so drink positions stay correct after viewport changes or orientation rotation.

#### 5. Adjust `.drink-group` CSS for outside positioning

**File:** `src/styles.css` (lines 424-442)

- Remove or relax `max-width: 60px; max-height: 60px` — let clusters grow as needed since they're outside the clock and won't occlude hour numbers
- Keep `flex-flow: row wrap` for compact clustering
- Ensure `overflow: visible` on `#clock` so outside-positioned drinks aren't clipped by the circular border-radius

#### 6. Handle shrinking for many drinks

Drink pictograms already use `font-size: min(2rem, 3.3vw)`. For hours with many drinks (5+), dynamically reduce `font-size` on the pictograms so they all remain visible in the cluster. No cap or count badge.

## Acceptance Criteria

- [x] Drinks appear just outside the clock circle, aligned radially with their corresponding hour number
- [x] Hour numbers remain fully visible and tappable (no occlusion)
- [x] Multiple drinks at one hour display as a compact cluster
- [x] All drink pictograms are shown (shrink if many, no cap)
- [x] Positions update correctly on window resize / orientation change
- [x] Positions are correct on page load with existing localStorage data
- [x] Works across screen sizes (phone through desktop)

## Key Files

- `index.html:63-75` — clock number HTML elements
- `src/modules/drinkingClock.js:18-80` — `updateClockDisplay()` with broken positioning at line 50
- `src/styles.css:307-321` — `#clock` sizing
- `src/styles.css:358-375` — `.clock-number` CSS transform positioning
- `src/styles.css:424-442` — `.drink-group` and `.drink-pictogram` styles
- `src/main.js:104-124` — clock initialization and event listeners

## Sources

- **Origin brainstorm:** [docs/brainstorms/2026-02-25-clock-drink-positioning-brainstorm.md](docs/brainstorms/2026-02-25-clock-drink-positioning-brainstorm.md) — Key decisions: DOM-based positioning, outside placement, compact clusters, show all pictograms
