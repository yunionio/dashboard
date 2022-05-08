import { mapState } from 'vuex'
import { typeClouds } from '@/utils/common/hypervisor'
import setting from '@/config/setting'

const brandMap = typeClouds.getBrand()

export default {
  name: 'BrandIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState('app', {
      companyInfo: state => state.companyInfo,
    }),
    cloudPodsIcon () {
      const { inner_logo_format, inner_logo } = this.companyInfo
      if (this.name === 'Cloudpods' && inner_logo_format && inner_logo) {
        return `data:${inner_logo_format};base64,${inner_logo}`
      }
      return ''
    },
  },
  methods: {
    getBrand () {
      const ret = brandMap[this.name]
      if (this.name === 'Cloudpods') {
        const { inner_copyright, inner_copyright_en } = this.companyInfo
        if (setting.language === 'en' && inner_copyright_en) {
          ret.label = inner_copyright_en
        }
        if (setting.language === 'zh-CN' && inner_copyright) {
          ret.label = inner_copyright
        }
      }
      return ret
    },
  },
  render (h) {
    const option = this.getBrand()
    const name = option.key.toLowerCase()
    const small = ['DStack', 'OpenStack']
    let fontSize = '20px'
    if (small.includes(this.name)) {
      fontSize = '16px'
    }
    const cloudPodsIcon = this.cloudPodsIcon
    return (
      <span title={option.label}>
        {
          cloudPodsIcon ? <img src={cloudPodsIcon} style={{ width: fontSize }} /> : <icon type={name} style={{ fontSize }} />
        }
      </span>
    )
  },
}
