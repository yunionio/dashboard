import * as R from 'ramda'
import numerify from 'numerify'
import store from '@/store'
import i18n from '@/locales'

export default {
  bind: function (el, binding, vnode) {
    const lang = store.getters.setting.language
    const isZh = lang === 'zh-CN'
    const discount = binding.value
    if (!R.isNil(discount) && !R.isEmpty(discount)) {
      let discountFormatValue
      if (isZh) {
        discountFormatValue = numerify(discount * 10, '0.0')
      } else {
        discountFormatValue = Math.round(discount * 100)
      }
      el.innerHTML = i18n.t('common.discount_unit', [discountFormatValue])
    }
  },
}
