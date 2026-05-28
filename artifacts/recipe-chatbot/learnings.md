# Recipe Chatbot — Learnings

---
category: tooling
applied: not-yet
---
## e2e/*.spec.ts 가 vitest에 의해 실행되는 문제

**상황**: Checkpoint A, `bun run test` 실행 시 Playwright 테스트 파일이 vitest에 포함돼 오류 발생
**판단**: `vitest.config.ts`의 `exclude`에 `"e2e/**"` 추가. 기존 프로젝트 설정 누락이었음. `.spec.ts` 패턴을 공유하므로 vitest exclude 설정이 필수.
**다시 마주칠 가능성**: 높음 — Next.js + Playwright 조합 프로젝트는 매번 발생 가능.

---
category: task-ordering
applied: not-yet
---
## Task 실행 순서 결정

**상황**: Step 2, plan.md 의존성 분석
**판단**: plan.md 순서(1→2→3→4→5→6→7→8) 그대로 유지. Task 5(Route Handler)는 Task 1만 필요해 Task 3·4와 병렬 가능하지만, 메인 컨텍스트 단일 실행이므로 순차 선택.
**다시 마주칠 가능성**: 낮음 — 이번 feature에 특유한 상황.
