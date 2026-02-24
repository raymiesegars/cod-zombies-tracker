/**
 * No Jug support: maps that have noJugWR can log runs with No Jug as a modifier (toggle), not a challenge.
 * Used by edit page, leaderboards, and API to show No Jug filter when applicable.
 */

import { getWaWMapConfig } from '@/lib/waw/waw-map-config';
import { getBo1MapConfig } from '@/lib/bo1/bo1-map-config';
import { getBo2MapConfig } from '@/lib/bo2/bo2-map-config';
import { getBo3MapConfig } from '@/lib/bo3/bo3-map-config';
import { getBocwMapConfig } from '@/lib/bocw/bocw-map-config';
import { getBo6MapConfig } from '@/lib/bo6/bo6-map-config';
import { getBo7MapConfig } from '@/lib/bo7/bo7-map-config';
import { getVanguardMapConfig } from '@/lib/vanguard/vanguard-map-config';

/** Whether this map supports No Jug as a run modifier (toggle) based on noJugWR in config. */
export function hasNoJugSupport(slug: string, gameShortName: string | null | undefined): boolean {
  if (!slug || !gameShortName) return false;
  switch (gameShortName) {
    case 'WAW':
      return getWaWMapConfig(slug)?.noJugWR != null;
    case 'BO1':
      return (getBo1MapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    case 'BO2':
      return (getBo2MapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    case 'BO3':
      return (getBo3MapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    case 'BOCW':
      return (getBocwMapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    case 'BO6':
      return (getBo6MapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    case 'BO7':
      return (getBo7MapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    case 'VANGUARD':
      return (getVanguardMapConfig(slug) as { noJugWR?: number } | null)?.noJugWR != null;
    default:
      return false;
  }
}
