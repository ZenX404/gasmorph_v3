# Tasks: 补贴控制台与消费券 NFT

**Input**: Design documents from `/specs/001-subsidy-console-nft/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 合约部分需要覆盖消费券 NFT 合约，使用 Foundry 运行

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Sync spec references in docs by linking new console route in README at README.md
- [x] T002 [P] Create feature-specific constants scaffold in app/lib/voucher/types.ts
- [x] T003 [P] Create console metrics adapter scaffold in app/lib/console/metrics.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create NFT voucher contract in contracts/gas-subsidy/src/VoucherNFT.sol
- [x] T005 Add voucher contract deploy script in contracts/gas-subsidy/script/DeployVoucher.s.sol
- [x] T006 Add voucher contract tests in contracts/gas-subsidy/test/VoucherNFT.t.sol
- [x] T007 [P] Export voucher ABI and address hooks in app/lib/contracts/voucher.ts
- [x] T008 [P] Add voucher lifecycle helpers in app/lib/voucher/logic.ts
- [x] T009 Establish UI theme tokens and layout shell in app/components/layout/AppShell.tsx
- [x] T010 [P] Add shared console/demo layout styles in app/components/layout/pageShell.tsx
- [x] T011 Add environment variables for voucher contract in .env.example
- [x] T012 Add structured logging helper with trace id in app/lib/telemetry/logger.ts
- [x] T013 [P] Add request validation helpers in app/lib/validation/validators.ts
- [x] T014 Add contract test execution note in specs/001-subsidy-console-nft/quickstart.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 控制台查看运行与补贴状态 (Priority: P1) MVP

**Goal**: 控制台可访问，提供运行概览、指标、账户摘要与发券入口

**Independent Test**: 未连接钱包也可访问控制台，可查看指标并切换补贴开关与发券

### Implementation for User Story 1

- [x] T015 [US1] Create console page route in app/(marketing)/console/page.tsx
- [x] T016 [P] [US1] Build console dashboard cards in app/components/console/DashboardCards.tsx
- [x] T017 [P] [US1] Build sponsor summary panel in app/components/console/SponsorSummary.tsx
- [x] T018 [P] [US1] Build transaction list table in app/components/console/TransactionTable.tsx
- [x] T019 [P] [US1] Build issue-voucher form in app/components/console/IssueVoucherForm.tsx
- [x] T020 [US1] Wire console overview API with validation and trace logging in app/api/console/overview/route.ts
- [x] T021 [US1] Wire subsidy toggle API with validation and trace logging in app/api/console/subsidy-toggle/route.ts
- [x] T022 [US1] Wire issue voucher API with validation and trace logging in app/api/console/issue-voucher/route.ts
- [x] T023 [US1] Wire transactions API with validation and trace logging in app/api/console/transactions/route.ts
- [x] T024 [US1] Connect console UI to APIs in app/(marketing)/console/page.tsx

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 演示页面签到领取消费券 (Priority: P2)

**Goal**: 演示页面支持每日签到，领取消费券并展示抵扣效果

**Independent Test**: 签到成功后消费券可在列表展示，并可用于抵扣

### Implementation for User Story 2

- [x] T025 [US2] Add voucher badge and list UI in app/components/voucher/VoucherList.tsx
- [x] T026 [US2] Add daily check-in UI in app/components/voucher/CheckInCard.tsx
- [x] T027 [US2] Wire check-in API with Asia/Shanghai day boundary, validation, and trace logging in app/api/demo/checkin/route.ts
- [x] T028 [US2] Integrate voucher display into demo page in app/(marketing)/subsidy/page.tsx
- [x] T029 [US2] Integrate voucher redemption hints in app/components/TxStatus.tsx
- [x] T030 [US2] Ensure subsidy logic respects voucher rules in app/lib/demoAction.ts
- [x] T031 [US2] Implement voucher accumulation rules in app/lib/voucher/logic.ts

**Checkpoint**: User Story 2 works independently with check-in and voucher display

---

## Phase 5: User Story 3 - 消费券 NFT 转赠 (Priority: P3)

**Goal**: 演示页面支持消费券 NFT 转赠功能

**Independent Test**: 选择消费券转赠成功后，消费券列表变化可见

### Implementation for User Story 3

- [x] T032 [US3] Add transfer voucher UI in app/components/voucher/TransferVoucherModal.tsx
- [x] T033 [US3] Wire transfer voucher API with validation and trace logging in app/api/demo/transfer-voucher/route.ts
- [x] T034 [US3] Wire burn voucher API with validation and trace logging in app/api/demo/burn-voucher/route.ts
- [x] T035 [US3] Integrate transfer/burn actions in app/components/voucher/VoucherList.tsx

**Checkpoint**: User Story 3 works independently with transfer and burn flows

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T036 [P] Update quickstart and console/demo URLs in specs/001-subsidy-console-nft/quickstart.md
- [x] T037 [P] Add extensible chart data adapter in app/lib/console/chartData.ts
- [x] T038 Refine global UI styling and animations in app/components/layout/AppShell.tsx
- [x] T039 Run quickstart validation steps from specs/001-subsidy-console-nft/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with subsidy flow but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on voucher model from US2

### Within Each User Story

- Shared contract and voucher utilities must be ready before story work
- UI components before page integration
- API routes before UI wiring

### Parallel Opportunities

- T002, T003 can run in parallel
- T016-T019 can run in parallel
- T020-T023 can run in parallel
- T025-T027 can run in parallel
- T032-T034 can run in parallel

---

## Parallel Example: User Story 1

```text
T016 Build console dashboard cards in app/components/console/DashboardCards.tsx
T017 Build sponsor summary panel in app/components/console/SponsorSummary.tsx
T018 Build transaction list table in app/components/console/TransactionTable.tsx
T019 Build issue-voucher form in app/components/console/IssueVoucherForm.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo console

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Demo (MVP)
3. Add User Story 2 -> Test independently -> Demo
4. Add User Story 3 -> Test independently -> Demo

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
