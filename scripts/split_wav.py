"""
Split wav files into individual phrases using ffmpeg silence detection.
No pydub required — uses ffmpeg directly.
"""
import os, json, hashlib, subprocess, re

OUTPUT_DIR = 'public/audio'
MANIFEST_PATH = os.path.join(OUTPUT_DIR, 'manifest.json')

def sha(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest() + '.mp3'

QUIZ_PHRASES = [
    'شاهه عبداللطيف ڀٽائي صوفي شاعر هو۔',
    'شاهه ڀٽائي سنڌي نثر لکندو هو۔',
    'شاهه جو رسالو فارسي زبان ۾ آهي۔',
    'سندس مزار لاڙڪاڻي ۾ آهي۔',
    'هو انسانيت، محبت، ۽ امن جو پرچارڪ هو۔',
    'هو ______ ۾ پيدا ٿيو۔',
    'شاهه عبداللطيف ڀٽائي سنڌ جو ______ شاعر هو۔',
    'شاهه ڀٽائي جو مزار ______ ۾ آهي۔',
    'سندس شاعري جو مجموعو ______ سڏجي ٿو۔',
]

LONG_PHRASES = [
    'سندس مزار ڀٽ شاهه ۾ آهي، جتي هزارين ماڻهو هر سال حاضري ڀرين ٿا.',
    'شاهه عبداللطيف ڀٽائي سنڌ جو وڏو صوفي شاعر هو. هو 1689ع ۾ هالا ڀرسان ڀٽ شهر ۾ پيدا ٿيو.',
    'شاهه ڀٽائي پنهنجي شاعري ذريعي ماڻهن کي اخلاص، ڀائيچاري ۽ قرباني جو درس ڏنو. هو سادو زندگي گذاريندڙ انسان هو ۽ سڄي حياتي صوفي ازم، فڪر، ۽ تصوف جي واٽ تي هليو.',
    'سندس شاعري ۾ محبت، امن، سچائي، ۽ انسانيت جا سبق آهن. شاهه صاحب جي رسالي کي شاهه جو رسالو چيو وڃي ٿو، جيڪو سنڌي ادب جو خزانو آهي.',
]

FILES = {
    'quiz_sentences.wav': QUIZ_PHRASES,
    'long_sentence.wav': LONG_PHRASES,
}

def detect_silence(wavfile, noise_db=-35, duration=0.5):
    """Returns list of (start, end) tuples for silent regions."""
    cmd = [
        'ffmpeg', '-i', wavfile,
        '-af', f'silencedetect=noise={noise_db}dB:d={duration}',
        '-f', 'null', '-'
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', output)]
    ends   = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', output)]
    return list(zip(starts, ends))

def get_duration(wavfile):
    cmd = ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
           '-of', 'default=noprint_wrappers=1:nokey=1', wavfile]
    return float(subprocess.check_output(cmd).strip())

def extract_chunk(wavfile, start, end, outpath):
    duration = end - start
    subprocess.run([
        'ffmpeg', '-y', '-i', wavfile,
        '-ss', str(start), '-t', str(duration),
        '-af', 'loudnorm',
        '-codec:a', 'libmp3lame', '-b:a', '64k',
        outpath
    ], capture_output=True)

def split_file(wavfile, phrases):
    print(f'\nProcessing {wavfile} ({len(phrases)} phrases expected)...')
    total_dur = get_duration(wavfile)

    # Try different thresholds until chunk count matches
    silences = []
    for noise_db, min_dur in [(-35, 0.5), (-38, 0.4), (-32, 0.4), (-30, 0.3)]:
        silences = detect_silence(wavfile, noise_db, min_dur)
        # Speech segments = gaps between silences
        print(f'  noise={noise_db}dB dur={min_dur}s -> {len(silences)} silence regions')
        if len(silences) == len(phrases) - 1 or len(silences) >= len(phrases) - 1:
            break

    # Build speech segment boundaries from silence gaps
    # Each speech segment: from end of previous silence to start of next silence
    boundaries = []
    prev_end = 0.0
    for s_start, s_end in silences:
        boundaries.append((prev_end, s_start))
        prev_end = s_end
    boundaries.append((prev_end, total_dur))

    # Filter out very short segments (< 0.3s) — likely noise
    boundaries = [(s, e) for s, e in boundaries if e - s > 0.3]

    print(f'  Speech segments found: {len(boundaries)}, expected: {len(phrases)}')

    if len(boundaries) != len(phrases):
        print(f'  Mismatch — saving debug chunks to public/audio/_debug_*')
        for i, (s, e) in enumerate(boundaries, 1):
            out = os.path.join(OUTPUT_DIR, f'_debug_{os.path.splitext(wavfile)[0]}_{i:02d}.mp3')
            extract_chunk(wavfile, s, e, out)
            print(f'    chunk {i:02d}: {s:.2f}s - {e:.2f}s ({e-s:.2f}s) -> {os.path.basename(out)}')
        return None

    return boundaries

with open(MANIFEST_PATH, encoding='utf-8') as f:
    manifest = json.load(f)

for wavfile, phrases in FILES.items():
    boundaries = split_file(wavfile, phrases)
    if boundaries is None:
        continue

    for phrase, (start, end) in zip(phrases, boundaries):
        filename = sha(phrase)
        outpath = os.path.join(OUTPUT_DIR, filename)
        extract_chunk(wavfile, start, end, outpath)
        manifest[phrase] = filename
        print(f'  ✓  {phrase[:65]}')

with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print('\nDone. Manifest updated.')
