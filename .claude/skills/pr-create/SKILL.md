---
name: pr-create
description: >
  현재 브랜치의 변경사항을 분석하여 PR을 생성하는 스킬.
  커밋 diff·로그를 읽고 pr-template.md 기반으로 본문을 작성하며,
  사용자 승인 후 `gh pr create`로 GitHub에 올린다.
  fork 저장소 환경을 지원하며 upstream 감지 시 --repo 플래그를 자동 추가한다.
  "PR 만들어줘", "PR 올려줘", "pull request 생성", "pr 작성해줘", "/pr", "/pr-create" 등
  PR 생성이 필요한 모든 상황에서 반드시 이 스킬을 사용하라.
  브랜치 작업이 끝났거나 커밋 직후 PR이 언급되면 자동으로 제안하라.
version: 1.0.0
context: fork
allowed-tools: Read, Glob, Grep, Bash
---

# PR 생성 스킬

현재 브랜치를 분석하여 프로젝트 컨벤션에 맞는 PR을 생성한다.

## 동작 순서 개요

1. **사전 검증** — 인증·브랜치 상태 확인
2. **diff 분석** — 커밋 목록 및 변경 파일 수집
3. **템플릿 로드 및 본문 작성** — `references/pr-template.md` 기반
4. **사용자 확인** — 미리보기 출력 후 승인 대기
5. **PR 생성** — `gh pr create` 실행, fork 감지 시 `--repo` 자동 추가

---

## Step 1: 사전 검증

```bash
gh auth status
git branch --show-current
git remote -v
```

| 상황 | 처리 |
|------|------|
| `gh auth status` 실패 | "gh auth login을 먼저 실행하세요." 출력 후 종료 |
| `main` / `master` 브랜치 | 경고 출력 후 feature 브랜치 생성 여부 사용자에게 확인 |
| 이미 PR 존재 (`gh pr view` 성공) | 새로 만들지 않고 기존 PR URL 안내 |

---

## Step 2: diff 분석

베이스 브랜치는 `main → master → develop` 순서로 자동 감지한다.

```bash
BASE=$(git rev-parse --verify main 2>/dev/null && echo main || \
       git rev-parse --verify master 2>/dev/null && echo master || echo develop)

git log ${BASE}..HEAD --oneline
git diff ${BASE}..HEAD --name-status
git diff ${BASE}..HEAD
```

커밋이 0개이면 "변경사항이 없습니다." 출력 후 종료.
diff 전체를 읽어 **무엇이 왜 바뀌었는지** 파악하라. 파일 목록만 보고 추측하지 마라.

---

## Step 3: 템플릿 로드 및 PR 본문 작성

Read 도구로 `references/pr-template.md`를 반드시 읽은 뒤 본문을 채운다.
템플릿을 읽지 않고 임의로 본문을 작성하지 마라.

### PR 제목 규칙

- **70자 이내, 한국어**
- 커밋 컨벤션 prefix 사용: `feat:` `fix:` `refactor:` `chore:`
- 커밋이 단일이면 해당 커밋 메시지를 그대로 제목으로 사용한다
- "무엇을 했다"(what)보다 "왜/어떤 효과"(why/effect)를 담는다

```
✅ feat: 미리보기에 반응형 뷰포트 전환 기능 추가
✅ fix: 라이트 모드에서 입력창 배경색 깨지는 문제 해결
❌ feat: LivePreview.tsx 수정
❌ fix: App.css rgba 값 변경
```

### 본문 채우기 순서

1. `## Summary` — 변경 목적을 2~3문장 (왜에 집중)
2. `## Changes` — 커밋을 타입별(`feat` / `fix` / `chore·docs·style`)로 그룹핑하여 bullet 목록
3. `## Test Plan` — 변경 기능에 맞는 체크리스트
4. `## Notes` — breaking change, 환경변수, 의존성 변경 (없으면 "없음")

---

## Step 4: 사용자 확인

PR 미리보기(제목 + 본문 전체)를 출력하고 **사용자 승인을 기다린다**.
사용자 승인 없이 PR을 생성하지 마라.

수정 요청이 오면 해당 섹션만 재작성하고 다시 미리보기를 보여준다.

---

## Step 5: gh pr create 실행

upstream remote 감지 여부에 따라 명령을 분기한다.

```bash
# fork 환경 (upstream remote 있음)
gh pr create \
  --title "<제목>" \
  --body "<본문>" \
  --base "${BASE}" \
  --head "<fork계정>:<브랜치>" \
  --repo "<upstream-owner>/<repo>"

# 일반 환경 (upstream 없음)
gh pr create \
  --title "<제목>" \
  --body "<본문>" \
  --base "${BASE}"
```

- PR 생성 성공 시 **PR URL을 사용자에게 출력**한다
- 실패 시 에러 원인을 분석하고 해결 방법을 제안한다

---

## 주의사항

- 사용자 승인 없이 PR을 생성하지 마라
- `references/pr-template.md`를 읽지 않고 본문을 임의 작성하지 마라
- 원격 브랜치가 없으면 `git push -u origin <branch>` 먼저 실행 후 진행한다
