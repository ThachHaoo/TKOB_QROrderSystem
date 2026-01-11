/**
 * Menu feature data layer
 * 
 * Public API:
 * - MenuDataFactory - selector for mock vs real strategies
 * - IMenuStrategy - interface for strategy implementations
 * 
 * This layer encapsulates all menu data access logic.
 * Features should import from here, not from global @/api.
 */

export { MenuDataFactory } from './factory';
export type { IMenuStrategy } from './types';
