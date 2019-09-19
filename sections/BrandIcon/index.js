const BRAND_ICON_OPTIONS = {
  VMware: {
    label: 'VMware',
    value: 'vmware',
  },
  OneCloud: {
    label: 'OneCloud',
    value: 'onecloud',
  },
  Aliyun: {
    label: '阿里云',
    value: 'aliyun',
  },
  Qcloud: {
    label: '腾讯云',
    value: 'qcloud',
  },
  Azure: {
    label: '微软云',
    value: 'azure',
  },
  Aws: {
    label: 'Aws',
    value: 'aws',
  },
  Huawei: {
    label: '华为云',
    value: 'huawei',
  },
  OpenStack: {
    label: 'OpenStack',
    value: 'openstack',
  },
  Ucloud: {
    label: 'Ucloud',
    value: 'ucloud',
  },
  ZStack: {
    label: 'ZStack',
    value: 'zstack',
  },
  DStack: {
    label: 'DStack',
    value: 'dstack',
  },
}

export default {
  name: 'BrandIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  render (h) {
    const option = BRAND_ICON_OPTIONS[this.name]
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
          <icon name={ option.value } width={ width } height={ height } />
        </span>
      </a-tooltip>
    )
  },
}
