import { useAuth } from '@/src/auth/AuthProvider';
import {
  TOWER_FLOORS,
  buildGameSessionPayload,
  createClientResultId,
  getFloorAccess,
  type TowerFloor,
} from '@/src/game/towerGame';
import {
  DUNGEON_ROOMS,
  MAX_HEARTS,
  createDungeonRun,
  dodge,
  getSpikePhase,
  isRoomClear,
  stepDungeon,
  strike,
  type DungeonRun,
  type RoomObstacle,
  type Vector2,
} from '@/src/game/roomGame';
import { getEnemyMotion, getKnightMotion, getSwordMotion } from '@/src/game/towerAnimation';
import {
  submitTowerSession,
  type TowerSessionPayload,
  type TowerSessionResult,
} from '@/src/game/towerSession';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  ImageBackground,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const towerBackground = require('../assets/images/tower/tower-hall.png');
const dungeonRoomBackground = require('../assets/images/tower/dungeon-room.png');
const knightSprite = require('../assets/images/tower/knight.png');
const goblinSprite = require('../assets/images/tower/goblin.png');

type GameMode = 'intro' | 'map' | 'playing' | 'result';

export default function TowerGameScreen() {
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<GameMode>('intro');
  const [selectedFloor, setSelectedFloor] = useState<TowerFloor>(TOWER_FLOORS[0]);
  const [run, setRun] = useState<DungeonRun | null>(null);
  const [attacking, setAttacking] = useState(false);
  const [attackStartedAtMs, setAttackStartedAtMs] = useState(0);
  const [dodging, setDodging] = useState(false);
  const [moving, setMoving] = useState(false);
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<TowerSessionResult | null>(null);
  const [pendingUpload, setPendingUpload] = useState<TowerSessionPayload | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [profileRefreshError, setProfileRefreshError] = useState('');
  const lastTickRef = useRef(0);
  const submittedIdRef = useRef<string | null>(null);
  const resultIdRef = useRef(createClientResultId());
  const activeUploadIdRef = useRef<string | null>(null);
  const runIsDemoRef = useRef(false);
  const attackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dodgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveInputRef = useRef<Vector2>({ x: 0, y: 0 });

  const floorAccess = useMemo(
    () => getFloorAccess(user?.level ?? 1, demoUnlocked),
    [demoUnlocked, user?.level],
  );
  const runStatus = run?.status;

  const beginFloor = useCallback((floor: TowerFloor) => {
    setSelectedFloor(floor);
    setRun(createDungeonRun(floor.id));
    setSubmission(null);
    setPendingUpload(null);
    setSubmitError('');
    setProfileRefreshError('');
    setAttacking(false);
    setAttackStartedAtMs(0);
    setDodging(false);
    setMoving(false);
    moveInputRef.current = { x: 0, y: 0 };
    lastTickRef.current = Date.now();
    submittedIdRef.current = null;
    activeUploadIdRef.current = null;
    runIsDemoRef.current = demoUnlocked;
    if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
    if (dodgeTimeoutRef.current) clearTimeout(dodgeTimeoutRef.current);
    resultIdRef.current = createClientResultId();
    setMode('playing');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [demoUnlocked]);

  useEffect(() => () => {
    activeUploadIdRef.current = null;
    if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
    if (dodgeTimeoutRef.current) clearTimeout(dodgeTimeoutRef.current);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') return;
      moveInputRef.current = { x: 0, y: 0 };
      setMoving(false);
      setRun(current => current?.status === 'playing' ? { ...current, status: 'paused' } : current);
    });
    return () => subscription.remove();
  }, []);

  const uploadPayload = useCallback(async (payload: TowerSessionPayload) => {
    const uploadId = payload.clientResultId;
    activeUploadIdRef.current = uploadId;
    setSubmitting(true);
    setSubmitError('');
    setProfileRefreshError('');
    const outcome = await submitTowerSession(
      payload,
      value => api.post<TowerSessionResult>('/game-sessions', value).then(response => response.data),
      refreshUser,
    );
    if (activeUploadIdRef.current !== uploadId) return;

    if (outcome.status === 'uploadFailed') {
      setPendingUpload(outcome.payload);
      setSubmitError('The server could not be reached. Retry this exact run when your connection returns.');
    } else {
      setPendingUpload(null);
      setSubmission(outcome.result);
      if (!outcome.profileRefreshed) {
        setProfileRefreshError('XP was awarded, but the profile display could not refresh yet. It will update next time the app reconnects.');
      }
    }
    setSubmitting(false);
  }, [refreshUser]);

  useEffect(() => {
    if (mode !== 'playing' || runStatus !== 'playing') return;
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.min(0.12, Math.max(0.01, (now - lastTickRef.current) / 1000));
      lastTickRef.current = now;
      setRun(current => current ? stepDungeon(current, moveInputRef.current, elapsed, now) : current);
    }, 60);
    return () => clearInterval(timer);
  }, [mode, runStatus, selectedFloor]);

  useEffect(() => {
    if (!run || (run.status !== 'victory' && run.status !== 'defeated')) return;
    setMode('result');
    if (submittedIdRef.current === resultIdRef.current) return;
    submittedIdRef.current = resultIdRef.current;
    const durationSeconds = (Date.now() - run.startedAtMs) / 1000;
    const payload = buildGameSessionPayload(run, durationSeconds, resultIdRef.current);
    if (runIsDemoRef.current) {
      setSubmission({ awardedXp: 0, validationState: 'Demo' });
      return;
    }
    setPendingUpload(payload);
    void uploadPayload(payload);
  }, [run, uploadPayload]);

  const changeMoveInput = useCallback((input: Vector2) => {
    moveInputRef.current = input;
    setMoving(Math.hypot(input.x, input.y) > 0.08);
  }, []);

  const attack = () => {
    if (!run || run.status !== 'playing') return;
    const now = Date.now();
    setRun(current => current ? strike(current, now) : current);
    setAttackStartedAtMs(now);
    setAttacking(true);
    if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
    attackTimeoutRef.current = setTimeout(() => setAttacking(false), 420);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const performDodge = () => {
    if (!run || run.status !== 'playing') return;
    const now = Date.now();
    if (now < run.dodgeCooldownUntilMs) return;
    setRun(current => current ? dodge(current, now) : current);
    setDodging(true);
    if (dodgeTimeoutRef.current) clearTimeout(dodgeTimeoutRef.current);
    dodgeTimeoutRef.current = setTimeout(() => setDodging(false), 500);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const togglePause = () => {
    moveInputRef.current = { x: 0, y: 0 };
    setMoving(false);
    setRun(current => current ? {
      ...current,
      status: current.status === 'paused' ? 'playing' : 'paused',
    } : current);
    lastTickRef.current = Date.now();
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {mode === 'intro' && <Intro onEnter={() => setMode('map')} onClose={() => router.back()} />}
      {mode === 'map' && (
        <TowerMap
          access={floorAccess}
          demoUnlocked={demoUnlocked}
          onClose={() => router.back()}
          onDemoToggle={() => setDemoUnlocked(value => !value)}
          onSelect={beginFloor}
          userLevel={user?.level ?? 1}
        />
      )}
      {mode === 'playing' && run && (
        <PlayScene
          attacking={attacking}
          attackStartedAtMs={attackStartedAtMs}
          dodging={dodging}
          floor={selectedFloor}
          onAttack={attack}
          onClose={() => setMode('map')}
          onDodge={performDodge}
          onMoveInput={changeMoveInput}
          onPause={togglePause}
          moving={moving}
          run={run}
        />
      )}
      {mode === 'result' && run && (
        <ResultScreen
          floor={selectedFloor}
          onMap={() => setMode('map')}
          onRetry={() => beginFloor(selectedFloor)}
          run={run}
          isDemo={runIsDemoRef.current}
          submission={submission}
          onRetryUpload={() => pendingUpload && void uploadPayload(pendingUpload)}
          profileRefreshError={profileRefreshError}
          submitError={submitError}
          submitting={submitting}
          uploadFailed={Boolean(pendingUpload && submitError)}
        />
      )}
    </View>
  );
}

function Intro({ onEnter, onClose }: { onEnter(): void; onClose(): void }) {
  return <ImageBackground source={towerBackground} resizeMode="cover" style={styles.fill}>
    <View style={styles.vignette} />
    <SafeAreaView edges={['top', 'bottom']} style={styles.introSafe}>
      <Pressable accessibilityLabel="Close Tower game" accessibilityRole="button" onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
      <View style={styles.introCopy}>
        <Text style={styles.kicker}>BUDGET BOUNDER PRESENTS</Text>
        <Text style={styles.gameTitle}>TOWER OF{`\n`}FORTUNE</Text>
        <View style={styles.rule} />
        <Text style={styles.introBody}>Every wise choice forged your strength. Now climb the five floors, guard your savings, and defeat the creatures of impulse.</Text>
      </View>
      <Image source={knightSprite} contentFit="contain" style={styles.introKnight} />
      <Pressable accessibilityRole="button" onPress={onEnter} style={styles.heroButton}>
        <Text style={styles.heroButtonText}>ENTER THE TOWER  ›</Text>
      </Pressable>
    </SafeAreaView>
  </ImageBackground>;
}

function TowerMap({ access, demoUnlocked, onClose, onDemoToggle, onSelect, userLevel }: {
  access: ReturnType<typeof getFloorAccess>;
  demoUnlocked: boolean;
  onClose(): void;
  onDemoToggle(): void;
  onSelect(floor: TowerFloor): void;
  userLevel: number;
}) {
  return <ImageBackground source={towerBackground} blurRadius={2} resizeMode="cover" style={styles.fill}>
    <View style={styles.mapShade} />
    <SafeAreaView edges={['top', 'bottom']} style={styles.fill}>
      <View style={styles.mapHeader}>
        <Pressable accessibilityLabel="Close Tower map" accessibilityRole="button" onPress={onClose} style={styles.iconButton}><Text style={styles.iconButtonText}>‹</Text></Pressable>
        <View style={styles.mapTitleWrap}><Text style={styles.mapKicker}>YOUR LEVEL · {userLevel}</Text><Text style={styles.mapTitle}>CHOOSE A FLOOR</Text></View>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.floorList} showsVerticalScrollIndicator={false}>
        {[...access].reverse().map(({ floor, unlocked }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !unlocked }}
            disabled={!unlocked}
            key={floor.id}
            onPress={() => onSelect(floor)}
            style={({ pressed }) => [styles.floorCard, { borderColor: floor.accent }, !unlocked && styles.floorLocked, pressed && styles.floorPressed]}>
            <View style={[styles.floorNumber, { backgroundColor: unlocked ? floor.accent : '#384052' }]}><Text style={styles.floorNumberText}>{floor.id}</Text></View>
            <View style={styles.floorCopy}>
              <Text style={[styles.floorName, unlocked && { color: floor.accent }]}>{floor.name}</Text>
              <Text style={styles.floorSubtitle}>{unlocked ? floor.subtitle : `Reach finance level ${floor.id} to unlock`}</Text>
              <Text style={styles.floorBoss}>{unlocked ? `GUARDIAN · ${floor.boss}` : '🔒  SEALED'}</Text>
            </View>
            <Text style={styles.floorArrow}>{unlocked ? '›' : '◆'}</Text>
          </Pressable>
        ))}
        {__DEV__ && <Pressable accessibilityRole="button" onPress={onDemoToggle} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>{demoUnlocked ? '✓ DEMO MODE: ALL FLOORS OPEN' : 'DEVELOPER DEMO: UNLOCK ALL FLOORS'}</Text>
        </Pressable>}
      </ScrollView>
    </SafeAreaView>
  </ImageBackground>;
}

function PlayScene({ attacking, attackStartedAtMs, dodging, floor, moving, onAttack, onClose, onDodge, onMoveInput, onPause, run }: {
  attacking: boolean;
  attackStartedAtMs: number;
  dodging: boolean;
  floor: TowerFloor;
  moving: boolean;
  onAttack(): void;
  onClose(): void;
  onDodge(): void;
  onMoveInput(input: Vector2): void;
  onPause(): void;
  run: DungeonRun;
}) {
  const room = DUNGEON_ROOMS[run.roomIndex];
  const roomClear = isRoomClear(run, room);
  const progress = (run.roomIndex + (roomClear ? 0.85 : 0.25)) / DUNGEON_ROOMS.length;
  const knightMotion = getKnightMotion(run.clockMs, moving);
  const swordMotion = getSwordMotion(run.clockMs, attackStartedAtMs, attacking);

  return <View style={styles.playRoot}>
    <SafeAreaView edges={['top', 'bottom']} style={styles.playSafe}>
      <View style={styles.hud}>
        <Pressable accessibilityLabel="Leave this floor" accessibilityRole="button" onPress={onClose} style={styles.hudButton}><Text style={styles.hudButtonText}>×</Text></Pressable>
        <View style={styles.hudCenter}>
          <Text style={[styles.hudFloor, { color: floor.accent }]}>FLOOR {floor.id} · ROOM {run.roomIndex + 1}/{DUNGEON_ROOMS.length}</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: floor.accent }]} /></View>
        </View>
        <Pressable accessibilityLabel={run.status === 'paused' ? 'Resume game' : 'Pause game'} accessibilityRole="button" onPress={onPause} style={styles.hudButton}><Text style={styles.hudButtonText}>{run.status === 'paused' ? '▶' : 'Ⅱ'}</Text></Pressable>
      </View>
      <View style={styles.statsRow}>
        <View accessibilityLabel={`${run.hearts} of ${MAX_HEARTS} hearts`} style={styles.heartsRow}>{Array.from({ length: MAX_HEARTS }, (_, index) => <Text key={index} style={[styles.heart, index >= run.hearts && styles.emptyHeart]}>♥</Text>)}</View>
        <Text style={styles.statText}>◉ {run.coins}</Text>
        <Text style={styles.statText}>✦ {run.savingsStars}</Text>
        <Text style={styles.statText}>{run.score.toString().padStart(4, '0')}</Text>
      </View>
      <View style={styles.roomFrame}>
        <ImageBackground source={dungeonRoomBackground} resizeMode="stretch" style={styles.roomWorld}>
          <View style={[styles.floorTint, { backgroundColor: floor.glow }]} />
          <View style={styles.roomNamePlate}><Text style={styles.roomName}>{room.title.toUpperCase()}</Text><Text style={[styles.roomObjective, roomClear && { color: floor.accent }]}>{roomClear ? 'DOOR OPEN · GO NORTH' : room.kind === 'treasure' ? 'DEFEAT THE GUARD · CLAIM ALL LOOT' : room.enemies.length ? 'DEFEAT EVERY GUARD' : 'FIND THE NORTH DOOR'}</Text></View>
          <View style={[styles.doorSeal, roomClear && styles.doorOpen]}><Text style={styles.doorSealText}>{roomClear ? '▲' : '✦'}</Text></View>
          {room.obstacles.map(obstacle => <RoomObstacleSprite key={obstacle.id} obstacle={obstacle} spikePhase={getSpikePhase(run, obstacle.id)} />)}
          {run.loot.filter(item => !item.collected).map(item => <DungeonLootSprite key={item.id} item={item} />)}
          {run.enemies.filter(item => item.hp > 0).map((item, index) => <DungeonEnemySprite clockMs={run.clockMs} enemy={item} index={index} key={item.id} />)}
          <View style={[styles.roomKnightWrap, roomPoint(run.hero), { opacity: dodging ? 0.68 : 1, transform: [{ translateY: knightMotion.lift }, { rotate: `${knightMotion.tilt}deg` }, { scale: dodging ? 1.16 : 1 }] }]}>
            <View style={styles.shadow} />
            <Image source={knightSprite} contentFit="contain" style={styles.roomKnight} />
            <View style={[styles.swordArc, { opacity: swordMotion.opacity, transform: [{ rotate: `${swordMotion.rotation}deg` }, { scale: swordMotion.scale }] }]}><Text style={styles.swordGlyph}>⚔</Text></View>
          </View>
          {run.status === 'paused' && <View style={styles.pauseOverlay}><Text style={styles.pauseTitle}>TOWER PAUSED</Text><Pressable onPress={onPause} style={styles.heroButton}><Text style={styles.heroButtonText}>RESUME EXPLORING</Text></Pressable></View>}
        </ImageBackground>
      </View>
      <View style={styles.controls}>
        <VirtualJoystick enabled={run.status === 'playing'} onChange={onMoveInput} />
        <View style={styles.actionCluster}>
          <Pressable accessibilityLabel="Dodge" accessibilityRole="button" onPress={onDodge} style={({ pressed }) => [styles.dodgeButton, pressed && styles.controlPressed]}><Text style={styles.dodgeText}>➜</Text><Text style={styles.actionLabel}>DODGE</Text></Pressable>
          <Pressable accessibilityLabel="Attack" accessibilityRole="button" onPress={onAttack} style={({ pressed }) => [styles.attackButton, { borderColor: floor.accent }, pressed && styles.controlPressed]}><Text style={styles.attackText}>⚔</Text><Text style={styles.actionLabel}>STRIKE</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  </View>;
}

function roomPoint(point: Vector2) {
  return { left: `${7 + point.x * 86}%` as const, top: `${15 + point.y * 78}%` as const };
}

function RoomObstacleSprite({ obstacle, spikePhase }: { obstacle: RoomObstacle; spikePhase: ReturnType<typeof getSpikePhase> }) {
  const box = {
    left: `${7 + obstacle.x * 86}%` as const,
    top: `${15 + obstacle.y * 78}%` as const,
    width: `${obstacle.width * 86}%` as const,
    height: `${obstacle.height * 78}%` as const,
  };
  if (obstacle.kind === 'spikes') return <View style={[styles.roomObstacle, styles.spikes, spikePhase === 'warning' && styles.spikesWarning, spikePhase === 'active' && styles.spikesActive, box]}><Text style={[styles.spikesText, spikePhase === 'active' && styles.spikesTextActive]}>{spikePhase === 'active' ? '▲ ▲ ▲' : '·  ·  ·'}</Text></View>;
  return <View style={[styles.roomObstacle, obstacle.kind === 'crate' ? styles.crate : styles.pillar, box]}><Text style={styles.obstacleGlyph}>{obstacle.kind === 'crate' ? '×' : '◆'}</Text></View>;
}

function DungeonEnemySprite({ clockMs, enemy, index }: { clockMs: number; enemy: DungeonRun['enemies'][number]; index: number }) {
  const size = enemy.boss ? 96 : 68;
  const motion = getEnemyMotion(clockMs, index);
  return <View style={[styles.roomEnemy, roomPoint(enemy), { width: size, height: size, marginLeft: -size / 2, marginTop: -size * 0.68, transform: [{ translateY: motion.lift }, { rotate: `${motion.tilt}deg` }] }]}>
    <View style={styles.enemyHpTrack}><View style={[styles.enemyHpFill, { width: `${enemy.hp / enemy.maxHp * 100}%` }]} /></View>
    <View style={[styles.eventShadow, { width: size * 0.7 }]} />
    <Image source={goblinSprite} contentFit="contain" style={styles.encounterImage} />
  </View>;
}

function DungeonLootSprite({ item }: { item: DungeonRun['loot'][number] }) {
  return <View style={[styles.roomLoot, roomPoint(item)]}>
    {item.kind === 'coin' ? <View style={styles.coin}><Text style={styles.coinText}>$</Text></View> : <View style={styles.relic}><Text style={styles.relicText}>✦</Text></View>}
  </View>;
}

function VirtualJoystick({ enabled, onChange }: { enabled: boolean; onChange(input: Vector2): void }) {
  const [knob, setKnob] = useState<Vector2>({ x: 0, y: 0 });
  useEffect(() => {
    if (enabled) return;
    setKnob({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  }, [enabled, onChange]);
  useEffect(() => () => onChange({ x: 0, y: 0 }), [onChange]);
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => enabled,
    onMoveShouldSetPanResponder: () => enabled,
    onPanResponderMove: (_, gesture) => {
      const radius = 38;
      const magnitude = Math.max(1, Math.hypot(gesture.dx, gesture.dy));
      const scale = Math.min(1, radius / magnitude);
      const next = { x: gesture.dx * scale, y: gesture.dy * scale };
      setKnob(next);
      onChange({ x: next.x / radius, y: next.y / radius });
    },
    onPanResponderRelease: () => { setKnob({ x: 0, y: 0 }); onChange({ x: 0, y: 0 }); },
    onPanResponderTerminate: () => { setKnob({ x: 0, y: 0 }); onChange({ x: 0, y: 0 }); },
  }), [enabled, onChange]);
  return <View accessibilityLabel="Movement joystick" style={[styles.joystick, !enabled && styles.controlDisabled]} {...responder.panHandlers}>
    <View style={[styles.joystickKnob, { transform: [{ translateX: knob.x }, { translateY: knob.y }] }]}><Text style={styles.joystickGlyph}>✥</Text></View>
  </View>;
}

function ResultScreen({ floor, isDemo, onMap, onRetry, onRetryUpload, profileRefreshError, run, submission, submitError, submitting, uploadFailed }: {
  floor: TowerFloor;
  isDemo: boolean;
  onMap(): void;
  onRetry(): void;
  onRetryUpload(): void;
  profileRefreshError: string;
  run: DungeonRun;
  submission: TowerSessionResult | null;
  submitError: string;
  submitting: boolean;
  uploadFailed: boolean;
}) {
  const won = run.status === 'victory';
  return <ImageBackground source={towerBackground} blurRadius={won ? 0 : 4} resizeMode="cover" style={styles.fill}>
    <View style={styles.resultShade} />
    <SafeAreaView edges={['top', 'bottom']} style={styles.resultSafe}>
      <Text style={styles.resultKicker}>{won ? `FLOOR ${floor.id} CLEARED` : 'THE TOWER PREVAILS'}</Text>
      <Text style={[styles.resultTitle, { color: won ? floor.accent : bb.colors.coral }]}>{won ? 'VICTORY' : 'DEFEATED'}</Text>
      <Image source={knightSprite} contentFit="contain" style={[styles.resultKnight, !won && styles.resultKnightDefeated]} />
      <View style={styles.resultCard}>
        <View style={styles.resultStat}><Text style={styles.resultValue}>{run.score}</Text><Text style={styles.resultLabel}>SCORE</Text></View>
        <View style={styles.resultStat}><Text style={styles.resultValue}>{run.coins}</Text><Text style={styles.resultLabel}>COINS</Text></View>
        <View style={styles.resultStat}><Text style={styles.resultValue}>{run.savingsStars}</Text><Text style={styles.resultLabel}>RELICS</Text></View>
      </View>
      <View style={styles.xpNotice}>
        {submitting && <><ActivityIndicator color={floor.accent} /><Text style={styles.xpText}>RECORDING YOUR RUN…</Text></>}
        {isDemo && <Text style={styles.xpText}>DEMO RUN · NO ACCOUNT XP AWARDED</Text>}
        {submission && !isDemo && <Text style={styles.xpText}>+{submission.awardedXp} XP ADDED TO YOUR FINANCE LEVEL</Text>}
        {!!submitError && <Text style={styles.errorText}>{submitError}</Text>}
        {!!profileRefreshError && <Text style={styles.warningText}>{profileRefreshError}</Text>}
      </View>
      {uploadFailed && <Pressable accessibilityRole="button" onPress={onRetryUpload} style={styles.uploadRetryButton}><Text style={styles.uploadRetryText}>RETRY XP UPLOAD</Text></Pressable>}
      <Pressable accessibilityRole="button" disabled={submitting} onPress={onRetry} style={[styles.heroButton, submitting && styles.disabledButton]}><Text style={styles.heroButtonText}>CLIMB AGAIN</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={submitting} onPress={onMap} style={[styles.secondaryButton, submitting && styles.disabledButton]}><Text style={styles.secondaryButtonText}>RETURN TO TOWER MAP</Text></Pressable>
    </SafeAreaView>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050812' }, fill: { flex: 1 },
  vignette: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3, 5, 12, 0.40)' },
  introSafe: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  closeButton: { alignSelf: 'flex-end', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(5,8,18,0.78)', borderWidth: 1, borderColor: '#7B8290', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#FFF4D6', fontSize: 30, lineHeight: 32 },
  introCopy: { alignItems: 'center', gap: 9, marginTop: 12 },
  kicker: { color: '#F2B94B', fontSize: 10, fontWeight: '900', letterSpacing: 2.2 },
  gameTitle: { color: '#FFF4D6', textAlign: 'center', fontFamily: bb.fonts.display, fontSize: 43, lineHeight: 42, fontWeight: '900', letterSpacing: 1, textShadowColor: '#3B0C08', textShadowOffset: { width: 4, height: 5 }, textShadowRadius: 0 },
  rule: { width: 84, height: 3, backgroundColor: '#F2B94B' },
  introBody: { maxWidth: 330, color: '#D8DFEC', textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '600' },
  introKnight: { flex: 1, width: '76%', minHeight: 240, marginVertical: -12 },
  heroButton: { width: '100%', minHeight: 54, backgroundColor: '#F2B94B', borderWidth: 3, borderTopColor: '#FFE4A0', borderLeftColor: '#FFE4A0', borderRightColor: '#8A4A12', borderBottomColor: '#8A4A12', borderRadius: 5, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  heroButtonText: { color: '#17100A', fontWeight: '900', letterSpacing: 1.4, fontSize: 13 },
  mapShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,7,16,0.78)' },
  mapHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  iconButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#151C2C', borderWidth: 1, borderColor: '#66728A', borderRadius: 6 },
  iconButtonText: { color: '#FFF4D6', fontSize: 34, lineHeight: 38 }, headerSpacer: { width: 46 },
  mapTitleWrap: { flex: 1, alignItems: 'center', gap: 3 }, mapKicker: { color: '#F2B94B', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  mapTitle: { color: '#FFF4D6', fontFamily: bb.fonts.display, fontSize: 22, fontWeight: '900', letterSpacing: 0.8 },
  floorList: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },
  floorCard: { minHeight: 92, backgroundColor: 'rgba(12,17,31,0.94)', borderWidth: 2, borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11 },
  floorLocked: { opacity: 0.62, borderColor: '#4A5160' }, floorPressed: { transform: [{ scale: 0.985 }] },
  floorNumber: { width: 48, height: 58, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }, floorNumberText: { color: '#12131A', fontSize: 27, fontWeight: '900' },
  floorCopy: { flex: 1, gap: 4 }, floorName: { color: '#AEB6C5', fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  floorSubtitle: { color: '#B8C1D2', fontSize: 11, lineHeight: 15 }, floorBoss: { color: '#78869F', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 }, floorArrow: { color: '#FFF4D6', fontSize: 28 },
  demoButton: { minHeight: 44, borderWidth: 1, borderColor: '#7B6E45', backgroundColor: 'rgba(52,43,20,0.85)', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  demoButtonText: { color: '#F2B94B', fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  floorTint: { ...StyleSheet.absoluteFillObject, opacity: 0.10 }, playRoot: { flex: 1, backgroundColor: '#050812' }, playSafe: { flex: 1 },
  hud: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingTop: 8 }, hudButton: { width: 40, height: 40, borderRadius: 4, backgroundColor: 'rgba(8,12,23,0.88)', borderWidth: 1, borderColor: '#78869F', alignItems: 'center', justifyContent: 'center' }, hudButtonText: { color: '#FFF4D6', fontWeight: '900', fontSize: 19 },
  hudCenter: { flex: 1, gap: 5 }, hudFloor: { textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  progressTrack: { height: 8, backgroundColor: '#111827', borderWidth: 1, borderColor: '#69748A', overflow: 'hidden' }, progressFill: { height: '100%' },
  statsRow: { marginHorizontal: 10, marginTop: 7, minHeight: 34, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(7,10,19,0.87)', borderWidth: 1, borderColor: '#5A6478' }, statText: { color: '#FFF4D6', fontSize: 13, fontWeight: '900' }, heartsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 }, heart: { color: '#F04D5F', fontSize: 18, lineHeight: 20, textShadowColor: '#5A1018', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 0 }, emptyHeart: { color: '#313A4C', textShadowColor: '#101520' },
  roomFrame: { flex: 1, marginHorizontal: 7, marginTop: 6, borderWidth: 2, borderColor: '#55637A', borderRadius: 7, overflow: 'hidden', backgroundColor: '#07101C' },
  roomWorld: { flex: 1, position: 'relative', overflow: 'hidden' },
  roomNamePlate: { position: 'absolute', top: 7, left: 8, right: 8, zIndex: 12, alignItems: 'center' },
  roomName: { color: '#FFF4D6', fontSize: 12, lineHeight: 15, fontWeight: '900', letterSpacing: 1.3, textShadowColor: '#050812', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  roomObjective: { color: '#BFC9DA', marginTop: 2, fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  doorSeal: { position: 'absolute', zIndex: 4, top: '13%', left: '50%', width: 54, height: 25, marginLeft: -27, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(91,24,33,0.90)', borderWidth: 2, borderColor: '#EC6A61', borderRadius: 4 },
  doorOpen: { backgroundColor: 'rgba(34,86,74,0.90)', borderColor: '#78E1B3' }, doorSealText: { color: '#FFF4D6', fontSize: 15, fontWeight: '900' },
  roomKnightWrap: { position: 'absolute', zIndex: 8, width: 78, height: 90, marginLeft: -39, marginTop: -62, alignItems: 'center', justifyContent: 'flex-end' },
  roomKnight: { width: 78, height: 90, zIndex: 2 }, shadow: { position: 'absolute', bottom: 6, width: 52, height: 12, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.58)' }, swordArc: { position: 'absolute', zIndex: 4, right: -27, top: 22, width: 62, height: 62, alignItems: 'flex-end', justifyContent: 'flex-start', transformOrigin: 'left bottom' }, swordGlyph: { color: '#FFF4D6', fontSize: 33, lineHeight: 38, textShadowColor: '#F2B94B', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2 },
  roomObstacle: { position: 'absolute', zIndex: 3, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pillar: { backgroundColor: 'rgba(42,51,68,0.94)', borderWidth: 2, borderTopColor: '#8792A4', borderLeftColor: '#737F93', borderRightColor: '#171E2B', borderBottomColor: '#111724', borderRadius: 5 },
  crate: { backgroundColor: 'rgba(92,53,32,0.95)', borderWidth: 2, borderTopColor: '#D09053', borderLeftColor: '#B27645', borderRightColor: '#402415', borderBottomColor: '#321B10', borderRadius: 3 },
  spikes: { backgroundColor: 'rgba(54,20,28,0.42)', borderWidth: 1, borderColor: 'rgba(117,77,84,0.70)' }, spikesWarning: { backgroundColor: 'rgba(202,126,32,0.48)', borderColor: '#F2B94B' }, spikesActive: { backgroundColor: 'rgba(150,20,34,0.86)', borderColor: '#FF7D82', transform: [{ scale: 1.03 }] }, spikesText: { color: '#C9934B', fontSize: 15, fontWeight: '900', letterSpacing: 1 }, spikesTextActive: { color: '#FFF4D6', fontSize: 12, letterSpacing: -2, textShadowColor: '#8A111D', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 0 }, obstacleGlyph: { color: '#D6DBE4', fontSize: 18, fontWeight: '900', opacity: 0.82 },
  roomEnemy: { position: 'absolute', zIndex: 7, alignItems: 'center', justifyContent: 'flex-end' }, enemyHpTrack: { position: 'absolute', zIndex: 4, top: 0, width: '74%', height: 5, backgroundColor: '#25090E', borderWidth: 1, borderColor: '#090B10' }, enemyHpFill: { height: '100%', backgroundColor: '#EC6A61' },
  roomLoot: { position: 'absolute', zIndex: 5, width: 40, height: 40, marginLeft: -20, marginTop: -20, alignItems: 'center', justifyContent: 'center' },
  encounterImage: { width: '115%', height: '115%', zIndex: 2 }, eventShadow: { position: 'absolute', bottom: 0, height: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)' },
  coin: { width: '72%', aspectRatio: 1, borderRadius: 999, backgroundColor: '#F2B94B', borderWidth: 3, borderTopColor: '#FFF0A6', borderLeftColor: '#FFF0A6', borderBottomColor: '#9D5514', borderRightColor: '#9D5514', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] }, coinText: { color: '#6E3B0A', fontWeight: '900', fontSize: 18 },
  relic: { width: '68%', aspectRatio: 1, backgroundColor: '#66D5E8', borderWidth: 2, borderColor: '#D3FAFF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] }, relicText: { color: '#082C3B', fontSize: 18, transform: [{ rotate: '-45deg' }] }, trapText: { color: '#D0D5DF', textShadowColor: '#6A1520', textShadowOffset: { width: 2, height: 3 }, textShadowRadius: 0, transform: [{ rotate: '180deg' }] },
  pauseOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,6,13,0.88)', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 22, zIndex: 20 }, pauseTitle: { color: '#FFF4D6', fontFamily: bb.fonts.display, fontSize: 30, fontWeight: '900' },
  controls: { height: 130, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8, backgroundColor: 'rgba(5,8,17,0.94)', borderTopWidth: 1, borderTopColor: '#5F697D' },
  joystick: { width: 108, height: 108, borderRadius: 54, backgroundColor: 'rgba(31,42,60,0.90)', borderWidth: 3, borderTopColor: '#7E8BA3', borderLeftColor: '#7E8BA3', borderRightColor: '#0A0F1A', borderBottomColor: '#0A0F1A', alignItems: 'center', justifyContent: 'center' },
  joystickKnob: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#43516A', borderWidth: 2, borderTopColor: '#AAB5C7', borderLeftColor: '#AAB5C7', borderRightColor: '#1A2231', borderBottomColor: '#1A2231', alignItems: 'center', justifyContent: 'center' }, joystickGlyph: { color: '#FFF4D6', fontSize: 21, fontWeight: '900' },
  actionCluster: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  dodgeButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#24475A', borderWidth: 2, borderColor: '#66D5E8', alignItems: 'center', justifyContent: 'center' }, dodgeText: { color: '#BDEFF7', fontSize: 23, lineHeight: 25, transform: [{ rotate: '-35deg' }] },
  attackButton: { width: 82, height: 82, backgroundColor: '#8C261C', borderWidth: 3, borderRadius: 41, alignItems: 'center', justifyContent: 'center' }, attackText: { color: '#FFF4D6', fontSize: 27, lineHeight: 29 }, actionLabel: { color: '#FFD7AE', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, controlPressed: { transform: [{ scale: 0.93 }], opacity: 0.82 },
  controlDisabled: { opacity: 0.45 },
  resultShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,5,12,0.68)' }, resultSafe: { flex: 1, alignItems: 'center', paddingHorizontal: 22, paddingVertical: 22, gap: 10 }, resultKicker: { color: '#D6DFEE', fontSize: 11, fontWeight: '900', letterSpacing: 1.7, marginTop: 8 }, resultTitle: { fontFamily: bb.fonts.display, fontSize: 45, lineHeight: 48, fontWeight: '900', letterSpacing: 2, textShadowColor: '#111', textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0 },
  resultKnight: { flex: 1, minHeight: 220, width: '66%' }, resultKnightDefeated: { transform: [{ rotate: '-7deg' }], opacity: 0.65 },
  resultCard: { width: '100%', flexDirection: 'row', backgroundColor: 'rgba(10,14,26,0.93)', borderWidth: 2, borderColor: '#69748A', paddingVertical: 14 }, resultStat: { flex: 1, alignItems: 'center', gap: 3, borderRightWidth: 1, borderRightColor: '#394459' }, resultValue: { color: '#FFF4D6', fontSize: 24, fontWeight: '900' }, resultLabel: { color: '#8D9AB1', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  xpNotice: { minHeight: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, xpText: { color: '#F2B94B', textAlign: 'center', fontSize: 11, fontWeight: '900' }, errorText: { color: '#FF9AA3', textAlign: 'center', fontSize: 11, lineHeight: 15 }, warningText: { color: '#A9DDEA', textAlign: 'center', fontSize: 10, lineHeight: 14 },
  uploadRetryButton: { width: '100%', minHeight: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24475A', borderWidth: 1, borderColor: '#66D5E8', borderRadius: 5 }, uploadRetryText: { color: '#BDEFF7', fontSize: 11, fontWeight: '900', letterSpacing: 1 }, disabledButton: { opacity: 0.5 },
  secondaryButton: { width: '100%', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#8490A7', backgroundColor: 'rgba(12,17,29,0.85)', borderRadius: 5 }, secondaryButtonText: { color: '#E5EBF5', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
