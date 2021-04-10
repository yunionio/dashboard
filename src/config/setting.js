import * as R from 'ramda'
import storage from '@/utils/storage'
import { getLanguage } from '@/utils/common/cookie'

const _l2MenuVisible = storage.get('__oc_l2_menu_visible__')

export default {
  language: getLanguage(),
  themeColor: storage.get('__oc_theme_color__') || process.env.THEME_COLOR || '#1890FF',
  theme: storage.get('__oc_theme__') || process.env.THEME || 'dark',
  brand: process.env.BRAND || { 'zh-CN': '云联壹云', en: 'YunionCloud' },
  l2MenuVisible: !R.isNil(_l2MenuVisible) && !R.isNil(_l2MenuVisible) ? _l2MenuVisible : true,
}
