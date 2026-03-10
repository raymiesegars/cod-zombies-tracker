import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_SKRINE_CHARS = 28_000;
const TOP_K = 15;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export async function retrieveSkrineChunks(
  query: string,
  openai: OpenAI
): Promise<{ title: string; content: string; source: string }[] | null> {
  const skrineRows = await prisma.chatbotWikiImport.findMany({
    where: { source: 'skrine' },
    select: { title: true, content: true, embedding: true },
  });
  const withEmbedding = skrineRows.filter(
    (r) => r.embedding != null && Array.isArray(r.embedding)
  );

  if (withEmbedding.length === 0) return null;

  const embeddingRes = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query.slice(0, 8000),
  });
  const queryEmbedding = embeddingRes.data[0]?.embedding as number[] | undefined;
  if (!queryEmbedding) return null;

  const scored = withEmbedding
    .map((row) => {
      const emb = row.embedding as number[] | null;
      if (!emb || !Array.isArray(emb)) return { row, score: -1 };
      return { row, score: cosineSimilarity(queryEmbedding, emb) };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  const result: { title: string; content: string; source: string }[] = [];
  let totalChars = 0;
  for (const { row } of scored) {
    if (totalChars + row.content.length > MAX_SKRINE_CHARS) break;
    result.push({
      title: row.title,
      content: row.content,
      source: 'skrine',
    });
    totalChars += row.content.length;
  }
  return result;
}

export async function getSkrineChunksFallback(): Promise<
  { title: string; content: string; source: string }[]
> {
  const rows = await prisma.chatbotWikiImport.findMany({
    where: { source: 'skrine' },
    orderBy: { title: 'asc' },
    select: { title: true, content: true },
  });
  const result: { title: string; content: string; source: string }[] = [];
  let total = 0;
  for (const row of rows) {
    if (total + row.content.length > MAX_SKRINE_CHARS) break;
    result.push({ title: row.title, content: row.content, source: 'skrine' });
    total += row.content.length;
  }
  return result;
}

const CHUNK_TRIGGERS: { pattern: RegExp; titleContains: string }[] = [
  { pattern: /raygun|ray gun|shots needed|wonder weapons needed/i, titleContains: 'Raygun' },
  { pattern: /raygun|ray gun|shots needed|wonder weapons|waffe|shots per horde|drop chance|point drop/i, titleContains: 'Point Drops' },
  { pattern: /waffe|shots per horde/i, titleContains: 'Waffe' },
  { pattern: /drop chance|point drop/i, titleContains: 'Drop Chance' },
  { pattern: /health scale|dog round|zombie health|instakill round|(nacht|verruckt|shi no numa|der riese).*(health|scale|dog)/i, titleContains: 'Instakill' },
  { pattern: /reset|165|resets|reset time|map reset|hours.*reset/i, titleContains: 'Reset' },
  { pattern: /round time|per round|cumulative|total time to round|time to round|reach round|get to round/i, titleContains: 'Round' },
  { pattern: /perfect time|expected time|moon.*(round|\d)|megas.*classics|round 30|round 50|moon 30|moon 50/i, titleContains: 'Perfect' },
  { pattern: /firebase z|firebase.*trial|trial combo|ideal combo|weaver.*trial|a1\+a2|cold war.*trial|kills.*gen/i, titleContains: 'Firebase' },
  { pattern: /firebase z|4p = 16|kills.*gen/i, titleContains: '4p' },
  { pattern: /zis|zombies in spaceland|spaceland|carrier.*bomb|iw.*zombie|infinite warfare|spawn delay/i, titleContains: 'NOT ACTUAL' },
  { pattern: /blitz|transmit.*time|harvest.*stone|purge.*circle|vanguard|terra maledicta|anfang/i, titleContains: '4p' },
];

export async function getSkrineChunksByKeywords(
  query: string
): Promise<{ title: string; content: string; source: string }[]> {
  const q = query.toLowerCase();
  const titleFilters = new Set<string>();
  for (const { pattern, titleContains } of CHUNK_TRIGGERS) {
    if (pattern.test(q)) titleFilters.add(titleContains);
  }
  if (titleFilters.size === 0) return [];

  const conditions = Array.from(titleFilters).map((contains) => ({
    title: { contains, mode: 'insensitive' as const },
  }));

  const rows = await prisma.chatbotWikiImport.findMany({
    where: {
      source: 'skrine',
      OR: conditions,
    },
    select: { title: true, content: true },
  });

  return rows.map((r) => ({ title: r.title, content: r.content, source: 'skrine' }));
}

export async function embedSkrineChunk(
  title: string,
  content: string,
  openai: OpenAI
): Promise<number[]> {
  const text = `${title}\n${content}`.slice(0, 8000);
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return (res.data[0]?.embedding as number[]) ?? [];
}
