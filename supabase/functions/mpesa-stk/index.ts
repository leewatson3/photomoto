import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY') ?? ''
const CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET') ?? ''
const SHORTCODE = Deno.env.get('MPESA_SHORTCODE') ?? '174379'
const PASSKEY = Deno.env.get('MPESA_PASSKEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken(): Promise<string> {
  const credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)
  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${credentials}` } }
  )
  const data = await response.json()
  return data.access_token
}

function getTimestamp(): string {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, amount, reference } = await req.json()

    if (!phone || !amount || !reference) {
      return new Response(
        JSON.stringify({ error: 'Missing phone, amount or reference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let formattedPhone = phone.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1)
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1)

    const accessToken = await getAccessToken()
    const timestamp = getTimestamp()
    const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`)

    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.ceil(amount),
          PartyA: formattedPhone,
          PartyB: SHORTCODE,
          PhoneNumber: formattedPhone,
          CallBackURL: 'https://webhook.site/photomoto-callback',
          AccountReference: reference,
          TransactionDesc: `PhotoMoto ticket - ${reference}`,
        }),
      }
    )

    const stkData = await stkResponse.json()
    console.log('STK Response:', JSON.stringify(stkData))

    if (stkData.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: stkData.CheckoutRequestID,
          message: 'STK push sent successfully',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: stkData.errorMessage ?? 'STK push failed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})