# AGENTS.md — Backend (server/)

## Module Context

Bun 런타임 기반 단일 파일 API 서버(`server/index.ts`). 외부 AI API(Anthropic, Google)를 호출하고 생성된 코드를 후처리하여 클라이언트에 반환한다.

## Tech Stack & Constraints

- **Bun 전용 런타임** — `Bun.serve()` 사용, Node.js API(`fs`, `http`, `express`) 사용 금지
- 외부 HTTP 호출: Bun 내장 `fetch` API 사용 — 별도 HTTP 클라이언트 라이브러리 추가 금지
- 현재 AI 모델: Anthropic `claude-haiku-4-5-20251001`, Google `gemini-2.5-flash`

## Implementation Patterns

**API 키 처리**
- `resolveApiKey(provider, clientKey)` 사용 — clientKey가 환경변수보다 우선
- 환경변수: `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` (`.env.local` 또는 시스템 환경변수)

**코드 후처리 순서 (변경 금지)**
1. `stripCodeFences(text)` — 마크다운 코드 펜스 제거
2. `ensureRenderCall(code)` — `render()` 호출 자동 추가

**CORS**
- 모든 응답에 `CORS_HEADERS` 포함 필수 (OPTIONS preflight 포함)
- 현재 `*` 허용 — 프로덕션 배포 시 도메인 제한 필요

**엔드포인트**
- `GET /api/config` — 환경변수 키 설정 여부 반환
- `POST /api/generate` — `{ prompt, provider?, apiKey? }` → `{ code }`

## Local Golden Rules

**Do's**
- 새 AI Provider 추가 시: `callXxx()` 함수 추가 + `Provider` 타입 확장 + `ENV_KEYS` 객체 업데이트
- `SYSTEM_PROMPT` 수정 시 TypeScript 문법 금지 규칙이 유지되는지 반드시 확인
- 에러 응답은 HTTP 상태코드와 `{ error: string }` 형식으로 통일

**Don'ts**
- `SYSTEM_PROMPT`에서 "TypeScript 문법 금지" 규칙 제거하지 마라 — react-live가 TypeScript 미지원
- `stripCodeFences` → `ensureRenderCall` 순서를 바꾸지 마라
- 포트 3002 변경하지 마라 — `vite.config.ts` 프록시와 연동됨
- API 키를 로그에 출력하지 마라
