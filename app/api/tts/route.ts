import { NextResponse } from 'next/server';

const AZURE_KEY = process.env.AZURE_SPEECH_KEY ?? '';
const AZURE_REGION = process.env.AZURE_SPEECH_REGION ?? 'eastus';
const AZURE_ENDPOINT = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

// ur-PK-AsadNeural — natural Urdu/Sindhi male voice
const VOICE = 'ur-PK-AsadNeural';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ur-PK">
        <voice name="${VOICE}">
          <prosody rate="-10%" pitch="-2st">
            ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </prosody>
        </voice>
      </speak>`.trim();

    const res = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
        'User-Agent': 'sindhi-lesson-app',
      },
      body: ssml,
    });

    if (res.ok) {
      const blob = await res.blob();
      return new NextResponse(blob, {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: 'NO_BALANCE' }, { status: 402 });
    }

    const err = await res.text();
    console.error('[TTS] Azure error', res.status, err);
    return NextResponse.json({ error: 'TTS provider error' }, { status: 502 });

  } catch (error) {
    console.error('[TTS] Route error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
