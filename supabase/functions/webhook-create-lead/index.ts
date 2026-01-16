import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LeadData {
  email: string;
  full_name: string;
  phone?: string;
  lead_source?: string;
  referral_source?: string;
  health_goals?: string;
  notes?: string;
  tags?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate webhook secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    console.log('Received webhook payload:', JSON.stringify(body));

    // Extract lead data - support both flat and nested structures
    const leadData: LeadData = {
      email: body.email || body.Email || body.data?.email || '',
      full_name: body.full_name || body.name || body.Name || body.data?.name || body.firstName + ' ' + (body.lastName || '') || '',
      phone: body.phone || body.Phone || body.data?.phone || null,
      lead_source: body.lead_source || body.source || 'webflow',
      referral_source: body.referral_source || body.referral || body.utm_source || null,
      health_goals: body.health_goals || body.goals || body.message || body.Message || null,
      notes: body.notes || body.additional_info || null,
      tags: body.tags || (body.form_name ? [body.form_name] : ['webflow-lead']),
    };

    // Validate required fields
    if (!leadData.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leadData.full_name || leadData.full_name.trim() === '') {
      leadData.full_name = leadData.email.split('@')[0]; // Fallback to email prefix
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if client already exists
    const { data: existingClient } = await supabase
      .from('crm_clients')
      .select('id, email')
      .eq('email', leadData.email.toLowerCase())
      .single();

    if (existingClient) {
      console.log('Client already exists:', existingClient.id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Client already exists',
          client_id: existingClient.id,
          duplicate: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new client/lead
    const { data: newClient, error: insertError } = await supabase
      .from('crm_clients')
      .insert({
        email: leadData.email.toLowerCase(),
        full_name: leadData.full_name.trim(),
        phone: leadData.phone,
        lead_source: leadData.lead_source,
        referral_source: leadData.referral_source,
        health_goals: leadData.health_goals,
        notes: leadData.notes,
        tags: leadData.tags,
        marketing_status: 'lead',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating client:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully created lead:', newClient.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead created successfully',
        client_id: newClient.id,
        duplicate: false
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
