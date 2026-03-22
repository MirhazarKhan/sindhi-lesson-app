"""
Split batch1.wav (21), batch4.wav (3), batch5.wav (1) into MP3s and update manifest.
Uses hardcoded silence boundaries derived from ffmpeg silencedetect.
"""
import os, json, hashlib, subprocess

OUTPUT_DIR = 'public/audio'
MANIFEST_PATH = os.path.join(OUTPUT_DIR, 'manifest.json')

def sha(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest() + '.mp3'

def extract(wavfile, start, end, outpath):
    subprocess.run([
        'ffmpeg', '-y', '-i', wavfile,
        '-ss', str(start), '-t', str(end - start),
        '-af', 'loudnorm',
        '-codec:a', 'libmp3lame', '-b:a', '64k',
        outpath
    ], capture_output=True)

# ── BATCH 1: letter names (21 phrases) ───────────────────────────────────────
# 21 silence regions detected → speech segments are gaps between them
# First silence is leading silence; phrases = gaps between silence[i].end and silence[i+1].start
BATCH1_SILENCES = [
    (0.37093,  1.521633),
    (1.720816, 2.771338),
    (3.031565, 3.963719),
    (4.31093,  5.30263),
    (5.477823, 6.380317),
    (6.76449,  7.561451),
    (7.884535, 8.893696),
    (9.25161,  10.21941),
    (10.435374,11.400363),
    (11.637914,12.501451),
    (12.676553,13.62322),
    (13.972472,14.990658),
    (15.299456,16.268798),
    (16.786213,17.716916),
    (17.889524,18.923401),
    (19.252562,20.25229),
    (20.394739,21.402177),
    (21.5439,  22.498277),
    (22.717914,23.728889),
    (24.075692,25.028571),
    (25.384807,26.211519),
]
BATCH1_PHRASES = [
    'الف', 'بَي', 'جيم', 'دال', 'رَي', 'سين', 'شين', 'صاد', 'طوي', 'عين',
    'فَي', 'لام', 'نون', 'همزو', 'هَي', 'واؤ', 'يَي', 'ٽَي', 'ڀَي', 'ڌال', 'ڏال',
]
# Phrases are in the gaps between consecutive silences (skip leading silence)
BATCH1_BOUNDARIES = [
    (BATCH1_SILENCES[i][1], BATCH1_SILENCES[i+1][0])
    for i in range(len(BATCH1_SILENCES) - 1)
] + [(BATCH1_SILENCES[-1][1], 27.0)]  # last phrase to end of file

# ── BATCH 4: dates (3 phrases) ───────────────────────────────────────────────
# 4 silence regions detected
BATCH4_SILENCES = [
    (1.275601, 2.141633),
    (2.734104, 3.158594),
    (3.660408, 4.545805),
    (6.02068,  6.733243),
]
BATCH4_PHRASES = ['1589ع', '1689ع', '1789ع']
BATCH4_BOUNDARIES = [
    (BATCH4_SILENCES[0][1], BATCH4_SILENCES[1][0]),  # 1589
    (BATCH4_SILENCES[1][1], BATCH4_SILENCES[2][0]),  # 1689
    (BATCH4_SILENCES[2][1], BATCH4_SILENCES[3][0]),  # 1789
]

# ── BATCH 5: splash quote (1 phrase) ─────────────────────────────────────────
BATCH5_PHRASES = ['ڪانه پُڇي ٿو ذاتِ، جيڪي آيا سي اَگهيا']
BATCH5_BOUNDARIES = [(0.0, 3.54)]

# ── Process ───────────────────────────────────────────────────────────────────
with open(MANIFEST_PATH, encoding='utf-8') as f:
    manifest = json.load(f)

BATCHES = [
    ('batch1.wav', BATCH1_PHRASES, BATCH1_BOUNDARIES),
    ('batch4.wav', BATCH4_PHRASES, BATCH4_BOUNDARIES),
    ('batch5.wav', BATCH5_PHRASES, BATCH5_BOUNDARIES),
]

for wavfile, phrases, boundaries in BATCHES:
    print(f'\n{wavfile} ({len(phrases)} phrases)')
    for phrase, (start, end) in zip(phrases, boundaries):
        filename = sha(phrase)
        outpath = os.path.join(OUTPUT_DIR, filename)
        extract(wavfile, start, end, outpath)
        manifest[phrase] = filename
        print(f'  OK  {phrase}  ->  {filename}')

with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print('\nManifest updated.')
