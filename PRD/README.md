# 매수고객관리 CRM -- 디자인 문서

> Show Me The PRD로 생성됨 (2026-03-28)

## 문서 구성

| 문서 | 내용 | 언제 읽나 |
|------|------|----------|
| [01_PRD.md](./01_PRD.md) | 뭘 만드는지, 누가 쓰는지, 성공 기준 | 프로젝트 시작 전 |
| [02_DATA_MODEL.md](./02_DATA_MODEL.md) | Customer / Timeline / PropertyMemo 구조 | DB 설계할 때 |
| [03_PHASES.md](./03_PHASES.md) | Phase 1~3 단계별 계획 + 시작 프롬프트 | 개발 순서 정할 때 |
| [04_PROJECT_SPEC.md](./04_PROJECT_SPEC.md) | 기술 스택, 절대 하지 마, 환경변수 | AI에게 코드 시킬 때마다 |

## 다음 단계

**Phase 1을 시작하려면** [03_PHASES.md](./03_PHASES.md)의 "Phase 1 시작 프롬프트"를 복사해서 Claude Code에 붙여넣으세요.

## 미결 사항 ([NEEDS CLARIFICATION])

- [ ] 패스워드 변경 방법 (초기에는 .env 수동 변경으로 처리?)
- [ ] 타임라인 항목 삭제/수정 가능 여부
- [ ] 보유 현금 필드 단위 (억원 vs 만원)
- [ ] available_cash 단위 확정
- [ ] mention_name과 name 분리 여부 (동명이인 처리)
- [ ] 세션 유지 시간 (브라우저 닫으면 재인증 vs 7일 유지)
