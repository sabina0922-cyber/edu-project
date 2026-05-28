# 요리 초보 어시스턴트 챗봇

## Problem Statement
HMW — 요리 초보가 "뭘 만들지?" 라는 막막함을 느끼는 순간, 레시피 목록을 나열하는 앱이 아니라 맥락을 아는 조수처럼 대화할 수 있을까?

## Recommended Direction

**"냉장고 재료 → 단계별 요리 가이드" + Claude API 기능 명시적 시연**

포트폴리오 목적임을 감안하면 레시피 자체보다 **Claude API 역량을 코드로 증명**하는 구조가 더 가치 있다. 구체적으로:

- **Multi-turn 대화**: 재료·선호도·알레르기를 첫 턴에서 수집하고 이후 대화에서 맥락을 유지
- **Tool Use**: `get_ingredients()`(냉장고 재고 확인), `check_nutrition()` 같은 가상 도구를 정의해 tool calling 시연
- **Streaming**: 레시피 설명을 스트리밍으로 출력 → 실시간 느낌

CLI 기반으로 만들면 3-4시간 안에 완성 가능. Web UI는 시간 부족.

## Key Assumptions to Validate
- [ ] Claude가 한국 요리 레시피를 충분히 알고 있다 → 첫 10분에 수동으로 테스트
- [ ] Tool Use 없이 대화 맥락만으로도 포트폴리오 임팩트가 충분하다 → Tool 구현 시간이 남으면 추가

## MVP Scope

**포함:**
- 재료 입력 → 레시피 추천 (multi-turn)
- 단계별 설명 (streaming 출력)
- 대화 맥락 유지 (세션 내 재료·선호도 기억)
- Tool Use 1개 이상 (가상 도구라도 OK)

**제외:**
- 웹 UI, 모바일
- 실제 DB 연동
- 이미지 인식

## Not Doing (and Why)
- **실패 진단 챗봇** — 포트폴리오 임팩트는 있지만 3-4시간 안에 "대화 흐름" 설계가 더 복잡
- **웹 UI** — Next.js 세팅만 1시간 이상 소요, CLI이면 즉시 시연 가능
- **외부 레시피 API 연동** — API 키 관리·에러 처리가 시간 잡아먹음, Claude 자체 지식으로 충분

## Open Questions
- Tool Use를 실제 기능(재고 파일 읽기 등)으로 만들 것인가, 가상 도구 시연으로만 할 것인가?
- CLI vs 간단한 웹 챗 UI (Next.js + Vercel 배포) — 배포 가능성이 포트폴리오에 중요하다면 웹도 고려
