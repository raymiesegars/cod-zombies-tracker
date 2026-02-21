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
  type LucideIcon,
} from 'lucide-react';
import type { ChallengeType } from '@/types';

const CHALLENGE_TYPE_ICONS: Record<ChallengeType, LucideIcon> = {
  HIGHEST_ROUND: Target,
  NO_DOWNS: Shield,
  NO_PERKS: CircleOff,
  NO_PACK: Package,
  STARTING_ROOM: Home,
  ONE_BOX: PackageOpen,
  PISTOL_ONLY: Crosshair,
  NO_POWER: ZapOff,
  ROUND_30_SPEEDRUN: Timer,
  ROUND_50_SPEEDRUN: Timer,
  ROUND_70_SPEEDRUN: Timer,
  ROUND_100_SPEEDRUN: Timer,
  EASTER_EGG_SPEEDRUN: Timer,
  GHOST_AND_SKULLS: Timer,
  ALIENS_BOSS_FIGHT: Timer,
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
