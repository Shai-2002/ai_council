export interface ParsedMention {
  roleSlug: string;
  roleName: string;
  instruction: string;
}

export interface ParsedMessage {
  mentions: ParsedMention[];
  isSimulationCandidate: boolean;
  rawText: string;
}

const ROLE_MAP: Record<string, string> = {
  'aria': 'ceo',
  'ceo': 'ceo',
  'dev': 'coo',
  'coo': 'coo',
  'maya': 'cfo',
  'cfo': 'cfo',
  'kai': 'product',
  'product': 'product',
  'priya': 'marketing',
  'marketing': 'marketing',
  'all': 'all',
  'everyone': 'all',
};

const ROLE_NAMES: Record<string, string> = {
  'ceo': 'Aria',
  'coo': 'Dev',
  'cfo': 'Maya',
  'product': 'Kai',
  'marketing': 'Priya',
};

const ALL_ROLES = ['ceo', 'coo', 'cfo', 'product', 'marketing'];

export function parseMentions(text: string): ParsedMessage {
  const mentionRegex = /@(\w+)/gi;
  const matches: { role: string; index: number; length: number }[] = [];

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const roleName = match[1].toLowerCase();
    const roleSlug = ROLE_MAP[roleName];
    if (roleSlug) {
      matches.push({
        role: roleSlug,
        index: match.index,
        length: match[0].length,
      });
    }
  }

  if (matches.length === 0) {
    return { mentions: [], isSimulationCandidate: false, rawText: text };
  }

  // Expand @all to all roles
  const expandedRoles = matches.flatMap(m => m.role === 'all' ? ALL_ROLES : [m.role]);
  const uniqueRoles = [...new Set(expandedRoles)];

  // Extract per-role instructions
  const mentions: ParsedMention[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const instructionStart = current.index + current.length;
    const instructionEnd = next ? next.index : text.length;
    const instruction = text.slice(instructionStart, instructionEnd).trim();

    if (current.role === 'all') {
      ALL_ROLES.forEach(r => {
        mentions.push({
          roleSlug: r,
          roleName: ROLE_NAMES[r],
          instruction: instruction || text,
        });
      });
    } else {
      mentions.push({
        roleSlug: current.role,
        roleName: ROLE_NAMES[current.role],
        instruction: instruction || text,
      });
    }
  }

  // Deduplicate by roleSlug (keep last instruction for each role)
  const dedupedMentions = Object.values(
    mentions.reduce((acc, m) => {
      acc[m.roleSlug] = m;
      return acc;
    }, {} as Record<string, ParsedMention>)
  );

  // Simulation detection: 3+ unique roles tagged + discussion keywords
  const lowerText = text.toLowerCase();
  const isSimulationCandidate = uniqueRoles.length >= 3 && (
    lowerText.includes('argue') ||
    lowerText.includes('discuss') ||
    lowerText.includes('debate') ||
    lowerText.includes('simulation') ||
    lowerText.includes('after everyone') ||
    lowerText.includes('push them') ||
    dedupedMentions.every(m => m.instruction.length > 20)
  );

  return {
    mentions: dedupedMentions,
    isSimulationCandidate,
    rawText: text,
  };
}

/** For autocomplete dropdown — returns matching roles for partial input */
export function getMatchingRoles(partial: string): { slug: string; name: string; role: string }[] {
  const lower = partial.toLowerCase().replace('@', '');
  if (!lower) {
    return ALL_ROLES.map(slug => ({
      slug,
      name: ROLE_NAMES[slug],
      role: slug.toUpperCase(),
    }));
  }

  return Object.entries(ROLE_MAP)
    .filter(([key]) => key.startsWith(lower) && key !== 'all' && key !== 'everyone')
    .map(([, slug]) => ({
      slug,
      name: ROLE_NAMES[slug],
      role: slug.toUpperCase(),
    }))
    .filter((item, index, self) =>
      self.findIndex(s => s.slug === item.slug) === index
    );
}
