export default {
  name: 'HelpLink',
  functional: true,
  props: {
    blank: {
      type: Boolean,
      default: true,
    },
    href: {
      type: String,
      required: true,
    },
  },
  render (h, ctx) {
    const { blank, href } = ctx.props
    const target = blank ? '_blank' : '_self'
    const slots = ctx.slots()
    return (
      <a href={ href } target={ target } title={ href }>
        { slots.default ? h('span', slots.default) : href }
        { blank ? <icon class='ml-1' type='blank' /> : null }
      </a>
    )
  },
}
