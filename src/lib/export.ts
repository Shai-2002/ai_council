interface ArtifactExportInput {
  artifact_type: string;
  title: string;
  structured_data: Record<string, unknown>;
}

export function artifactToMarkdown(artifact: ArtifactExportInput): string {
  const { artifact_type, title, structured_data: data } = artifact;

  switch (artifact_type) {
    case 'Decision Memo':
      return formatDecisionMemo(title, data);
    case 'Execution Plan':
      return formatExecutionPlan(title, data);
    case 'Financial Breakdown':
      return formatFinancialBreakdown(title, data);
    case 'PRD-lite':
      return formatPrdLite(title, data);
    case 'Marketing Brief':
      return formatMarketingBrief(title, data);
    default:
      return `# ${title}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }
}

function formatDecisionMemo(title: string, d: Record<string, unknown>): string {
  let md = `# Decision Memo\n## ${title}\n\n`;
  if (d.context) md += `## Context\n${d.context}\n\n`;
  if (Array.isArray(d.options)) {
    md += `## Evaluated Options\n`;
    for (const opt of d.options as Array<{ option: string; pros: string[]; cons: string[] }>) {
      md += `### ${opt.option}\n`;
      md += `**Pros:** ${opt.pros.join(', ')}\n`;
      md += `**Cons:** ${opt.cons.join(', ')}\n\n`;
    }
  }
  if (d.decision) md += `## Decision\n${d.decision}\n\n`;
  if (d.rationale) md += `## Rationale\n${d.rationale}\n\n`;
  if (Array.isArray(d.risks)) md += `## Risks\n${(d.risks as string[]).map(r => `- ${r}`).join('\n')}\n\n`;
  if (Array.isArray(d.next_steps)) md += `## Next Steps\n${(d.next_steps as string[]).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
  return md;
}

function formatExecutionPlan(title: string, d: Record<string, unknown>): string {
  let md = `# Execution Plan\n## ${title}\n\n`;
  if (d.objective) md += `**Objective:** ${d.objective}\n\n`;
  if (d.timeline) md += `**Timeline:** ${d.timeline}\n\n`;
  if (Array.isArray(d.phases)) {
    md += `## Phases\n`;
    for (const p of d.phases as Array<{ name: string; duration: string; tasks: string[]; dependencies: string[]; deliverable: string }>) {
      md += `### ${p.name} (${p.duration})\n`;
      md += `**Tasks:**\n${p.tasks.map(t => `- ${t}`).join('\n')}\n`;
      if (p.dependencies.length) md += `**Dependencies:** ${p.dependencies.join(', ')}\n`;
      md += `**Deliverable:** ${p.deliverable}\n\n`;
    }
  }
  if (Array.isArray(d.resources)) md += `## Resources\n${(d.resources as string[]).map(r => `- ${r}`).join('\n')}\n\n`;
  if (Array.isArray(d.risks)) md += `## Risks\n${(d.risks as string[]).map(r => `- ${r}`).join('\n')}\n\n`;
  if (Array.isArray(d.success_metrics)) md += `## Success Metrics\n${(d.success_metrics as string[]).map(m => `- ${m}`).join('\n')}\n`;
  return md;
}

function formatFinancialBreakdown(title: string, d: Record<string, unknown>): string {
  let md = `# Financial Breakdown\n## ${title}\n\n`;
  if (d.summary) md += `**Summary:** ${d.summary}\n\n`;
  if (Array.isArray(d.assumptions)) md += `## Assumptions\n${(d.assumptions as string[]).map(a => `- ${a}`).join('\n')}\n\n`;
  const revenue = d.revenue as { model?: string; projections?: Array<{ period: string; amount: string; notes: string }> } | undefined;
  if (revenue) {
    md += `## Revenue Model\n${revenue.model || ''}\n\n`;
    if (Array.isArray(revenue.projections)) {
      md += `| Period | Amount | Notes |\n| --- | --- | --- |\n`;
      revenue.projections.forEach(p => { md += `| ${p.period} | ${p.amount} | ${p.notes} |\n`; });
      md += '\n';
    }
  }
  if (Array.isArray(d.costs)) {
    md += `## Costs\n| Category | Monthly | Notes |\n| --- | --- | --- |\n`;
    (d.costs as Array<{ category: string; monthly: string; notes: string }>).forEach(c => { md += `| ${c.category} | ${c.monthly} | ${c.notes} |\n`; });
    md += '\n';
  }
  if (d.runway) md += `**Runway:** ${d.runway}\n\n`;
  const ue = d.unit_economics as { cac?: string; ltv?: string; payback_period?: string } | undefined;
  if (ue) md += `## Unit Economics\n- **CAC:** ${ue.cac}\n- **LTV:** ${ue.ltv}\n- **Payback Period:** ${ue.payback_period}\n\n`;
  if (Array.isArray(d.recommendations)) md += `## Recommendations\n${(d.recommendations as string[]).map(r => `- ${r}`).join('\n')}\n`;
  return md;
}

function formatPrdLite(title: string, d: Record<string, unknown>): string {
  let md = `# PRD-lite\n## ${title}\n\n`;
  if (d.problem) md += `## Problem\n${d.problem}\n\n`;
  if (d.target_user) md += `**Target User:** ${d.target_user}\n\n`;
  if (Array.isArray(d.features)) {
    md += `## Features\n`;
    for (const f of d.features as Array<{ name: string; priority: string; description: string; acceptance_criteria: string[] }>) {
      md += `### ${f.name} [${f.priority}]\n${f.description}\n`;
      md += `**Acceptance Criteria:**\n${f.acceptance_criteria.map(c => `- ${c}`).join('\n')}\n\n`;
    }
  }
  if (Array.isArray(d.scope_boundaries)) md += `## Out of Scope\n${(d.scope_boundaries as string[]).map(s => `- ${s}`).join('\n')}\n\n`;
  if (Array.isArray(d.success_metrics)) md += `## Success Metrics\n${(d.success_metrics as string[]).map(m => `- ${m}`).join('\n')}\n\n`;
  if (Array.isArray(d.technical_notes)) md += `## Technical Notes\n${(d.technical_notes as string[]).map(n => `- ${n}`).join('\n')}\n`;
  return md;
}

function formatMarketingBrief(title: string, d: Record<string, unknown>): string {
  let md = `# Marketing Brief\n## ${title}\n\n`;
  if (d.objective) md += `**Objective:** ${d.objective}\n\n`;
  const ta = d.target_audience as { persona?: string; pain_points?: string[]; channels?: string[] } | undefined;
  if (ta) {
    md += `## Target Audience\n**Persona:** ${ta.persona}\n`;
    if (Array.isArray(ta.pain_points)) md += `**Pain Points:** ${ta.pain_points.join(', ')}\n`;
    if (Array.isArray(ta.channels)) md += `**Channels:** ${ta.channels.join(', ')}\n\n`;
  }
  if (d.positioning) md += `## Positioning\n${d.positioning}\n\n`;
  if (Array.isArray(d.key_messages)) md += `## Key Messages\n${(d.key_messages as string[]).map(m => `- ${m}`).join('\n')}\n\n`;
  if (Array.isArray(d.channels)) {
    md += `## Channel Strategy\n`;
    for (const c of d.channels as Array<{ name: string; strategy: string; budget: string; timeline: string }>) {
      md += `### ${c.name}\n- **Strategy:** ${c.strategy}\n- **Budget:** ${c.budget}\n- **Timeline:** ${c.timeline}\n\n`;
    }
  }
  if (Array.isArray(d.success_metrics)) md += `## Success Metrics\n${(d.success_metrics as string[]).map(m => `- ${m}`).join('\n')}\n\n`;
  if (d.budget_summary) md += `**Budget Summary:** ${d.budget_summary}\n`;
  return md;
}

export function artifactToHtml(artifact: ArtifactExportInput): string {
  const md = artifactToMarkdown(artifact);
  // Simple markdown-to-HTML conversion for export
  const html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${artifact.title}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
  h1 { border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
  h2 { color: #4f46e5; margin-top: 24px; }
  h3 { color: #374151; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
  th { background: #f3f4f6; }
  li { margin: 4px 0; }
  strong { color: #111827; }
</style>
</head><body><p>${html}</p></body></html>`;
}
