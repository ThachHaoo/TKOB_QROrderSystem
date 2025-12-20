// @ts-nocheck
import { defineConfig } from 'orval';

export default defineConfig({
  tenantApi: {
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
