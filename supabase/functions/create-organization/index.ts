import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      email, password, adminName, phone, 
      mandalName, area, city, state 
    } = await req.json();

    // --- STEP 0: DATA INTEGRITY PRE-CHECKS ---
    
    // Check if Mandal already exists with the same "Big Four" identity
    const { data: existingMandal } = await supabaseAdmin
      .from('mandals')
      .select('id')
      .match({ 
        name: mandalName, 
        area: area, 
        city: city, 
        state: state 
      })
      .maybeSingle();

    if (existingMandal) {
      throw new Error("Your Mandal is already registered with us. Contact support if you believe this is an error.");
    }

    // Check if the email is already in use (One Email = One Mandal policy)
    // Checking the profiles table is faster than checking Auth admin
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("This email is already associated with another Mandal.");
    }

    // --- STEP 1: CREATE AUTH USER ---
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: adminName }
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // --- STEP 2: ATOMIC DATABASE SETUP ---
    const { error: rpcError } = await supabaseAdmin.rpc('create_organization', {
      p_user_id: userId,
      p_mandal_name: mandalName,
      p_area: area,
      p_city: city,
      p_state: state,
      p_full_name: adminName,
      p_phone: phone
    });

    if (rpcError) {
      // --- STEP 3: AFFORDABLE ROLLBACK ---
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Database Setup Failed: ${rpcError.message}`);
    }

    return new Response(
      JSON.stringify({ message: "Organization setup successful", userId }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      }
    );
  }
})