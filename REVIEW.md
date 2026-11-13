# Door preview review

Scope: reversible door previews, their destination links, and their mobile and keyboard behavior. Design principles were reviewed against [Anti Slop](https://github.com/miqdadbadjuber/anti-slop/blob/main/antislop.md); this is not a claim of a complete audit of unrelated, existing portfolio content.

## Function and accessibility: PASS

- Pointer entry opens a door and reveals its preview. Moving onto the preview keeps it open. Leaving both starts retraction after a 180ms grace period; the door closes after the card retracts.
- All four door links and all four preview links retain their corresponding project URL. Desktop clicks are no longer delayed by an animation timer. Modified clicks retain native browser behavior.
- Only one preview opens at once. Closed previews are inert and excluded from accessibility navigation.
- Keyboard focus opens previews. Escape closes them and returns focus to the door when necessary.
- In Chrome touch emulation, the first tap opens a preview. Tapping its link uses the project destination. The 44px close button dismisses it.
- The image frame reserves its dimensions; a failed screenshot shows an explicit message while its project link remains usable.
- Preview text contrast was calculated: title 11.78:1, description 5.52:1, metadata 5.45:1, category labels 8.01:1. The paper preview has a dark focus outline in both themes.

## Purpose and content: PASS

- The paper preview and colored image mount distinguish a quick inspection from the larger project descriptions below.
- Door colors connect each preview to its source. No generic sparkle appears in the preview header.
- Summaries describe existing project information. The four-project index is an actual count, not an invented statistic.
- Screenshots and project destinations reuse the portfolio's existing assets and links.

## Identity and motion: PASS

- The owner's video, screenshots, and approved interaction provide the direction recorded in DESIGN.md: Energy 2 / Rhythm 3 / Motion 2.
- The choreography explains where a preview comes from and returns it to the same door. It does not loop or animate unrelated sections.
- Reduced motion removes transitions while preserving previews and navigation.

## Browser verification: PASS

- Exercised real pointer movement, keyboard input, and emulated touch in local headless Chrome; no application runtime exceptions were observed.
- Verified the first and last previews stay inside the viewport at widths 320, 375, 390, 600, 768, 1024, 1440, and 1920px.
- Inspected screenshots of desktop, mobile, and dark-mode previews. Positioning accounts for the hanging theme control.
- Google Fonts requests were stubbed in the repeatable interaction run to exercise the declared system-font fallback. This does not measure font-loading performance or real-device behavior.
- JavaScript syntax, local asset references, unique IDs, and patch whitespace are checked separately. No Lighthouse or field performance score is claimed.
