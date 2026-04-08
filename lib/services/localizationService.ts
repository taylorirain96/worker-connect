import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Language } from '@/types/global'

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', region: 'US' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', region: 'GB' },
  { code: 'en-AU', name: 'English (AU)', nativeName: 'English (AU)', region: 'AU' },
  { code: 'en-NZ', name: 'English (NZ)', nativeName: 'English (NZ)', region: 'NZ' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', region: 'ES' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', region: 'MX' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', region: 'FR' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', region: 'CA' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', region: 'BR' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', region: 'CN' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', region: 'TW' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
]

const BASE_TRANSLATIONS: Record<string, string> = {
  'nav.home': 'Home',
  'nav.jobs': 'Jobs',
  'nav.profile': 'Profile',
  'nav.earnings': 'Earnings',
  'nav.settings': 'Settings',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.success': 'Success',
  'tax.title': 'Tax Information',
  'tax.grossIncome': 'Gross Income',
  'tax.calculate': 'Calculate Taxes',
  'gdpr.title': 'Privacy & Data',
  'gdpr.export': 'Export My Data',
  'gdpr.delete': 'Delete My Account',
  'currency.convert': 'Convert Currency',
}

const LOCALE_TRANSLATIONS: Record<string, Record<string, string>> = {
  'es-ES': {
    'nav.home': 'Inicio',
    'nav.jobs': 'Trabajos',
    'nav.profile': 'Perfil',
    'nav.earnings': 'Ganancias',
    'nav.settings': 'Configuración',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.success': 'Éxito',
    'tax.title': 'Información Fiscal',
    'tax.grossIncome': 'Ingresos Brutos',
    'tax.calculate': 'Calcular Impuestos',
    'gdpr.title': 'Privacidad y Datos',
    'gdpr.export': 'Exportar Mis Datos',
    'gdpr.delete': 'Eliminar Mi Cuenta',
    'currency.convert': 'Convertir Moneda',
  },
  'fr-FR': {
    'nav.home': 'Accueil',
    'nav.jobs': 'Emplois',
    'nav.profile': 'Profil',
    'nav.earnings': 'Revenus',
    'nav.settings': 'Paramètres',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.success': 'Succès',
    'tax.title': 'Informations Fiscales',
    'tax.grossIncome': 'Revenu Brut',
    'tax.calculate': 'Calculer les Impôts',
    'gdpr.title': 'Confidentialité et Données',
    'gdpr.export': 'Exporter Mes Données',
    'gdpr.delete': 'Supprimer Mon Compte',
    'currency.convert': 'Convertir Devise',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.jobs': 'Jobs',
    'nav.profile': 'Profil',
    'nav.earnings': 'Einnahmen',
    'nav.settings': 'Einstellungen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.loading': 'Laden...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.success': 'Erfolg',
    'tax.title': 'Steuerinformationen',
    'tax.grossIncome': 'Bruttoeinkommen',
    'tax.calculate': 'Steuern Berechnen',
    'gdpr.title': 'Datenschutz',
    'gdpr.export': 'Meine Daten Exportieren',
    'gdpr.delete': 'Mein Konto Löschen',
    'currency.convert': 'Währung Umrechnen',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.jobs': '仕事',
    'nav.profile': 'プロフィール',
    'nav.earnings': '収益',
    'nav.settings': '設定',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.success': '成功',
    'tax.title': '税務情報',
    'tax.grossIncome': '総収入',
    'tax.calculate': '税金を計算',
    'gdpr.title': 'プライバシーとデータ',
    'gdpr.export': 'データをエクスポート',
    'gdpr.delete': 'アカウントを削除',
    'currency.convert': '通貨換算',
  },
  'zh-CN': {
    'nav.home': '首页',
    'nav.jobs': '工作',
    'nav.profile': '个人资料',
    'nav.earnings': '收入',
    'nav.settings': '设置',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.success': '成功',
    'tax.title': '税务信息',
    'tax.grossIncome': '总收入',
    'tax.calculate': '计算税款',
    'gdpr.title': '隐私与数据',
    'gdpr.export': '导出我的数据',
    'gdpr.delete': '删除我的账户',
    'currency.convert': '货币转换',
  },
}

export function getSupportedLanguages(): Language[] {
  return SUPPORTED_LANGUAGES
}

export function getTranslations(languageCode: string): Record<string, string> {
  return LOCALE_TRANSLATIONS[languageCode] ?? BASE_TRANSLATIONS
}

export async function setUserLanguage(userId: string, languageCode: string): Promise<void> {
  if (!db) return

  await setDoc(doc(db, 'userLanguagePreferences', userId), {
    userId,
    languageCode,
    updatedAt: new Date().toISOString(),
  })
}

export async function getUserLanguage(userId: string): Promise<string> {
  if (!db) return 'en-US'

  const snap = await getDoc(doc(db, 'userLanguagePreferences', userId))
  if (!snap.exists()) return 'en-US'

  return (snap.data().languageCode as string) ?? 'en-US'
}
