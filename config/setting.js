import storage from '@/utils/storage'

export default {
  themeColor: storage.get('__oc_theme_color__') || process.env.themeColor || '#1890FF',
  theme: storage.get('__oc_theme__') || process.env.theme || 'dark',
}
