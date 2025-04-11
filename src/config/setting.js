import * as R from 'ramda'
import storage from '@/utils/storage'
import { getLanguage } from '@/utils/common/cookie'

const _l2MenuVisible = storage.get('__oc_l2_menu_visible__')
const defaultBrand = { 'zh-CN': '内置虚拟化', en: 'Buiilt-in Virtualization', 'ja-JP': '内蔵バーチャライゼーション' }

export default {
  language: getLanguage(),
  themeColor: storage.get('__oc_theme_color__') || process.env.THEME_COLOR || '#1890FF',
  theme: storage.get('__oc_theme__') || process.env.THEME || 'dark',
  brand: process.env.BRAND || defaultBrand,
  defaultBrand,
  product: process.env.PRODUCT || (process.env.VUE_APP_IS_PRIVATE ? { 'zh-CN': '云管平台', en: 'Cloud Management Platform', 'ja-JP': 'クラウド管理プラットフォーム' } : { 'zh-CN': 'Cloudpods', en: 'Cloudpods', 'ja-JP': 'Cloudpods' }),
  l2MenuVisible: !R.isNil(_l2MenuVisible) && !R.isNil(_l2MenuVisible) ? _l2MenuVisible : true,
  monitorAlertNotifyTriggerTime: process.env.VUE_APP_MONITOR_ALERT_NOTIFY_TRIGGER_TIME || 1000 * 60 * 60, // 默认值1小时
  oemVersion: process.env.OEM_VERSION || process.env.VUE_APP_OEM_VERSION || '',
}
