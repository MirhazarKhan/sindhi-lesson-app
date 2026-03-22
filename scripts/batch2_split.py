"""
Split batch_2_short_phrases.wav into 14 individual MP3s using known silence boundaries.
"""
import os, json, hashlib, subprocess

OUTPUT_DIR = 'public/audio'
MANIFEST_PATH = os.path.join(OUTPUT_DIR, 'manifest.json')

def sha(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest() + '.mp3'

BATCH2_PHRASES = [
    'بهترين',
    'جنگجو',
    'جو',
    'رومانوي',
    'سيوهڻ',
    'سنڌ',
    'شاعر',
    'شاهه',
    'صوفي',
    'هو',
    'وڏو',
    'ڀٽائي',
    'ڀٽ شاهه',
    'ڪراچي',
]

# Silence regions detected at -30dB threshold
silences = [
    (0.548753, 1.347302),
    (1.805578, 2.678821),
    (2.898639, 4.026803),
    (4.488118, 5.317324),
    (5.733469, 6.709932),
    (7.095692, 8.053243),
    (8.370476, 9.262177),
    (9.483311, 10.289796),
    (10.685397, 11.58839),
    (11.820363, 12.796463),
    (13.17229, 14.10898),
    (14.494422, 15.351927),
    (15.956281, 16.883628),
    (17.311429, 18.085805),
]

# Speech segments = gaps between consecutive silences (skip leading silence before first word)
# Segment i = from end of silence[i] to start of silence[i+1]
boundaries = []
for i in range(len(silences) - 1):
    seg_start = silences[i][1]
    seg_end   = silences[i + 1][0]
    boundaries.append((seg_start, seg_end))
# Last phrase: end of last silence to end of file
boundaries.append((silences[-1][1], 18.5))

print(f'Segments: {len(boundaries)}, Phrases: {len(BATCH2_PHRASES)}')
for i, (s, e) in enumerate(boundaries):
    label = BATCH2_PHRASES[i] if i < len(BATCH2_PHRASES) else '?'
    print(f'  {i+1}: {s:.3f}s - {e:.3f}s ({e-s:.3f}s)  ->  {label}')

with open(MANIFEST_PATH, encoding='utf-8') as f:
    manifest = json.load(f)

for phrase, (start, end) in zip(BATCH2_PHRASES, boundaries):
    filename = sha(phrase)
    outpath = os.path.join(OUTPUT_DIR, filename)
    duration = end - start
    subprocess.run([
        'ffmpeg', '-y', '-i', 'batch_2_short_phrases.wav',
        '-ss', str(start), '-t', str(duration),
        '-af', 'loudnorm',
        '-codec:a', 'libmp3lame', '-b:a', '64k',
        outpath
    ], capture_output=True)
    manifest[phrase] = filename
    print(f'  OK  {phrase}  ->  {filename}')

with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print('\nManifest updated.')
