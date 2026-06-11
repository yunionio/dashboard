import JForm from './Form'
import Generator from '../core/schema'
import validator from '../validate'
/* istanbul ignore next */
JForm.install = function (Vue) {
  Vue.prototype.$generator = new Generator()
  Vue.prototype.$validator = validator()

  Vue.component(JForm.name, JForm)
}

export default JForm
