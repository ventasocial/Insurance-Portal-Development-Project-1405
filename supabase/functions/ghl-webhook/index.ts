// Supabase Edge Function para GHL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GHL_API_KEY = Deno.env.get('GHL_API_KEY')
const GHL_API_BASE = 'https://rest.gohighlevel.com/v1'

// Cliente Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { type, data } = await req.json()
    
    // Manejar diferentes tipos de eventos de GHL
    switch(type) {
      case 'contact.updated':
        await handleContactUpdate(data)
        break
      case 'opportunity.updated':
        await handleOpportunityUpdate(data)
        break
      // Añadir más handlers según necesites
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function handleContactUpdate(data) {
  // Actualizar información del contacto en Supabase
  const { error } = await supabaseClient
    .from('contacts')
    .upsert({
      ghl_id: data.id,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      custom_fields: data.customFields
    })
  
  if (error) throw error
}

async function handleOpportunityUpdate(data) {
  // Actualizar información del reclamo en Supabase
  const { error } = await supabaseClient
    .from('claims')
    .upsert({
      ghl_opportunity_id: data.id,
      status: mapGHLStatusToClaimStatus(data.status),
      custom_fields: data.customFields
    })
  
  if (error) throw error
}