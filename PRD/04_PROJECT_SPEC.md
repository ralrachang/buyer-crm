# 매수고객관리 CRM -- 프로젝트 스펙

> AI가 코드를 짤 때 지켜야 할 규칙과 절대 하면 안 되는 것.
> 이 문서를 AI에게 항상 함께 공유하세요.

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | AI 코딩 호환 최고, 커뮤니티 활발, Vercel 원클릭 배포 |
| DB / 백엔드 | Supabase (PostgreSQL) | 인증+DB+스토리지 올인원, 무료 티어로 충분, RLS로 데이터 보안 |
| 인증 | 커스텀 패스워드 미들웨어 | 공유 패스워드 1개 방식 — Supabase Auth 불필요 |
| 배포 | Vercel | Next.js 최적화, 무료 티어, 자동 HTTPS |
| 스타일링 | Tailwind CSS v4 | AI 코딩에 최적, 빠른 프로토타이핑 |
| 언어 | TypeScript | 타입 안전성, 런타임 버그 최소화 |

---

## 프로젝트 구조

```
매수고객관리/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 패스워드 로그인 페이지
│   │   ├── customers/
│   │   │   ├── page.tsx          # 고객 목록
│   │   │   ├── new/page.tsx      # 고객 등록
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 고객 상세 + 타임라인
│   │   │       └── edit/page.tsx # 고객 편집
│   │   └── api/
│   │       └── auth/route.ts     # 패스워드 검증 API
│   ├── components/
│   │   ├── CustomerCard.tsx      # 고객 카드 컴포넌트
│   │   ├── TimelineEntry.tsx     # 타임라인 항목
│   │   └── TimelineForm.tsx      # 타임라인 입력 폼
│   ├── lib/
│   │   ├── supabase.ts           # Supabase 클라이언트
│   │   └── auth.ts               # 패스워드 세션 유틸
│   └── types/
│       └── index.ts              # Customer, TimelineEntry 타입 정의
├── public/
├── .env.local                    # 환경변수 (절대 GitHub 올리지 말 것)
└── package.json
```

---

## 절대 하지 마 (DO NOT)

> AI에게 코드를 시킬 때 이 목록을 반드시 함께 공유하세요.

- [ ] API 키나 패스워드를 코드에 직접 쓰지 마 (.env.local 사용)
- [ ] SITE_PASSWORD를 클라이언트 코드에 노출하지 마 (서버사이드에서만 검증)
- [ ] 기존 Supabase 테이블 스키마를 임의로 변경하지 마
- [ ] 목업/하드코딩 데이터로 완성이라고 하지 마 (실제 DB 연결 필수)
- [ ] package.json의 기존 의존성 버전을 임의로 변경하지 마
- [ ] 고객 데이터를 클라이언트 로컬스토리지에 저장하지 마 (보안 위험)
- [ ] 인증 없이 /customers 경로에 접근 가능하게 만들지 마

---

## 항상 해 (ALWAYS DO)

- [ ] 변경하기 전에 계획을 먼저 보여줘
- [ ] 환경변수는 .env.local에 저장, .env.example에 키 이름만 기록
- [ ] 패스워드 검증은 Next.js 미들웨어 또는 서버 액션에서만 수행
- [ ] 모바일에서도 타임라인 입력 가능한 반응형 디자인
- [ ] Supabase 쿼리 에러 발생 시 사용자에게 친절한 한국어 메시지 표시
- [ ] @mention_name은 공백 없이 저장 (검색 편의)

---

## 테스트 방법

```bash
# 로컬 실행
npm run dev

# 타입 체크
npx tsc --noEmit

# 빌드 확인
npm run build
```

---

## 배포 방법 (Vercel)

1. GitHub에 프로젝트 푸시
2. vercel.com → New Project → GitHub 레포 연결
3. Environment Variables에 아래 환경변수 입력
4. Deploy 클릭

---

## 환경변수

| 변수명 | 설명 | 어디서 발급 |
|--------|------|------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL | Supabase Dashboard > Settings > API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 공개 키 | Supabase Dashboard > Settings > API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 서비스 롤 키 (서버 전용) | Supabase Dashboard > Settings > API |
| SITE_PASSWORD | 사이트 접근 공유 패스워드 | 직접 설정 |
| NEXTAUTH_SECRET | 세션 암호화 키 (랜덤 문자열) | `openssl rand -base64 32` |

> .env.local 파일에 저장. 절대 GitHub에 올리지 마세요. (.gitignore에 .env.local 포함 확인)

---

## [NEEDS CLARIFICATION]

- [ ] 패스워드 변경 시 프로세스 (Vercel 환경변수 수동 수정으로 처리?)
- [ ] 세션 유지 시간 (브라우저 닫으면 재인증 vs 7일 유지)
- [ ] Supabase 무료 티어 한도 초과 시 대응 방안 (월 50만 row 요청, 500MB 스토리지)
