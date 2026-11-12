import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as an from '../index.js';

const {
  normalize,
  normalizeForSearch,
  stripTashkeel,
  stripTatweel,
  removeKashida,
  normalizeHamza,
  normalizeHamzaCarriers,
  normalizeTaaMarbuta,
  normalizeAlefMaqsura,
  normalizeLigatures,
  normalizeDigits,
  normalizePunctuation,
  removeInvisible,
  normalizeWhitespace,
  stripNonArabic,
  hasTashkeel,
  arabicRatio,
  isArabic,
} = an;

// ---------------------------------------------------------------------------
// stripTashkeel / hasTashkeel
// ---------------------------------------------------------------------------

test('stripTashkeel removes basic harakat, shadda and tanwin', () => {
  assert.equal(stripTashkeel('مُحَمَّدٌ'), 'محمد');
  assert.equal(stripTashkeel('السَّلَامُ عَلَيْكُمْ'), 'السلام عليكم');
  assert.equal(stripTashkeel('مَكْتَبٍ'), 'مكتب');
});

test('stripTashkeel removes Quranic annotation marks and superscript alef', () => {
  assert.equal(stripTashkeel('قُرْآن\u06D6'), 'قرآن');
  assert.equal(stripTashkeel('علي\u0670'), 'علي'); // ٰ superscript alef
});

test('stripTashkeel leaves undiacritized text untouched', () => {
  assert.equal(stripTashkeel('مرحبا بالعالم'), 'مرحبا بالعالم');
  assert.equal(stripTashkeel(''), '');
});

test('hasTashkeel detects diacritics', () => {
  assert.equal(hasTashkeel('مُحَمَّد'), true);
  assert.equal(hasTashkeel('محمد'), false);
  assert.equal(hasTashkeel(''), false);
});

// ---------------------------------------------------------------------------
// stripTatweel / removeKashida
// ---------------------------------------------------------------------------

test('stripTatweel removes kashida and equals removeKashida', () => {
  assert.equal(stripTatweel('ه\u0640\u0640\u0640ذا'), 'هذا');
  assert.equal(removeKashida('رح\u0640\u0640بة'), 'رحبة');
});

// ---------------------------------------------------------------------------
// Hamza normalization
// ---------------------------------------------------------------------------

test('normalizeHamza unifies alef hamza variants', () => {
  assert.equal(normalizeHamza('قرآن'), 'قران');
  assert.equal(normalizeHamza('أحمد'), 'احمد');
  assert.equal(normalizeHamza('إبراهيم'), 'ابراهيم');
  assert.equal(normalizeHamza('\u0671لكتاب'), 'الكتاب'); // ٱ alef wasla
  assert.equal(normalizeHamza('اسم'), 'اسم'); // plain alef untouched
});

test('normalizeHamzaCarriers unifies waw/ya carriers', () => {
  assert.equal(normalizeHamzaCarriers('سؤال'), 'سوال');
  assert.equal(normalizeHamzaCarriers('مسؤول'), 'مسوول');
  assert.equal(normalizeHamzaCarriers('شيئ'), 'شيي'); // ئ → ي
});

test('normalizeTaaMarbuta and normalizeAlefMaqsura', () => {
  assert.equal(normalizeTaaMarbuta('مدرسة جميلة'), 'مدرسه جميله');
  assert.equal(normalizeAlefMaqsura('على مصطفى'), 'علي مصطفي');
});

// ---------------------------------------------------------------------------
// Digits
// ---------------------------------------------------------------------------

test('normalizeDigits converts Arabic-Indic and extended digits to latin', () => {
  assert.equal(normalizeDigits('٣٤٥'), '345');
  assert.equal(normalizeDigits('٢٠٢٦'), '2026');
  assert.equal(normalizeDigits('\u06F9\u06F8\u06F7'), '987'); // ۹۸۷
  assert.equal(normalizeDigits('سنة ٢٠٢٦م'), 'سنة 2026م');
});

test('normalizeDigits converts latin digits to Arabic-Indic', () => {
  assert.equal(normalizeDigits('2026', 'arabic'), '٢٠٢٦');
  assert.equal(normalizeDigits('v1.2', 'arabic'), 'v١.٢');
});

// ---------------------------------------------------------------------------
// Punctuation / invisible / whitespace / nonArabic
// ---------------------------------------------------------------------------

test('normalizePunctuation maps Arabic punctuation to latin', () => {
  assert.equal(normalizePunctuation('مرحبا، كيف حالك؟'), 'مرحبا, كيف حالك?');
  assert.equal(normalizePunctuation('نعم؛ ٥٠٪'), 'نعم; ٥٠%');
});

test('removeInvisible strips ZWJ, ZWNJ, ZWSP, BOM and direction marks', () => {
  assert.equal(removeInvisible('ا\u200Cل'), 'ال'); // ZWNJ
  assert.equal(removeInvisible('عر\u200Bاق'), 'عراق'); // ZWSP
  assert.equal(removeInvisible('\uFEFFبسم'), 'بسم'); // BOM
  assert.equal(removeInvisible('نص\u200F\u061C'), 'نص'); // RLM + ALM
});

test('normalizeWhitespace collapses runs of whitespace and trims', () => {
  assert.equal(normalizeWhitespace('  أهلا   بالعالم\n\n\tكيف  '), 'أهلا بالعالم كيف');
});

test('stripNonArabic removes latin letters, latin digits and symbols', () => {
  assert.equal(stripNonArabic('مرحبا Hello 123!'), 'مرحبا  ');
  assert.equal(
    normalize('مرحبا Hello 123!', { nonArabic: 'strip', whitespace: true }),
    'مرحبا'
  );
});

// ---------------------------------------------------------------------------
// Ligatures / presentation forms
// ---------------------------------------------------------------------------

test('normalizeLigatures decomposes lam-alef and isolated presentation forms', () => {
  assert.equal(normalizeLigatures('\uFEFB'), 'لا'); // ﻻ
  assert.equal(normalizeLigatures('\uFEF5'), 'لآ'); // ﻵ
  assert.equal(normalizeLigatures('\uFE8D\uFEE9'), 'اه'); // isolated alef + isolated heh
});

test('normalize applies ligature decomposition before hamza unification', () => {
  // ﻷ (lam + alef-hamza ligature) → لا after hamza normalization
  assert.equal(normalize('\uFEF7'), 'لا');
});

// ---------------------------------------------------------------------------
// arabicRatio / isArabic
// ---------------------------------------------------------------------------

test('arabicRatio computes the share of Arabic letters', () => {
  assert.equal(arabicRatio('محمد'), 1);
  assert.equal(arabicRatio('hello'), 0);
  assert.ok(Math.abs(arabicRatio('hello محمد') - 4 / 9) < 1e-9);
  assert.equal(arabicRatio(''), 0);
});

test('isArabic with default and custom thresholds', () => {
  assert.equal(isArabic('هذا نص عربي'), true);
  assert.equal(isArabic('this is english'), false);
  assert.equal(isArabic('نص mixed عربي'), true);
  assert.equal(isArabic('نص mixed عربي', 0.8), false);
});

// ---------------------------------------------------------------------------
// normalize() defaults and options
// ---------------------------------------------------------------------------

test('normalize defaults: tashkeel/tatweel/hamza on, conservative variants off', () => {
  assert.equal(normalize('مُدَرَّسَةً قِرَاءَة'), 'مدرسة قراءة'); // آ→ا but ة kept
  assert.equal(normalize('قر\u0640\u0640آن'), 'قران');
  assert.equal(normalize('على'), 'على'); // ى kept by default
  assert.equal(normalize('٤٥'), '٤٥'); // digits kept by default
});

test('normalize can enable aggressive variants individually', () => {
  assert.equal(
    normalize('مدرسة على سؤال', { taaMarbuta: true, alefMaqsura: true, hamzaCarriers: true }),
    'مدرسه علي سوال'
  );
  assert.equal(normalize('مدرسة', { taaMarbuta: true }), 'مدرسه');
});

test('normalize with digits latin and punctuation latin', () => {
  assert.equal(
    normalize('السعر ٥٠٪، شكراً', { digits: 'latin', punctuation: 'latin' }),
    'السعر 50%, شكرا'
  );
});

test('normalize with whitespace collapse', () => {
  assert.equal(normalize('  نص   فيه فراغات  ', { whitespace: true }), 'نص فيه فراغات');
});

test('normalize lowercases latin when asked', () => {
  assert.equal(normalize('javascript في ٢٠٢٦', { digits: 'latin', lowercaseLatin: true }), 'javascript في 2026');
  assert.equal(normalize('JavaScript', { lowercaseLatin: true }), 'javascript');
});

test('normalize keeps arabic digits when digits: keep', () => {
  assert.equal(normalize('سنة ٢٠٢٦'), 'سنة ٢٠٢٦');
});

test('normalize handles empty strings and idempotency', () => {
  assert.equal(normalize(''), '');
  const once = normalize('إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ');
  assert.equal(normalize(once), once); // applying twice changes nothing
});

// ---------------------------------------------------------------------------
// normalizeForSearch()
// ---------------------------------------------------------------------------

test('normalizeForSearch produces a canonical search form', () => {
  assert.equal(normalizeForSearch('إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ'), 'ان الله يامر بالعدل');
  assert.equal(normalizeForSearch('مُحَمَّدٌ قَرَأَ الكِتَابَ'), 'محمد قرا الكتاب');
});

test('normalizeForSearch makes variant writings equal', () => {
  assert.equal(normalizeForSearch('سؤال'), normalizeForSearch('سوال'));
  assert.equal(normalizeForSearch('مدرسة'), normalizeForSearch('مدرسه'));
  assert.equal(normalizeForSearch('على'), normalizeForSearch('علي'));
  assert.equal(normalizeForSearch('٤٥ ريال'), normalizeForSearch('45 ريال'));
  assert.equal(normalizeForSearch('أحمد'), normalizeForSearch('احمد'));
  assert.equal(normalizeForSearch('QUERIES Hello'), normalizeForSearch('queries hello'));
});

test('normalizeForSearch collapses whitespace and latin punctuation', () => {
  assert.equal(normalizeForSearch('  مرحبا،   كيف حالك؟  '), 'مرحبا, كيف حالك?');
});

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

test('all functions throw TypeError on non-string input', () => {
  assert.throws(() => normalize(123), TypeError);
  assert.throws(() => normalize(null), TypeError);
  assert.throws(() => normalizeForSearch(undefined), TypeError);
  assert.throws(() => stripTashkeel(42), TypeError);
  assert.throws(() => normalizeHamza({}), TypeError);
  assert.throws(() => hasTashkeel([]), TypeError);
  assert.throws(() => arabicRatio(3.14), TypeError);
});

test('DEFAULT_OPTIONS is frozen and documented', () => {
  assert.equal(typeof an.DEFAULT_OPTIONS, 'object');
  assert.throws(() => { 'use strict'; an.DEFAULT_OPTIONS.hamza = false; }, TypeError);
  assert.equal(an.DEFAULT_OPTIONS.hamza, true);
});
