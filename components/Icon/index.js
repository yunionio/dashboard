import { Icon as AntIcon } from 'ant-design-vue'
import { mergeProps } from 'ant-design-vue/lib/_util/props-util'

const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./assets', false, /\.svg$/)
requireAll(req)

const Iconfont = {
  functional: true,
  name: 'Icon',
  props: AntIcon.props,
  render (h, context) {
    const { props, slots, listeners, data } = context
    const { type, ...restProps } = props
    const slotsMap = slots()
    const children = slotsMap.default
    // component > children > type
    let content = null
    if (type) {
      content = <use {...{ attrs: { 'xlink:href': `#oc-${type}` } }} />
    }
    if (children) {
      content = children
    }
    const iconProps = mergeProps({}, data, { props: restProps, on: listeners })
    return <AntIcon {...iconProps}>{content}</AntIcon>
  },
}

export default Iconfont
