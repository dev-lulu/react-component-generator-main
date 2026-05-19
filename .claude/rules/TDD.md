# TDD 규칙 — React Component Generator

⚠️ **이 규칙은 Rigid — 상황에 맞게 변형하지 마라**

이 문서는 React Component Generator 프로젝트에서의 테스트 주도 개발(TDD) 표준을 정의합니다. 상위 레벨 문제는 CLAUDE.md/AGENTS.md에 정의된 규칙을 우선합니다.

---

## 적용 기준

### TDD를 반드시 적용해야 하는 대상 ✓

- **비즈니스 로직**: `ensureRenderCall()`, 코드 후처리 함수, 데이터 변환 로직
- **API 통신**: 요청/응답 처리, 타임아웃, 재시도 로직, 에러 핸들링
- **유틸리티 함수**: 공유 헬퍼, 유효성 검증, 파싱/직렬화
- **버그 수정**: 재현 가능한 실패 케이스 → 테스트로 기록 → 수정

### TDD가 불필요한 대상 ✗

- **타입 정의** (`src/types/`, `server/types/`)
- **설정 파일** (`.env`, `tsconfig.json`, `vite.config.ts`)
- **순수 UI 렌더링** (react-live 코드 에디터, 프리뷰 영역의 DOM 조작)
- **외부 API 응답 파싱** (Claude/Gemini API 스키마는 안정적이므로 통합 테스트로 충분)

---

## RED-GREEN-REFACTOR 사이클

### 1️⃣ RED: 실패하는 테스트 작성

**규칙:**
- **하나의 동작 = 하나의 테스트** (예: "코드에 render() 호출이 없으면 추가" ≠ "코드 검증과 삽입을 모두 처리")
- **반드시 실행해서 실패 확인**: `bun test` 또는 해당 테스트 파일 실행
- **실패 이유는 반드시 "기능 미구현"이어야 함**: "assertion failed" or "function not found", NOT "syntax error"
- 테스트가 존재하지 않는 함수를 호출하거나 존재하지 않는 값을 검증할 수 있음

```typescript
// ❌ RED 단계에서 프로덕션 코드 작성 금지
// ❌ "이미 대충 짜여 있으니 테스트만 추가"도 금지

describe("ensureRenderCall", () => {
  test("should add render() call if missing", () => {
    const code = "const App = () => <div>Hello</div>";
    const result = ensureRenderCall(code);
    expect(result).toContain("render(");
  });
});
```

**테스트가 빨간불이 되는지 먼저 확인:**
```bash
bun test --testNamePattern="should add render"
# ❌ FAIL: "ensureRenderCall is not defined"
```

### 2️⃣ GREEN: 최소 코드로 테스트 통과

**규칙:**
- **최소한의 코드만 작성**: 테스트를 통과하는 최소한의 구현만
- **YAGNI 원칙 준수**: "나중에 필요할 것 같은" 로직 추가 금지
- **신규 + 기존 테스트 모두 통과 확인**: `bun test` 전체 실행

```typescript
// ✓ GREEN: 테스트를 통과하는 최소 코드
export function ensureRenderCall(code: string): string {
  if (!code.includes("render(")) {
    return code + "\nrender(App);";
  }
  return code;
}
```

**통과 확인:**
```bash
bun test
# ✓ PASS: 신규 테스트 + 기존 테스트 모두 성공
```

### 3️⃣ REFACTOR: 중복 제거 & 개선

**규칙:**
- **green 상태 유지**: 리팩터링 중 모든 테스트는 계속 통과해야 함
- **중복 제거**: 유사한 로직 병합, 헬퍼 함수 추출
- **이름 개선**: 매직 스트링/숫자 → 상수, 모호한 변수 → 명확한 이름
- **새로운 동작 추가 금지**: 리팩터링은 "어떻게" 개선, "무엇" 추가 금지

```typescript
// ✓ REFACTOR: 가독성 개선
const RENDER_CALL = "render(App);";

export function ensureRenderCall(code: string): string {
  if (code.includes("render(")) {
    return code;
  }
  return `${code}\n${RENDER_CALL}`;
}
```

**테스트 유지 확인:**
```bash
bun test
# ✓ PASS: 모든 테스트 통과 (기능 변화 없음)
```

### 4️⃣ 반복

RED 단계로 돌아가서 다음 동작을 테스트로 정의합니다.

```typescript
// 다음 RED: "render() 호출이 이미 있으면 중복 추가 금지"
test("should not add render() if already present", () => {
  const code = `const App = () => <div>Hello</div>\nrender(App);`;
  const result = ensureRenderCall(code);
  expect(result).toEqual(code); // 변화 없음
});
```

---

## 삭제 강제 규칙

**테스트 작성 전에 프로덕션 코드를 먼저 작성했다면:**

1. **프로덕션 코드를 완전히 삭제**
2. **RED 단계부터 재시작**
3. "참고용으로 남기기" 금지 — 테스트가 검증하지 않는 코드는 기술 부채

```bash
# ❌ 하지 말 것: "일단 짜두고 나중에 테스트 추가"
export function ensureRenderCall(code: string): string {
  // ... 이미 완전히 구현된 함수 ...
}

# ✓ 해야 할 것: RED부터
# 1. 함수 정의 삭제
# 2. 테스트 작성
# 3. 함수 다시 구현 (최소 코드)
```

---

## 변명 차단표

| 변명 | 반박 |
|------|------|
| "너무 단순해서 테스트 불필요" | 단순할수록 테스트는 빠르다. 단순한 함수 10개 > 복잡한 함수 1개의 버그 확률 |
| "나중에 추가하겠다" | "나중"은 오지 않는다. RED → GREEN → REFACTOR 사이클이 10분이면 지금 하라 |
| "시간이 없다" | TDD는 느리지 않다 — 디버깅/회귀 테스트 시간을 제거한다. 장기 생산성을 계산하면 이득 |
| "삭제하면 낭비" | 테스트하지 않은 코드는 이미 낭비다. RED 사이클로 재작성해야 신뢰할 수 있다 |
| "프로토타입이다" | 프로토타입도 버그가 있다. 테스트는 프로토타입을 제품으로 승격시키는 증거다 |
| "AI가 생성한 코드라 검증 불필요" | AI 생성 코드는 타입 에러, 논리 오류, 엣지 케이스 누락이 많다. 특히 필요 |
| "react-live 미리보기로 확인했다" | 수동 테스트는 지나간 엣지 케이스를 잡지 못한다. 자동화 테스트만이 회귀 방지 |

---

## 프로젝트별 규칙 우선 조항

**우선순위:**
1. 각 디렉토리의 AGENTS.md (있으면 우선)
   - `src/AGENTS.md` — React/Frontend 테스트 규칙
   - `server/AGENTS.md` — Bun/API 테스트 규칙
2. 프로젝트 루트 CLAUDE.md
3. **이 파일 (TDD.md) — 기본값/fallback**

**현재 프로젝트 상태:**
- 테스트 스위트 없음 (AGENTS.md 명시)
- 향후 도입 시 TDD 규칙은 **이 문서를 따름**
- 구체적 테스트 환경 설정(Vitest, Bun test, etc.)은 AGENTS.md에서 정의

---

## 실행 명령어

```bash
# 테스트 실행 (구현 후)
bun test

# 특정 테스트만 실행
bun test --testNamePattern="ensureRenderCall"

# Watch 모드 (개발 중 자동 실행)
bun test --watch
```

---

## 참고

- RED-GREEN-REFACTOR는 **아젠다가 아닌 규칙**: 각 사이클은 5~15분 내 완료해야 함
- **테스트는 문서**: 테스트 코드로 동작을 설명하므로 주석보다 명확해야 함
- **엣지 케이스 테스트**: 정상 경로만 아니라 null, 빈 배열, 타임아웃 등도 포함
