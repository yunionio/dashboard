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
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import NetworkConfig from './NetworkConfig'
import NetworkSchedtag from './NetworkSchedtag'

export default {
  name: 'ServerNetwork',
  components: {
    NetworkSchedtag,
    NetworkConfig,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
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
    /**
     * 工单/草稿回填期间：不要用 auto_alloc_network_count 强行改 networkType，
     * 否则会覆盖 initForm 已设好的指定子网/调度标签
     */
    ignoreAutoNetworkType: {
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
      networkDraftRestoring: false,
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
        if (this.ignoreAutoNetworkType) return
        if (this.networkDraftRestoring) return
        if (this.canReadWriteFormFieldDraft() && this.readFormFieldDraft()?.networkType) return
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
    'form.fi.networkList': {
      handler () {
        if (this.networkDraftRestoring) return
        if (!this.canReadWriteFormFieldDraft()) return
        this.persistFormFieldDraftSnapshot()
      },
      deep: true,
    },
  },
  mounted () {
    // Decorator 可能已种好 networkType（工单/草稿），但 networkComponent 默认是空的，
    // 必须同步挂出 VPC/子网区域，否则只见 radio 选中、下面空白
    this.syncNetworkComponentFromForm()
  },
  methods: {
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) return undefined
      const networkType = f.getFieldValue('networkType') || this.form.fd?.networkType
      const ret = { networkType }
      // 多网卡：存与工单同形的 nets，回填走 NetworkConfig.initData（uuid key 会变）
      if (networkType === NETWORK_OPTIONS_MAP.manual.key) {
        const list = this.$refs.networkConfigRef?.networkList
        if (Array.isArray(list) && list.length) {
          ret.nets = list.map((item) => {
            const vpcId = item.vpc?.id || f.getFieldValue(this.decorator.networkConfig.vpcs(item.key)[0])
            const networkId = item.network?.id || f.getFieldValue(this.decorator.networkConfig.networks(item.key)[0])
            const net = {
              vpc: vpcId,
              network: networkId,
              network_id: networkId,
            }
            if (item.ipShow && item.ip) net.address = item.ip
            if (item.macShow && item.mac) net.mac = item.mac
            if (item.requireIpv6) {
              net.require_ipv6 = true
              if (item.ipv6Mode === 'only') net.strict_ipv6 = true
            }
            if (item.ipv6Show && item.ipv6) net.address6 = item.ipv6
            if (item.deviceShow && item.device) {
              net.sriov_device = { model: item.device }
            }
            if (item.secgroupShow && item.secgroups?.length) {
              net.secgroups = item.secgroups
            }
            return net
          }).filter(n => n.network)
        }
      } else if (networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        const list = this.$refs.networkSchedtagRef?.schedtagList
        if (Array.isArray(list) && list.length) {
          ret.nets = list.map((item) => {
            const schedtag = item.schedtag || f.getFieldValue(this.decorator.networkSchedtag.schedtags(item.key)[0])
            const strategy = item.policy || f.getFieldValue(this.decorator.networkSchedtag.policys(item.key)[0])
            let device = item.device
            if (!device && item.deviceShow && typeof this.decorator.networkSchedtag.devices === 'function') {
              device = f.getFieldValue(this.decorator.networkSchedtag.devices(item.key)[0])
            }
            const tag = { id: schedtag, strategy }
            if (device) tag.sriov_device = { model: device }
            return { schedtags: [tag] }
          }).filter(n => n.schedtags?.[0]?.id)
        }
      }
      return ret
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc) return
      this.networkDraftRestoring = true
      const finish = () => {
        this.networkDraftRestoring = false
      }
      if (draft.networkType) {
        this.form.fc.setFieldsValue({ networkType: draft.networkType })
        if (this.form.fd) this.form.fd.networkType = draft.networkType
        this.syncNetworkComponentFromForm()
      }
      this.$nextTick(() => {
        this.applyNetworkDraftNets(draft)
        // NetworkConfig 异步挂载 / 子网列表未就绪时再补几次
        setTimeout(() => this.applyNetworkDraftNets(draft), 800)
        setTimeout(() => this.applyNetworkDraftNets(draft), 2000)
        setTimeout(() => { this.applyNetworkDraftNets(draft); finish() }, 4000)
      })
    },
    applyNetworkDraftNets (draft) {
      if (!draft) return
      if (draft.networkType === NETWORK_OPTIONS_MAP.manual.key && Array.isArray(draft.nets) && draft.nets.length) {
        const ref = this.$refs.networkConfigRef
        if (ref && typeof ref.initData === 'function') {
          ref.initData(draft.nets)
        }
        return
      }
      if (draft.networkType === NETWORK_OPTIONS_MAP.schedtag.key && Array.isArray(draft.nets) && draft.nets.length) {
        const ref = this.$refs.networkSchedtagRef
        if (ref && typeof ref.initData === 'function') {
          ref.initData(draft.nets)
        }
      }
    },

    /** 按当前表单 networkType 挂载对应子组件（与 @change 同源） */
    syncNetworkComponentFromForm () {
      const type = (this.form.fc && this.form.fc.getFieldValue('networkType')) ||
        (this.form.fd && this.form.fd.networkType)
      if (!type) return
      this.change({ target: { value: type }, name: 'default' })
    },
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
        this.$nextTick(() => {
          // 回填期间 syncNetworkComponentFromForm→change 不要落盘，避免 nets 未就绪冲掉草稿
          if (!this.networkDraftRestoring) {
            this.persistFormFieldDraftSnapshot()
          }
        })
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
      // 工单/草稿回填期间禁止拆掉 NetworkConfig，否则 initData 的 VPC/子网会被冲掉
      if (this.ignoreAutoNetworkType || this.networkDraftRestoring) return true
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
