# Render Deployment Guide สำหรับ Monorepo

## วิธีการ Deploy บน Render

### 1. Deploy ทั้ง Frontend และ Backend พร้อมกัน (แนะนำ)
ใช้ไฟล์ `render.yaml` หลัก:

```bash
# Deploy ทั้งสองส่วนพร้อมกัน
render deploy --config render.yaml
```

### 2. Deploy แยกส่วน

#### Frontend เท่านั้น:
```bash
render deploy --config render-frontend.yaml
```

#### Backend เท่านั้น:
```bash
render deploy --config render-backend.yaml
```

## การตั้งค่า Environment Variables

### Frontend Environment Variables:
- `NODE_ENV=production`
- `PORT=10000`
- `NEXT_PUBLIC_API_URL` (URL ของ backend)

### Backend Environment Variables:
- `PORT=10000`
- `GO_ENV=production`
- `DATABASE_URL` (จาก PostgreSQL service)

## Build Commands ที่ใช้

### Frontend (Next.js):
1. `npm ci` - ติดตั้ง dependencies
2. `npm run shared:build` - build shared packages
3. `npm run build --filter=frontend` - build frontend app
4. `npm run start --filter=frontend` - start production server

### Backend (Go):
1. `cd apps/backend` - เข้าไปใน backend directory
2. `go mod download` - download Go modules
3. `go build -o bin/server ./cmd/server` - compile Go application
4. `./bin/server` - run the server

## Health Check Endpoints

- **Frontend**: `/` (root path)
- **Backend**: `/health` (custom health endpoint)

## การจัดการ Database

Database จะถูกสร้างอัตโนมัติผ่าน `render.yaml`:
- Type: PostgreSQL
- Plan: Starter (ฟรี)
- Region: Singapore
- Database Name: municollect
- User: municollect_user

## Tips สำหรับ Monorepo

1. **Build Order**: Shared packages จะถูก build ก่อน apps
2. **Caching**: Turbo จะจัการ caching ให้อัตโนมัติ
3. **Dependencies**: ใช้ workspace dependencies ผ่าน npm workspaces
4. **Environment**: แยก environment variables ตาม service

## Troubleshooting

### ถ้า Build ล้มเหลว:
1. ตรวจสอบ `turbo.json` configuration
2. ตรวจสอบ dependencies ใน `package.json`
3. ตรวจสอบ build scripts ใน workspace packages

### ถ้า Start Command ล้มเหลว:
1. ตรวจสอบ PORT environment variable
2. ตรวจสอบ health check endpoints
3. ตรวจสอบ logs ใน Render dashboard