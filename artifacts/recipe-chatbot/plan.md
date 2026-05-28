# Recipe Chatbot 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| Claude API 호출 위치 | Next.js Route Handler (`app/api/chat/route.ts`) | API 키 서버 보호, Streaming 지원 |
| Streaming 방식 | `ReadableStream` + `text/event-stream` | Anthropic SDK `stream()` 반환값을 그대로 파이핑 |
| 채팅 상태 | React `useState` (인메모리) | 새로고침 시 초기화 — spec 요구사항 |
| 재료 상태 | `localStorage` + `useState` | 새로고침 후 영속 — spec 요구사항 |
| 진입 경로 | `app/page.tsx` 교체 | 포트폴리오 직관성, 기존 ComponentExample 제거 |
| 컴포넌트 렌더링 | 모든 interactive 컴포넌트 `'use client'` | useState·이벤트 핸들러 사용 필수 |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Env var | `.env.local` | Task 1 |

## 데이터 모델

### ChatMessage
- `id: string` (required)
- `role: 'user' | 'assistant' | 'error'` (required)
- `content: string` (required)
- `toolCall?: { name: string; status: 'pending' | 'done' }` (optional — tool badge 표시용)

### Ingredient
- `id: string` (required)
- `name: string` (required)
- `qty: string` (required)
- `unit: string` (required)
- `expiresAt?: string` — ISO date string (optional)
- `memo?: string` (optional)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| next-best-practices | 5, 4 | route-handlers.md (streaming), rsc-boundaries.md (use client 경계) |
| shadcn | 2, 3, 4, 6 | composition.md, forms.md — 컴포넌트 조합 규칙 |
| vercel-react-best-practices | 2 | client-localstorage-schema.md — localStorage 스키마 |
| claude-api | 5 | streaming tool use 패턴 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `app/page.tsx` | Modify | Task 4 |
| `app/layout.tsx` | Modify (폰트 제거) | Task 4 |
| `app/globals.css` | Modify (커스텀 스크롤바) | Task 4 |
| `app/api/chat/route.ts` | New | Task 5 |
| `lib/storage.ts` | New | Task 1 |
| `lib/mock-receipt.ts` | New | Task 1 |
| `lib/claude.ts` | New | Task 5 |
| `hooks/use-ingredients.ts` | New | Task 2 |
| `hooks/use-chat.ts` | New | Task 6 |
| `components/recipe-chatbot/ingredient-list.tsx` | New | Task 2 |
| `components/recipe-chatbot/ingredient-list.test.tsx` | New | Task 2 |
| `components/recipe-chatbot/ingredient-form.tsx` | New | Task 2 |
| `components/recipe-chatbot/ingredient-form.test.tsx` | New | Task 2 |
| `components/recipe-chatbot/add-method-selector.tsx` | New | Task 3 |
| `components/recipe-chatbot/add-method-selector.test.tsx` | New | Task 3 |
| `components/recipe-chatbot/receipt-scanner.tsx` | New | Task 3 |
| `components/recipe-chatbot/receipt-scanner.test.tsx` | New | Task 3 |
| `components/recipe-chatbot/chat-layout.tsx` | New | Task 4 |
| `components/recipe-chatbot/chat-layout.test.tsx` | New | Task 4 |
| `components/recipe-chatbot/chat-message.tsx` | New | Task 6 |
| `components/recipe-chatbot/chat-input.tsx` | New | Task 6 |
| `components/recipe-chatbot/chat-input.test.tsx` | New | Task 6 |
| `.env.local` | New | Task 1 |

---

## Tasks

### Task 1: 셋업 — 패키지 설치 + 공유 타입·스토리지

- **담당 시나리오**: 없음 (기반 인프라)
- **크기**: S (2 파일)
- **의존성**: None
- **참조**:
  - `vercel-react-best-practices` — client-localstorage-schema
- **구현 대상**:
  - `lib/storage.ts` — `getIngredients()`, `saveIngredients()` localStorage 래퍼
  - `lib/mock-receipt.ts` — 영수증 mock 파싱 결과 (Ingredient[] 4-5개, 비식품 1개 포함)
  - `.env.local` — `ANTHROPIC_API_KEY` 주석 포함 템플릿
  - `bun add @anthropic-ai/sdk` 실행
- **수용 기준**:
  - [ ] `saveIngredients([...])` 호출 후 `getIngredients()`가 같은 배열을 반환
  - [ ] `mock-receipt.ts`가 `Ingredient[]` 형태의 배열을 export하고, 비식품 항목이 1개 이상 포함
- **검증**: `bun run test -- storage`

---

### Task 2: 재료 관리 — 목록 조회·직접 입력·삭제

- **담당 시나리오**: Scenario 9, 10, 13, 14, 15
- **크기**: M (4 파일)
- **의존성**: Task 1 (`storage.ts` 의존)
- **참조**:
  - `shadcn` — forms.md (FieldGroup + Field 패턴), composition.md
  - `vercel-react-best-practices` — client-localstorage-schema
- **구현 대상**:
  - `hooks/use-ingredients.ts` — `ingredients`, `addIngredient()`, `removeIngredient()` (localStorage 연동)
  - `components/recipe-chatbot/ingredient-list.tsx` — 목록 + D-뱃지 + 삭제 버튼 + 빈 상태 안내
  - `components/recipe-chatbot/ingredient-list.test.tsx`
  - `components/recipe-chatbot/ingredient-form.tsx` — 재료명·수량·단위·유통기한·메모 폼
  - `components/recipe-chatbot/ingredient-form.test.tsx`
- **수용 기준**:
  - [ ] 재료 목록이 있을 때 각 항목의 이름·수량이 화면에 표시됨 (Scenario 9)
  - [ ] 유통기한이 있는 항목에 "D-N" 텍스트가 표시됨 (Scenario 9)
  - [ ] D-7 이내 항목이 "곧 만료" 섹션에 표시됨 (Scenario 9)
  - [ ] 저장된 재료가 없을 때 빈 상태 안내 텍스트가 표시됨 (Scenario 10)
  - [ ] 재료명 + 수량 입력 후 저장 → 목록에 해당 항목이 나타남 (Scenario 13)
  - [ ] 재료명 비운 채 저장 시도 → 해당 필드 근처에 안내 텍스트 표시, 화면 유지 (Scenario 14)
  - [ ] 수량 비운 채 저장 시도 → 해당 필드 근처에 안내 텍스트 표시, 화면 유지 (Scenario 14)
  - [ ] 삭제 버튼 클릭 → 해당 항목이 목록에서 사라짐, 나머지 항목 유지 (Scenario 15)
  - [ ] 직접 입력 저장 후 새로고침 → 목록에 항목이 남아 있음 (Scenario 13, 영속 불변 규칙)
  - [ ] 삭제 후 새로고침 → 삭제된 항목이 다시 나타나지 않음 (Scenario 15, 영속 불변 규칙)
- **검증**: `bun run test -- ingredient`

---

### Task 3: 영수증 스캔 (mock)

- **담당 시나리오**: Scenario 11, 12
- **크기**: M (4 파일)
- **의존성**: Task 1 (`mock-receipt.ts`), Task 2 (`use-ingredients`)
- **참조**:
  - `shadcn` — composition.md (Dialog 또는 페이지 내 섹션)
- **구현 대상**:
  - `components/recipe-chatbot/add-method-selector.tsx` — 영수증 스캔·직접 입력 선택 카드 + 백 버튼 (wireframe Screen 6)
  - `components/recipe-chatbot/add-method-selector.test.tsx`
  - `components/recipe-chatbot/receipt-scanner.tsx` — 이미지 선택 영역 + mock 결과 목록 + 체크박스 + 유통기한 입력 + 저장 버튼
  - `components/recipe-chatbot/receipt-scanner.test.tsx`
- **수용 기준**:
  - [ ] 이미지 파일 선택 → mock 파싱 결과 목록(3개 이상)이 체크박스와 함께 표시됨 (Scenario 11)
  - [ ] 비식품 항목이 기본 선택 해제 상태로 표시됨 (Scenario 11)
  - [ ] 저장 버튼 클릭 → 체크된 항목 수만큼 재료 목록에 추가됨 (Scenario 12)
  - [ ] 저장 후 재료 목록 화면으로 이동됨 (Scenario 12)
  - [ ] 저장 후 새로고침 → 선택된 항목들이 재료 목록에 남아 있음 (Scenario 12, 영속 불변 규칙)
- **검증**: `bun run test -- receipt`

---

### Checkpoint A: Tasks 1-3 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 재료 추가(직접 입력) → 목록에 표시 → 삭제 → 목록에서 사라짐이 end-to-end로 동작
- [ ] Browser MCP: `localhost:3000` 접속 후 재료 탭에서 직접 입력 → 저장 → 목록 확인 (`artifacts/recipe-chatbot/evidence/checkpoint-a.png` 저장)

---

### Task 4: 앱 셸 — 상단 탭 + 채팅 빈 상태

- **담당 시나리오**: Scenario 1 (full)
- **크기**: M (3 파일)
- **의존성**: Task 2 (재료 탭 연결)
- **참조**:
  - `next-best-practices` — rsc-boundaries.md, directives.md
  - `shadcn` — composition.md
- **구현 대상**:
  - `app/page.tsx` — recipe chatbot 루트 (기존 ComponentExample 교체, `'use client'`)
  - `components/recipe-chatbot/chat-layout.tsx` — 헤더 + 상단 탭(채팅/재료) + 빈 상태(chef-hat 아이콘 + 카테고리 quick-pick + 제안 칩 4개) + 입력창 셸
  - `components/recipe-chatbot/chat-layout.test.tsx`
- **수용 기준**:
  - [ ] 페이지 로드 → "요리 어시스턴트" 제목이 표시됨 (Scenario 1)
  - [ ] 페이지 로드 → 어시스턴트 인사 메시지가 메시지 영역에 표시됨 (Scenario 1)
  - [ ] 페이지 로드 → 제안 칩 4개가 표시됨 (Scenario 1)
  - [ ] 입력이 없는 상태에서 입력창이 활성화되어 있음 (Scenario 1)
  - [ ] "재료" 탭 클릭 → 재료 목록 화면으로 전환됨
- **검증**: `bun run test -- chat-layout`, `bun run build`

---

### Task 5: Route Handler + get_recipe tool 정의

- **담당 시나리오**: Scenario 2 (server-side), Scenario 8 (오류 응답)
- **크기**: M (2 파일)
- **의존성**: Task 1 (패키지 설치)
- **참조**:
  - `next-best-practices` — route-handlers.md (streaming: `text/event-stream`)
  - `claude-api` — tool use + streaming 패턴
- **구현 대상**:
  - `app/api/chat/route.ts` — POST 핸들러, messages + ingredients 수신, 스트리밍 응답 반환. 오류 시 `{ error: string }` JSON 반환
  - `lib/claude.ts` — `get_recipe` tool 정의 (하드코딩 레시피 3-4개), system prompt (요리 가이드 페르소나 + 저장 재료 주입 지점)
- **수용 기준**:
  - [ ] POST `/api/chat` with `{ messages: [{role:"user", content:"계란볶음밥 만들어줘"}] }` → `Content-Type: text/event-stream` 응답 반환
  - [ ] 응답 스트림에 "계란" 또는 "재료" 텍스트가 포함됨
  - [ ] POST `/api/chat` with 잘못된 요청 → `{ error: "..." }` JSON + 4xx 상태코드 반환
- **검증**: `bun run test -- chat/route`, `bun run build`

---

### Task 6: 스트리밍 채팅 UI

- **담당 시나리오**: Scenario 2 (full), Scenario 3
- **크기**: M (3 파일)
- **의존성**: Task 4 (레이아웃), Task 5 (API)
- **참조**:
  - `shadcn` — composition.md (no-bubble assistant style), icons.md
  - `next-best-practices` — rsc-boundaries.md
- **구현 대상**:
  - `components/recipe-chatbot/chat-message.tsx` — assistant (no-bubble, tool badge), user (pill), error (dashed) 메시지 렌더링. `'use client'`
  - `components/recipe-chatbot/chat-input.tsx` — textarea + 전송 버튼. 응답 중 disabled. `'use client'`
  - `components/recipe-chatbot/chat-input.test.tsx`
  - `hooks/use-chat.ts` — messages state, `sendMessage()` (fetch → stream 읽기 → messages 업데이트), 응답 중 `isStreaming` flag
- **수용 기준**:
  - [ ] "계란볶음밥 만들어줘" 전송 → tool badge("get_recipe 호출 중...")가 먼저 나타남 (Scenario 2)
  - [ ] 응답이 완료되기 전에 텍스트가 부분적으로 화면에 표시됨 (Scenario 2 — streaming)
  - [ ] 응답 중 입력창과 전송 버튼이 비활성화 상태임 (Scenario 2, 불변 규칙)
  - [ ] "준비됐어요" 전송 → 응답에 번호가 붙은 조리 행동 설명이 포함됨 (Scenario 3)
  - [ ] 이전 대화 맥락이 유지되어 요리명·재료를 다시 묻지 않음 (Scenario 3)
- **검증**: `bun run test -- chat-input`, Browser MCP — "계란볶음밥" 전송 후 tool badge + streaming 확인 (`artifacts/recipe-chatbot/evidence/task-6-streaming.png`)

---

### Checkpoint B: Tasks 4-6 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 채팅 탭에서 요리명 입력 → tool badge → 재료 목록 응답 → 단계 진행이 end-to-end로 동작
- [ ] Browser MCP: streaming 중 입력창 disabled 확인 (`artifacts/recipe-chatbot/evidence/checkpoint-b.png`)

---

### Task 7: 없는 재료·요리 변경·API 오류 처리

- **담당 시나리오**: Scenario 4, 5, 8
- **크기**: M (2 파일 수정)
- **의존성**: Task 5, Task 6
- **구현 대상**:
  - `lib/claude.ts` (Modify) — system prompt에 "없는 재료 → 대체 제안" 지시 추가, "다른 요리명 언급 시 컨텍스트 전환" 지시 추가
  - `hooks/use-chat.ts` (Modify) — fetch 실패 시 `role: 'error'` 메시지 추가, `isStreaming` 해제
  - `components/recipe-chatbot/chat-message.tsx` (Modify) — error 메시지 렌더링 (dashed border, alert-triangle 아이콘)
- **수용 기준**:
  - [ ] "[재료명]이 없어요" 전송 → 응답에 대체 재료 또는 생략 안내 텍스트가 포함됨 (Scenario 4)
  - [ ] 다른 요리명 전송 → 응답에 새 요리 재료 텍스트가 포함되고, 이전 요리 단계 안내가 이어지지 않음 (Scenario 5)
  - [ ] API 오류 발생 → 오류 안내 메시지 버블이 표시됨 (dashed 스타일) (Scenario 8)
  - [ ] 오류 표시 후 입력창이 다시 활성화됨 (Scenario 8)
- **검증**: `bun run test -- use-chat`, Human review — "버터가 없어요" 입력 후 대체 안내 확인

---

### Task 8: 재료-채팅 연동 + 세션 초기화

- **담당 시나리오**: Scenario 6, 7
- **크기**: S (2 파일 수정)
- **의존성**: Task 2, Task 6
- **구현 대상**:
  - `hooks/use-chat.ts` (Modify) — `sendMessage()`에서 `getIngredients()` 읽어 API 요청의 `ingredients` 필드로 전달
  - `app/api/chat/route.ts` (Modify) — 수신한 `ingredients`를 system prompt에 주입 ("현재 냉장고 재료: ...")
  - `components/recipe-chatbot/chat-layout.tsx` (Modify) — 연필 버튼 클릭 → `clearMessages()` 호출 → 빈 상태 복귀
- **수용 기준**:
  - [ ] 재료("계란", "대파") 저장 후 "냉장고 재료로 만들어줘" 전송 → 응답에 "계란" 또는 "대파" 텍스트 포함 (Scenario 7)
  - [ ] 재료 없는 상태에서 "냉장고 재료로 만들어줘" → 저장 재료 없음 안내 또는 일반 추천 표시 (Scenario 7)
  - [ ] 연필(새 대화) 버튼 클릭 → 채팅창이 빈 상태(어시스턴트 인사 + 제안 칩)로 초기화됨 (Scenario 6)
  - [ ] 브라우저 새로고침 → 채팅창이 빈 상태로 표시됨 (Scenario 6)
- **검증**: `bun run test -- use-chat`, Browser MCP — 재료 저장 → 채팅에서 "냉장고 재료" 확인 (`artifacts/recipe-chatbot/evidence/task-8-integration.png`)

---

### Checkpoint C: 최종
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 전체 E2E: 재료 추가(스캔 mock) → 채팅에서 "냉장고 재료로 만들어줘" → 재료 반영된 레시피 응답 확인
- [ ] Human review — 포트폴리오 시연 흐름 전체 점검 (스트리밍, tool badge, 재료 연동)

---

## 미결정 항목

없음 — 모든 핵심 경로가 결정됨
