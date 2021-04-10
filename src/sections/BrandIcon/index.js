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
    let fontSize = '20px'
    if (small.includes(this.name)) {
      fontSize = '16px'
    }
    return (
      <span title={ option.label }>
        <icon type={ name } style={{ fontSize }} />
      </span>
    )
  },
}
