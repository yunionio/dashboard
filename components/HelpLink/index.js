import router from '@/router'

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
    let { blank, href } = ctx.props
    const format = path => {
      if (path.startsWith('http')) return path
      if (!path.startsWith('/')) {
        console.error('请填写绝对路径')
        path += '/'
      }
      if (path.startsWith('/v1') || path.startsWith('/v2')) {
        path = path.replace(/\/v[12]/, '') // 去掉 /v2 或者 /v1
      }
      return router.resolve(path).href
    }
    href = format(href)
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
