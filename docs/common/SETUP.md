# Hướng dẫn Cài đặt Môi trường Phát triển

> Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường phát triển local cho **TKQR-in Ordering Platform**.

- **Version**: 1.0
- **Last Updated**: 2025-01-11
- **Prerequisites**: Node.js 20+, Docker, Git

---

## Mục lục

1. [Yêu cầu Hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cài đặt Prerequisites](#2-cài-đặt-prerequisites)
3. [Clone Repository](#3-clone-repository)
4. [Cài đặt Dependencies](#4-cài-đặt-dependencies)
5. [Cấu hình Environment Variables](#5-cấu-hình-environment-variables)
6. [Khởi động Database Services](#6-khởi-động-database-services)
7. [Database Migration & Seeding](#7-database-migration--seeding)
8. [Chạy Development Server](#8-chạy-development-server)
9. [Verify Setup](#9-verify-setup)
10. [IDE Setup & Extensions](#10-ide-setup--extensions)
11. [Docker Setup (Alternative)](#11-docker-setup-alternative)
12. [Troubleshooting](#12-troubleshooting)
13. [Next Steps](#13-next-steps)

---

## 1. Yêu cầu Hệ thống

### 1.1. Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10/11, macOS 12+, Ubuntu 20.04+ |
| **RAM** | 8GB (khuyến nghị 16GB) |
| **Disk** | 10GB free space |
| **CPU** | 4 cores (khuyến nghị) |
| **Network** | Stable internet connection |

### 1.2. Software Prerequisites

- **Node.js**: >= 20.x LTS
- **pnpm**: >= 8.x
- **Docker**: >= 24.x + Docker Compose
- **Git**: >= 2.30
- **VS Code**: Latest (khuyến nghị)

---

## 2. Cài đặt Prerequisites

### 2.1. Node.js & pnpm

#### Cài đặt Node.js

**Option 1: Sử dụng nvm (khuyến nghị)**

```bash
# Linux/macOS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, sau đó:
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # v20.x.x
npm --version   # 10.x.x
```

**Windows**: Download [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

**Option 2: Direct Download**
- Download từ [nodejs.org](https://nodejs.org/)
- Chọn **LTS** version (20.x)

#### Cài đặt pnpm

```bash
# Via npm (sau khi cài Node.js)
npm install -g pnpm

# Verify
pnpm --version  # 8.x.x hoặc cao hơn
```

**Alternative methods**:
```bash
# Via Corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# Via standalone script
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 2.2. Docker & Docker Compose

#### Windows

1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Install và restart máy
3. Enable WSL 2 backend (khuyến nghị)

```powershell
# Verify
docker --version
docker-compose --version
```

#### macOS

```bash
# Via Homebrew
brew install --cask docker

# Hoặc download Docker Desktop từ docker.com
```

#### Linux (Ubuntu/Debian)

```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify
docker --version
docker compose version
```

### 2.3. Git

#### Windows
- Download [Git for Windows](https://git-scm.com/download/win)
- Trong quá trình cài đặt, chọn "Git from the command line and also from 3rd-party software"

#### macOS
```bash
# Via Homebrew
brew install git

# Hoặc sử dụng Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

**Configure Git**:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

---

## 3. Clone Repository

### 3.1. SSH Setup (khuyến nghị)

```bash
# Generate SSH key (nếu chưa có)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Paste vào GitHub Settings > SSH Keys
```

### 3.2. Clone Project

```bash
# Via SSH (khuyến nghị)
git clone git@github.com:your-org/qr-dine-in-platform.git
cd qr-dine-in-platform

# Via HTTPS (alternative)
git clone https://github.com/your-org/qr-dine-in-platform.git
cd qr-dine-in-platform
```

### 3.3. Verify Structure

```bash
ls -la
# Expected folders:
# apps/, packages/, docs/, infrastructure/, etc.
```

---

## 4. Cài đặt Dependencies

### 4.1. Install All Dependencies

```bash
# Install dependencies cho tất cả packages/apps
pnpm install

# Nếu gặp lỗi, thử:
pnpm install --frozen-lockfile
```

**Expected output**:
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded X, added XXX, done
```

### 4.2. Verify Installation

```bash
# List installed workspaces
pnpm list --depth=0

# Check script availability
pnpm run --list
```

---

## 5. Cấu hình Environment Variables

### 5.1. Copy Template Files

```bash
# Root .env
cp .env.example .env

# Backend API
cp apps/api/.env.example apps/api/.env

# Customer Web App
cp apps/web-customer/.env.example apps/web-customer/.env

# Staff Console
cp apps/web-staff/.env.example apps/web-staff/.env
```

### 5.2. Configure Root .env

```bash
# filepath: .env

# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qr_ordering_dev"
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
DATABASE_USER="postgres"
DATABASE_PASSWORD="postgres"
DATABASE_NAME="qr_ordering_dev"

# ============================================
# REDIS
# ============================================
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRES_IN="7d"

# QR Token Secret (for signed QR codes)
QR_TOKEN_SECRET="your-qr-token-signing-secret"
QR_TOKEN_EXPIRES_IN="365d"

# ============================================
# API
# ============================================
API_PORT="3000"
API_HOST="localhost"
API_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:5173,http://localhost:5174"

# ============================================
# FRONTEND URLS
# ============================================
CUSTOMER_APP_URL="http://localhost:5173"
STAFF_APP_URL="http://localhost:5174"
KDS_APP_URL="http://localhost:5175"

# ============================================
# PAYMENTS (Stripe - Test Mode)
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# STORAGE (Local/S3)
# ============================================
STORAGE_TYPE="local"  # local | s3 | r2
STORAGE_PATH="./uploads"

# AWS S3 (nếu dùng)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="ap-southeast-1"
# AWS_S3_BUCKET=""

# Cloudflare R2 (nếu dùng)
# R2_ACCOUNT_ID=""
# R2_ACCESS_KEY_ID=""
# R2_SECRET_ACCESS_KEY=""
# R2_BUCKET=""

# ============================================
# EMAIL & SMS (Optional - MVP)
# ============================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER=""
# SMTP_PASSWORD=""
# TWILIO_ACCOUNT_SID=""
# TWILIO_AUTH_TOKEN=""
# TWILIO_PHONE_NUMBER=""

# ============================================
# LOGGING & MONITORING
# ============================================
LOG_LEVEL="debug"  # debug | info | warn | error
NODE_ENV="development"

# Sentry (optional)
# SENTRY_DSN=""

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS="60000"  # 1 minute
RATE_LIMIT_MAX_REQUESTS="100"
```

### 5.3. Configure API .env

```bash
# filepath: apps/api/.env

# Inherits from root .env
# Override nếu cần

API_PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qr_ordering_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
```

### 5.4. Configure Frontend .env Files

**Customer App**:
```bash
# filepath: apps/web-customer/.env

VITE_API_URL=http://localhost:3000
VITE_APP_NAME="TKQR-in"
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Staff Console**:
```bash
# filepath: apps/web-staff/.env

VITE_API_URL=http://localhost:3000
VITE_APP_NAME="TKQR-in Staff"
VITE_WS_URL=ws://localhost:3000
```

---

## 6. Khởi động Database Services

### 6.1. Using Docker Compose

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME                SERVICE      STATUS       PORTS
# qr-ordering-db      postgres     Up          0.0.0.0:5432->5432/tcp
# qr-ordering-redis   redis        Up          0.0.0.0:6379->6379/tcp
```

### 6.2. Docker Compose Configuration

```yaml
# filepath: docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: qr-ordering-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: qr_ordering_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: qr-ordering-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

### 6.3. Verify Database Connection

```bash
# Test PostgreSQL
docker exec -it qr-ordering-db psql -U postgres -d qr_ordering_dev -c "SELECT version();"

# Test Redis
docker exec -it qr-ordering-redis redis-cli ping
# Expected: PONG
```

---

## 7. Database Migration & Seeding

### 7.1. Run Migrations

```bash
# Generate Prisma Client (nếu dùng Prisma)
pnpm --filter @app/api prisma generate

# Run migrations
pnpm --filter @app/api db:migrate

# Or using direct command
pnpm --filter @app/api prisma migrate dev
```

**Expected output**:
```
✓ Generated Prisma Client
✓ Applied migrations:
  └─ 20250111000000_init
  └─ 20250111000001_add_tenants
  └─ 20250111000002_add_menus
```

### 7.2. Seed Sample Data

```bash
# Seed database với sample data
pnpm --filter @app/api db:seed

# Or
pnpm --filter @app/api prisma db seed
```

**Sample data includes**:
- 2 demo tenants (restaurants)
- Sample menu categories & items
- Sample tables với QR codes
- Test users (admin, waiter, kitchen)

### 7.3. Verify Data

```bash
# Connect to database
docker exec -it qr-ordering-db psql -U postgres -d qr_ordering_dev

# Check tables
\dt

# Check sample data
SELECT id, name, slug FROM tenants;
SELECT id, name, category_id FROM menu_items LIMIT 5;

# Exit
\q
```

---

## 8. Chạy Development Server

### 8.1. Start All Services

**Option 1: Run all in parallel**
```bash
# Start tất cả services cùng lúc
pnpm dev
```

**Option 2: Run từng service riêng (khuyến nghị cho development)**

```bash
# Terminal 1: Backend API
pnpm --filter @app/api dev

# Terminal 2: Customer Web App
pnpm --filter @app/web-customer dev

# Terminal 3: Staff Console
pnpm --filter @app/web-staff dev

# Terminal 4: Kitchen Display System (optional)
pnpm --filter @app/web-kds dev
```

### 8.2. Available Scripts

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm dev:api          # Backend API only
pnpm dev:customer     # Customer app only
pnpm dev:staff        # Staff console only

# Build
pnpm build            # Build all apps
pnpm build:api        # Build API only

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:e2e         # E2E tests only
pnpm test:cov         # With coverage

# Linting & Formatting
pnpm lint             # Check linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed data
pnpm db:reset         # Reset database
pnpm db:studio        # Open Prisma Studio
```

---

## 9. Verify Setup

### 9.1. Health Checks

**Backend API**:
```bash
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-11T..."}
```

**Database**:
```bash
curl http://localhost:3000/health/db

# Expected:
# {"database":"connected","redis":"connected"}
```

### 9.2. Access Applications

Open trong browser:

| Application | URL | Credentials |
|-------------|-----|-------------|
| **Backend API** | http://localhost:3000 | N/A |
| **API Docs (Swagger)** | http://localhost:3000/api-docs | N/A |
| **Customer App** | http://localhost:5173 | No login required |
| **Staff Console** | http://localhost:5174 | admin@demo.com / password |
| **Kitchen Display** | http://localhost:5175 | kitchen@demo.com / password |
| **Prisma Studio** | http://localhost:5555 | Run `pnpm db:studio` |

### 9.3. Test Sample Flow

1. **Scan QR Code** (simulate):
   - Truy cập: http://localhost:5173/menu?token=SAMPLE_TOKEN_FROM_SEED
   - Xem menu của demo restaurant

2. **Create Order**:
   - Add items to cart
   - Checkout
   - Submit order

3. **Staff Console**:
   - Login tại http://localhost:5174
   - Xem order vừa tạo trong order list

4. **Kitchen Display**:
   - Login tại http://localhost:5175
   - Xem order trong KDS queue
   - Chuyển trạng thái: Received → Preparing → Ready

---

## 10. IDE Setup & Extensions

### 10.1. VS Code (Recommended)

#### Install Extensions

Mở VS Code, install các extensions sau:

```json
// filepath: .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "github.copilot",
    "eamodio.gitlens"
  ]
}
```

#### Workspace Settings

```json
// filepath: .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 10.2. Launch Configurations

```json
// filepath: .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "@app/api", "dev:debug"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--watch"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 11. Docker Setup (Alternative)

### 11.1. Full Stack với Docker

Nếu muốn chạy toàn bộ stack trong Docker:

```bash
# Build images
docker-compose -f docker-compose.full.yml build

# Start all services
docker-compose -f docker-compose.full.yml up -d

# View logs
docker-compose -f docker-compose.full.yml logs -f

# Stop all
docker-compose -f docker-compose.full.yml down
```

### 11.2. Production-like Setup

```yaml
# filepath: docker-compose.full.yml

version: '3.8'

services:
  postgres:
    # ...existing postgres config...

  redis:
    # ...existing redis config...

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/qr_ordering_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  web-customer:
    build:
      context: .
      dockerfile: apps/web-customer/Dockerfile
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://localhost:3000

  web-staff:
    build:
      context: .
      dockerfile: apps/web-staff/Dockerfile
    ports:
      - "5174:80"
```

---

## 12. Troubleshooting

### 12.1. Common Issues

#### Issue: `pnpm install` fails

**Symptoms**:
```
ERR_PNPM_PEER_DEP_ISSUES
```

**Solution**:
```bash
# Clear pnpm store
pnpm store prune

# Remove node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Reinstall
pnpm install --no-frozen-lockfile
```

#### Issue: Docker containers won't start

**Symptoms**:
```
Error: port 5432 already in use
```

**Solution**:
```bash
# Check what's using the port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Stop conflicting service hoặc thay đổi port trong docker-compose.yml
# Option 1: Stop PostgreSQL service
sudo systemctl stop postgresql  # Linux
brew services stop postgresql   # macOS

# Option 2: Change port
# Edit docker-compose.yml:
ports:
  - "5433:5432"  # Host:Container
```

#### Issue: Database migration fails

**Symptoms**:
```
Error: Can't reach database server
```

**Solution**:
```bash
# Verify database is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait for health check
docker-compose ps  # Status should be "Up (healthy)"

# Retry migration
pnpm --filter @app/api db:migrate
```

#### Issue: Frontend can't connect to API

**Symptoms**:
```
Network Error / CORS error
```

**Solution**:
```bash
# Check API is running
curl http://localhost:3000/health

# Verify CORS_ORIGINS in .env includes frontend URL
CORS_ORIGINS="http://localhost:5173,http://localhost:5174"

# Restart API
# Ctrl+C in API terminal, then:
pnpm --filter @app/api dev
```

#### Issue: TypeScript errors

**Symptoms**:
```
Cannot find module '@app/shared'
```

**Solution**:
```bash
# Rebuild TypeScript references
pnpm --filter @app/shared build

# Generate Prisma Client
pnpm --filter @app/api prisma generate

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### 12.2. Reset Everything

Nếu gặp nhiều lỗi, reset toàn bộ:

```bash
# Stop all services
docker-compose down -v  # -v removes volumes

# Remove node_modules
rm -rf node_modules
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Remove build artifacts
find . -name 'dist' -type d -prune -exec rm -rf '{}' +
find . -name '.next' -type d -prune -exec rm -rf '{}' +

# Reinstall
pnpm install

# Restart Docker
docker-compose up -d

# Migrate & seed
pnpm --filter @app/api db:migrate
pnpm --filter @app/api db:seed

# Start dev servers
pnpm dev
```

### 12.3. Check System Resources

```bash
# Docker resource usage
docker stats

# Disk space
df -h  # Linux/macOS
wmic logicaldisk get size,freespace,caption  # Windows

# Memory
free -h  # Linux
top  # macOS
taskmgr  # Windows
```

---

## 13. Next Steps

### 13.1. Explore Codebase

```bash
# Backend structure
apps/api/src/
├── modules/      # Feature modules
│   ├── tenants/
│   ├── menu/
│   ├── orders/
│   └── auth/
├── common/       # Shared utilities
├── config/       # Configuration
└── main.ts       # Entry point

# Frontend structure
apps/web-customer/src/
├── components/   # React components
├── pages/        # Page components
├── hooks/        # Custom hooks
├── lib/          # Utilities
└── App.tsx       # Root component
```

### 13.2. Read Documentation

- [Architecture](./ARCHITECTURE.md) – System architecture
- [Contributing](./CONTRIBUTING.md) – Contribution guidelines
- [API Documentation](http://localhost:3000/api-docs) – OpenAPI/Swagger

### 13.3. Start Development

1. **Pick a task**: Check [GitHub Issues](../../../issues) hoặc [USER_STORIES.md](./01-product/06-USER_STORIES.md)
2. **Create branch**: `git checkout -b feature/your-feature`
3. **Code**: Make changes
4. **Test**: `pnpm test`
5. **Commit**: Follow [commit conventions](./CONTRIBUTING.md#6-commit-messages)
6. **Push**: `git push origin feature/your-feature`
7. **PR**: Create Pull Request

### 13.4. Learn the Stack

**Backend (NestJS)**:
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Guide](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Frontend (React)**:
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

**DevOps**:
- [Docker Documentation](https://docs.docker.com/)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

## 14. Support & Contact

### 14.1. Getting Help

- **Documentation**: Check `docs/` folder
- **GitHub Issues**: [Create new issue](../../../issues/new)
- **GitHub Discussions**: [Ask questions](../../../discussions)
- **Email**: dev@example.com

### 14.2. Reporting Issues

Nếu gặp vấn đề trong setup:

1. Check [Troubleshooting](#12-troubleshooting) section
2. Search [existing issues](../../../issues)
3. Create new issue với:
   - OS & version
   - Node.js version
   - Error message đầy đủ
   - Steps to reproduce

---

## 15. Appendix

### 15.1. Useful Commands

```bash
# Package management
pnpm add <package>              # Add dependency
pnpm add -D <package>           # Add dev dependency
pnpm remove <package>           # Remove dependency
pnpm update                     # Update all packages

# Workspace commands
pnpm --filter @app/api <cmd>    # Run command in specific workspace
pnpm -r <cmd>                   # Run in all workspaces
pnpm -r --parallel <cmd>        # Run in parallel

# Docker
docker-compose up -d            # Start detached
docker-compose down             # Stop containers
docker-compose logs -f <service> # Follow logs
docker-compose exec <service> sh # Shell into container
docker-compose restart <service> # Restart service

# Database
pnpm db:migrate                 # Run migrations
pnpm db:seed                    # Seed data
pnpm db:studio                  # Open Prisma Studio
pnpm db:reset                   # Reset database
pnpm db:push                    # Push schema without migration
```

### 15.2. Environment Variables Reference

Xem file `.env.example` để biết danh sách đầy đủ các biến môi trường.

### 15.3. Port Reference

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & Session |
| Backend API | 3000 | REST API |
| Customer App | 5173 | Web app for customers |
| Staff Console | 5174 | Staff management |
| KDS | 5175 | Kitchen Display System |
| Prisma Studio | 5555 | Database GUI |

---

**Chúc bạn setup thành công! 🎉**

*Nếu gặp vấn đề, đừng ngại tạo issue hoặc hỏi trong Discussions.*