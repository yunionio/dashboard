import Control from './Control'

/* istanbul ignore next */
Control.install = function (Vue) {
  Vue.component(Control.name, Control)
}

export default Control
