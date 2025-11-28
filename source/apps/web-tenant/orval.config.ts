import { defineConfig } from 'orval';

export default defineConfig({
  tenantApi: {
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
        },
      },
    },
  },
});
