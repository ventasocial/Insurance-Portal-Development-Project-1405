// Supabase Edge Function para llamadas a GHL API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GHL_API_KEY = Deno.env.get('GHL_API_KEY')
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1'

serve(async (req) => {
  try {
    const { action, data } = await req.json()
    
    switch(action) {
      case 'send_status_update':
        return await sendStatusUpdate(data)
      case 'trigger_automation':
        return await triggerAutomation(data)
      // Más acciones según necesites
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendStatusUpdate({ contactId, status, claimId }) {
  const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}/workflow/status_update/subscribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      claimId,
      status,
      timestamp: new Date().toISOString()
    })
  })
  
  return new Response(
    JSON.stringify(await response.json()),
    { headers: { 'Content-Type': 'application/json' } }
  )
}