import { defineConfig } from 'orval';

// Orval configuration to generate typed API client & React Query hooks
// Output targets `src/services/api` to align with Clean Architecture.
export default defineConfig({
  customerApi: {
    input: {
      target: '../../docs/common/openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: 'src/services/api',
      schemas: 'src/services/api/models',
      client: 'react-query',
      prettier: true,
      mock: false,
      override: {
        mutator: {
          path: 'src/services/axios.ts',
          name: 'api',
        },
        reactQuery: {
          version: 5,
          suspense: false,
          // keep hooks colocated by tag
        },
      },
    },
  },
});
