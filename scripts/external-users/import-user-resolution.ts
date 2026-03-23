import { createHash } from 'crypto';
import type { PrismaClient } from '@prisma/client';

type ExternalSource = 'ZWR' | 'SRC';

type ResolveImportTargetUserInput = {
  prisma: PrismaClient;
  source: ExternalSource;
  sourcePlayerName: string;
  explicitCztUser?: string | null;
  mappedUserId?: string | null;
  allowAutoUser: boolean;
  dryRun: boolean;
  resolveExplicitUser: (cztUser: string) => Promise<{ id: string }>;
};

type ResolvedUser = {
  id: string;
  resolution: 'explicit' | 'mapped' | 'identity' | 'placeholder_created' | 'placeholder_dry_run';
};

const DRY_RUN_PLACEHOLDER_ID = 'dry-run-external-user';

function normalizeExternalKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function shortHash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 10);
}

function toSourcePrefix(source: ExternalSource): string {
  return source.toLowerCase();
}

function baseUsername(source: ExternalSource, sourcePlayerName: string): string {
  const prefix = toSourcePrefix(source);
  const slug = sourcePlayerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const core = slug || 'user';
  const combined = `${prefix}_${core}`;
  return combined.slice(0, 20);
}

async function getUniqueUsername(prisma: PrismaClient, base: string): Promise<string> {
  const cleanBase = (base || 'external_user').slice(0, 20);
  let candidate = cleanBase;
  let n = 2;
  while (true) {
    const existing = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!existing) return candidate;
    const suffix = `_${n}`;
    candidate = `${cleanBase.slice(0, Math.max(1, 20 - suffix.length))}${suffix}`;
    n++;
  }
}

async function getUniqueExternalIdentifiers(
  prisma: PrismaClient,
  source: ExternalSource,
  normalizedKey: string
): Promise<{ email: string; supabaseId: string }> {
  const prefix = toSourcePrefix(source);
  const hash = shortHash(`${prefix}:${normalizedKey}`);
  let i = 0;
  while (true) {
    const suffix = i === 0 ? '' : `-${i}`;
    const email = `${prefix}.${hash}${suffix}@external.local`;
    const supabaseId = `external:${prefix}:${hash}${suffix}`;
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { supabaseId }] },
      select: { id: true },
    });
    if (!existing) return { email, supabaseId };
    i++;
  }
}

function isMissingSchemaError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const code = (error as { code?: string }).code;
  return code === 'P2021' || code === 'P2022';
}

async function findIdentityUserId(
  prisma: PrismaClient,
  source: ExternalSource,
  externalKey: string
): Promise<string | null> {
  try {
    const row = await prisma.externalAccountIdentity.findUnique({
      where: { source_externalKey: { source, externalKey } },
      select: { userId: true },
    });
    return row?.userId ?? null;
  } catch (error) {
    if (isMissingSchemaError(error)) return null;
    throw error;
  }
}

async function upsertIdentity(
  prisma: PrismaClient,
  source: ExternalSource,
  externalName: string,
  externalKey: string,
  userId: string
): Promise<void> {
  try {
    await prisma.externalAccountIdentity.upsert({
      where: { source_externalKey: { source, externalKey } },
      update: { externalName, userId },
      create: { source, externalName, externalKey, userId },
    });
  } catch (error) {
    if (isMissingSchemaError(error)) return;
    throw error;
  }
}

async function findCrossSourceIdentityUserId(
  prisma: PrismaClient,
  source: ExternalSource,
  externalKey: string
): Promise<string | null> {
  const otherSource: ExternalSource = source === 'ZWR' ? 'SRC' : 'ZWR';
  return findIdentityUserId(prisma, otherSource, externalKey);
}

async function findPlaceholderByDisplayName(
  prisma: PrismaClient,
  sourcePlayerName: string
): Promise<string | null> {
  try {
    const row = await prisma.user.findFirst({
      where: {
        isExternalPlaceholder: true,
        isArchived: false,
        OR: [
          { displayName: { equals: sourcePlayerName, mode: 'insensitive' } },
          { externalDisplayName: { equals: sourcePlayerName, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });
    return row?.id ?? null;
  } catch (error) {
    if (isMissingSchemaError(error)) return null;
    throw error;
  }
}

export async function resolveImportTargetUser(input: ResolveImportTargetUserInput): Promise<ResolvedUser> {
  const {
    prisma,
    source,
    sourcePlayerName,
    explicitCztUser,
    mappedUserId,
    allowAutoUser,
    dryRun,
    resolveExplicitUser,
  } = input;

  const normalizedKey = normalizeExternalKey(sourcePlayerName);
  if (!normalizedKey) throw new Error('sourcePlayerName cannot be empty');

  if (explicitCztUser && explicitCztUser.trim()) {
    const resolved = await resolveExplicitUser(explicitCztUser.trim());
    await upsertIdentity(prisma, source, sourcePlayerName, normalizedKey, resolved.id);
    return { id: resolved.id, resolution: 'explicit' };
  }

  if (mappedUserId) {
    const byId = await prisma.user.findUnique({ where: { id: mappedUserId }, select: { id: true } });
    if (byId) {
      await upsertIdentity(prisma, source, sourcePlayerName, normalizedKey, byId.id);
      return { id: byId.id, resolution: 'mapped' };
    }
  }

  const identityUserId = await findIdentityUserId(prisma, source, normalizedKey);
  if (identityUserId) {
    const byId = await prisma.user.findUnique({ where: { id: identityUserId }, select: { id: true } });
    if (byId) return { id: byId.id, resolution: 'identity' };
  }

  const crossSourceUserId = await findCrossSourceIdentityUserId(prisma, source, normalizedKey);
  if (crossSourceUserId) {
    const byId = await prisma.user.findUnique({ where: { id: crossSourceUserId }, select: { id: true } });
    if (byId) {
      await upsertIdentity(prisma, source, sourcePlayerName, normalizedKey, byId.id);
      return { id: byId.id, resolution: 'identity' };
    }
  }

  const placeholderByNameUserId = await findPlaceholderByDisplayName(prisma, sourcePlayerName);
  if (placeholderByNameUserId) {
    await upsertIdentity(prisma, source, sourcePlayerName, normalizedKey, placeholderByNameUserId);
    return { id: placeholderByNameUserId, resolution: 'identity' };
  }

  if (!allowAutoUser) {
    throw new Error(
      `No CZT user resolved for ${source} player "${sourcePlayerName}". Pass --czt-user=<id|username|displayName> or use --auto-user.`
    );
  }

  if (dryRun) {
    return { id: DRY_RUN_PLACEHOLDER_ID, resolution: 'placeholder_dry_run' };
  }

  const base = baseUsername(source, sourcePlayerName);
  const username = await getUniqueUsername(prisma, base);
  const { email, supabaseId } = await getUniqueExternalIdentifiers(prisma, source, normalizedKey);
  const avatarPath = source === 'ZWR' ? '/avatars/avatar-external-zwr.png' : '/avatars/avatar-external-src.png';

  let created: { id: string };
  try {
    created = await prisma.user.create({
      data: {
        email,
        supabaseId,
        username,
        displayName: sourcePlayerName,
        externalDisplayName: sourcePlayerName,
        isExternalPlaceholder: true,
        externalAvatarSource: source,
        avatarUrl: avatarPath,
        isPublic: true,
      },
      select: { id: true },
    });
  } catch (error) {
    if (isMissingSchemaError(error)) {
      throw new Error(
        'Auto placeholder creation requires the new migration. Run `pnpm db:migrate:deploy` before using --auto-user.'
      );
    }
    throw error;
  }

  await upsertIdentity(prisma, source, sourcePlayerName, normalizedKey, created.id);
  return { id: created.id, resolution: 'placeholder_created' };
}
