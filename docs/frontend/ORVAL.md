# Hướng dẫn Orval (Codegen API) – Next.js 15 + Clean Architecture

Tài liệu này hướng dẫn quy trình tích hợp **Orval** để sinh client API + hooks React Query từ OpenAPI/Swagger, phù hợp với cấu trúc Clean Architecture và Feature-Sliced Design.

## Mục tiêu
- Tự động sinh code client (Axios) và hooks React Query v5.
- Lưu code sinh ra tại lớp **Infrastructure/Data**: `src/services/api`.
- Sử dụng **mutator** là Axios instance trung tâm (`src/services/axios.ts`).
- Tách DTO/schemas tại `src/services/api/models`.

## Cấu trúc thư mục
```
apps/<app-name>/
├── src/
│   ├── app/               # App Router: chỉ wrapper route/layout/page
│   ├── features/          # Business logic theo domain (auth, menu,...)
│   ├── services/
│   │   ├── axios.ts       # Axios instance + interceptors
│   │   └── api/           # ← Orval output (endpoints & models)
│   ├── shared/            # UI atoms/molecules/layout/common
│   ├── store/             # Zustand/Redux
│   └── types/             # Global types (env,...)
└── orval.config.ts
```

## Cấu hình Orval
Ví dụ cấu hình (đã có sẵn):
```ts
// apps/web-customer/orval.config.ts
import { defineConfig } from 'orval';
export default defineConfig({
  customerApi: {
    input: { target: '../../docs/common/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: 'src/services/api',
      schemas: 'src/services/api/models',
      client: 'react-query',
      prettier: true,
      mock: false,
      override: {
        mutator: { path: 'src/services/axios.ts', name: 'api' },
        reactQuery: { version: 5, suspense: false },
      },
    },
  },
});
```
Tương tự cho web-tenant (`apps/web-tenant/orval.config.ts`).

## Chạy codegen
```bash
# Trong thư mục app tương ứng
pnpm install
pnpm orval
```
- Orval sẽ đọc `../../docs/common/openapi.yaml` và sinh code vào `src/services/api`.
- Nếu thay đổi file Swagger/OpenAPI, chạy lại `pnpm orval`.

## Cách sử dụng trong Features
- KHÔNG import trực tiếp trong `src/app`. Hãy tạo hooks/logic tại `src/features/*/hooks` và gọi hooks sinh từ Orval.
```ts
// src/features/menu-view/hooks/useMenu.ts
'use client';
import { useGetTenantsTenantIdMenu } from '@/services/api/menu';

export const useMenu = (tenantId: string) => {
  const query = useGetTenantsTenantIdMenu(tenantId, { query: { staleTime: 5 * 60_000 } });
  return { menu: query.data ?? [], ...query };
};
```
- Page wrappers ở `src/app` chỉ render từ `src/features`:
```tsx
// src/app/menu/page.tsx
import { MenuPage } from '@/features/menu-view';
export default function Page() { return <MenuPage />; }
```

## Nguyên tắc kiến trúc
- `src/app`: Chỉ router/layout/page – tránh business logic.
- `src/features`: Đặt UI thông minh (smart components) + hooks + services domain.
- `src/shared/ui`: Atoms/Molecules “dumb” tái sử dụng.
- `src/services/api`: Chỉ chứa code sinh từ Orval (không chỉnh sửa thủ công).
- `src/services/axios.ts`: Axios instance duy nhất – dùng làm mutator.
- DTO/Model sinh ra ở `src/services/api/models`.

## Lưu ý
- Hooks Orval là client-only; đặt trong nơi phù hợp (hooks/features) hoặc gọi từ Client Components.
- Thêm cấu hình `NEXT_PUBLIC_API_URL` trong `.env` để Axios baseURL hoạt động.
- Tránh import chéo trái phép giữa features – dùng barrel `index.ts` tại mỗi feature.

## Khắc phục sự cố
- “Module not found” sau khi đổi cấu trúc: kiểm tra alias `@/*` → `./src/*`, `@/app/*` → `./src/app/*` trong `tsconfig.json`.
- Lỗi type trong editor: restart TypeScript server trong VSCode.
- Lỗi 401 từ Axios: kiểm tra interceptor token (`localStorage['authToken']`).
