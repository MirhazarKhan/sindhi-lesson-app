import { audioCache } from './audioCache';

let currentAudio: HTMLAudioElement | null = null;
let currentPlayId = 0;
let noBalanceNotified = false;

// Loaded once from /audio/manifest.json
let staticManifest: Record<string, string> | null = null;

const sindhiLetterNames: Record<string, string> = {
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
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function playBlob(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    currentAudio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    currentAudio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    currentAudio.play().catch(() => resolve());
  });
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    currentAudio = new Audio(url);
    currentAudio.onended = () => resolve();
    currentAudio.onerror = () => resolve();
    currentAudio.play().catch(() => resolve());
  });
}

async function loadManifest(): Promise<Record<string, string>> {
  if (staticManifest) return staticManifest;
  try {
    const res = await fetch('/audio/manifest.json');
    if (res.ok) {
      staticManifest = await res.json();
      return staticManifest!;
    }
  } catch { /* no manifest yet */ }
  staticManifest = {};
  return staticManifest;
}

function notifyNoBalance() {
  if (noBalanceNotified) return;
  noBalanceNotified = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tts:no-balance'));
  }
  console.warn('[TTS] UpliftAI balance exhausted. Visit https://upliftai.org to top up.');
}

async function fetchTTS(text: string): Promise<Blob | null> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.status === 402) { notifyNoBalance(); return null; }
    if (!res.ok) { console.error('[TTS] API error', res.status); return null; }
    return await res.blob();
  } catch (err) {
    console.error('[TTS] Fetch error:', err);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function playSindhiAudio(text: string): Promise<void> {
  if (!text || typeof window === 'undefined') return;

  stopAudio();
  const playId = ++currentPlayId;

  const textToRead = sindhiLetterNames[text] ?? text;

  try {
    // 1. Static pre-generated file (public/audio/)
    const manifest = await loadManifest();
    const staticFile = manifest[textToRead];
    if (staticFile) {
      if (playId !== currentPlayId) return;
      await playUrl(`/audio/${staticFile}`);
      return;
    }

    // 2. IndexedDB cache (previously fetched from API)
    const cached = await audioCache.get(textToRead);
    if (cached) {
      if (playId !== currentPlayId) return;
      await playBlob(cached);
      return;
    }

    // 3. UpliftAI live API
    const blob = await fetchTTS(textToRead);
    if (blob) {
      await audioCache.set(textToRead, blob);
      if (playId !== currentPlayId) return;
      await playBlob(blob);
      return;
    }

    // 4. Nothing available — banner already shown via notifyNoBalance()
  } catch (err) {
    console.error('[TTS] Playback error:', err);
  }
}

export async function prefetchLessonAudio(lessonData: any) {
  if (typeof window === 'undefined') return;

  // If static manifest covers everything, no API calls needed
  const manifest = await loadManifest();
  const texts = new Set<string>();

  lessonData.introSlides?.forEach((s: any) => texts.add(s.text));
  lessonData.vocabularyGame?.forEach((v: any) => {
    texts.add(v.word);
    v.letters.forEach((l: string) => texts.add(sindhiLetterNames[l] ?? l));
  });
  lessonData.quiz?.trueFalse?.forEach((q: any) => texts.add(q.question));
  lessonData.quiz?.fillInTheBlanks?.forEach((q: any) => {
    texts.add(q.question);
    q.options.forEach((o: string) => texts.add(o));
  });

  for (const text of texts) {
    if (manifest[text]) continue; // already have static file
    try {
      const cached = await audioCache.get(text);
      if (!cached) {
        const blob = await fetchTTS(text);
        if (blob) await audioCache.set(text, blob);
      }
    } catch (e) {
      console.error('[TTS] Prefetch error for:', text, e);
    }
  }
}

export function stopAudio() {
  currentPlayId++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined') {
    window.speechSynthesis?.cancel();
  }
}
