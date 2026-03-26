<template>
  <div>
    <a-form-item>
      <a-radio-group v-decorator="decorator.networkType" @change="change">
        <template  v-for="(item, key) in originNetworkMaps">
          <a-radio-button v-if="(isServertemplate && (key !== 'schedtag')) || !isServertemplate" :value="key" :key="key">
            {{ item.t ? $t(item.t) : item.label }}
            <help-tooltip v-if="key === 'default'" :name="`${key}ServerNetwork`" class="ml-2" />
          </a-radio-button>
        </template>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="networkComponent === 'config'">
      <network-config
        :form="form"
        :decorator="decorator.networkConfig"
        :isBonding="isBonding"
        :network-params="networkListParams"
        v-bind="configs"
        ref="networkConfigRef"
        :vpc-params="networkVpcParams"
        :vpc-resource="vpcResource"
        :ipsDisable="ipsDisable"
        :network-resource-mapper="networkResourceMapper"
        :vpc-resource-mapper="vpcResourceMapper"
        :limit="form.fi.capability.max_nic_count"
        :show-vpc="showVpc"
        :is-dialog="isDialog"
        :showMacConfig="showMacConfig"
        :showDeviceConfig="showDeviceConfig"
        :showSecgroupConfig="showSecgroupConfig"
        :secgroupParams="secgroupParams"
        :hiddenAdd="hiddenAdd" />
    </a-form-item>
    <a-form-item v-if="networkComponent === 'schedtag'">
      <network-schedtag
        ref="networkSchedtagRef"
        :form="form"
        :decorator="decorator.networkSchedtag"
        :isBonding="isBonding"
        :schedtag-params="schedtagParams"
        :limit="form.fi.capability.max_nic_count"
        :showDeviceConfig="showDeviceConfig" />
    </a-form-item>
  </div>
</template>

<script>
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import { HYPERVISORS_MAP } from '@/constants'
import NetworkConfig from './NetworkConfig'
import NetworkSchedtag from './NetworkSchedtag'

export default {
  name: 'ServerNetwork',
  components: {
    NetworkSchedtag,
    NetworkConfig,
  },
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => val.networkType && val.networkConfig && val.networkSchedtag,
      // val.segment && val.ip && val.schedtag && val.strategy,
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    networkListParams: {
      type: Object,
      default: () => ({}),
    },
    networkVpcParams: {
      type: Object,
      default: () => ({}),
    },
    vpcResource: {
      type: String,
    },
    schedtagParams: {
      type: Object,
      default: () => ({}),
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
    networkResourceMapper: {
      type: Function,
      default: data => data,
    },
    vpcResourceMapper: {
      type: Function,
      default: data => data,
    },
    hypervisor: {
      type: String,
    },
    cloudprovider: {
      type: String,
    },
    serverCount: {
      type: Number,
      default: 1,
    },
    isServertemplate: {
      type: Boolean,
      default: false,
    },
    defaultNetwork: {
      type: Boolean,
      default: true,
    },
    vpcObj: {
      type: Object,
    },
    allowNetworkTypes: {
      type: Array,
    },
    showVpc: {
      type: Boolean,
      default: true,
    },
    isDialog: {
      type: Boolean,
      default: false,
    },
    showMacConfig: {
      type: Boolean,
      default: false,
    },
    showDeviceConfig: {
      type: Boolean,
      default: false,
    },
    showSecgroupConfig: {
      type: Boolean,
      default: false,
    },
    secgroupParams: {
      type: Object,
      default: () => ({}),
    },
    hiddenNetworkOptions: {
      type: Array,
    },
    defaultNetworkType: {
      type: String,
    },
    hiddenAdd: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const { auto_alloc_network_count } = this.$store.getters.capability
    const { hypervisor } = this.form.fd || {}
    const _networkMaps = { ...NETWORK_OPTIONS_MAP }
    if (!auto_alloc_network_count || auto_alloc_network_count <= 0) {
      if (hypervisor !== HYPERVISORS_MAP.proxmox.key) {
        delete _networkMaps.default
      }
    }
    if (this.allowNetworkTypes && this.allowNetworkTypes.length) {
      this.allowNetworkTypes.forEach(key => {
        delete _networkMaps[key]
      })
    }
    if (!this.defaultNetwork) delete _networkMaps.default
    return {
      networkComponent: '', // 指定IP子网 / 指定调度标签 的控件
      networkMaps: _networkMaps,
    }
  },
  computed: {
    ipsDisable () {
      return this.serverCount > 1
    },
    configs () {
      if (this.vpcObj && this.vpcObj.id && this.vpcObj.name) {
        return {
          vpcObj: this.vpcObj,
        }
      }
      return {}
    },
    originNetworkMaps () {
      if (this.hiddenNetworkOptions?.length > 0) {
        this.hiddenNetworkOptions.forEach(v => {
          this.$delete(this.networkMaps, v)
        })
      }
      return this.networkMaps
    },
    /** form.fi.capability 与 store 可能不同步，合并后再驱动网络类型 */
    effectiveAutoAllocNetworkCountTt () {
      const cap = this.form.fi?.capability
      if (cap && Object.prototype.hasOwnProperty.call(cap, 'auto_alloc_network_count')) {
        return cap.auto_alloc_network_count
      }
      return this.$store.getters.capability?.auto_alloc_network_count
    },
  },
  watch: {
    effectiveAutoAllocNetworkCountTt: {
      handler () {
        this.applyNetworkTypeByAutoAllocCountTt()
      },
      immediate: true,
    },
    async hypervisor (val, oldVal) {
      if (val === HYPERVISORS_MAP.esxi.key || oldVal === HYPERVISORS_MAP.esxi.key) {
        await this.refreshNetworkConfig()
        this.changeIpDisable(this.serverCount > 1)
      }
    },
    async cloudprovider (val, oldVal) {
      if (val !== oldVal) {
        await this.refreshNetworkConfig()
      }
    },
    serverCount (val, oldVal) {
      if (val !== oldVal && (val === 1 || oldVal === 1)) {
        this.changeIpDisable(val > 1)
      }
    },
    defaultNetworkType: {
      handler (val) {
        if (val) {
          switch (val) {
            case NETWORK_OPTIONS_MAP.default.key:
              this.networkComponent = ''
              break
            case NETWORK_OPTIONS_MAP.manual.key:
              this.networkComponent = 'config'
              break
            case NETWORK_OPTIONS_MAP.schedtag.key:
              this.networkComponent = 'schedtag'
              break
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    /** 无自动分配（0 / 未下发 / 空）时网络类型应为「指定 IP 子网」(compute.text_2，界面常称「其他」) */
    applyNetworkTypeByAutoAllocCountTt () {
      const val = this.effectiveAutoAllocNetworkCountTt
      const noAutoAlloc = val == null || val === '' || Number(val) <= 0
      if (noAutoAlloc) {
        const { hypervisor } = this.form.fd || {}
        if (hypervisor !== HYPERVISORS_MAP.proxmox.key) {
          this.$delete(this.networkMaps, NETWORK_OPTIONS_MAP.default.key)
        }
        const manual = NETWORK_OPTIONS_MAP.manual.key
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ networkType: manual })
          if (this.form.fd) {
            this.form.fd.networkType = manual
          }
          this.networkComponent = 'config'
        })
      } else {
        const maps = { ...NETWORK_OPTIONS_MAP }
        if (!this.defaultNetwork) delete maps[NETWORK_OPTIONS_MAP.default.key]
        if (this.allowNetworkTypes && this.allowNetworkTypes.length) {
          this.allowNetworkTypes.forEach(key => {
            delete maps[key]
          })
        }
        this.networkMaps = maps
        const value = {
          networkType: NETWORK_OPTIONS_MAP[Object.keys(maps)[0]].key,
        }
        this.$nextTick(() => {
          this.form.fc.setFieldsValue(value)
          if (this.form.fd) {
            this.form.fd.networkType = value.networkType
          }
          this.networkComponent = value.networkType === NETWORK_OPTIONS_MAP.default.key ? '' : 'config'
        })
      }
    },
    change (e) {
      if (this.form.fd) {
        this.form.fd.networkType = e.target.value
      }

      switch (e.target.value) {
        case NETWORK_OPTIONS_MAP.default.key:
          this.networkComponent = ''
          break
        case NETWORK_OPTIONS_MAP.manual.key:
          this.networkComponent = 'config'
          break
        case NETWORK_OPTIONS_MAP.schedtag.key:
          this.networkComponent = 'schedtag'
          break
      }
    },
    async refreshNetworkConfig () {
      if (this.networkComponent === 'config') {
        this.networkComponent = ''
        await this.$nextTick() // 刷新 network-config 组件
        this.networkComponent = 'config'
      }
      return true
    },
    changeIpDisable (ipDisable) {
      if (this.$refs.networkConfigRef) this.$refs.networkConfigRef.reset(ipDisable)
    },
  },
}
</script>
