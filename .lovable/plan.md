# Netflix-style feed and creator controls

## What will change
- Replace the current top-first studio layout with a streaming-style home experience that still keeps the creator workflow easy to reach.
- Add two vibrant poster rows: **Trending Anime & Toons** and **New Releases**.
- Add clear **FREE** and **5 COIN UNLOCK** labels, favorite hearts, and a polished series detail window.
- Add **Donate Coins to Creator** inside the detail window.
- Add an explicit **Generate Next Episode** action in the Creator Studio.
- Add a **Platform API Settings** tab in the profile drawer with masked Gemini and custom video-service fields.

## Interaction details
- Poster selection opens the series detail window.
- Favorite hearts toggle locally without opening the series.
- Donate and locked-episode actions provide immediate, clear feedback; they will not silently change real balances before wallet logic exists.
- The existing story writer, preview, accounts, saved projects, pricing, and sign-in flows remain available.

## API credential safety
- Private keys will never be embedded in page code or permanently saved in browser storage.
- Settings inputs will remain masked and session-only for this UI pass, with clear configured/not-configured states.
- Existing story suggestions continue using the securely managed Lovable AI connection. A real custom video endpoint remains inactive until its server-side connector is implemented and credentials are added through secure project settings.

## Technical details
- Build reusable media-card, media-row, and detail-window components using the existing design tokens and controls.
- Use bundled/generated poster artwork rather than external image links.
- Keep page metadata intact and verify desktop and mobile layouts, card interactions, the detail window, drawer tabs, and the creator actions.
