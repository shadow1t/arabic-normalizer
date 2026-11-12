'use strict';

/**
 * arabic-normalizer — تطبيع النصوص العربية
 * Zero-dependency Arabic text normalization for JavaScript (Node.js & browsers).
 *
 * إزالة التشكيل والمدّ والتطويل، توحيد الهمزات والتاء المربوطة والألف المقصورة،
 * تحويل الأرقام العربية/الفارسية، فكّ الحروف المركّبة (Presentation Forms)،
 * وإزالة المحارف الخفية — كل ذلك بخيارات دقيقة تناسب البحث والفهرسة والمقارنة.
 *
 * @license MIT
 * @author Rasheed (shadow1t)
 * @see https://github.com/shadow1t/arabic-normalizer
 */

// ---------------------------------------------------------------------------
// Unicode constants
// ---------------------------------------------------------------------------

/** الحركات والتشكيل (بما فيها علامات الضبط القرآنية). */
const TASHKEEL_RE = /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;
const TASHKEEL_TEST_RE = /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/;

/** التطويل (الكشيدة). */
const TATWEEL_RE = /\u0640/g;

/** المحارف الخفية والاتجاهية: ALM و ZWJ/ZWNJ و ZWSP و BOM وعلامات الاتجاه. */
const INVISIBLE_RE = /[\u061C\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

/** الحروف المركّبة والصور العرضية (Arabic Presentation Forms A/B). */
const PRESENTATION_RE = /[\uFB50-\uFDFF\uFE70-\uFEFF]/g;

/** الأرقام العربية الشرقية (٠-٩) والموسّعة (۰-۹). */
const EASTERN_DIGITS_RE = /[\u0660-\u0669\u06F0-\u06F9]/g;

/** ألف علّم: توحيد الهمزات المكتوبة على الألف. */
const ALEF_VARIANTS = new Map([
  ['\u0622', '\u0627'], // آ (ألف ممدودة)
  ['\u0623', '\u0627'], // أ (ألف مع همزة)
  ['\u0625', '\u0627'], // إ (ألف مع همزة أسفل)
  ['\u0671', '\u0627'], // ٱ (ألف وصل)
]);

/** الهمزات على حروف العلة (توحيد عدواني يُستخدم غالبًا للبحث). */
const HAMZA_CARRIERS = new Map([
  ['\u0624', '\u0648'], // ؤ → و
  ['\u0626', '\u064A'], // ئ → ي
]);

/** ترقيم عربي → لاتيني. */
const PUNCTUATION_MAP = new Map([
  ['\u060C', ','], // ،
  ['\u061B', ';'], // ؛
  ['\u061F', '?'], // ؟
  ['\u066A', '%'], // ٪
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertString(fnName, text) {
  if (typeof text !== 'string') {
    throw new TypeError(
      `${fnName}: expected a string, got ${text === null ? 'null' : typeof text}`
    );
  }
}

function replaceWith(text, re, map) {
  return text.replace(re, (ch) => (map.has(ch) ? map.get(ch) : ch));
}

function easternDigitToLatin(ch) {
  const cp = ch.codePointAt(0);
  const base = cp <= 0x0669 ? 0x0660 : 0x06F0;
  return String.fromCodePoint(cp - base + 0x30);
}

// ---------------------------------------------------------------------------
// Single-purpose functions
// ---------------------------------------------------------------------------

/** إزالة التشكيل والحركات (فتحة، ضمة، كسرة، شدّة، تنوين، علامات ضبط قرآنية). */
export function stripTashkeel(text) {
  assertString('stripTashkeel', text);
  return text.replace(TASHKEEL_RE, '');
}

/** إزالة التطويل/الكشيدة (ـ). */
export function stripTatweel(text) {
  assertString('stripTatweel', text);
  return text.replace(TATWEEL_RE, '');
}

/** الاسم البديل لـ stripTatweel (الكشيدة = التطويل). */
export const removeKashida = stripTatweel;

/** توحيد الهمزات المكتوبة على الألف: آ أ إ ٱ → ا. */
export function normalizeHamza(text) {
  assertString('normalizeHamza', text);
  return replaceWith(text, /[\u0622\u0623\u0625\u0671]/g, ALEF_VARIANTS);
}

/** توحيد الهمزات على حروف العلة: ؤ → و، ئ → ي (عدواني — للبحث والمطابقة). */
export function normalizeHamzaCarriers(text) {
  assertString('normalizeHamzaCarriers', text);
  return replaceWith(text, /[\u0624\u0626]/g, HAMZA_CARRIERS);
}

/** توحيد التاء المربوطة: ة → ه (عدواني — للبحث). */
export function normalizeTaaMarbuta(text) {
  assertString('normalizeTaaMarbuta', text);
  return text.replace(/\u0629/g, '\u0647');
}

/** توحيد الألف المقصورة: ى → ي (عدواني — للبحث). */
export function normalizeAlefMaqsura(text) {
  assertString('normalizeAlefMaqsura', text);
  return text.replace(/\u0649/g, '\u064A');
}

/**
 * فكّ الحروف المركّبة والصور العرضية إلى حروف قياسية:
 * «ﻻ» → «لا»، «لأ» المركّبة → «لأ»، والحروف المعزولة (ﻟ ﺍ …) → حروف عادية.
 */
export function normalizeLigatures(text) {
  assertString('normalizeLigatures', text);
  return text.replace(PRESENTATION_RE, (ch) => ch.normalize('NFKC'));
}

/** تحويل الأرقام: 'latin' يحوّل ٠١٢/۰۱۲ → 012، و 'arabic' يحوّل 012 → ٠١٢. */
export function normalizeDigits(text, target = 'latin') {
  assertString('normalizeDigits', text);
  if (target === 'latin') return text.replace(EASTERN_DIGITS_RE, easternDigitToLatin);
  if (target === 'arabic') {
    return text.replace(/[0-9]/g, (ch) =>
      String.fromCodePoint(0x0660 + ch.codePointAt(0) - 0x30)
    );
  }
  return text;
}

/** تحويل الترقيم العربي إلى لاتيني: ، ؛ ؟ ٪ → , ; ? %. */
export function normalizePunctuation(text) {
  assertString('normalizePunctuation', text);
  return replaceWith(text, /[\u060C\u061B\u061F\u066A]/g, PUNCTUATION_MAP);
}

/** إزالة المحارف الخفية (ZWJ/ZWNJ/ZWSP/BOM/ALM وعلامات الاتجاه LRM/RLM). */
export function removeInvisible(text) {
  assertString('removeInvisible', text);
  return text.replace(INVISIBLE_RE, '');
}

/** دمج الفراغات المتعددة (مسافات، أسطر، جدولة) في مسافة واحدة مع تقليم الأطراف. */
export function normalizeWhitespace(text) {
  assertString('normalizeWhitespace', text);
  return text.replace(/\s+/g, ' ').trim();
}

/** حذف كل ما ليس حرفًا عربيًا أو فراغًا (يزيل اللاتيني والأرقام اللاتينية والرموز). */
export function stripNonArabic(text) {
  assertString('stripNonArabic', text);
  return text.replace(/[^\p{Script=Arabic}\s]/gu, '');
}

/** هل يحتوي النص على تشكيل؟ */
export function hasTashkeel(text) {
  assertString('hasTashkeel', text);
  return TASHKEEL_TEST_RE.test(text);
}

/** نسبة الحروف العربية من مجموع الحروف (0 حتى 1). يعيد 0 للنص الفارغ. */
export function arabicRatio(text) {
  assertString('arabicRatio', text);
  const letters = text.match(/\p{L}/gu) || [];
  if (letters.length === 0) return 0;
  const arabic = text.match(/\p{Script=Arabic}/gu) || [];
  return arabic.length / letters.length;
}

/** هل النص عربيًا أساسًا؟ (النسبة ≥ الحد المعطى، الافتراضي 0.5). */
export function isArabic(text, threshold = 0.5) {
  assertString('isArabic', text);
  return arabicRatio(text) >= threshold;
}

// ---------------------------------------------------------------------------
// normalize() — the main entry point
// ---------------------------------------------------------------------------

/** الخيارات الافتراضية لـ normalize(). */
export const DEFAULT_OPTIONS = Object.freeze({
  tashkeel: true,        // إزالة التشكيل
  tatweel: true,         // إزالة التطويل/الكشيدة
  ligatures: true,       // فكّ الحروف المركّبة والصور العرضية
  invisible: true,       // إزالة المحارف الخفية
  hamza: true,           // آ أ إ ٱ → ا
  hamzaCarriers: false,  // ؤ → و، ئ → ي
  taaMarbuta: false,     // ة → ه
  alefMaqsura: false,    // ى → ي
  digits: 'keep',        // 'keep' | 'latin' | 'arabic'
  punctuation: 'keep',  // 'keep' | 'latin'
  whitespace: false,     // دمج الفراغات المتعددة
  nonArabic: 'keep',     // 'keep' | 'strip'
  lowercaseLatin: false, // تصغير الحروف اللاتينية (للبحث)
});

/**
 * تطبيع النص العربي حسب الخيارات.
 * الترتيب مضمون داخليًا (فكّ المركّبات قبل توحيد الهمزات، إلخ).
 *
 * @param {string} text النص المراد تطبيعه.
 * @param {Partial<typeof DEFAULT_OPTIONS>} [options]
 * @returns {string}
 */
export function normalize(text, options = {}) {
  assertString('normalize', text);
  const o = { ...DEFAULT_OPTIONS, ...options };
  let s = text;
  if (o.ligatures) s = normalizeLigatures(s);
  if (o.tashkeel) s = stripTashkeel(s);
  if (o.tatweel) s = stripTatweel(s);
  if (o.hamza) s = normalizeHamza(s);
  if (o.hamzaCarriers) s = normalizeHamzaCarriers(s);
  if (o.taaMarbuta) s = normalizeTaaMarbuta(s);
  if (o.alefMaqsura) s = normalizeAlefMaqsura(s);
  if (o.digits === 'latin' || o.digits === 'arabic') s = normalizeDigits(s, o.digits);
  if (o.punctuation === 'latin') s = normalizePunctuation(s);
  if (o.invisible) s = removeInvisible(s);
  if (o.nonArabic === 'strip') s = stripNonArabic(s);
  if (o.whitespace) s = normalizeWhitespace(s);
  if (o.lowercaseLatin) s = s.toLowerCase();
  return s;
}

/**
 * مسبار جاهز للبحث والفهرسة: يطبّق كل التحويلات «العدوانية»
 * (الهمزات كلها، التاء المربوطة، الألف المقصورة، الأرقام اللاتينية،
 * الترقيم اللاتيني، دمج الفراغات، تصغير اللاتيني).
 * مثال: normalizeForSearch("سؤال") === normalizeForSearch("سوال") → true
 */
export function normalizeForSearch(text) {
  assertString('normalizeForSearch', text);
  return normalize(text, {
    hamzaCarriers: true,
    taaMarbuta: true,
    alefMaqsura: true,
    digits: 'latin',
    punctuation: 'latin',
    whitespace: true,
    lowercaseLatin: true,
  });
}
