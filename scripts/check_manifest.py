import json

with open('public/audio/manifest.json', encoding='utf-8') as f:
    manifest = json.load(f)
with open('data/lesson.json', encoding='utf-8') as f:
    lesson = json.load(f)

def check(label, key):
    status = 'OK' if key in manifest else 'MISS'
    print(f'  [{status}] {key}')

print('=== QUIZ TRUE/FALSE ===')
for q in lesson['quiz']['trueFalse']:
    check('tf', q['question'])

print('\n=== FILL IN BLANKS - questions ===')
for q in lesson['quiz']['fillInTheBlanks']:
    check('fib', q['question'])

print('\n=== FILL IN BLANKS - options ===')
for q in lesson['quiz']['fillInTheBlanks']:
    for o in q['options']:
        check('opt', o)

print('\n=== VOCAB WORDS ===')
for v in lesson['vocabularyGame']:
    check('word', v['word'])
    for l in v['letters']:
        check('letter', l)
