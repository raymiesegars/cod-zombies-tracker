import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { getChatbotTokens, consumeChatbotToken } from '@/lib/chatbot/rate-limit';
import { buildChatbotContext } from '@/lib/chatbot/context';
import { looksLikeAbuse } from '@/lib/chatbot/abuse-check';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 2000;
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_RESPONSE_TOKENS = 1024;
const UNKNOWN_MARKER = '[LEKRONORIUM_UNKNOWN]';

const systemPromptPrefix = `You are LeKronorium, the official chatbot for this Call of Duty Zombies tracker site. You have exclusive high-level zombies knowledge and strats that general AI assistants do not have.

CRITICAL: You MUST answer ONLY from the CONTEXT below. If the user's question cannot be answered from the context, you MUST respond with EXACTLY this line first (no other text before it):
${UNKNOWN_MARKER}
Then add one short sentence: that you don't have that information yet but are forwarding their question to the team to learn for the future. Do NOT make up answers, map names, strategies, or stats. If the answer is in the context, answer normally and do NOT use the ${UNKNOWN_MARKER} line.`;

export async function POST(request: NextRequest) {
  try {
    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: 'Sign in to use the chatbot' }, { status: 401 });
    }
    const me = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    const userId = me.id;

    const { remaining } = await getChatbotTokens(userId);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'No chatbot uses left. Tokens refill over time—check back later.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` },
        { status: 400 }
      );
    }
    if (looksLikeAbuse(message)) {
      return NextResponse.json(
        { error: 'Message was rejected. Please ask a normal question about the site or zombies.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chatbot is not configured' }, { status: 503 });
    }

    const context = await buildChatbotContext();
    const systemContent = `${systemPromptPrefix}\n\n---\nCONTEXT:\n${context}`;

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message },
      ],
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.3,
    });

    let reply = completion.choices[0]?.message?.content?.trim() ?? 'I could not generate a response. Please try again.';
    let wasUnknown = false;
    if (reply.includes(UNKNOWN_MARKER)) {
      wasUnknown = true;
      reply = reply.replace(UNKNOWN_MARKER, '').trim() || "I don't have that information yet. I'm forwarding your question to the team so we can learn for the future.";
      await prisma.chatbotUnansweredQuestion.create({
        data: { userId, question: message },
      });
    }

    const { consumed, remaining: newRemaining } = await consumeChatbotToken(userId);
    if (!consumed) {
      return NextResponse.json(
        { error: 'No chatbot uses left. Tokens refill over time.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ reply, tokensRemaining: newRemaining, wasUnknown });
  } catch (err) {
    console.error('Chatbot API error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 503 }
    );
  }
}
