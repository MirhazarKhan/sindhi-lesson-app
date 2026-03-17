import { NextResponse } from 'next/server';

const UPLIFT_API_KEY = 'sk_api_b1c965d35f5675c0501515233f02e590437c46334e4c69a759aa47515982e7da';
const UPLIFT_ENDPOINT = 'https://api.upliftai.org/v1/synthesis/text-to-speech';
const SINDHI_VOICE_ID = 'v_sd0kl3m9';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const upliftRes = await fetch(UPLIFT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPLIFT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voiceId: SINDHI_VOICE_ID,
        text,
        outputFormat: 'MP3_22050_128',
      }),
    });

    if (upliftRes.ok) {
      const blob = await upliftRes.blob();
      return new NextResponse(blob, {
        headers: { 'Content-Type': upliftRes.headers.get('Content-Type') || 'audio/mpeg' },
      });
    }

    if (upliftRes.status === 402) {
      return NextResponse.json(
        { error: 'NO_BALANCE', message: 'UpliftAI account needs top-up at https://upliftai.org' },
        { status: 402 }
      );
    }

    const err = await upliftRes.text();
    console.error('[TTS] UpliftAI error', upliftRes.status, err);
    return NextResponse.json({ error: 'TTS provider error' }, { status: 502 });

  } catch (error) {
    console.error('[TTS] Route error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
