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

// Default hardcoded maps (used as fallback)
const DEFAULT_ROLE_MAP: Record<string, string> = {
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

const DEFAULT_ROLE_NAMES: Record<string, string> = {
  'ceo': 'Aria',
  'coo': 'Dev',
  'cfo': 'Maya',
  'product': 'Kai',
  'marketing': 'Priya',
};

const DEFAULT_ALL_ROLES = ['ceo', 'coo', 'cfo', 'product', 'marketing'];

/** Build a role map from dynamic roles array */
export function buildRoleMap(roles: Array<{ slug: string; name: string; title: string }>): {
  roleMap: Record<string, string>;
  roleNames: Record<string, string>;
  allRoles: string[];
} {
  const roleMap: Record<string, string> = { all: 'all', everyone: 'all' };
  const roleNames: Record<string, string> = {};
  const allRoles: string[] = [];

  roles.forEach(r => {
    roleMap[r.slug.toLowerCase()] = r.slug;
    roleMap[r.name.toLowerCase()] = r.slug;
    roleMap[r.title.toLowerCase()] = r.slug;
    roleNames[r.slug] = r.name;
    allRoles.push(r.slug);
  });

  return { roleMap, roleNames, allRoles };
}

export function parseMentions(
  text: string,
  dynamicMaps?: { roleMap: Record<string, string>; roleNames: Record<string, string>; allRoles: string[] }
): ParsedMessage {
  const roleMap = dynamicMaps?.roleMap || DEFAULT_ROLE_MAP;
  const roleNames = dynamicMaps?.roleNames || DEFAULT_ROLE_NAMES;
  const allRoles = dynamicMaps?.allRoles || DEFAULT_ALL_ROLES;

  const mentionRegex = /@(\w+)/gi;
  const matches: { role: string; index: number; length: number }[] = [];

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const roleName = match[1].toLowerCase();
    const roleSlug = roleMap[roleName];
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
  const expandedRoles = matches.flatMap(m => m.role === 'all' ? allRoles : [m.role]);
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
      allRoles.forEach(r => {
        mentions.push({
          roleSlug: r,
          roleName: roleNames[r] || r,
          instruction: instruction || text,
        });
      });
    } else {
      mentions.push({
        roleSlug: current.role,
        roleName: roleNames[current.role] || current.role,
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

  // Simulation detection
  const lowerText = text.toLowerCase();
  const simulationKeywords = [
    'simulate', 'simulation', 'run simulation',
    'argue with each other', 'debate each other', 'discuss among yourselves',
    'after everyone gives their answers', 'after everyone responds',
    'push them to the edge', 'challenge each other',
    'let them discuss', 'let them debate', 'let them argue',
  ];
  const isSimulationCandidate = uniqueRoles.length >= 3 &&
    simulationKeywords.some(kw => lowerText.includes(kw));

  return {
    mentions: dedupedMentions,
    isSimulationCandidate,
    rawText: text,
  };
}

/** For autocomplete dropdown — returns matching roles for partial input */
export function getMatchingRoles(
  partial: string,
  dynamicMaps?: { roleMap: Record<string, string>; roleNames: Record<string, string>; allRoles: string[] }
): { slug: string; name: string; role: string }[] {
  const roleMap = dynamicMaps?.roleMap || DEFAULT_ROLE_MAP;
  const roleNames = dynamicMaps?.roleNames || DEFAULT_ROLE_NAMES;
  const allRoles = dynamicMaps?.allRoles || DEFAULT_ALL_ROLES;

  const lower = partial.toLowerCase().replace('@', '');
  if (!lower) {
    return allRoles.map(slug => ({
      slug,
      name: roleNames[slug] || slug,
      role: slug.toUpperCase(),
    }));
  }

  return Object.entries(roleMap)
    .filter(([key]) => key.startsWith(lower) && key !== 'all' && key !== 'everyone')
    .map(([, slug]) => ({
      slug,
      name: roleNames[slug] || slug,
      role: slug.toUpperCase(),
    }))
    .filter((item, index, self) =>
      self.findIndex(s => s.slug === item.slug) === index
    );
}
