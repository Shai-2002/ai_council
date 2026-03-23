export interface ExtractedTask {
  id: string;
  text: string;
  source_artifact_id: string;
  source_artifact_title?: string;
  role_slug: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export function extractTasks(artifact: {
  id: string;
  role_slug: string;
  artifact_type: string;
  title?: string;
  structured_data: Record<string, unknown>;
}): ExtractedTask[] {
  const tasks: ExtractedTask[] = [];
  const data = artifact.structured_data;

  const base = {
    source_artifact_id: artifact.id,
    source_artifact_title: artifact.title,
    role_slug: artifact.role_slug,
    completed: false,
  };

  // Decision Memo → next_steps
  if (data.next_steps && Array.isArray(data.next_steps)) {
    data.next_steps.forEach((step: string, i: number) => {
      tasks.push({
        ...base,
        id: `${artifact.id}-task-${i}`,
        text: step,
        priority: i === 0 ? 'high' : 'medium',
      });
    });
  }

  // Execution Plan → phases with tasks
  if (data.phases && Array.isArray(data.phases)) {
    data.phases.forEach((phase: { name?: string; tasks?: string[] }, pi: number) => {
      if (phase.tasks && Array.isArray(phase.tasks)) {
        phase.tasks.forEach((task: string, ti: number) => {
          tasks.push({
            ...base,
            id: `${artifact.id}-phase${pi}-task${ti}`,
            text: phase.name ? `[${phase.name}] ${task}` : task,
            priority: pi === 0 ? 'high' : 'medium',
          });
        });
      }
    });
  }

  // Financial Breakdown → recommendations
  if (data.recommendations && Array.isArray(data.recommendations)) {
    data.recommendations.forEach((rec: string, i: number) => {
      tasks.push({
        ...base,
        id: `${artifact.id}-rec-${i}`,
        text: rec,
        priority: 'medium',
      });
    });
  }

  // PRD-lite → features with acceptance_criteria, or scope_boundaries
  if (data.features && Array.isArray(data.features)) {
    data.features.forEach((feat: { name?: string; description?: string; priority?: string }, i: number) => {
      const text = feat.name
        ? `${feat.name}: ${feat.description || ''}`
        : typeof feat === 'string' ? feat : JSON.stringify(feat);
      tasks.push({
        ...base,
        id: `${artifact.id}-feat-${i}`,
        text,
        priority: feat.priority === 'must-have' ? 'high' : feat.priority === 'should-have' ? 'medium' : 'low',
      });
    });
  }

  // Marketing Brief → success_metrics or channels
  if (data.success_metrics && Array.isArray(data.success_metrics)) {
    data.success_metrics.forEach((metric: string, i: number) => {
      tasks.push({
        ...base,
        id: `${artifact.id}-metric-${i}`,
        text: `Track: ${metric}`,
        priority: 'medium',
      });
    });
  }

  // Fallback: look for any array that contains action-like items
  if (tasks.length === 0) {
    const actionKeys = ['actions', 'action_items', 'tasks', 'steps', 'todos', 'next_steps', 'key_messages'];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        if (actionKeys.includes(key.toLowerCase())) {
          value.forEach((item: string, i: number) => {
            tasks.push({
              ...base,
              id: `${artifact.id}-${key}-${i}`,
              text: item,
              priority: 'medium',
            });
          });
        }
      }
    }
  }

  return tasks;
}
