# Brainstorm: Fix Drink Positioning on Clock

**Date:** 2026-02-25
**Status:** Complete

## What We're Building

Fix the broken drink positioning on the drinking clock so that drink pictograms appear **just outside** their corresponding hour number, instead of being scattered/stacked in wrong locations.

## The Problem

The clock face uses CSS transforms to position hour numbers:
```css
transform: rotateZ(calc((var(--nth-child) + 6) * 30 * 1deg))
           translateY(400%)
           rotateZ(calc((var(--nth-child) + 6) * 30 * -1deg));
```

But the JS code in `updateClockDisplay()` uses a completely different angle formula:
```js
const angle = (parseInt(hour) - 3) * 30 * (Math.PI / 180);
```

These two formulas produce different angles for the same hour, causing drinks to land in wrong positions.

## Why This Approach

**Read positions from the DOM** rather than duplicating the angle math in JS. Query the computed position of each `.clock-number` element and place the drink group at a slightly larger radius from center along the same angle. This is the most robust approach because:

- Automatically stays in sync with CSS changes
- No need to maintain a parallel angle mapping in JS
- Works regardless of clock sizing/responsiveness

## Key Decisions

1. **Placement:** Drinks appear just outside the hour number (slightly further from center along the same radial line)
2. **Multi-drink layout:** Compact grid/cluster using flex-wrap, correctly positioned outside the hour
3. **Overflow:** Show all drink pictograms, shrinking them as needed to fit — no cap or count badge
4. **Positioning strategy:** Read actual DOM positions of clock numbers rather than duplicating angle math in JS

## Open Questions

None — requirements are clear.
