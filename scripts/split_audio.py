"""
Split a single long recording into individual phrase MP3s.
Detects silence gaps between phrases and maps them to the manifest.

Requirements:
    pip install pydub

Also needs ffmpeg installed:
    Windows: https://ffmpeg.org/download.html  (add to PATH)
    Or: winget install ffmpeg

Usage:
    python scripts/split_audio.py recording.mp3

The script will:
1. Split on silence (>700ms gap, threshold -40dBFS)
2. Save each chunk to public/audio/<hash>.mp3
3. Update public/audio/manifest.json
"""

import sys
import os
import json
import hashlib

try:
    from pydub import AudioSegment
    from pydub.silence import split_on_silence
except ImportError:
    print("Missing dependency. Run:  pip install pydub")
    sys.exit(1)

# ── Ordered list of phrases — must match recording order ─────────────────────
PHRASES = [
    "1589ع",
    "1689ع",
    "1789ع",
    "الف",
    "بهترين",
    "بَي",
    "جنگجو",
    "جو",
    "جيم",
    "دال",
    "رومانوي",
    "رَي",
    "سامي جا سلوڪ",
    "سندس شاعري جو مجموعو ______ سڏجي ٿو۔",
    "سندس شاعري ۾ محبت، امن، سچائي، ۽ انسانيت جا سبق آهن. شاهه صاحب جي رسالي کي \"شاهه جو رسالو\" چيو وڃي ٿو، جيڪو سنڌي ادب جو خزانو آهي.",
    "سندس مزار لاڙڪاڻي ۾ آهي۔",
    "سندس مزار ڀٽ شاهه ۾ آهي، جتي هزارين ماڻهو هر سال حاضري ڀرين ٿا.",
    "سنڌ جو عظيم صوفي شاعر",
    "سين",
    "سيوهڻ",
    "سِنڌ",
    "سچل جو رسالو",
    "شاعِر",
    "شاهه",
    "شاهه جو رسالو",
    "شاهه جو رسالو فارسي زبان ۾ آهي۔",
    "شاهه عبداللطيف ڀٽائي",
    "شاهه عبداللطيف ڀٽائي سنڌ جو ______ شاعر هو۔",
    "شاهه عبداللطيف ڀٽائي سنڌ جو وڏو صوفي شاعر هو. هو 1689ع ۾ هالا ڀرسان ڀٽ شهر ۾ پيدا ٿيو.",
    "شاهه عبداللطيف ڀٽائي صوفي شاعر هو۔",
    "شاهه ڀٽائي جو مزار ______ ۾ آهي۔",
    "شاهه ڀٽائي سنڌي نثر لکندو هو۔",
    "شاهه ڀٽائي پنهنجي شاعري ذريعي ماڻهن کي اخلاص، ڀائيچاري ۽ قرباني جو درس ڏنو. هو سادو زندگي گذاريندڙ انسان هو ۽ سڄي حياتي صوفي ازم، فڪر، ۽ تصوف جي واٽ تي هليو.",
    "شين",
    "صاد",
    "صحيح جواب",
    "صوفي",
    "صُوفي",
    "طوي",
    "عين",
    "عَبدُاللَطِيف",
    "غلط جواب",
    "فَي",
    "لام",
    "نون",
    "همزو",
    "هو",
    "هو ______ ۾ پيدا ٿيو۔",
    "هو انسانيت، محبت، ۽ امن جو پرچارڪ هو۔",
    "هَي",
    "واؤ",
    "وَڏو",
    "يَي",
    "ٽَي",
    "ڀَي",
    "ڀِٽائي",
    "ڀٽ شاهه",
    "ڌال",
    "ڏال",
    "ڪانه پُڇي ٿو ذاتِ، جيڪي آيا سي اَگهيا",
    "ڪراچي",
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
MANIFEST_PATH = os.path.join(OUTPUT_DIR, 'manifest.json')


def text_to_filename(text: str) -> str:
    return hashlib.sha1(text.encode('utf-8')).hexdigest() + '.mp3'


def split(recording_path: str):
    print(f"Loading {recording_path}...")
    audio = AudioSegment.from_file(recording_path)

    # Normalize volume
    audio = audio.normalize()

    print("Detecting silence and splitting...")
    chunks = split_on_silence(
        audio,
        min_silence_len=700,    # silence must be at least 700ms
        silence_thresh=-40,     # anything below -40dBFS is silence
        keep_silence=150,       # keep 150ms padding on each side
    )

    print(f"Found {len(chunks)} chunks, expected {len(PHRASES)}\n")

    if len(chunks) != len(PHRASES):
        print(f"⚠️  Chunk count mismatch!")
        print(f"   Got {len(chunks)} chunks but have {len(PHRASES)} phrases.")
        print(f"   Try adjusting silence detection or re-recording.")
        print(f"\n   Saving chunks anyway as chunk_01.mp3, chunk_02.mp3 ...")
        print(f"   Listen to them and re-record if needed.\n")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        for i, chunk in enumerate(chunks, 1):
            path = os.path.join(OUTPUT_DIR, f'chunk_{i:02d}.mp3')
            chunk.export(path, format='mp3', bitrate='64k')
            print(f"  Saved chunk_{i:02d}.mp3  ({len(chunk)}ms)")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load existing manifest
    manifest = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, encoding='utf-8') as f:
            manifest = json.load(f)

    print("Saving phrase files...")
    for i, (phrase, chunk) in enumerate(zip(PHRASES, chunks), 1):
        filename = text_to_filename(phrase)
        filepath = os.path.join(OUTPUT_DIR, filename)
        chunk.export(filepath, format='mp3', bitrate='64k')
        manifest[phrase] = filename
        print(f"  [{i:02}/{len(PHRASES)}] ✓  {phrase[:55]}")

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Done! {len(PHRASES)} files saved to public/audio/")
    print(f"Manifest updated: {MANIFEST_PATH}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python scripts/split_audio.py <recording.mp3>")
        print("Example: python scripts/split_audio.py my_recording.m4a")
        sys.exit(1)
    split(sys.argv[1])
