/**
 * Clamps a numeric value between a minimum and maximum value
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(min, value), max);
};
