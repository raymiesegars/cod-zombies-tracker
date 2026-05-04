import { strict as assert } from 'node:assert';
import { validateMapCloneCreatePayload } from '../src/lib/admin/map-clone';
import type { MapCloneCreatePayload } from '../src/lib/admin/map-clone-types';

function buildValidPayload(): MapCloneCreatePayload {
  return {
    gameId: 'game-1',
    sourceMapId: 'map-1',
    map: {
      name: 'Clone Target',
      slug: 'clone-target',
      description: 'desc',
      imageUrl: '/images/maps/clone-target.webp',
      isDlc: true,
      isCustom: false,
      steamWorkshopUrl: null,
      releaseDate: null,
      roundCap: 999,
      order: 8,
    },
    expectedChallengeTypes: ['HIGHEST_ROUND', 'NO_DOWNS'],
    challenges: [
      {
        sourceSlug: 'highest-round',
        name: 'Highest Round',
        slug: 'highest-round',
        description: null,
        type: 'HIGHEST_ROUND',
        roundTarget: null,
        xpReward: 0,
        isActive: true,
      },
      {
        sourceSlug: 'no-downs',
        name: 'No Downs',
        slug: 'no-downs',
        description: null,
        type: 'NO_DOWNS',
        roundTarget: null,
        xpReward: 0,
        isActive: true,
      },
    ],
    easterEggs: [],
    achievements: [
      {
        sourceSlug: 'round-20',
        name: 'Round 20',
        slug: 'round-20',
        description: null,
        iconUrl: null,
        type: 'ROUND_MILESTONE',
        criteria: { round: 20, challengeType: 'HIGHEST_ROUND' },
        xpReward: 50,
        rarity: 'COMMON',
        isActive: true,
        difficulty: null,
        mapScoped: true,
        challengeSourceSlug: 'highest-round',
        easterEggSourceSlug: null,
      },
    ],
  };
}

function run() {
  const valid = buildValidPayload();
  assert.equal(validateMapCloneCreatePayload(valid), null, 'valid payload should pass');

  const missingType = buildValidPayload();
  missingType.challenges = missingType.challenges.filter((challenge) => challenge.type !== 'NO_DOWNS');
  assert.match(
    validateMapCloneCreatePayload(missingType) ?? '',
    /Missing required challenge types/i,
    'missing expected challenge type should fail'
  );

  const invalidCriteria = buildValidPayload();
  invalidCriteria.achievements = [
    {
      ...invalidCriteria.achievements[0]!,
      criteria: [] as unknown as Record<string, unknown>,
    },
  ];
  assert.match(
    validateMapCloneCreatePayload(invalidCriteria) ?? '',
    /criteria must be an object/i,
    'invalid achievement criteria should fail'
  );

  const eeIndependentNaming = buildValidPayload();
  eeIndependentNaming.easterEggs = [
    {
      sourceSlug: 'main-quest',
      name: 'The Main Egg',
      slug: 'the-main-egg',
      description: null,
      type: 'MAIN_QUEST',
      optimalRound: null,
      xpReward: 5000,
      playerCountRequirement: null,
      rewardsDescription: null,
      videoEmbedUrl: null,
      variantTag: null,
      categoryTag: null,
      isActive: true,
      steps: [{ order: 1, label: 'Do step one', imageUrl: null, buildableReferenceSlug: null }],
    },
  ];
  eeIndependentNaming.achievements = [
    {
      sourceSlug: 'ee-main',
      name: 'Totally Different Achievement Name',
      slug: 'different-achievement-name',
      description: null,
      iconUrl: null,
      type: 'EASTER_EGG_COMPLETE',
      criteria: {},
      xpReward: 5000,
      rarity: 'UNCOMMON',
      isActive: true,
      difficulty: null,
      mapScoped: true,
      challengeSourceSlug: null,
      easterEggSourceSlug: 'main-quest',
    },
  ];
  assert.equal(
    validateMapCloneCreatePayload(eeIndependentNaming),
    null,
    'EE achievements should support independent naming from EE records'
  );

  console.log('map clone validation tests passed');
}

run();
