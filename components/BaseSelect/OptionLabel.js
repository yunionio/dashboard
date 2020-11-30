import * as R from 'ramda'
import i18n from '@/locales'

const resourceMode = {
  networks: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      return ( // IP子网
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
          <span style="color: #8492a6; font-size: 13px">{i18n.t('common.text00001')}: { vm.data.ports - vm.data.ports_used }</span>
        </div>
      )
    },
    labelFormat: item => `${item.name}(${item.guest_ip_start} - ${item.guest_ip_end}, vlan=${item.vlan_id})`,
  },
  vpcs: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      return (
        <div class="d-flex">
          <span class='text-truncate flex-fill' title={ text }>{ text }</span>
        </div>
      )
    },
    labelFormat: item => {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.cidr_block}）`
    },
  },
  servers: {
    labelFormat: item => {
      let label = item.name
      if (item.ips) label += ` (${item.ips})`
      return label
    },
  },
  eips: {
    vnode: (vm, h) => {
      const { name, ip_addr } = vm.data
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-3' title={ name }>{ name }</span>
          {
            ip_addr ? <span style="color: #8492a6; font-size: 13px">IP: { ip_addr}</span> : null
          }
        </div>
      )
    },
  },
  // repos: {
  //   vnode: (vm, h) => {
  //     const text = vm.getLabel()
  //     let type = '-'
  //     if (vm.data.type === 'internal') type = `${vm.$t('dictionary.server')}类型`
  //     if (vm.data.type === 'external') type = `${vm.$t('dictionary.container')}类型`
  //     return (
  //       <div class='d-flex'>
  //         <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
  //         <span style="color: #8492a6; font-size: 13px">{ type }</span>
  //       </div>
  //     )
  //   },
  // },
  receivers: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      let concats = []
      if (vm.data.enabled_contact_types && vm.data.enabled_contact_types.length) {
        concats = vm.data.enabled_contact_types.map(val => {
          if (i18n.te(`common.${val}`)) {
            return i18n.t(`common.${val}`)
          }
          return val
        })
      }
      let concatText = concats.length ? concats.join('、') : null
      concatText = concatText ? `${i18n.t('common_599')}: ${concatText}` : i18n.t('common_731')
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
          <div style="color: #8492a6; font-size: 13px">{ concatText }</div>
        </div>
      )
    },
  },
}

export default {
  name: 'OptionLabel',
  props: {
    nameKey: {
      type: String,
      required: true,
    },
    labelFormat: {
      type: Function,
    },
    data: {
      type: Object,
      required: true,
    },
    resource: {
      type: String,
    },
  },
  computed: {
    text () {
      return this.data[this.nameKey]
    },
  },
  methods: {
    getLabel () {
      let text = this.data[this.nameKey]
      const resourceItem = resourceMode[this.resource]
      if (this.labelFormat) {
        text = this.labelFormat(this.data)
      } else if (resourceItem && resourceItem.labelFormat) {
        text = resourceItem.labelFormat(this.data)
      }
      return text
    },
  },
  render (h) {
    const resourceItem = resourceMode[this.resource]
    if (this.resource) { // 兼容外传 options 的情况
      if (resourceItem && resourceItem.vnode) {
        return resourceItem.vnode(this, h)
      }
    }
    const str = this.getLabel()
    const text = R.is(String, str) ? str : this.text
    return (<div title={text}>{ text }</div>)
  },
}
