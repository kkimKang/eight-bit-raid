# 8-BIT RAID — Project Status

## Last Updated
2026-08-22 17:30

## Completed Work
- CHOMPER 보스 이동속도를 기존 대비 75%로 하향 (일반 패턴 + 궁극기)
- 전 캐릭터 점프력(`kit.jump`)을 1.5배로 상향 (캐릭터 간 상대 차이는 유지)
- 보스 피격 시 게임이 멈추던 문제 수정: overlap 콜백이 탄이 아니라 보스 스프라이트를 비활성/파괴하던 인자 순서를 고치고, 물리 스텝 중 `destroy()`를 프레임 끝으로 미룸
- 한글 UI를 Noto Sans KR / 맑은 고딕으로 바꾸고, 게임 캔버스를 3배 해상도(카메라 줌)로 렌더해 글자를 선명하게 표시

## Completed Work
- Vite + TypeScript + Phaser 3 웹게임 스캐폴드 (`npm run dev` / `npm run build`)
- 타이틀 → 난이도 → 캐릭터 선택 → 상점 로비 → 보스전 → 결과 → 올클리어 씬 플로우
- 플랫포머 물리, 하트 HP, 무적/피격 무적, 스톰프, 기절(Hard+), 물리/마법 피해와 보스 저항
- 캐릭터 8종: BLADE, BUSTER, SHADE, BOLT, BRICK, TAUNT, BLOOM, HYMN
- 본편 보스 10종: CHOMPER ~ POSTCAT, 패턴 상태머신 + 궁극기 맵
- 상점 업글(ATK/HP/CDR), S~F 랭크, 골드, 보스 순환, 전멸 시 재도전
- 로컬 1~4인 (1P 방향키, 2P IJKL, 3~4P 게임패드), 인원 수 HP 스케일
- Easy / Normal / Hard / Impossible 배율, 난이도별 보스 컷 (MASKED / GONDOLA / POSTCAT)

## Current Technical State
- 엔트리: [src/main.ts](src/main.ts), 게임 부트: [src/apps/game/createGame.ts](src/apps/game/createGame.ts)
- 세션 상태: [src/shared/session.ts](src/shared/session.ts)
- 전투 월드: [src/features/combat/RaidWorld.ts](src/features/combat/RaidWorld.ts)
- 보스 패턴: [src/features/bosses/patterns.ts](src/features/bosses/patterns.ts)
- 오리지널 픽셀 아트/처프 SFX, 서버 없음. 클리어 기록만 `localStorage`
- 저작권: 원작 유즈맵의 역할/루프만 호러지. 타사 IP 이름·도트·BGM 미사용

## Next Steps
- `???` / 엑스트라 보스, Joke·Kaizo, 온라인 매칭, 루피·스킨은 이후 과제로 유지
- 실기 플레이로 보스 HP·패턴 속도 밸런스 조정
- 외부 도트/처프 트랙이 필요하면 `assets/`에 오리지널 에셋만 추가

## Known Issues
- 2P는 같은 키보드에서 IJKL + F/G/H/U/O (1P의 S/D와 충돌하지 않도록 분리)
- 개발 모드에서만 F10으로 현재 보스 스킵 가능
- Phaser 번들이 커서 프로덕션 청크가 큼 (코드 스플리팅은 이후)
