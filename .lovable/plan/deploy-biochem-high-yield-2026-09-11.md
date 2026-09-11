# Deploy Biochem High-Yield

## Goal
Bring the uploaded Biochem High-Yield study app into the current project and publish it as the live site.

## Implementation
- Replace the placeholder home page with the uploaded three-tab study experience: Fact Sheets, Flashcards, and Compounds.
- Preserve the supplied topic summaries, flashcard questions and answers, compound dataset, and spaced-repetition behavior.
- Adapt browser-saved flashcard progress so it works safely with the current app framework.
- Recreate the uploaded visual style using the project design system, with responsive navigation and readable study layouts.
- Add page-specific title, description, and social metadata.

## Validation and release
- Verify the home page, topic navigation, card flipping/grading, compound search, and mobile layout.
- Check for build and runtime errors.
- Run the security check required for publishing, then deploy to the Lovable public URL.

## Technical details
- Keep the existing TanStack Start routing and place the app at `/`.
- Import the uploaded TypeScript data and SRS logic into client-safe modules.
- Use semantic Tailwind v4 tokens and existing React dependencies.
