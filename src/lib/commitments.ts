import crypto from 'crypto';

export interface CommitmentCandidate {
  type: 'definition' | 'constraint' | 'policy' | 'commitment';
  content: string;
}

const RULE_PATTERNS = [
  { regex: /(?:from now on|going forward|always)\s+(.{10,200})/gi, type: 'policy' as const },
  { regex: /(?:never|don't ever|do not ever)\s+(.{10,200})/gi, type: 'constraint' as const },
  { regex: /(?:when I say|by .+ I mean|define .+ as)\s+(.{10,200})/gi, type: 'definition' as const },
  { regex: /(?:I commit to|we commit to|let's commit to)\s+(.{10,200})/gi, type: 'commitment' as const },
  { regex: /(?:rule:|new rule:)\s+(.{10,200})/gi, type: 'policy' as const },
  { regex: /(?:whenever|every time|each time)\s+(.{10,200})/gi, type: 'policy' as const },
];

/** Detect potential commitment/rule statements in user text */
export function detectCommitments(text: string): CommitmentCandidate[] {
  const candidates: CommitmentCandidate[] = [];
  const seen = new Set<string>();

  for (const { regex, type } of RULE_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const content = match[0].trim();
      const normalized = content.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        candidates.push({ type, content });
      }
    }
  }

  return candidates;
}

/** Hash commitment content for integrity checking */
export function hashCommitment(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/** Format active commitments for prompt injection */
export function formatCommitmentsForPrompt(
  commitments: Array<{ type: string; content: string }>
): string {
  if (commitments.length === 0) return '';

  const lines = commitments.map(c =>
    `[${c.type.toUpperCase()}] ${c.content}`
  );

  return `\n\n=== ACTIVE COMMITMENTS (You MUST obey these) ===\n${lines.join('\n')}\n===`;
}
