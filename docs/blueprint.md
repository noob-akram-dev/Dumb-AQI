# **App Name**: Dumb AQI

## Core Features:

- AQI Fetching: Fetch the current AQI data from a public API based on the user's location (with location permission, if needed) or manual entry. Use a tool that picks the closest reporting station. Error checking for when AQI data is unavailable.
- Impact Examples Generation: Based on the AQI, generate relatable examples of the impact, such as equivalent cigarette consumption or other health comparisons, as requested by the user. These examples will be contextual and appropriate, such as avoiding making smoking sound appealing.
- Data Presentation: Display the AQI and the generated impact examples in a clear and understandable format within a card layout.
- Location Handling: When possible, auto-detect user's location for local AQI. Alternatively allow manual input of address for location detection. Must request location permission before trying to obtain location.

## Style Guidelines:

- Primary color: A shade of red (#FF6B6B) to signal the urgency and potential danger of air pollution.
- Background color: Light gray (#F0F0F0) to provide contrast and readability against the red accents.
- Accent color: A muted orange (#FFA500) to highlight important information and calls to action.
- Body and headline font: 'Roboto' for clear readability and a modern, slightly serious tone.
- Single-page design with a prominent card layout for the AQI and its impacts. Focus on presenting information clearly and directly.
- Use warning icons (e.g., exclamation points, hazard symbols) to emphasize the potential health risks.
- Subtle but noticeable animations to draw attention to changes in AQI and updated impact examples.