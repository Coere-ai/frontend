/**
 * Whether the player is skipping ahead unseen. The engine's own timing
 * (an Extract all run, a build) goes at its pace while a person watches,
 * and at once while the player skips to a chapter, as the stage's waits do.
 */
export const pace = { fast: (): boolean => false };

