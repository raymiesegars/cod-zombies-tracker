import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_SKRINE_CHARS = 25_000;
const TOP_K = 12;

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
): Promise<{ title: string; content: string; source: string }[]> {
  const skrineRows = await prisma.chatbotWikiImport.findMany({
    where: { source: 'skrine' },
    select: { title: true, content: true, embedding: true },
  });
  const withEmbedding = skrineRows.filter(
    (r) => r.embedding != null && Array.isArray(r.embedding)
  );

  if (withEmbedding.length === 0) return [];

  const embeddingRes = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query.slice(0, 8000),
  });
  const queryEmbedding = embeddingRes.data[0]?.embedding as number[] | undefined;
  if (!queryEmbedding) return [];

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
