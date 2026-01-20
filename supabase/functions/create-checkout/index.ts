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

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            throw new Error('Unauthorized');
        }

        const { items, returnUrl, orderId } = await req.json();
        const userId = user.id;

        console.log('Creating checkout session for verified user:', userId);

        if (!items || items.length === 0) {
            throw new Error('No items in cart');
        }

        const line_items = items.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.node.title,
                    images: item.product.node.images?.edges?.[0]?.node?.url
                        ? [item.product.node.images.edges[0].node.url]
                        : [],
                    description: item.variantTitle !== 'Default Title' ? item.variantTitle : undefined,
                    metadata: {
                        product_id: item.product.node.id, // Our DB Product ID
                        variant_id: item.variantId
                    }
                },
                unit_amount: Math.round(parseFloat(item.price.amount) * 100), // Stripe expects cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            // Pass order_id in success_url so frontend can verify it
            success_url: `${returnUrl}/orders?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${returnUrl}/supplements`,
            client_reference_id: userId,
            metadata: {
                user_id: userId,
                order_id: orderId, // Link Stripe session to our DB Order
            },
        })

        console.log('Session created:', session.id);

        return new Response(
            JSON.stringify({ url: session.url, id: session.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
