/**
 * arabic-normalizer — تطبيع النصوص العربية
 * TypeScript definitions.
 * @license MIT
 */

export type DigitTarget = 'latin' | 'arabic';

export interface NormalizeOptions {
  /** إزالة التشكيل والحركات (افتراضي: true) */
  tashkeel?: boolean;
  /** إزالة التطويل/الكشيدة ـ (افتراضي: true) */
  tatweel?: boolean;
  /** فكّ الحروف المركّبة والصور العرضية (افتراضي: true) */
  ligatures?: boolean;
  /** إزالة المحارف الخفية ZWJ/ZWNJ/BOM/ALM (افتراضي: true) */
  invisible?: boolean;
  /** آ أ إ ٱ → ا (افتراضي: true) */
  hamza?: boolean;
  /** ؤ → و، ئ → ي (افتراضي: false — عدواني) */
  hamzaCarriers?: boolean;
  /** ة → ه (افتراضي: false — عدواني) */
  taaMarbuta?: boolean;
  /** ى → ي (افتراضي: false — عدواني) */
  alefMaqsura?: boolean;
  /** 'keep' | 'latin' | 'arabic' (افتراضي: 'keep') */
  digits?: 'keep' | DigitTarget;
  /** تحويل الترقيم العربي إلى لاتيني (افتراضي: 'keep') */
  punctuation?: 'keep' | 'latin';
  /** دمج الفراغات المتعددة (افتراضي: false) */
  whitespace?: boolean;
  /** حذف غير الحروف العربية (افتراضي: 'keep') */
  nonArabic?: 'keep' | 'strip';
  /** تصغير الحروف اللاتينية (افتراضي: false) */
  lowercaseLatin?: boolean;
}

export declare function normalize(text: string, options?: NormalizeOptions): string;
export declare function normalizeForSearch(text: string): string;

export declare function stripTashkeel(text: string): string;
export declare function stripTatweel(text: string): string;
export declare const removeKashida: typeof stripTatweel;
export declare function normalizeHamza(text: string): string;
export declare function normalizeHamzaCarriers(text: string): string;
export declare function normalizeTaaMarbuta(text: string): string;
export declare function normalizeAlefMaqsura(text: string): string;
export declare function normalizeLigatures(text: string): string;
export declare function normalizeDigits(text: string, target?: DigitTarget): string;
export declare function normalizePunctuation(text: string): string;
export declare function removeInvisible(text: string): string;
export declare function normalizeWhitespace(text: string): string;
export declare function stripNonArabic(text: string): string;
export declare function hasTashkeel(text: string): boolean;
export declare function arabicRatio(text: string): number;
export declare function isArabic(text: string, threshold?: number): boolean;

export declare const DEFAULT_OPTIONS: Readonly<Required<NormalizeOptions>>;
