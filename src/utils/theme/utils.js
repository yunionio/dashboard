// import { message } from 'ant-design-vue'
import themeColor from './colors.js'
import i18n from '@/locales'

// let lessNodesAppended
const colorList = [
  {
    key: i18n.t('common_313'), color: '#F5222D',
  },
  {
    key: i18n.t('common_314'), color: '#FA541C',
  },
  {
    key: i18n.t('common_315'), color: '#FAAD14',
  },
  {
    key: i18n.t('common_316'), color: '#13C2C2',
  },
  {
    key: i18n.t('common_317'), color: '#52C41A',
  },
  {
    key: i18n.t('common_318'), color: '#1890FF',
  },
  {
    key: i18n.t('common_319'), color: '#2F54EB',
  },
  {
    key: i18n.t('common_320'), color: '#722ED1',
  },
]

const updateThemeColor = newPrimaryColor => {
  // const hideMessage = message.loading(i18n.t('common_321'), 0)
  // themeColor.changeColor(newPrimaryColor).finally(() => {
  //   hideMessage()
  // })
  themeColor.changeColor(newPrimaryColor)
}

export { updateThemeColor, colorList }
