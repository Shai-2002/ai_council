import { openrouter } from './provider';
import { generateText } from 'ai';

const RESEARCH_MODEL = 'perplexity/sonar-reasoning-pro';

/** Determine if a message would benefit from internet research */
export function needsResearch(message: string): boolean {
  const indicators = [
    /\b(market|industry|trend|benchmark|statistic|data|competitor|company|startup)\b/i,
    /\b(how much|what is the|current|latest|recent|202[4-6])\b/i,
    /\b(compare|versus|vs|alternative|similar)\b/i,
    /\b(regulation|law|policy|compliance|legal)\b/i,
    /\b(pricing|cost|revenue|salary|funding|valuation)\b/i,
    /\b(case study|example|success story|failure|lesson)\b/i,
    /\b(research|study|report|survey|analysis)\b/i,
  ];

  const matches = indicators.filter(p => p.test(message)).length;
  return matches >= 2 || message.length > 300;
}

/** Run research using Perplexity to gather internet context */
export async function runResearch(
  userMessage: string,
  roleContext: { name: string; title: string; domain: string }
): Promise<string | null> {
  try {
    const result = await generateText({
      model: openrouter(RESEARCH_MODEL),
      prompt: `You are a research assistant preparing briefing materials for a ${roleContext.title} named ${roleContext.name}.

The ${roleContext.title} needs to respond to: "${userMessage.slice(0, 500)}"

Search the internet and gather:
1. Relevant data, statistics, and benchmarks
2. Similar case studies or examples
3. Current market conditions or trends
4. Expert opinions or analysis

Format as a concise briefing (max 400 words). Include specific numbers, dates, and sources. Focus on ${roleContext.domain} relevance.

If the question is casual/greeting or doesn't need research, respond with: "NO_RESEARCH_NEEDED"`,
      maxOutputTokens: 800,
    });

    const text = result.text.trim();
    if (text === 'NO_RESEARCH_NEEDED' || text.length < 50) return null;
    return text;
  } catch (error) {
    console.error('Research pipeline error:', error);
    return null; // Fail silently — persona responds without research
  }
}
