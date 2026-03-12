import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMB_PLANNER_URL = 'https://api.tmb.cat/v1/planner/plan';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMB_APP_ID = Deno.env.get('TMB_APP_ID');
    const TMB_APP_KEY = Deno.env.get('TMB_APP_KEY');

    if (!TMB_APP_ID) throw new Error('TMB_APP_ID is not configured');
    if (!TMB_APP_KEY) throw new Error('TMB_APP_KEY is not configured');

    const { fromLat, fromLon, toLat, toLon } = await req.json();

    if (!fromLat || !fromLon || !toLat || !toLon) {
      return new Response(JSON.stringify({ error: 'Missing coordinates' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Current date/time for the query
    const now = new Date();
    const date = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}`;
    const hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const time = `${String(h12).padStart(2, '0')}:${mins}${ampm}`;

    const params = new URLSearchParams({
      app_id: TMB_APP_ID,
      app_key: TMB_APP_KEY,
      fromPlace: `${fromLat},${fromLon}`,
      toPlace: `${toLat},${toLon}`,
      date,
      time,
      arriveBy: 'false',
      mode: 'TRANSIT,WALK',
      maxWalkDistance: '1000',
      showIntermediateStops: 'true',
    });

    const response = await fetch(`${TMB_PLANNER_URL}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`TMB API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('TMB Planner error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
