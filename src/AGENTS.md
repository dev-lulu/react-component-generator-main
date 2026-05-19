# AGENTS.md — Frontend (src/)

## Module Context

React 19 + TypeScript 기반 프론트엔드. `useComponentGenerator` 훅이 상태와 API 통신을 담당하며, `react-live`가 생성된 코드를 런타임에 렌더링한다.

## Tech Stack & Constraints

- `react-live@4.x` — `LiveProvider`, `LivePreview`, `LiveError` 사용
- TypeScript strict mode — `src/types/index.ts`의 타입 재사용 필수
- 전역 CSS는 `src/index.css`만 허용, 컴포넌트별 CSS 파일 금지

## Implementation Patterns

**react-live 사용 시 필수 규칙**
- `LiveProvider`에 `noInline` prop 반드시 지정 — 없으면 `render()` 호출이 무시됨
- 생성된 코드는 `code` prop으로 전달 — `eval()` 직접 호출 절대 금지

**상태 관리**
- API 호출은 반드시 `useComponentGenerator` 훅을 통해서만 — 컴포넌트에서 직접 `fetch` 금지
- `GeneratedComponent` 타입: `{ id, prompt, code, createdAt }` — `src/types/index.ts` 참조
- `id` 생성 패턴: `` `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` ``

**Provider 타입**
- `'anthropic' | 'google'` — `src/types/index.ts`의 `Provider` 유니언 타입 import

## Local Golden Rules

**Do's**
- `LiveProvider` 사용 시 항상 `noInline` prop 포함
- 에러 상태는 `useComponentGenerator`의 `error` 상태로 처리 — 별도 try/catch 불필요
- 새 컴포넌트 추가 시 `src/components/` 하위에 PascalCase 파일명으로 생성

**Don'ts**
- `useComponentGenerator` 훅 외부에서 `/api/generate` 직접 호출하지 마라
- `react-live`의 `LiveProvider` 없이 생성된 코드를 렌더링하려 하지 마라
- `App.tsx`에 비즈니스 로직을 직접 작성하지 마라 — 훅으로 분리
