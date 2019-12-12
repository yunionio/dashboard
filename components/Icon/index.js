import { Icon as AntIcon } from 'ant-design-vue'
import { mergeProps } from 'ant-design-vue/lib/_util/props-util'

const customCache = new Set()

function getLocalImages () {
  let paths = []
  const localImagesMap = {}
  const imgs = require.context('./assets', false, /\.\/\w+\.svg/)
  imgs.keys().forEach(dir => {
    paths = paths.concat(imgs(dir))
  })
  paths.forEach(path => {
    const pathArr = path.split('/')
    const filenameHash = pathArr[pathArr.length - 1]
    const filename = filenameHash.split('.')[0]
    localImagesMap[filename] = path
  })
  return localImagesMap
}
const localImagesMap = getLocalImages()

function create (options) {
  const { scriptUrl, extraCommonProps = {} } = options
  /**
   * DOM API required.
   * Make sure in browser environment.
   * The Custom Icon will create a <script/>
   * that loads SVG symbols and insert the SVG Element into the document body.
   */
  if (
    typeof document !== 'undefined' &&
    typeof window !== 'undefined' &&
    typeof document.createElement === 'function' &&
    typeof scriptUrl === 'string' &&
    scriptUrl.length &&
    !customCache.has(scriptUrl)
  ) {
    const script = document.createElement('script')
    script.setAttribute('src', scriptUrl)
    script.setAttribute('data-namespace', scriptUrl)
    customCache.add(scriptUrl)
    document.body.appendChild(script)
  }
  const Icon = {
    functional: true,
    name: 'Icon',
    props: AntIcon.props,
    render (h, context) {
      const { props, slots, listeners, data } = context
      const { type, ...restProps } = props
      const localePath = localImagesMap[type]
      if (localePath) {
        const imgSize = (data.style && data.style.fontSize) || '16px'
        return <img src={localePath} alt={type} width={imgSize} height={imgSize} />
      }
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
      if (!content) return null
      const iconProps = mergeProps(extraCommonProps, data, { props: restProps, on: listeners })
      return <AntIcon {...iconProps}>{content}</AntIcon>
    },
  }
  return Icon
}

export default create({
  scriptUrl: '//at.alicdn.com/t/font_1347390_d9gqlqk57l.js',
})
