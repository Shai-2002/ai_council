// lib/mock-data.ts
import { Message, Artifact } from '@/types';

export const MOCK_MESSAGES: Message[] = [
  { id: '1', role: 'user', content: 'Should I launch in 4 weeks or wait until we have more features?' },
  { id: '2', role: 'assistant', content: "I'm going to push back on the 4-week timeline. Here's why:\n\nYour COO flagged that the current MVP scope requires 6 weeks minimum with a solo developer. Launching in 4 weeks means cutting auth OR the dashboard — both are core.\n\n**My recommendation:** Launch in 6 weeks with 3 features. Ship auth + core workflow + basic export. That's testable. That gets you real feedback.\n\nThe extra 2 weeks isn't delay — it's the difference between launching something people can actually use vs. a demo that impresses nobody.\n\nWorst case if you wait 2 more weeks? You're still pre-revenue. The burn rate doesn't change. Best case? You launch something that actually converts.\n\n*Confidence: 85% — the timeline math is straightforward.*" },
  { id: '3', role: 'user', content: 'What about launching with just auth and one feature?' },
  { id: '4', role: 'assistant', content: "Now you're thinking clearly. Auth + one core feature in 3 weeks is credible.\n\nBut which feature? That's the decision that matters. Let me frame it:\n\n**Option A: Auth + Dashboard**\nPros: Users can see value immediately. Visual proof of concept.\nCons: No way to extract data. Users look but can't act.\n\n**Option B: Auth + Core Workflow**\nPros: Users can actually DO something. Testable conversion funnel.\nCons: Less visually impressive. Harder to demo.\n\n**My decision:** Option B. A working workflow beats a pretty dashboard every time. You can measure if people complete the workflow. You can't measure if people like looking at a dashboard.\n\nWant me to write the formal Decision Memo?" },
];

export const MOCK_ARTIFACTS: Artifact[] = [
  { id: '1', roleSlug: 'ceo', artifactType: 'Decision Memo', title: 'Launch timeline: 6 weeks with 3 features', status: 'final', createdAt: '2026-03-20' },
  { id: '2', roleSlug: 'cfo', artifactType: 'Financial Breakdown', title: 'MVP burn rate analysis — 8 month runway', status: 'final', createdAt: '2026-03-19' },
  { id: '3', roleSlug: 'product', artifactType: 'PRD-lite', title: 'MVP scope: auth + dashboard + export', status: 'draft', createdAt: '2026-03-18' },
  { id: '4', roleSlug: 'coo', artifactType: 'Execution Plan', title: '6-week sprint plan — solo developer', status: 'draft', createdAt: '2026-03-17' },
  { id: '5', roleSlug: 'marketing', artifactType: 'Marketing Brief', title: 'LinkedIn outreach strategy for edtech founders', status: 'draft', createdAt: '2026-03-15' },
];

export const MOCK_ARTIFACT_DETAIL: Artifact & { structuredData: Record<string, unknown> } = {
  id: '1',
  roleSlug: 'ceo',
  artifactType: 'Decision Memo',
  title: 'Launch timeline: 6 weeks with 3 features',
  status: 'final',
  createdAt: '2026-03-20',
  structuredData: {
    context: 'Solo founder building an EdTech SaaS. 8 months runway. No external funding. Need to validate with paying users before month 5.',
    options: [
      { option: 'Launch in 4 weeks with 5 features', pros: ['Faster to market', 'More features to test'], cons: ['Unrealistic for solo dev', 'Quality will suffer', 'COO flagged as impossible'] },
      { option: 'Launch in 6 weeks with 3 features', pros: ['Realistic timeline', 'Quality over quantity', 'Testable conversion funnel'], cons: ['2 weeks slower', 'Less feature coverage'] },
      { option: 'Launch in 3 weeks with 1 feature', pros: ['Fastest possible', 'Laser focused'], cons: ['May not demonstrate enough value', 'Hard to charge for'] },
    ],
    decision: 'Launch in 6 weeks with 3 core features: auth + core workflow + basic export.',
    rationale: 'The 6-week timeline balances speed with quality. 3 features is the minimum that creates a testable value proposition. The CFO confirmed burn rate is sustainable through month 5, so the extra 2 weeks don\'t create financial pressure.',
    risks: ['Scope creep if we add "just one more thing"', 'Solo dev burnout at week 4-5', 'Market timing — competitor may launch first'],
    next_steps: ['COO to create detailed execution plan', 'Product Lead to finalize feature specs', 'CFO to set month-3 revenue target', 'Marketing to prepare launch outreach'],
  },
};
