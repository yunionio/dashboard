// import { message } from 'ant-design-vue'
import i18n from '@/locales'
import themeColor from './colors.js'

// let lessNodesAppended
const colorList = [
  {
    key: i18n.t('common_313'), color: '#F5222D', name: 'red',
  },
  {
    key: i18n.t('common_314'), color: '#FA541C', name: 'pink',
  },
  {
    key: i18n.t('common_315'), color: '#FAAD14', name: 'orange',
  },
  {
    key: i18n.t('common_316'), color: '#13C2C2', name: 'cyan',
  },
  {
    key: i18n.t('common_317'), color: '#52C41A', name: 'green',
  },
  {
    key: i18n.t('common_318'), color: '#1890FF', name: 'primary',
  },
  {
    key: i18n.t('common_319'), color: '#2F54EB', name: 'blue',
  },
  {
    key: i18n.t('common_320'), color: '#A100FF', name: 'purple',
  },
]

const updateThemeColor = newPrimaryColor => {
  // const hideMessage = message.loading(i18n.t('common_321'), 0)
  // themeColor.changeColor(newPrimaryColor).finally(() => {
  //   hideMessage()
  // })
  themeColor.changeColor(newPrimaryColor)
}

const getThemeName = color => {
  let ret = 'primary'
  colorList.map(item => {
    if (item.color === color) {
      ret = item.name
    }
  })
  return ret
}

export { updateThemeColor, colorList, getThemeName }
