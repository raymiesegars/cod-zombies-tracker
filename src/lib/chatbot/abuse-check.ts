const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|above|context)/i,
  /forget\s+(everything|all|your)\s+(above|previous|instructions?)/i,
  /you\s+are\s+now\s+/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if\s+you\s+are/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /<\|[a-z]+\|>/i,
  /repeat\s+(this|the)\s+(word|phrase|character)\s+\d+/i,
  /(.)\1{100,}/,
];

export function looksLikeAbuse(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 3) return true;
  for (const re of SUSPICIOUS_PATTERNS) {
    if (re.test(trimmed)) return true;
  }
  const uniqueChars = new Set(trimmed).size;
  if (trimmed.length > 50 && uniqueChars / trimmed.length < 0.2) return true;
  return false;
}
