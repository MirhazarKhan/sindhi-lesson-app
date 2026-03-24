"""
Split batch6.wav into 7 vocab word MP3s and update manifest.
Replaces the old Azure-generated versions with proper Sindhi TTS.
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

SILENCES = [
    (0.397642, 1.365306),
    (1.902449, 2.822449),
    (3.227755, 4.287256),
    (4.833832, 5.844036),
    (6.267891, 7.081995),
    (7.526077, 8.490340),
    (9.121315, 9.936871),
]

# Phrases in order as recorded: شاهه شاعر وڏو صوفي ڀٽائي سنڌ عبداللطيف
# These replace the diacritic versions used as manifest keys
PHRASES = [
    'شاهه',
    'شاعِر',
    'وَڏو',
    'صُوفي',
    'ڀِٽائي',
    'سِنڌ',
    'عَبدُاللَطِيف',
]

# Speech segments = gaps between consecutive silences
boundaries = [
    (SILENCES[i][1], SILENCES[i+1][0])
    for i in range(len(SILENCES) - 1)
] + [(SILENCES[-1][1], 10.5)]

with open(MANIFEST_PATH, encoding='utf-8') as f:
    manifest = json.load(f)

print(f'batch6.wav ({len(PHRASES)} phrases)')
for phrase, (start, end) in zip(PHRASES, boundaries):
    filename = sha(phrase)
    outpath = os.path.join(OUTPUT_DIR, filename)
    extract('batch6.wav', start, end, outpath)
    manifest[phrase] = filename
    print(f'  OK  {phrase}  ->  {filename}')

with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print('\nManifest updated.')
