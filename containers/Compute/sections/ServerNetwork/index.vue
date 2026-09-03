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
        :hiddenAdd="hiddenAdd"
        @advancedChange="onNetworkAdvancedChange"
        @optionalChange="onNetworkOptionalChange" />
    </a-form-item>
    <a-form-item v-if="networkComponent === 'schedtag'">
      <network-schedtag
        ref="networkSchedtagRef"
        :form="form"
        :decorator="decorator.networkSchedtag"
        :isBonding="isBonding"
        :schedtag-params="schedtagParams"
        :limit="form.fi.capability.max_nic_count"
        :showDeviceConfig="showDeviceConfig"
        @optionalChange="onNetworkOptionalChange" />
    </a-form-item>
  </div>
</template>

<script>
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import { HYPERVISORS_MAP } from '@/constants'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import { DRAFT_KIND } from '@/utils/createFormDraft'
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
    // 选择类：网络类型 / VPC / 网卡可跨 tab；高级与多网卡仅同 session 回填
    formDraftKind: {
      type: String,
      default: DRAFT_KIND.SELECTION,
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
    /**
     * 仅创建页（formDraftKey）或工单回填（ignoreAutoNetworkType）启用草稿期网络同步。
     * 弹框等未传 formDraftKey → 与接入草稿前一致。
     */
    isCreateNetworkDraftContext () {
      return !!(this.formDraftKey || this.ignoreAutoNetworkType)
    },
  },
  watch: {
    effectiveAutoAllocNetworkCountTt: {
      handler (val, oldVal) {
        if (this.ignoreAutoNetworkType) return
        if (this.networkDraftRestoring) return
        if (this.canRestoreFormFieldDraft() && this.readFormFieldDraft()?.networkType) return
        // 非创建页：跳过 mount immediate，避免弹框被强改 networkType
        if (!this.formDraftKey && oldVal === undefined) return
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
    networkComponent (val) {
      if (val && this._pendingNetworkDraft) {
        this.$nextTick(() => this.tryApplyPendingNetworkDraft())
      }
    },
    originNetworkMaps: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.restoreFormFieldDraftFields())
      },
    },
  },
  mounted () {
    // 仅创建草稿/工单回填：Decorator 已种 networkType 时需挂出 VPC/子网区
    if (this.isCreateNetworkDraftContext) {
      this.syncNetworkComponentFromForm()
    }
  },
  created () {
    this._pendingNetworkDraft = null
  },
  methods: {
    tryApplyPendingNetworkDraft () {
      const pending = this._pendingNetworkDraft
      if (!pending || !this.form?.fc) return true
      const { draft, options } = pending
      let ok = true
      if (draft.networkType === NETWORK_OPTIONS_MAP.manual.key &&
        Array.isArray(draft.nets) && draft.nets.length) {
        const ref = this.$refs.networkConfigRef
        if (ref && typeof ref.initData === 'function') {
          ref.initData(draft.nets, { skipAdvanced: options.fromLocal })
        } else {
          ok = false
        }
      } else if (draft.networkType === NETWORK_OPTIONS_MAP.schedtag.key &&
        Array.isArray(draft.nets) && draft.nets.length) {
        const ref = this.$refs.networkSchedtagRef
        if (ref && typeof ref.initData === 'function') {
          ref.initData(draft.nets, { skipAdvanced: options.fromLocal })
        } else {
          ok = false
        }
      }
      if (ok) {
        this._pendingNetworkDraft = null
        this.networkDraftRestoring = false
      }
      return ok
    },
    getCreateFormFieldDraftSnapshot () {
      if (!this.canReadWriteFormFieldDraft()) return undefined
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
            if (item.ipShow) {
              const ipVal = item.ip || (typeof this.decorator.networkConfig.ips === 'function'
                ? f.getFieldValue(this.decorator.networkConfig.ips(item.key, item.network)[0])
                : undefined)
              if (ipVal) net.address = ipVal
            }
            if (item.macShow) {
              const macVal = item.mac || (typeof this.decorator.networkConfig.macs === 'function'
                ? f.getFieldValue(this.decorator.networkConfig.macs(item.key, item.network)[0])
                : undefined)
              if (macVal) net.mac = macVal
            }
            if (item.requireIpv6) {
              net.require_ipv6 = true
              if (item.ipv6Mode === 'only') net.strict_ipv6 = true
            }
            if (item.ipv6Show) {
              const ipv6Val = item.ipv6 || (typeof this.decorator.networkConfig.ips6 === 'function'
                ? f.getFieldValue(this.decorator.networkConfig.ips6(item.key, item.network)[0])
                : undefined)
              if (ipv6Val) {
                const prefix = this.$refs.networkConfigRef?.getIpv6Prefix?.(item.network?.guest_ip6_start)
                net.address6 = prefix ? `${prefix}${ipv6Val}` : ipv6Val
              }
            }
            if (item.deviceShow) {
              const model = item.device || (typeof this.decorator.networkConfig.devices === 'function'
                ? f.getFieldValue(this.decorator.networkConfig.devices(item.key)[0])
                : undefined)
              if (model) net.sriov_device = { model }
            }
            // 安全组多选：不写入草稿、不回填
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
      // 跨 tab：未展开的高级选择从 stash 合并，避免基础网卡落盘冲掉
      if (this.isNetworkDraftFromLocal() && this._networkLocalFullDraft?.nets?.[0]) {
        const stashNet = this._networkLocalFullDraft.nets[0]
        if (!ret.nets || !ret.nets.length) {
          ret.nets = [this.pickNetworkCrossTabDraft(this._networkLocalFullDraft).nets?.[0]].filter(Boolean)
        }
        if (ret.nets?.[0] && stashNet) {
          const cur = ret.nets[0]
          const cfg = this.$refs.networkConfigRef
          const first = cfg?.networkList?.[0]
          // 未展开高级：保留 stash 的 IPv6 选择
          if (!cfg?.showAdvanced) {
            if (stashNet.require_ipv6 && !cur.require_ipv6) {
              cur.require_ipv6 = true
              if (stashNet.strict_ipv6) cur.strict_ipv6 = true
            }
          }
          // 未打开 IP/MAC/IPv6/设备：保留 stash（安全组多选不保留、不回填）
          if (!first?.ipShow && stashNet.address && !cur.address) cur.address = stashNet.address
          if (!first?.macShow && stashNet.mac && !cur.mac) cur.mac = stashNet.mac
          if (!first?.ipv6Show && stashNet.address6 && !cur.address6) cur.address6 = stashNet.address6
          if (!first?.deviceShow && stashNet.sriov_device?.model && !cur.sriov_device) {
            cur.sriov_device = { model: stashNet.sriov_device.model }
          }
          // schedtag 设备
          const schedFirst = this.$refs.networkSchedtagRef?.schedtagList?.[0]
          if (!schedFirst?.deviceShow && stashNet.schedtags?.[0]?.sriov_device?.model) {
            if (!cur.schedtags) cur.schedtags = stashNet.schedtags
            else if (cur.schedtags[0] && !cur.schedtags[0].sriov_device) {
              cur.schedtags[0].sriov_device = { ...stashNet.schedtags[0].sriov_device }
            }
          }
        }
      }
      return ret
    },
    restoreFormFieldDraftFields () {
      if (!this.canRestoreFormFieldDraft()) return false
      if (this.formDraftKind === DRAFT_KIND.INPUT) return false
      if (typeof this.isCreateFormFieldTouched === 'function' && this.isCreateFormFieldTouched(this.formDraftKey)) return false
      const draft = this.readFormFieldDraft()
      if (draft === null || draft === undefined) return false
      const fromLocal = this.isFormFieldDraftFromLocal()
      const safeDraft = this.sanitizeDraftForRestore(draft)
      if (typeof this.applyCreateFormFieldDraft === 'function') {
        // 把未收窄的完整草稿一并传入，供展开子项后回填
        this.applyCreateFormFieldDraft(safeDraft, { fromLocal, fullDraft: fromLocal ? draft : undefined })
        return true
      }
      return false
    },
    applyCreateFormFieldDraft (draft, options = {}) {
      if (!this.canRestoreFormFieldDraft() && !this.ignoreAutoNetworkType) return
      if (!draft || !this.form?.fc) return
      this.networkDraftRestoring = true
      const finish = () => {
        this.networkDraftRestoring = false
      }
      // 跨 tab（仅 local）：只回填网络类型 + 第一块网卡的 VPC/子网（或调度标签），不打开高级、不多网卡
      const fromLocal = options.fromLocal != null
        ? !!options.fromLocal
        : this.isFormFieldDraftFromLocal()
      if (fromLocal) {
        // 优先用 options.fullDraft / 当前 local 完整草稿；深拷贝避免后续落盘改到 stash
        const full = options.fullDraft || this.readFormFieldDraft() || draft
        try {
          this._networkLocalFullDraft = full && typeof full === 'object'
            ? JSON.parse(JSON.stringify(full))
            : full
        } catch (e) {
          this._networkLocalFullDraft = full && typeof full === 'object' ? { ...full } : full
        }
        this._networkFromLocal = true
        this._networkGatedApplied = Object.create(null)
      }
      const sourceDraft = fromLocal ? this.pickNetworkCrossTabDraft(draft) : draft
      // networkType 必须在当前可选 maps 中
      let networkType = sourceDraft.networkType
      if (networkType && !this.networkMaps?.[networkType] && !this.originNetworkMaps?.[networkType]) {
        const keys = Object.keys(this.networkMaps || {})
        networkType = keys[0]
      }
      if (networkType) {
        this.form.fc.setFieldsValue({ networkType })
        if (this.form.fd) this.form.fd.networkType = networkType
        this.syncNetworkComponentFromForm()
      }
      const safeDraft = networkType ? { ...sourceDraft, networkType } : sourceDraft
      const applyOpts = { fromLocal }
      this._pendingNetworkDraft = { draft: safeDraft, options: applyOpts }
      this.$nextTick(() => {
        if (!this.tryApplyPendingNetworkDraft()) {
          // networkComponent watch 会在子组件挂载后继续
          return
        }
        finish()
      })
    },
    isNetworkDraftFromLocal () {
      return !!(this._networkFromLocal || this.isFormFieldDraftFromLocal())
    },
    onNetworkAdvancedChange (open) {
      if (!open || !this.isNetworkDraftFromLocal()) return
      this.$nextTick(() => this.applyNetworkGatedFromDraft('advanced'))
    },
    onNetworkOptionalChange ({ flag, key, show }) {
      if (!show || !flag || !this.isNetworkDraftFromLocal()) return
      // 安全组多选：不回填
      if (flag === 'secgroup') return
      this.$nextTick(() => this.applyNetworkGatedFromDraft(flag, key))
    },
    /**
     * 跨 tab：用户展开网络高级子项后再回填（IP 单选 / 设备等；安全组多选不回填）
     */
    applyNetworkGatedFromDraft (flag, nicKey) {
      if (!flag || flag === 'secgroup' || !this.isNetworkDraftFromLocal() || !this.form?.fc) return
      const full = this._networkLocalFullDraft || this.readFormFieldDraft()
      if (!full || !Array.isArray(full.nets) || !full.nets.length) return
      // 跨 tab 仅第一块网卡
      const net = full.nets[0]
      if (!net || typeof net !== 'object') return
      if (!this._networkGatedApplied) this._networkGatedApplied = Object.create(null)
      const gateKey = `${flag}:${nicKey || 'first'}`
      if (this._networkGatedApplied[gateKey]) return

      if (full.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        const ref = this.$refs.networkConfigRef
        const list = ref && ref.networkList
        if (!list || !list.length) return
        const item = (nicKey && list.find(n => n.key === nicKey)) || list[0]
        if (!item) return
        const dec = this.decorator.networkConfig
        const scheduleWrite = (write) => {
          write()
          this.$nextTick(write)
        }
        if (flag === 'advanced') {
          // 高级展开后可见的选择：IPv6 开关/模式
          if (!net.require_ipv6) {
            this._networkGatedApplied[gateKey] = true
            return
          }
          item.requireIpv6 = true
          item.ipv6Mode = net.strict_ipv6 ? 'only' : 'all'
          const networkArg = item.network
          const values = {}
          if (dec.ipv6s) values[dec.ipv6s(item.key, networkArg)[0]] = true
          if (dec.ipv6_mode) values[dec.ipv6_mode(item.key, networkArg)[0]] = item.ipv6Mode
          if (!Object.keys(values).length) return
          this._networkGatedApplied[gateKey] = true
          scheduleWrite(() => this.form.fc.setFieldsValue(values))
          return
        }
        if (flag === 'ip') {
          if (!net.address || !dec.ips) return
          // 仅回填；IpSelect 拉完可用地址后若不在列表会自动清空，不伪造选项
          this.$set(item, 'ip', net.address)
          this._networkGatedApplied[gateKey] = true
          const fieldKey = dec.ips(item.key, item.network)[0]
          scheduleWrite(() => {
            this.$set(item, 'ip', net.address)
            this.form.fc.setFieldsValue({ [fieldKey]: net.address })
          })
          return
        }
        if (flag === 'mac') {
          if (!net.mac || !dec.macs) return
          this.$set(item, 'mac', net.mac)
          this._networkGatedApplied[gateKey] = true
          scheduleWrite(() => {
            this.form.fc.setFieldsValue({ [dec.macs(item.key, item.network)[0]]: net.mac })
          })
          return
        }
        if (flag === 'ipv6') {
          if (!net.address6 || !dec.ips6) return
          const prefix = ref.getIpv6Prefix
            ? ref.getIpv6Prefix(item.network?.guest_ip6_start || net.address6)
            : ''
          const short = prefix && net.address6.indexOf(prefix) === 0
            ? net.address6.replace(prefix, '')
            : net.address6
          this.$set(item, 'ipv6', short)
          this._networkGatedApplied[gateKey] = true
          scheduleWrite(() => {
            this.form.fc.setFieldsValue({ [dec.ips6(item.key, item.network)[0]]: short })
          })
          return
        }
        if (flag === 'device') {
          const model = net.sriov_device && net.sriov_device.model
          if (!model || !dec.devices) return
          const opts = ref.gpuOptions || []
          // options 未就绪则稍后重试；就绪后不在列表则不回填
          if (!opts.length) return
          const hit = opts.some(o => o.key === model || o.id === model || o.model === model)
          if (!hit) {
            this._networkGatedApplied[gateKey] = true
            return
          }
          this._networkGatedApplied[gateKey] = true
          scheduleWrite(() => {
            this.form.fc.setFieldsValue({ [dec.devices(item.key)[0]]: model })
          })
          return
        }
        return
      }

      if (full.networkType === NETWORK_OPTIONS_MAP.schedtag.key && flag === 'device') {
        const ref = this.$refs.networkSchedtagRef
        const list = ref && ref.schedtagList
        if (!list || !list.length) return
        const item = (nicKey && list.find(n => n.key === nicKey)) || list[0]
        if (!item) return
        const tag = net.schedtags && net.schedtags[0]
        const model = tag && tag.sriov_device && tag.sriov_device.model
        const dec = this.decorator.networkSchedtag
        if (!model || !dec || !dec.devices) return
        const opts = ref.gpuOptions || []
        if (!opts.length) return
        const hit = opts.some(o => o.key === model || o.id === model || o.model === model)
        if (!hit) {
          this._networkGatedApplied[gateKey] = true
          return
        }
        this._networkGatedApplied[gateKey] = true
        const write = () => {
          this.form.fc.setFieldsValue({ [dec.devices(item.key)[0]]: model })
        }
        write()
        this.$nextTick(write)
      }
    },
    /**
     * 跨 tab 回填：仅网络类型 + 第一块选择型网卡（VPC/子网 或 调度标签），不含高级
     */
    pickNetworkCrossTabDraft (draft) {
      if (!draft || typeof draft !== 'object') return {}
      const ret = {}
      if (draft.networkType) ret.networkType = draft.networkType
      if (!Array.isArray(draft.nets) || !draft.nets.length) return ret
      const first = draft.nets[0]
      if (!first || typeof first !== 'object') return ret
      if (draft.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        ret.nets = [{
          vpc: first.vpc,
          network: first.network,
          network_id: first.network_id,
        }]
      } else if (draft.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        const tag = first.schedtags && first.schedtags[0]
        if (tag && tag.id) {
          ret.nets = [{
            schedtags: [{
              id: tag.id,
              strategy: tag.strategy,
            }],
          }]
        }
      }
      return ret
    },
    /**
     * 回填白名单：manual 模式保留选择型子字段（VPC/子网、IP、IPv6 开关、设备型号），
     * MAC / IPv6 地址（输入）与安全组（多选）不回填
     */
    sanitizeDraftForRestore (draft) {
      if (draft == null || typeof draft !== 'object') return draft
      // 跨 tab：进一步收窄为类型 + 第一块基础选择项（高级子项展开后再回填）
      if (this.isFormFieldDraftFromLocal()) {
        return this.pickNetworkCrossTabDraft(draft)
      }
      if (draft.networkType !== NETWORK_OPTIONS_MAP.manual.key || !Array.isArray(draft.nets)) {
        return draft
      }
      return {
        ...draft,
        nets: draft.nets.map((net) => {
          if (!net || typeof net !== 'object') return null
          const ret = {
            vpc: net.vpc,
            network: net.network,
            network_id: net.network_id,
          }
          // IP 单选可回填
          if (net.address) ret.address = net.address
          if (net.require_ipv6) {
            ret.require_ipv6 = true
            if (net.strict_ipv6) ret.strict_ipv6 = true
          }
          if (net.sriov_device && net.sriov_device.model) ret.sriov_device = { model: net.sriov_device.model }
          // 安全组多选：不回填
          return ret
        }).filter(Boolean),
      }
    },
    applyNetworkDraftNets (draft, options = {}) {
      if (!draft) return
      const fromLocal = !!options.fromLocal
      if (draft.networkType === NETWORK_OPTIONS_MAP.manual.key && Array.isArray(draft.nets) && draft.nets.length) {
        const ref = this.$refs.networkConfigRef
        if (ref && typeof ref.initData === 'function') {
          ref.initData(draft.nets, { skipAdvanced: fromLocal })
        }
        return
      }
      if (draft.networkType === NETWORK_OPTIONS_MAP.schedtag.key && Array.isArray(draft.nets) && draft.nets.length) {
        const ref = this.$refs.networkSchedtagRef
        if (ref && typeof ref.initData === 'function') {
          ref.initData(draft.nets, { skipAdvanced: fromLocal })
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
