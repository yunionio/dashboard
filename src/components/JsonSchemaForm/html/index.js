import htmlRule from '../core/rules/html'
import Html from './Html'

/* istanbul ignore next */
Html.install = function (Vue) {
  Vue.prototype.$generator.addRule('html', htmlRule)
  Vue.component(Html.name, Html)
}

export default Html
