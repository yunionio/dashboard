import storage from '@/utils/storage'
import setting from '@/config/setting'

export default {
  state: {
    ...setting,
  },
  mutations: {
    SET_THEME (state, theme) {
      storage.set('__oc_theme__', theme)
      state.theme = theme
    },
    SET_THEME_COLOR (state, themeColor) {
      storage.set('__oc_theme_color__', themeColor)
      state.themeColor = themeColor
    },
    SET_L2_MENU_VISIBLE (state, visible) {
      storage.set('__oc_l2_menu_visible__', visible)
      state.l2MenuVisible = visible
    },
  },
}
