import { Radio } from 'ant-design-vue'
import RadioRule from '../core/rules/radio'
import JRadio from './Radio'

/* istanbul ignore next */
JRadio.install = function (Vue) {
  Vue.prototype.$generator.addRule('a-radio', RadioRule)
  Vue.use(Radio)
  Vue.component(JRadio.name, JRadio)
}

export default JRadio
