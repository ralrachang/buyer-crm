# 매수고객관리 CRM -- 데이터 모델

> 이 문서는 앱에서 다루는 핵심 데이터의 구조를 정의합니다.
> 개발자가 아니어도 이해할 수 있는 "개념적 ERD"입니다.

---

## 전체 구조

```
[Customer] --1:N--> [TimelineEntry]
     │
     └──1:N──> [PropertyMemo]
```

---

## 엔티티 상세

### Customer (고객)
매수 고객 한 명의 기본 정보 카드. @이름으로 식별.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동 생성) | uuid-abc-123 | O |
| mention_name | @이름 (유니크, 검색 키) | 김철수 | O |
| name | 고객 실명 | 김철수 | O |
| purchase_purpose | 매입 목적 | 임대수익 / 개발 / 거주 | X |
| purchase_intent | 매수의지 레벨 (1~5) | 4 | X |
| available_cash | 보유 현금 (억원) | 30 | X |
| preferred_area | 선호 지역 | 마포구, 용산구 | X |
| customer_concept | 고객 컨셉 메모 | 안정적 수익 선호, 리스크 회피형 | X |
| occupation | 직업 | 의사 | X |
| age | 나이 | 48 | X |
| has_corporation | 법인 보유 여부 | true / false | X |
| created_at | 등록일 (자동) | 2026-03-28 | O |
| updated_at | 최종 수정일 (자동) | 2026-03-28 | O |

### TimelineEntry (타임라인 항목)
고객과의 상담·연락 이력. 시간 순서로 쌓임.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동 생성) | uuid-xyz-456 | O |
| customer_id | 어떤 고객의 기록인지 | (Customer.id 참조) | O |
| mention | @멘션 태그 (매물명/위치 등) | @마포 꼬마빌딩 A동 | X |
| content | 상담 내용 | "수익률 5% 이상 원함, 대출 70% 가능 여부 확인 요청" | O |
| created_at | 입력 시각 (자동) | 2026-03-28 14:30 | O |

### PropertyMemo (매물 매칭 메모) — Phase 3
특정 고객에게 제안한 매물 정보 기록.

| 필드 | 설명 | 예시 | 필수 |
|------|------|------|------|
| id | 고유 식별자 (자동 생성) | uuid-pqr-789 | O |
| customer_id | 어떤 고객에게 제안했는지 | (Customer.id 참조) | O |
| property_location | 매물 위치 | 마포구 합정동 123-4 | O |
| price | 매물 가격 (억원) | 45 | X |
| features | 특징 메모 | 1층 카페 임대 중, 수익률 4.8%, 대출 60% 가능 | X |
| created_at | 등록일 (자동) | 2026-03-28 | O |

---

## 관계 정의

- **Customer 1 → N TimelineEntry**: 고객 1명이 여러 개의 상담 기록을 가짐
- **Customer 1 → N PropertyMemo**: 고객 1명에게 여러 매물을 제안할 수 있음
- Customer가 삭제되면 관련 TimelineEntry, PropertyMemo도 함께 삭제 (CASCADE)

---

## 왜 이 구조인가

- **단순성**: 50명 이하 소규모 운용에 최적화. 복잡한 관계 테이블 불필요.
- **확장성**: Phase 2에서 레벨 필드 활용, Phase 3에서 PropertyMemo 테이블 추가 — 기존 Customer 테이블 변경 없음.
- **@mention_name**: 고객을 이름으로 직접 참조 가능. 타임라인 입력 시 자동완성 연동 용이.

---

## [NEEDS CLARIFICATION]

- [ ] available_cash 단위를 억원으로 확정할지 (입력 편의 vs 정밀도)
- [ ] mention_name과 name을 분리할지 (같은 이름 고객 발생 시 처리 방법)
