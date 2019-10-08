import { typeClouds } from '@/utils/common/hypervisor'

const brandMap = typeClouds.getBrand()

export default {
  name: 'BrandIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  render (h) {
    const option = brandMap[this.name]
    const name = option.key.toLowerCase()
    const small = ['DStack', 'OpenStack']
    let width = '20px'
    let height = '20px'
    if (small.includes(this.name)) {
      width = '16px'
      height = '16px'
    }
    return (
      <a-tooltip title={ option.label }>
        <span>
          <icon name={ name } width={ width } height={ height } />
        </span>
      </a-tooltip>
    )
  },
}
