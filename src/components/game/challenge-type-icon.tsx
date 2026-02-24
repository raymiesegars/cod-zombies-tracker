'use client';

import {
  Target,
  Shield,
  CircleOff,
  Package,
  Home,
  PackageOpen,
  Crosshair,
  ZapOff,
  Timer,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { ChallengeType } from '@/types';

const CHALLENGE_TYPE_ICONS: Record<ChallengeType, LucideIcon> = {
  HIGHEST_ROUND: Target,
  NO_DOWNS: Shield,
  NO_PERKS: CircleOff,
  NO_PACK: Package,
  STARTING_ROOM: Home,
  STARTING_ROOM_JUG_SIDE: Home,
  STARTING_ROOM_QUICK_SIDE: Home,
  ONE_BOX: PackageOpen,
  PISTOL_ONLY: Crosshair,
  NO_POWER: ZapOff,
  NO_MAGIC: Sparkles,
  ROUND_30_SPEEDRUN: Timer,
  ROUND_50_SPEEDRUN: Timer,
  ROUND_70_SPEEDRUN: Timer,
  ROUND_100_SPEEDRUN: Timer,
  ROUND_200_SPEEDRUN: Timer,
  ROUND_255_SPEEDRUN: Timer,
  ROUND_935_SPEEDRUN: Timer,
  ROUND_999_SPEEDRUN: Timer,
  ROUND_10_SPEEDRUN: Timer,
  ROUND_20_SPEEDRUN: Timer,
  EXFIL_SPEEDRUN: Timer,
  EXFIL_R21_SPEEDRUN: Timer,
  BUILD_EE_SPEEDRUN: Timer,
  SUPER_30_SPEEDRUN: Timer,
  NO_JUG: CircleOff,
  NO_ARMOR: Shield,
  NO_BLITZ: CircleOff,
  NO_ATS: Crosshair,
  NO_MANS_LAND: Target,
  RUSH: Target,
  PURIST: Shield,
  INSTAKILL_ROUND_SPEEDRUN: Timer,
  EASTER_EGG_SPEEDRUN: Timer,
  GHOST_AND_SKULLS: Timer,
  ALIENS_BOSS_FIGHT: Timer,
  CRYPTID_FIGHT: Timer,
  MEPHISTOPHELES: Timer,
};

const DEFAULT_ICON = Target;

type ChallengeTypeIconProps = {
  type: ChallengeType | string;
  className?: string;
  size?: number;
};

export function ChallengeTypeIcon({ type, className, size = 20 }: ChallengeTypeIconProps) {
  const Icon = CHALLENGE_TYPE_ICONS[type as ChallengeType] ?? DEFAULT_ICON;
  return <Icon className={className} size={size} style={{ width: size, height: size }} />;
}
