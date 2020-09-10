import storage from '@/utils/storage'
import { getLanguage } from '@/utils/common/cookie'

export default {
  language: getLanguage(),
  themeColor: storage.get('__oc_theme_color__') || process.env.THEME_COLOR || '#1890FF',
  theme: storage.get('__oc_theme__') || process.env.THEME || 'dark',
  brand: process.env.BRAND || { 'zh-CN': '云联壹云', en: 'YunionCloud' },
}
