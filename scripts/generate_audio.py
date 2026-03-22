"""
Generate static Sindhi TTS audio files using Azure Cognitive Services.
Voice: ur-PK-AsadNeural (natural Urdu/Sindhi, multilingual neural)
Run once — files saved to public/audio/ and reused forever.

Usage: python scripts/generate_audio.py
"""

import os
import json
import hashlib
import requests
import time

AZURE_KEY = os.environ.get('AZURE_SPEECH_KEY', '')
AZURE_REGION = os.environ.get('AZURE_SPEECH_REGION', 'eastus')
ENDPOINT = f'https://{AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1'
VOICE = 'ur-PK-UzmaNeural'

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
LESSON_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'lesson.json')

SINDHI_LETTER_NAMES = {
    "ا": "الف", "ب": "بَي", "ٻ": "ٻَي", "ڀ": "ڀَي",
    "ت": "تَي", "ٿ": "ٿَي", "ٽ": "ٽَي", "ٺ": "ٺَي",
    "ث": "ثَي", "پ": "پَي", "ج": "جيم", "ڄ": "ڄَي",
    "جھ": "جھَي", "ڃ": "ڃَي", "چ": "چَي", "ڇ": "ڇَي",
    "ح": "حَي", "خ": "خَي", "د": "دال", "ڌ": "ڌال",
    "ڏ": "ڏال", "ڊ": "ڊال", "ڍ": "ڍال", "ذ": "ذال",
    "ر": "رَي", "ڙ": "ڙَي", "ز": "زَي", "س": "سين",
    "ش": "شين", "ص": "صاد", "ض": "ضاد", "ط": "طوي",
    "ظ": "ظوي", "ع": "عين", "غ": "غين", "ف": "فَي",
    "ڦ": "ڦَي", "ق": "قاف", "ڪ": "ڪاف", "ک": "کَي",
    "گ": "گاف", "ڳ": "ڳَي", "گھ": "گھَي", "ڱ": "ڱَي",
    "ل": "لام", "م": "ميم", "ن": "نون", "ڻ": "ڻون",
    "و": "واؤ", "ه": "هَي", "ء": "همزو", "ي": "يَي",
    "ئ": "همزو", "ے": "وڏي يَي",
}


def text_to_filename(text: str) -> str:
    return hashlib.sha1(text.encode('utf-8')).hexdigest() + '.mp3'


def make_ssml(text: str) -> str:
    safe = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ur-PK">
  <voice name="{VOICE}">
    <prosody rate="-5%" pitch="+2st" volume="+10%">{safe}</prosody>
  </voice>
</speak>"""


def collect_texts(lesson: dict) -> list:
    texts = set()

    texts.add('ڪانه پُڇي ٿو ذاتِ، جيڪي آيا سي اَگهيا')

    for slide in lesson.get('introSlides', []):
        texts.add(slide['text'])

    for vocab in lesson.get('vocabularyGame', []):
        texts.add(vocab['word'])
        for letter in vocab['letters']:
            name = SINDHI_LETTER_NAMES.get(letter, letter)
            texts.add(name)
            texts.add(letter)

    for q in lesson.get('quiz', {}).get('trueFalse', []):
        texts.add(q['question'])

    for q in lesson.get('quiz', {}).get('fillInTheBlanks', []):
        texts.add(q['question'])
        for opt in q.get('options', []):
            texts.add(opt)
        texts.add(q['answer'])

    texts.update([
        'بهترين',
        'صحيح جواب',
        'غلط جواب',
        'شاهه عبداللطيف ڀٽائي',
        'سنڌ جو عظيم صوفي شاعر',
    ])

    return sorted(texts)


def fetch_audio(text: str) -> bytes | None:
    try:
        res = requests.post(
            ENDPOINT,
            headers={
                'Ocp-Apim-Subscription-Key': AZURE_KEY,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
                'User-Agent': 'sindhi-lesson-app',
            },
            data=make_ssml(text).encode('utf-8'),
            timeout=30,
        )
        if res.status_code == 200:
            return res.content
        elif res.status_code in (401, 403):
            print('\n  [FATAL] Azure key invalid or unauthorized.')
            exit(1)
        else:
            print(f'  [err]  HTTP {res.status_code} — {res.text[:120]}')
            return None
    except Exception as e:
        print(f'  [err]  {e}')
        return None


def generate(texts: list):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    manifest = {}
    ok = skipped = failed = 0

    for i, text in enumerate(texts, 1):
        filename = text_to_filename(text)
        filepath = os.path.join(OUTPUT_DIR, filename)
        manifest[text] = filename

        if os.path.exists(filepath):
            print(f'  [{i:02}/{len(texts)}] skip  {text[:60]}')
            skipped += 1
            continue

        print(f'  [{i:02}/{len(texts)}] fetch {text[:60]}', end=' ', flush=True)
        audio = fetch_audio(text)

        if audio:
            with open(filepath, 'wb') as f:
                f.write(audio)
            print('✓')
            ok += 1
        else:
            print('✗')
            failed += 1

        time.sleep(0.15)

    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f'\n{"="*50}')
    print(f'Done: {ok} downloaded, {skipped} skipped, {failed} failed')
    print(f'Manifest: {manifest_path}')
    print(f'Total files: {len([f for f in os.listdir(OUTPUT_DIR) if f.endswith(".mp3")])} mp3s in public/audio/')


if __name__ == '__main__':
    with open(LESSON_FILE, encoding='utf-8') as f:
        lesson = json.load(f)

    texts = collect_texts(lesson)
    print(f'Collecting {len(texts)} unique texts to synthesize...\n')
    generate(texts)
