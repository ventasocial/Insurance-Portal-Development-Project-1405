// Servicio frontend para interactuar con GHL vía Supabase
import supabase from '../lib/supabase'

export const ghlService = {
  async triggerStatusUpdate(contactId, status, claimId) {
    const { data, error } = await supabase
      .functions.invoke('ghl-api', {
        body: {
          action: 'send_status_update',
          data: { contactId, status, claimId }
        }
      })
    
    if (error) throw error
    return data
  },
  
  async triggerAutomation(contactId, automationId, payload) {
    const { data, error } = await supabase
      .functions.invoke('ghl-api', {
        body: {
          action: 'trigger_automation',
          data: { contactId, automationId, payload }
        }
      })
    
    if (error) throw error
    return data
  }
}