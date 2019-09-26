
function getImgs () {
  let paths = []
  const filepathMap = {}
  const imgs = require.context('./assets', false, /\.\/\w+\.svg/)
  imgs.keys().forEach(dir => {
    paths = paths.concat(imgs(dir))
  })
  paths.forEach(path => {
    const pathArr = path.split('/')
    const filenameHash = pathArr[pathArr.length - 1]
    const filename = filenameHash.split('.')[0]
    filepathMap[filename] = path
  })
  return filepathMap
}
const filepathMap = getImgs()

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
    let locale = false // 是否是本地图标
    const localePath = filepathMap[ctx.props.name]
    const { name, ...rest } = ctx.props
    const link = `#oc-${name}`
    const svgProps = {
      attrs: {
        ...rest,
      },
    }
    if (localePath) locale = true
    const remoteIcon = (<i class='oc-icon'>
      <svg aria-hidden='true' { ...svgProps }>
        <use xlinkHref={ link } />
      </svg>
    </i>)
    const localeIcon = <img src={localePath} alt={ctx.props.name} { ...svgProps } />
    return (
      locale ? localeIcon : remoteIcon
    )
  },
}
