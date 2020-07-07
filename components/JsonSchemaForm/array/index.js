import List from './Array'
import './style/index.scss'

/* istanbul ignore next */
List.install = function (Vue) {
  Vue.component(List.name, List)
}

export default List
