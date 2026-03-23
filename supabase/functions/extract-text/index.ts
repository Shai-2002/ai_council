import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openrouterKey = Deno.env.get('OPENROUTER_API_KEY')!

serve(async (req) => {
  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
    const authHeader = req.headers.get('x-webhook-secret')
    if (webhookSecret && authHeader !== webhookSecret) {
      // Also accept Authorization bearer
      const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '')
      if (bearerToken !== supabaseServiceKey) {
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const payload = await req.json()
    // Support both webhook format (payload.record) and direct call (payload directly)
    const record = payload.record || payload

    if (!record || !record.storage_path || !record.id) {
      return new Response('No file record', { status: 400 })
    }

    // Skip if already extracted
    if (record.extraction_status === 'completed' || record.extraction_status === 'done') {
      return new Response('Already extracted', { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const filename = record.name || record.filename || ''
    const extension = filename.split('.').pop()?.toLowerCase()

    // Mark as processing
    await supabase.from('files').update({
      extraction_status: 'processing'
    }).eq('id', record.id)

    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('workspace-files')
      .download(record.storage_path)

    if (downloadError || !fileData) {
      await supabase.from('files').update({
        extraction_status: 'failed'
      }).eq('id', record.id)
      return new Response('Download failed: ' + downloadError?.message, { status: 500 })
    }

    const buffer = await fileData.arrayBuffer()
    let extractedText = ''

    // Plain text files — read directly
    if (['txt', 'md', 'csv', 'json'].includes(extension || '')) {
      extractedText = new TextDecoder().decode(buffer).slice(0, 50000)
    }
    // PDF and DOCX — use Claude to extract
    else if (['pdf', 'docx', 'doc'].includes(extension || '')) {
      try {
        // Convert to base64
        const uint8 = new Uint8Array(buffer)
        let binary = ''
        const chunkSize = 8192
        for (let i = 0; i < uint8.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8.slice(i, i + chunkSize))
        }
        const base64 = btoa(binary)

        const mediaType = extension === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-sonnet-4-6',
            max_tokens: 16000,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: 'Extract ALL text content from this document. Return the complete text exactly as it appears, preserving structure (headings, paragraphs, lists, tables). Do not summarize. Do not add commentary. Just output the raw text.',
                },
              ],
            }],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          extractedText = data.choices?.[0]?.message?.content || ''
        } else {
          const errText = await response.text()
          console.error('OpenRouter error:', errText)
        }
      } catch (extractErr) {
        console.error('Claude extraction error:', extractErr)
      }
    }

    // Save extracted text
    const status = extractedText.length > 50 ? 'done' : 'failed'
    await supabase.from('files').update({
      extracted_text: extractedText.slice(0, 50000),
      extraction_status: status,
    }).eq('id', record.id)

    return new Response(JSON.stringify({ status, length: extractedText.length }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Extraction error:', error)
    return new Response('Error: ' + (error as Error).message, { status: 500 })
  }
})
