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
