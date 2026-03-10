/**
 * Generate embeddings for Skrine ChatbotWikiImport rows that don't have them.
 * Run after migration and Skrine ingest: pnpm db:backfill-skrine-embeddings
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

for (const f of ['.env', '.env.local']) {
  const p = resolve(process.cwd(), f);
  if (existsSync(p)) {
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

import prisma from '../src/lib/prisma';
import OpenAI from 'openai';
import { embedSkrineChunk } from '../src/lib/chatbot/wiki-retrieval';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY required');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });
  const rows = await prisma.chatbotWikiImport.findMany({
    where: { source: 'skrine' },
    select: { id: true, title: true, content: true, embedding: true },
  });
  const toEmbed = rows.filter((r) => r.embedding == null);

  if (toEmbed.length === 0) {
    console.log('All Skrine chunks already have embeddings.');
    process.exit(0);
  }

  console.log(`Backfilling embeddings for ${toEmbed.length} Skrine chunks...`);
  let done = 0;
  for (const row of toEmbed) {
    try {
      const embedding = await embedSkrineChunk(row.title, row.content, openai);
      await prisma.chatbotWikiImport.update({
        where: { id: row.id },
        data: { embedding },
      });
      done++;
      if (done % 5 === 0) console.log(`  ${done}/${rows.length}`);
    } catch (e) {
      console.error(`  Failed ${row.id}:`, e);
    }
  }
  console.log(`Done. ${done}/${toEmbed.length} embeddings added.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
