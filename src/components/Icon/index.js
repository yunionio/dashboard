import { Icon as AntIcon } from 'ant-design-vue'
import { mergeProps } from 'ant-design-vue/lib/_util/props-util'

const commonContext = require.context('./assets', false, /\.svg$/)
const scopeContext = require.context('@scope/assets', false, /\.svg$/)

const requireAll = (commonContext, scopeContext) => {
  const commonFilePath = []
  const scopeFilePath = []

  commonContext.keys().forEach(v => {
    if (scopeContext.keys().includes(v)) {
      scopeFilePath.push(v)
    } else {
      commonFilePath.push(v)
    }
  })

  scopeContext.keys().forEach(v => {
    if (!commonContext.keys().includes(v)) {
      scopeFilePath.push(v)
    }
  })

  commonFilePath.forEach(commonContext)
  scopeFilePath.forEach(scopeContext)
}

requireAll(commonContext, scopeContext)

// 暂时修改为非函数式组件
// 主要因为在升级到antv 1.5后，icon外层使用tooltip的时候（最终会调用antv的trigger组件），将会触发warning
// 函数式组件不支持clone  https://github.com/vueComponent/ant-design-vue/pull/1947
const Iconfont = {
  name: 'Icon',
  props: AntIcon.props,
  render () {
    const { $props, $slots, $listeners, $data } = this
    const { type, ...restProps } = $props
    const slotsMap = $slots
    const children = slotsMap.default
    // component > children > type
    let content = null
    if (type) {
      content = <use {...{ attrs: { 'xlink:href': `#oc-${type}` } }} />
    }
    if (children) {
      content = children
    }
    const iconProps = mergeProps({}, $data, { props: restProps, on: $listeners })
    return <AntIcon {...iconProps}>{content}</AntIcon>
  },
}

export default Iconfont
