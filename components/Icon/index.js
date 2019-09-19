export default {
  name: 'Icon',
  functional: true,
  props: {
    name: {
      type: String,
      required: true,
    },
    fill: {
      type: String,
      default: 'currentColor',
    },
    width: {
      type: String,
      default: '1em',
    },
    height: {
      type: String,
      default: '1em',
    },
    class: {
      type: String,
    },
  },
  render (h, ctx) {
    const { name, ...rest } = ctx.props
    const link = `#oc-${name}`
    const svgProps = {
      attrs: {
        ...rest,
      },
    }
    return (
      <i class='oc-icon'>
        <svg aria-hidden='true' { ...svgProps }>
          <use xlinkHref={ link } />
        </svg>
      </i>
    )
  },
}
