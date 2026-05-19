# AGENTS.md — React Component Generator

## Operational Commands

패키지 매니저: **bun 전용** (npm/yarn/pnpm 사용 금지)

```bash
bun install           # 의존성 설치
bun run dev           # API 서버(3002) + Vite(5173) 동시 실행
bun run server        # API 서버만 실행
bun run build         # 타입 체크 + Vite 빌드
bun run lint          # ESLint 실행
bun run preview       # 빌드된 앱 프리뷰
```

테스트 스위트 없음 — 수동 테스트: `bun run dev` 후 http://localhost:5173 접속

## Project Context

자연어 프롬프트를 받아 AI가 React 컴포넌트를 즉시 생성하고 react-live로 실시간 미리보기하는 웹 앱.

Tech Stack: React 19, TypeScript, Vite, Bun, Anthropic Claude API, Google Gemini API, react-live

## Golden Rules

**Immutable (절대 위반 금지)**
- API 키 하드코딩 금지 — `.env` 파일 또는 UI 입력만 허용
- AI가 생성하는 컴포넌트 코드는 TypeScript 문법 금지 — 순수 JavaScript만
- CSS 파일/모듈 사용 금지 — inline styles만 허용 (생성된 컴포넌트 코드 기준)

**Do's**
- 환경변수는 반드시 `.env.example`에 키 이름만 기록하고 값은 `.env.local`에 저장
- `SYSTEM_PROMPT` 변경 시 기존 규칙과의 충돌 여부를 먼저 확인
- 새 Provider 추가 시 `server/index.ts`의 `Provider` 타입과 `src/types/index.ts`의 `Provider` 타입 동시 업데이트

**Don'ts**
- `.env.local`을 git에 커밋하지 마라 (`.gitignore`에 포함됨)
- `render()` 호출을 수동으로 추가하지 마라 — `ensureRenderCall()`이 자동 처리
- Vite dev server와 API server 포트를 바꾸지 마라 (5173, 3002 고정)

## Standards & References

**커밋 메시지 포맷 (한국어)**
- `feat:` 새 기능, `fix:` 버그 수정, `refactor:` 리팩터링, `chore:` 설정/도구

**코딩 컨벤션**
- Frontend: TypeScript strict mode, React functional components only
- Backend: Bun 런타임 네이티브 API 사용 (`Bun.serve`, `fetch`)
- 에러 메시지는 한국어로 작성 (사용자 대면 메시지)

**Maintenance Policy**
- 이 파일의 규칙과 실제 코드 간 괴리가 발생하면 즉시 업데이트를 제안하라.

## Context Map

- **[Frontend 컴포넌트 및 훅 수정 (src/)](./src/AGENTS.md)** — React 컴포넌트, 커스텀 훅, react-live 관련 작업 시.
- **[API 서버 수정 (server/)](./server/AGENTS.md)** — Bun 서버, AI API 호출, 코드 후처리 로직 수정 시.
