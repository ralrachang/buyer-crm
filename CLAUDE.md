# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # 개발 서버 실행 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npx tsc --noEmit  # 타입 체크
npm run lint      # ESLint
```

서버 프로세스 종료 (Windows):
```bash
powershell -Command "Stop-Process -Id <PID> -Force"
```

## Architecture

**Next.js 15 App Router + Supabase + TypeScript + Tailwind CSS v4**

### 인증 방식

Supabase Auth를 사용하지 않는다. 공유 패스워드 1개(`SITE_PASSWORD`)를 서버에서 비교하고, `jose`로 서명한 JWT를 `crm_session` httpOnly 쿠키에 저장한다. `middleware.ts`가 `/customers/**`, `/api/customers/**` 경로를 보호하며, 인증 실패 시 `/`로 리다이렉트한다.

### 데이터 흐름

- 모든 DB 쿼리는 API Routes(`src/app/api/`)에서 `createServerSupabase()`(서비스 롤 키)로 실행
- 클라이언트는 API Routes만 호출하며, Supabase에 직접 접근하지 않음
- `createBrowserSupabase()`는 현재 미사용 (향후 realtime 기능 시 사용)

### 데이터 모델

- `customers` — 고객 기본정보 (`mention_name` 유니크, @이름으로 식별)
- `timeline_entries` — 고객별 상담 이력 (`customer_id` FK, CASCADE DELETE)
- `PropertyMemo` — Phase 3 예정, 미구현

스키마: `supabase/schema.sql` (Supabase SQL Editor에서 실행, RLS 비활성화)

### 페이지 구조

- `/` — 로그인
- `/customers` — 고객 목록 + `QuickTimelineForm` (메인에서 바로 타임라인 기록)
- `/customers/new` — 고객 등록 (클라이언트 컴포넌트)
- `/customers/[id]` — 고객 상세 + 타임라인 (클라이언트 컴포넌트)
- `/customers/[id]/edit` — 서버 컴포넌트 (Supabase 직접 조회 후 `CustomerForm` 렌더)

### QuickTimelineForm 동작

메인 목록 페이지에서 고객 배열을 props로 전달받아 클라이언트 사이드 자동완성 필터링. 고객을 드롭다운에서 선택해야만 제출 가능. 선택된 고객의 `id`로 `/api/customers/[id]/timeline` POST 호출.

## 환경변수 (.env.local)

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 — 클라이언트 코드 노출 금지 |
| `SITE_PASSWORD` | 사이트 접근 패스워드 — 서버에서만 검증 |
| `NEXTAUTH_SECRET` | JWT 서명 키 (`openssl rand -base64 32`) |

## Phase 계획

- **Phase 1 (완료)**: 패스워드 로그인, 고객 CRUD, 타임라인, 메인 빠른기록
- **Phase 2 (완료)**: 매수의지 레벨 시각화, 고객 목록 검색/정렬
- **Phase 3**: 매물 매칭 메모(`PropertyMemo` 테이블 추가), 연락 알림

상세 계획: `PRD/03_PHASES.md`
