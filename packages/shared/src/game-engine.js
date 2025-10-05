/**
 * @fileoverview Game Engine API interface - must be implemented by all games
 */
// ============================================================================
// Utility Functions for Game Engines
// ============================================================================
/**
 * Create a successful result
 */
export function ok(data) {
    return { success: true, data };
}
/**
 * Create an error result
 */
export function err(error) {
    return { success: false, error };
}
/**
 * Type guard to check if result is successful
 */
export function isOk(result) {
    return result.success === true;
}
/**
 * Type guard to check if result is an error
 */
export function isErr(result) {
    return result.success === false;
}
