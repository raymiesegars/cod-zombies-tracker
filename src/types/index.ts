import type {
  User,
  Game,
  Map,
  Challenge,
  EasterEgg,
  ChallengeLog,
  EasterEggLog,
  Achievement,
  UserAchievement,
  LevelThreshold,
  PlayerCount,
  ChallengeType,
  EasterEggType,
  AchievementType,
  AchievementRarity,
} from '@prisma/client';

export type {
  User,
  Game,
  Map,
  Challenge,
  EasterEgg,
  ChallengeLog,
  EasterEggLog,
  Achievement,
  UserAchievement,
  LevelThreshold,
  PlayerCount,
  ChallengeType,
  EasterEggType,
  AchievementType,
  AchievementRarity,
};

export type MapWithGame = Map & {
  game: Game;
};

export type MapWithDetails = Map & {
  game: Game;
  challenges: Challenge[];
  easterEggs: EasterEgg[];
};

export type ChallengeLogWithDetails = ChallengeLog & {
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  challenge: Challenge;
  map: Map;
};

export type EasterEggLogWithDetails = EasterEggLog & {
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  easterEgg: EasterEgg;
  map: Map;
};

export type UserWithStats = User & {
  _count: {
    challengeLogs: number;
    easterEggLogs: number;
    userAchievements: number;
  };
};

export type UserProfile = User & {
  challengeLogs: (ChallengeLog & {
    map: Map;
    challenge: Challenge;
  })[];
  easterEggLogs: (EasterEggLog & {
    map: Map;
    easterEgg: EasterEgg;
  })[];
  userAchievements: (UserAchievement & {
    achievement: Achievement;
  })[];
};

export type LeaderboardEntry = {
  rank: number;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'avatarPreset' | 'level'>;
  value: number;
  playerCount: PlayerCount;
  proofUrls?: string[];
  proofUrl?: string | null;
  completedAt: Date;
  /** For EE time leaderboard: round the EE was completed on */
  roundCompleted?: number;
  /** Link to run detail: log id and type so card click can navigate to /maps/[slug]/run/[type]/[logId] */
  logId?: string;
  runType?: 'challenge' | 'easter-egg';
  /** Run was verified by an admin */
  isVerified?: boolean;
};

export type UserMapStats = {
  mapId: string;
  mapSlug: string;
  mapName: string;
  mapImageUrl: string | null;
  gameShortName: string;
  highestRound: number;
  highestRoundDifficulty?: string;
  hasCompletedMainEE: boolean;
  challengesCompleted: number;
};

export type UserAchievementWithAchievement = UserAchievement & {
  achievement: Achievement;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export type ChallengeLogFormData = {
  challengeId: string;
  mapId: string;
  roundReached: number;
  playerCount: PlayerCount;
  proofUrls?: string[];
  screenshotUrl?: string;
  notes?: string;
};

export type EasterEggLogFormData = {
  easterEggId: string;
  mapId: string;
  roundCompleted?: number;
  playerCount: PlayerCount;
  isSolo: boolean;
  isNoGuide: boolean;
  proofUrls?: string[];
  screenshotUrl?: string;
  notes?: string;
};

export type MapFilters = {
  gameId?: string;
  isDlc?: boolean;
  search?: string;
};

export type LeaderboardFilters = {
  playerCount?: PlayerCount;
  challengeType?: ChallengeType;
};
