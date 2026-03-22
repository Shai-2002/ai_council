export const MOCK_PROJECTS = [
  { id: 'p1', name: 'SaaS Launch Plan', description: 'GTM strategy for Q3', chats: [
    { id: 'c1', title: 'Strategy discussion', roleSlug: 'ceo' },
    { id: 'c2', title: 'Budget review', roleSlug: 'cfo' },
  ], filesCount: 3, updatedAt: '2026-03-22' },
  { id: 'p2', name: 'Q2 Marketing', description: 'Performance marketing channels', chats: [
    { id: 'c3', title: 'Channel strategy', roleSlug: 'marketing' },
  ], filesCount: 1, updatedAt: '2026-03-19' },
];

export const MOCK_CHAT_HISTORY: Record<string, { id: string; title: string; updatedAt: string }[]> = {
  ceo: [
    { id: 'h1', title: 'Startup direction discussion', updatedAt: '2026-03-22' },
    { id: 'h2', title: 'Funding vs bootstrap', updatedAt: '2026-03-20' },
  ],
  coo: [
    { id: 'h3', title: 'Launch timeline review', updatedAt: '2026-03-21' },
  ],
  cfo: [],
  product: [],
  marketing: [],
};

export const MOCK_FILES = [
  { id: 'f1', name: 'Q1 Financial Report.pdf', file_type: 'pdf', size_bytes: 2400000, extraction_status: 'done', created_at: '2026-03-20' },
  { id: 'f2', name: 'Product Roadmap.docx', file_type: 'docx', size_bytes: 890000, extraction_status: 'done', created_at: '2026-03-19' },
  { id: 'f3', name: 'Competitor Analysis.md', file_type: 'md', size_bytes: 45000, extraction_status: 'done', created_at: '2026-03-18' },
];
