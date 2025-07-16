import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { sizestr } from '@/utils/utils'
import { getBrandName } from '@/utils/common/hypervisor'
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
    labelFormat: item => {
      let label = item.name
      const details = []
      details.push(`${item.guest_ip_start} - ${item.guest_ip_end}/${item.guest_ip_mask}`)
      if (item.guest_ip6_start && item.guest_ip6_end) {
        details.push(`${item.guest_ip6_start} - ${item.guest_ip6_end}/${item.guest_ip6_mask}`)
      }
      details.push(`vlan=${item.vlan_id}`)
      if (item.server_type) {
        details.push(i18n.te(`dictionary.${item.server_type}`) ? i18n.t(`dictionary.${item.server_type}`) : item.server_type)
      }
      label += `(${details.join(',')})`
      return label
    },
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
      let label = item.name
      if (item.cidr_block || item.cidr_block6) {
        const cidrs = []
        if (item.cidr_block) {
          cidrs.push(item.cidr_block)
        }
        if (item.cidr_block6) {
          cidrs.push(item.cidr_block6)
        }
        label += `(${cidrs.join(',')})`
      }
      return label
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
  cloudproviders: {
    vnode: (vm, h) => {
      const { name, cloudaccount } = vm.data
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-3' title={ name }>{ name }</span>
          {
            cloudaccount ? <span style="color: #8492a6; font-size: 13px">{i18n.t('common.account')}: { cloudaccount}</span> : null
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
          if (val === 'mobile') val = 'message' // mobile 应该翻译为 短信
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
  storages: {
    vnode: (store, h) => {
      const text = store.getLabel()
      const capacity = sizestr(store.data.capacity, 'M', 1024)
      const allowedBrands = ['VMware', 'OneCloud']
      const actual_capacity_used = allowedBrands.includes(store.data.brand) ? sizestr(store.data.actual_capacity_used, 'M', 1024) : '-'
      const allocated = sizestr(store.data.used_capacity, 'M', 1024)
      return ( // block storage
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
          <span style="color: #8492a6; font-size: 13px">{ i18n.t('storage.text_180', [capacity]) } / { i18n.t('storage.text_181', [allocated])} / { i18n.t('storage.text_178', [actual_capacity_used]) }</span>
        </div>
      )
    },
  },
  alertdashboards: {
    vnode: (vm, h) => {
      const data = vm.data
      let desc = ''
      if (data.scope === 'system') {
        desc = i18n.t('monitor.dashboard.select.option', [i18n.t('shareScope.system')])
      }
      if (data.scope === 'domain') {
        desc = i18n.t('monitor.dashboard.select.option', [data.project_domain, i18n.t('cloudenv.text_393')])
      }
      if (data.scope === 'project') {
        desc = i18n.t('monitor.dashboard.select.option', [data.project, i18n.t('cloudenv.text_254')])
      }
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ data.name }>{ data.name }</span>
          <div style="color: #8492a6; font-size: 13px">{ desc }</div>
        </div>
      )
    },
  },
  projects: {
    vnode: (vm, h) => {
      const project = vm.data
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ project.name }>{ project.name }</span>
          {(vm.isAdminMode && vm.l3PermissionEnable) ? <span style="color: #8492a6; font-size: 13px">{i18n.t('common_257')}{i18n.t('dictionary.domain')}: {project.project_domain}</span> : null}
        </div>
      )
    },
  },
  roles: {
    vnode: (vm, h) => {
      const role = vm.data
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ role.name }>{ role.name }</span>
          {(vm.isAdminMode && vm.l3PermissionEnable) ? <span style="color: #8492a6; font-size: 13px">{i18n.t('common_257')}{i18n.t('dictionary.domain')}: {role.project_domain}</span> : null}
        </div>
      )
    },
  },
  robots: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      let typeText = ''
      if (vm.data.type && vm.data.type.length) {
        const k = `common.${vm.data.type}-robot`
        if (i18n.te(k)) {
          typeText = i18n.t(`common.${vm.data.type}-robot`)
        } else {
          typeText = vm.data.type
        }
      }
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
          <div style="color: #8492a6; font-size: 13px">{ typeText }</div>
        </div>
      )
    },
  },
  dns_zones: {
    vnode: (vm, h) => {
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={vm.data.name}>{vm.data.name}</span>
          <span style="color: #8492a6; font-size: 13px" class="oc-selected-display-none">{getBrandName(vm.data.brand)}{vm.data.manager ? ` - ${i18n.t('dictionary.cloudprovider') + ':' + vm.data.manager}` : ''}</span>
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
    applyOptionLabel: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'isDomainMode', 'l3PermissionEnable', 'isProjectMode']),
    text () {
      return this._$t(this.data, this.nameKey)
    },
  },
  methods: {
    getLabel () {
      let text = this.text
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
    if (this.resource) { // 兼容外传 options 的情况
      const resourceItem = resourceMode[this.resource]
      if (this.applyOptionLabel && resourceItem && resourceItem.vnode) {
        return resourceItem.vnode(this, h)
      }
    }
    const str = this.getLabel()
    const text = R.is(String, str) ? str : this.text
    return (<div title={text}>{ text }</div>)
  },
}
