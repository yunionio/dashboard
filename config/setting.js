import storage from '@/utils/storage'
import { getLanguage } from '@/utils/common/cookie'

export default {
  language: getLanguage(),
  themeColor: storage.get('__oc_theme_color__') || process.env.themeColor || '#1890FF',
  theme: storage.get('__oc_theme__') || process.env.theme || 'dark',
}
