# Tasks: 补贴活动与SDK接入
**Input**: Design documents from `/specs/001-subsidy-activity-sdk/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: 所有新功能必须包含单元测试与页面级 E2E，请将测试任务写入各用户故事阶段。
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Project initialization and basic structure
- [ ] T001 Create SDK package scaffold in packages/sdk/package.json, packages/sdk/tsconfig.json, packages/sdk/README.md
- [ ] T002 [P] Add SDK source entry stub in packages/sdk/src/index.ts
- [ ] T003 [P] Add tsconfig path alias for @gasmorph/sdk in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
**CRITICAL**: No user story work can begin until this phase is complete
- [ ] T004 [P] Add activity domain types in app/lib/activities/types.ts
- [ ] T005 [P] Add activity store in app/lib/activities/store.ts
- [ ] T006 [P] Add project config store in app/lib/console/projectConfigStore.ts
- [ ] T007 [P] Extend request validators for project config and activities in app/lib/validation/validators.ts
- [ ] T008 Add shared activity error mapping in app/lib/activities/errors.ts
- [ ] T009 [P] Add log redaction helper for sensitive fields in app/lib/telemetry/redact.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 项目方配置补贴账户与签到开关 (Priority: P1) MVP
**Goal**: 控制台可配置补贴账户公开信息与签到开关，并在演示页生效
**Independent Test**: 通过控制台保存配置并关闭签到，演示页同步显示不可签到

### Tests for User Story 1 (必选)
- [ ] T010 [P] [US1] Unit test for project config store in tests/unit/project-config-store.spec.ts
- [ ] T011 [P] [US1] Unit test for config validation (reject sensitive fields) in tests/unit/project-config-validators.spec.ts
- [ ] T012 [P] [US1] Integration test for project config API in tests/integration/project-config.test.ts
- [ ] T013 [P] [US1] Integration test for check-in toggle enforcement in tests/integration/checkin-toggle.test.ts
- [ ] T014 [P] [US1] Page-level E2E for console config + check-in toggle in tests/e2e/console/project-config.spec.ts

### Implementation for User Story 1
- [ ] T015 [P] [US1] Implement project config API in app/api/console/project-config/route.ts
- [ ] T016 [P] [US1] Add console config UI in app/components/console/ProjectConfigCard.tsx
- [ ] T017 [US1] Wire console page to config API in app/(marketing)/console/page.tsx
- [ ] T018 [US1] Apply check-in toggle to demo UI in app/(marketing)/subsidy/page.tsx
- [ ] T019 [US1] Enforce check-in toggle on server in app/api/demo/checkin/route.ts
- [ ] T020 [US1] Update check-in component for disabled state in app/components/voucher/CheckInCard.tsx
- [ ] T021 [US1] Add sanitized structured logs for config updates in app/api/console/project-config/route.ts

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 项目方管理活动并驱动演示领券 (Priority: P1)
**Goal**: 控制台管理活动，演示页展示可领取与已暂停/已结束活动并完成领券
**Independent Test**: 创建活动并在演示页领取一次消费券

### Tests for User Story 2 (必选)
- [ ] T022 [P] [US2] Unit test for activity store rules in tests/unit/activity-store.spec.ts
- [ ] T023 [P] [US2] Unit test for activity claim rules in tests/unit/activity-claim.spec.ts
- [ ] T024 [P] [US2] Integration test for activities APIs in tests/integration/activities-api.test.ts
- [ ] T025 [P] [US2] Page-level E2E for activity create + claim in tests/e2e/subsidy/activities.spec.ts

### Implementation for User Story 2
- [ ] T026 [P] [US2] Implement console activities API (list/create) in app/api/console/activities/route.ts
- [ ] T027 [P] [US2] Implement console activities API (update/delete) in app/api/console/activities/[id]/route.ts
- [ ] T028 [P] [US2] Implement demo activities API in app/api/demo/activities/route.ts
- [ ] T029 [P] [US2] Implement demo activity claim API in app/api/demo/activities/claim/route.ts
- [ ] T030 [P] [US2] Add console activity form UI in app/components/console/ActivityForm.tsx
- [ ] T031 [P] [US2] Add console activity list UI in app/components/console/ActivityList.tsx
- [ ] T032 [US2] Wire console activities into app/(marketing)/console/page.tsx
- [ ] T033 [P] [US2] Add demo activity board UI in app/components/voucher/ActivityBoard.tsx
- [ ] T034 [US2] Wire demo activity board into app/(marketing)/subsidy/page.tsx

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 项目方使用SDK快速接入补贴与活动 (Priority: P2)
**Goal**: 提供 @gasmorph/sdk 并在演示页通过 SDK 调用补贴与活动发券流程
**Independent Test**: 演示页通过 SDK 完成补贴交易与活动领券

### Tests for User Story 3 (必选)
- [ ] T035 [P] [US3] Unit test for SDK client in tests/unit/sdk/client.spec.ts
- [ ] T036 [P] [US3] Unit test for SDK activities in tests/unit/sdk/activities.spec.ts
- [ ] T037 [P] [US3] Page-level E2E for SDK demo flow in tests/e2e/subsidy/sdk-flow.spec.ts

### Implementation for User Story 3
- [ ] T038 [P] [US3] Implement SDK core types in packages/sdk/src/types.ts
- [ ] T039 [P] [US3] Implement SDK client in packages/sdk/src/client.ts
- [ ] T040 [P] [US3] Implement SDK activities helpers in packages/sdk/src/activities.ts
- [ ] T041 [P] [US3] Implement SDK voucher helpers in packages/sdk/src/vouchers.ts
- [ ] T042 [US3] Export SDK public API in packages/sdk/src/index.ts
- [ ] T043 [US3] Update tsconfig.json path mappings for SDK imports
- [ ] T044 [US3] Integrate SDK usage into demo flow in app/(marketing)/subsidy/page.tsx and app/lib/demoAction.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns
**Purpose**: Improvements that affect multiple user stories
- [ ] T045 [P] Update docs in specs/001-subsidy-activity-sdk/quickstart.md and README.md
- [ ] T046 [P] Add perf smoke check for config/activity APIs in tests/integration/performance-smoke.test.ts
- [ ] T047 Run lint/typecheck (`npm run lint`, `npm run typecheck`)
- [ ] T048 Run unit tests (`npm test`)
- [ ] T049 Run page-level E2E (`npm run playwright`)
- [ ] T050 Run quickstart validation steps from specs/001-subsidy-activity-sdk/quickstart.md

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 config but testable alone
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but testable alone

### Within Each User Story
- Tests MUST be written and FAIL before implementation
- Data types/stores before APIs
- APIs before UI wiring
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities
- Phase 1 tasks marked [P] can run in parallel
- Phase 2 tasks marked [P] can run in parallel
- Tests within each user story marked [P] can run in parallel
- UI components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1
```bash
# Launch all tests for User Story 1 together (as required):
Task: "Unit test for project config store in tests/unit/project-config-store.spec.ts"
Task: "Unit test for config validation (reject sensitive fields) in tests/unit/project-config-validators.spec.ts"
Task: "Integration test for project config API in tests/integration/project-config.test.ts"
Task: "Integration test for check-in toggle enforcement in tests/integration/checkin-toggle.test.ts"
Task: "Page-level E2E for console config + check-in toggle in tests/e2e/console/project-config.spec.ts"
# Launch key UI tasks for User Story 1 together:
Task: "Implement project config API in app/api/console/project-config/route.ts"
Task: "Add console config UI in app/components/console/ProjectConfigCard.tsx"
```

---

## Implementation Strategy
### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo if ready

### Incremental Delivery
1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Demo
3. Add User Story 2 -> Test independently -> Demo
4. Add User Story 3 -> Test independently -> Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy
With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
