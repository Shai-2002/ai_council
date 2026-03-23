import { supabase } from './supabase';
import { runSimulation } from './simulation';
import { createServer } from 'http';

const POLL_INTERVAL = 3000; // 3 seconds
let isProcessing = false;

async function pollForJobs() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Find a pending job
    const { data: jobs, error } = await supabase
      .from('simulation_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error || !jobs || jobs.length === 0) {
      isProcessing = false;
      return;
    }

    const job = jobs[0];

    // Atomic claim — only if still pending
    const { data: claimed, error: claimError } = await supabase
      .from('simulation_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', job.id)
      .eq('status', 'pending')
      .select()
      .single();

    if (claimError || !claimed) {
      // Another worker got it
      isProcessing = false;
      return;
    }

    console.log(`[Worker] Processing simulation ${job.id} for chat ${job.chat_id}`);

    await runSimulation(job);

  } catch (error) {
    console.error('[Worker] Poll error:', error);
  } finally {
    isProcessing = false;
  }
}

// Health check server
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`[Worker] Health server on port ${port}`);
});

// Start polling
console.log('[Worker] AI Roles Simulation Worker started');
console.log(`[Worker] Polling every ${POLL_INTERVAL}ms`);

setInterval(pollForJobs, POLL_INTERVAL);
pollForJobs(); // initial poll
