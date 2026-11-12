<div dir="rtl">

# arabic-normalizer — تطبيع النصوص العربية

[![CI](https://github.com/shadow1t/arabic-normalizer/actions/workflows/ci.yml/badge.svg)](https://github.com/shadow1t/arabic-normalizer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![No dependencies](https://img.shields.io/badge/dependencies-0-success)](./package.json)

مكتبة JavaScript **بلا أي اعتماديات** لتطبيع النصوص العربية — إزالة التشكيل، توحيد الهمزات والتاء المربوطة والألف المقصورة، تحويل الأرقام العربية والفارسية، فكّ الحروف المركّبة، وإزالة المحارف الخفية — لتستخدمها في **البحث، الفهرسة، إزالة التكرار، والمقارنة**.

## لماذا؟

الكلمة العربية الواحدة يمكن كتابتها بأشكال متعددة، فتفشل المقارنات والبحث:

```js
'سؤال' !== 'سوال'   // همزة على واو
'مدرسة' !== 'مدرسه' // تاء مربوطة
'أحمد'  !== 'احمد'  // همزة على ألف
'٤٥'    !== '45'    // أرقام عربية
'ﻻ'     !== 'لا'    // حرف مركّب (Presentation Form)
```

مع `normalizeForSearch()` كلها تصبح **متطابقة**:

```js
import { normalizeForSearch } from 'arabic-normalizer';

normalizeForSearch('سؤال') === normalizeForSearch('سوال'); // true ✓
normalizeForSearch('٤٥ ريال') === normalizeForSearch('45 ريال'); // true ✓
```

## التثبيت

```bash
npm install arabic-normalizer
```

أو مباشرة من GitHub:

```bash
npm install github:shadow1t/arabic-normalizer
```

لا حاجة لأي حزمة إضافية — لا dependencies ولا devDependencies.

## الاستخدام

### Node.js (ESM)

```js
import { normalize, normalizeForSearch } from 'arabic-normalizer';

// الوضع الافتراضي (آمن): تشكيل + تطويل + همزات الألف + فكّ المركّبات
normalize('مُقَابِلُ الْبَلَدِ اَلْعَرَبِيَّةِ');
// → "مقبل البلد العربية"  (التاء المربوطة والألف المقصورة محفوظتان)

// مسبار البحث: كل التحويلات العدوانية + أرقام لاتينية + تصغير اللاتيني
normalizeForSearch('إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ');
// → "ان الله يامر بالعدل"
```

### المتصفح

```html
<script type="module">
  import { normalize } from 'https://cdn.jsdelivr.net/gh/shadow1t/arabic-normalizer@main/index.js';
  console.log(normalize('مُحَمَّدٌ')); // محمد
</script>
```

### TypeScript

ملف الأنواع `index.d.ts` مرفق — لا حاجة لـ `@types`.

## الدوال

| الدالة | الوظيفة |
| --- | --- |
| `normalize(text, options?)` | التطبيع الشامل حسب خيارات دقيقة |
| `normalizeForSearch(text)` | مسبار جاهز للبحث والفهرسة |
| `stripTashkeel(text)` | إزالة الحركات والتشكيل وعلامات الضبط القرآنية |
| `hasTashkeel(text)` | هل يحتوي النص تشكيلًا؟ |
| `stripTatweel(text)` / `removeKashida` | إزالة التطويل (ـ) |
| `normalizeHamza(text)` | آ أ إ ٱ → ا |
| `normalizeHamzaCarriers(text)` | ؤ → و، ئ → ي (عدواني) |
| `normalizeTaaMarbuta(text)` | ة → ه (عدواني) |
| `normalizeAlefMaqsura(text)` | ى → ي (عدواني) |
| `normalizeLigatures(text)` | فكّ الحروف المركّبة: ﻻ → لا، ﻷ → لأ، والحروف المعزولة |
| `normalizeDigits(text, target?)` | الأرقام: 'latin' (٠١٢→012) أو 'arabic' (012→٠١٢) |
| `normalizePunctuation(text)` | ، ؛ ؟ ٪ → , ; ? % |
| `removeInvisible(text)` | إزالة ZWJ/ZWNJ/ZWSP/BOM/ALM وعلامات الاتجاه |
| `normalizeWhitespace(text)` | دمج الفراغات المتعددة |
| `stripNonArabic(text)` | حذف كل ما ليس حرفًا عربيًا |
| `arabicRatio(text)` | نسبة الحروف العربية من مجموع الحروف (0–1) |
| `isArabic(text, threshold?)` | هل النص عربيًا أساسًا؟ |

## خيارات `normalize()`

كل الخيارات اختيارية — الافتراضي متحفظ لا يغيّر المعنى:

| الخيار | الافتراضي | الوظيفة |
| --- | --- | --- |
| `tashkeel` | `true` | إزالة التشكيل |
| `tatweel` | `true` | إزالة التطويل/الكشيدة |
| `ligatures` | `true` | فكّ الحروف المركّبة والصور العرضية |
| `invisible` | `true` | إزالة المحارف الخفية والاتجاهية |
| `hamza` | `true` | آ أ إ ٱ → ا |
| `hamzaCarriers` | `false` | ؤ → و، ئ → ي |
| `taaMarbuta` | `false` | ة → ه |
| `alefMaqsura` | `false` | ى → ي |
| `digits` | `'keep'` | `'keep'` \| `'latin'` \| `'arabic'` |
| `punctuation` | `'keep'` | `'keep'` \| `'latin'` |
| `whitespace` | `false` | دمج الفراغات المتعددة |
| `nonArabic` | `'keep'` | `'keep'` \| `'strip'` |
| `lowercaseLatin` | `false` | تصغير الحروف اللاتينية |

مثال على التخصيص:

```js
import { normalize } from 'arabic-normalizer';

normalize('مدرسة ٤٥ طالبة', {
  taaMarbuta: true,
  digits: 'latin',
  whitespace: true,
});
// → "مدرسه 45 طالبه"
```

## حالات استخدام واقعية

- **محرك بحث عربي**: طبّق `normalizeForSearch` على الاستعلام وعلى النص المفهرس قبل المطابقة.
- **إزالة التكرار**: مقارنة سجلات مكتوبة بمصادر مختلفة (نسخ/لصق، OCR).
- **بيانات المستخدمين**: تطبيع أسماء وأرقام هواتف مدخلة بلوحة مفاتيح عربية قبل التحقق.
- **NLP**: خطوة معالجة أولية قبل التقطيع أو التحليل.

## الاختبارات

```bash
npm test    # node --test tests/
```

## المساهمة

المشكلات والاقتراحات مرحّب بها في [Issues](https://github.com/shadow1t/arabic-normalizer/issues).
إذا أضفت ميزة، أشغل الاختبارات أولًا وأرفق اختبارات لحالتك.

## الرخصة

[MIT](./LICENSE) © 2026 Rasheed (shadow1t)

</div>

---

<div dir="ltr">

## English

**arabic-normalizer** is a zero-dependency JavaScript library for normalizing Arabic text: stripping diacritics (tashkeel/harakat), unifying hamza variants (`آ أ إ ٱ → ا`), taa marbuta (`ة → ه`), alef maqsura (`ى → ي`), converting Eastern Arabic digits (`٠١٢ → 012`), decomposing ligatures/presentation forms (`ﻻ → لا`), and removing invisible characters — designed for **search, indexing, deduplication, and comparison**.

```js
import { normalize, normalizeForSearch } from 'arabic-normalizer';

normalize('مُحَمَّدٌ');               // → "محمد"
normalizeForSearch('سؤال') === normalizeForSearch('سوال'); // → true
```

- Works in Node.js (ESM) and browsers, TypeScript definitions included.
- Conservative by default; aggressive variants are opt-in or via `normalizeForSearch()`.
- Run tests: `npm test` (uses `node --test`).

**License:** [MIT](./LICENSE)

</div>
