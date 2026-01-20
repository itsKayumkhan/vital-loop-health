import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-08-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        // User Client for Auth
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await userClient.auth.getUser();
        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        const { session_id, order_id } = await req.json()

        if (!session_id) {
            throw new Error('Missing session_id');
        }

        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            throw new Error('Session not found');
        }

        // 2. Verify payment status
        if (session.payment_status !== 'paid') {
            return new Response(
                JSON.stringify({ success: false, message: 'Payment not paid', status: session.payment_status }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // 3. Connect to Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 4. Update Order Status
        // If order_id is provided, use it. Otherwise use metadata.order_id
        const targetOrderId = order_id || session.metadata?.order_id;

        if (!targetOrderId) {
            console.warn('No order_id found in request or metadata');
            // We can still try to find the order by session if we stored it, but we didn't.
        } else {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'Paid', payment_intent_id: session.payment_intent })
                .eq('id', targetOrderId)
                .eq('customer_id', user.id);

            if (error) {
                console.error('Failed to update order:', error);
                throw error;
            }
        }

        return new Response(
            JSON.stringify({ success: true, orderId: targetOrderId }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        console.error('Error verifying payment:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
