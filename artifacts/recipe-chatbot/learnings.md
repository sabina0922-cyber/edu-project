# Recipe Chatbot — Learnings

---
category: code-review
applied: rule
---
## bulk add에서 stale closure — functional updater 필수 → .claude/rules/react-functional-updater.md

**상황**: Step 4, code-reviewer가 `use-ingredients.ts`의 `addIngredient` forEach 루프에서 데이터 유실 버그를 발견.
**판단**: `setIngredients((prev) => ...)` functional updater 패턴으로 수정 + `addIngredients` bulk API 추가. `saveIngredients(next)` 호출을 updater 내부로 이동해 상태와 저장 일관성 확보.
**다시 마주칠 가능성**: 높음 — React useState에서 배열을 loop로 업데이트하는 패턴은 항상 stale closure 위험. 일반화 가능한 규칙.

---
category: code-review
applied: rule
---
## 외부 API 루프에는 max iterations guard 필수 → .claude/rules/claude-api-tool-use-guard.md

**상황**: Step 4, route.ts의 agentic tool-use 루프에 무한 루프 가능성 발견.
**판단**: `MAX_TOOL_ITERATIONS = 5` 가드 추가. tool_use 루프 패턴은 항상 상한 필요.
**다시 마주칠 가능성**: 높음 — Claude API tool-use loop를 구현할 때마다 재발.

---
category: code-review
applied: not-yet
---
## error role 메시지는 API 전송 전에 필터링

**상황**: Step 4, use-chat.ts의 오류 메시지가 다음 전송 시 `user` 역할로 Claude에 전달되는 문제.
**판단**: `filter((m) => m.role !== 'error')` 로 제거. UI 전용 상태(error)와 API 메시지 히스토리를 분리.
**다시 마주칠 가능성**: 높음 — chat 메시지 타입이 UI 상태를 포함하면 항상 이 문제 발생.

---
category: tooling
applied: not-yet
---
## Prettier가 let → const 변환으로 로직 버그 유발

**상황**: route.ts에서 `let toolIterations = 0`을 작성했으나 PostToolUse hook이 Prettier를 실행해 `const toolIterations = 0`으로 변환. 카운터가 항상 0이 되는 버그 발생.
**판단**: 포맷터 실행 후 Read로 파일 확인 후 재편집. 명시적 `let` 의도 있을 때 변수명을 카운터임을 명확히 표현(toolIterationCount).
**다시 마주칠 가능성**: 중간 — 루프 카운터 패턴에서 재발 가능.

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
