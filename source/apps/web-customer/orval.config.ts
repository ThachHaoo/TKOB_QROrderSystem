// @ts-nocheck
import { defineConfig } from 'orval';

/**
 * Orval Configuration for Customer App
 * Generates typed API client & React Query hooks from OpenAPI spec
 * 
 * Architecture:
 * - Input: openapi-spec.json (sync from backend via pnpm codegen)
 * - Output: src/services/generated/ (organized by API tags)
 * - Client: React Query v5 hooks
 * - Mutator: customInstance (unwraps { success, data } responses)
 */
export default defineConfig({
  customerApi: {
    input: {
      target: './openapi-spec.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/services/generated',
      schemas: 'src/services/generated/models',
      client: 'react-query',
      prettier: true,
      mock: false,
      override: {
        mutator: {
          path: 'src/services/axios.ts',
          name: 'customInstance',
        },
        reactQuery: {
          version: 5,
          suspense: false,
        },
      },
    },
  },
});
