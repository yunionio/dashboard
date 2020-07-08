import checkboxRule from '../core/rules/checkbox'
import Checkbox from './Checkbox'

/* istanbul ignore next */
Checkbox.install = function (Vue) {
  Vue.prototype.$generator.addRule('a-checkbox', checkboxRule)
  Vue.component(Checkbox.name, Checkbox)
}

export default Checkbox
