import { z } from 'zod';

export const DecisionMemoSchema = z.object({
  context: z.string().describe('Background and constraints informing the decision'),
  options: z.array(
    z.object({
      option: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    })
  ).describe('Evaluated alternatives'),
  decision: z.string().describe('The recommended course of action'),
  rationale: z.string().describe('Why this decision over alternatives'),
  risks: z.array(z.string()).describe('Key risks to monitor'),
  next_steps: z.array(z.string()).describe('Immediate action items'),
});

export const ExecutionPlanSchema = z.object({
  objective: z.string().describe('What this plan aims to accomplish'),
  timeline: z.string().describe('Overall timeframe'),
  phases: z.array(
    z.object({
      name: z.string(),
      duration: z.string(),
      tasks: z.array(z.string()),
      dependencies: z.array(z.string()),
      deliverable: z.string(),
    })
  ).describe('Execution phases with tasks and deliverables'),
  resources: z.array(z.string()).describe('Required resources and tools'),
  risks: z.array(z.string()).describe('Execution risks'),
  success_metrics: z.array(z.string()).describe('How to measure success'),
});

export const FinancialBreakdownSchema = z.object({
  summary: z.string().describe('One-line financial summary'),
  assumptions: z.array(z.string()).describe('Key financial assumptions'),
  revenue: z.object({
    model: z.string(),
    projections: z.array(
      z.object({
        period: z.string(),
        amount: z.string(),
        notes: z.string(),
      })
    ),
  }).describe('Revenue model and projections'),
  costs: z.array(
    z.object({
      category: z.string(),
      monthly: z.string(),
      notes: z.string(),
    })
  ).describe('Cost breakdown'),
  runway: z.string().describe('Estimated runway'),
  unit_economics: z.object({
    cac: z.string(),
    ltv: z.string(),
    payback_period: z.string(),
  }).describe('Unit economics estimates'),
  recommendations: z.array(z.string()).describe('Financial recommendations'),
});

export const PrdLiteSchema = z.object({
  problem: z.string().describe('The user problem being solved'),
  target_user: z.string().describe('Primary user persona'),
  features: z.array(
    z.object({
      name: z.string(),
      priority: z.enum(['must-have', 'should-have', 'nice-to-have']),
      description: z.string(),
      acceptance_criteria: z.array(z.string()),
    })
  ).describe('Feature specifications with priorities'),
  scope_boundaries: z.array(z.string()).describe('What is explicitly OUT of scope'),
  success_metrics: z.array(z.string()).describe('How to measure feature success'),
  technical_notes: z.array(z.string()).describe('Implementation considerations'),
});

export const MarketingBriefSchema = z.object({
  objective: z.string().describe('Marketing objective'),
  target_audience: z.object({
    persona: z.string(),
    pain_points: z.array(z.string()),
    channels: z.array(z.string()),
  }).describe('Target audience profile'),
  positioning: z.string().describe('Brand positioning statement'),
  key_messages: z.array(z.string()).describe('Core messages to communicate'),
  channels: z.array(
    z.object({
      name: z.string(),
      strategy: z.string(),
      budget: z.string(),
      timeline: z.string(),
    })
  ).describe('Channel strategy'),
  success_metrics: z.array(z.string()).describe('Marketing KPIs'),
  budget_summary: z.string().describe('Total budget overview'),
});

export type DecisionMemo = z.infer<typeof DecisionMemoSchema>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
export type FinancialBreakdown = z.infer<typeof FinancialBreakdownSchema>;
export type PrdLite = z.infer<typeof PrdLiteSchema>;
export type MarketingBrief = z.infer<typeof MarketingBriefSchema>;
