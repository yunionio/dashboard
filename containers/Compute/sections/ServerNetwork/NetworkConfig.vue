<template>
  <div class="network-config">
    <div
      class="network-config-item"
      v-for="(item, i) in networkList"
      :key="item.key">
      <div class="network-config-item__top">
        <a-tag color="blue" class="network-config-item__tag">{{ isBonding ? 'bond' : $t('compute.text_193')}}{{i + count}}</a-tag>
        <div class="network-config-item__selects">
          <a-form-item
            v-show="showVpc"
            :wrapperCol="{ span: 24 }"
            class="mb-0 network-config-item__vpc">
            <oc-select
              v-if="i === 0"
              v-decorator="decorator.vpcs(item.key)"
              show-status
              show-group
              :status-desc="$t('compute.vpc_status_desc')"
              :resource="vpcResource"
              :formatter="vpcFormatter"
              :params="vpcParams"
              :mapper="vpcResourceMapper"
              :sort="(arr) => arr.sort((a, b) => a.network_count > b.network_count ? -1 : 1)"
              :placeholder="$t('compute.text_194')"
              @selectChange="(curObjArr) => vpcSelectChange(curObjArr, i, item)"
              @fetchSuccess="(data) => fetchVpcSuccessHandle(data, item)" />
            <a-tag v-else color="blue" class="network-config-item__vpc-tag">{{ getVpcTag(networkList[0].vpc) }}</a-tag>
          </a-form-item>
          <a-form-item
            :wrapperCol="{ span: 24 }"
            class="mb-0 network-config-item__network network-item">
            <base-select
              class="w-100"
              v-decorator="decorator.networks(item.key)"
              resource="networks"
              remote
              show-sync
              :item.sync="item.network"
              :isDefaultSelect="canDefaultSelect && i === 0"
              :need-params="true"
              :params="{ ...networkParamsC, $t: item.key }"
              :mapper="networkResourceMapper"
              :remote-fn="q => ({ search: q })"
              :beforeDefaultSelectCallBack="beforeDefaultSelectCallBack"
              @change="v => networkChange(v, item, i)"
              @update:resList="list => resolveNetworkFromFetchedList(list, item)"
              :select-props="{ allowClear: true, placeholder: $t('compute.text_195') }"
              :min-width="isDialog ? '200px' : '500px'" />
            <div slot="extra" v-if="i === 0">{{$t('compute.text_196')}}<help-link href="/network">{{$t('compute.perform_create')}}</help-link>
            </div>
          </a-form-item>
        </div>
        <div class="network-config-item__aside">
          <a-button
            v-if="hasAdvancedOptions(item)"
            type="link"
            size="small"
            @click="item.advancedShow = !item.advancedShow">
            {{ item.advancedShow ? $t('compute.hide_advanced') : $t('compute.advanced') }}
          </a-button>
          <a-button
            v-if="i !== 0"
            shape="circle"
            icon="minus"
            size="small"
            @click="decrease(item.key, i)" />
        </div>
      </div>

      <div v-if="item.advancedShow && hasAdvancedOptions(item)" class="network-config-item__advanced">
        <div class="network-config-item__advanced-main">
          <div class="network-config-item__toggles">
            <template v-if="isSupportIPv4(item) && !(isSupportIPv6(item) && item.ipv6Mode === 'only' && item.requireIpv6)">
              <a-tooltip :title="ipsDisabled ? ipBtnTooltip : undefined">
                <span class="network-config-item__toggle">
                  <a-checkbox
                    :checked="item.ipShow"
                    :disabled="ipsDisabled"
                    @change="() => triggerShowIp(item)">
                    {{$t('compute.text_198')}}
                  </a-checkbox>
                </span>
              </a-tooltip>
            </template>
            <template v-if="showMacConfig">
              <a-tooltip :title="ipsDisabled ? ipBtnTooltip : undefined">
                <span class="network-config-item__toggle">
                  <a-checkbox
                    :checked="item.macShow"
                    :disabled="ipsDisabled"
                    @change="() => triggerShowMac(item)">
                    {{$t('compute.mac_config')}}
                  </a-checkbox>
                </span>
              </a-tooltip>
            </template>
            <template v-if="showDeviceConfig">
              <span class="network-config-item__toggle">
                <a-checkbox
                  :checked="item.deviceShow"
                  @change="() => triggerShowDevice(item)">
                  {{ $t('compute.config_transparent_net') }}
                </a-checkbox>
              </span>
            </template>
            <template v-if="showSecgroupConfig">
              <span class="network-config-item__toggle">
                <a-checkbox
                  :checked="item.secgroupShow"
                  @change="() => triggerShowSecgroup(item)">
                  {{ $t('compute.config_secgroup') }}
                </a-checkbox>
              </span>
            </template>
            <template v-if="isSupportIPv6(item) && isSupportIPv4(item)">
              <div class="network-config-item__ipv6-toggle">
                <a-checkbox v-decorator="decorator.ipv6s(item.key, item.network)" @change="(e) => triggerRequireIpv6(item, e)" />
                <a-dropdown>
                  <a-menu slot="overlay" @click="(e) => triggerIpv6Mode(item, e, i)" v-decorator="decorator.ipv6_mode(item.key, item.network)">
                    <a-menu-item key="all">{{ $t('compute.server_create.require_ipv6_all') }}</a-menu-item>
                    <a-menu-item key="only">{{ $t('compute.server_create.require_ipv6_only') }}</a-menu-item>
                  </a-menu>
                  <a-button type="link" size="small">
                    {{ item.ipv6Mode === 'only' ? $t('compute.server_create.require_ipv6_only') : $t('compute.server_create.require_ipv6_all') }}
                    <a-icon type="down" />
                  </a-button>
                </a-dropdown>
              </div>
            </template>
            <template v-if="(isSupportIPv6(item) && item.requireIpv6) || (!isSupportIPv4(item) && isSupportIPv6(item))">
              <span class="network-config-item__toggle">
                <a-checkbox
                  :checked="item.ipv6Show"
                  @change="() => triggerShowIpv6(item)">
                  {{$t('compute.ipv6_config')}}
                </a-checkbox>
              </span>
            </template>
            <template v-if="showPortMapping">
              <span class="network-config-item__toggle">
                <a-checkbox
                  :checked="item.portMappingShow"
                  @change="() => triggerShowPortMapping(item)">
                  {{ $t('compute.port_mappings.set') }}
                </a-checkbox>
              </span>
            </template>
          </div>

          <div
            v-if="hasExpandedAdvancedFields(item)"
            class="network-config-item__fields">
            <div
              v-if="item.ipShow && isSupportIPv4(item) && !(isSupportIPv6(item) && item.ipv6Mode === 'only' && item.requireIpv6)"
              class="network-config-item__field">
              <div class="network-config-item__field-label">IP</div>
              <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
                <ip-select v-decorator="decorator.ips(item.key, item.network)" :value="item.ip" :network="item.network" @change="e => ipChange(e, i)" />
              </a-form-item>
            </div>
            <div v-if="showMacConfig && item.macShow" class="network-config-item__field">
              <div class="network-config-item__field-label">{{ $t('compute.text_385') }}</div>
              <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
                <a-input
                  :placeholder="$t('compute.text_806')"
                  @change="e => macChange(e, i)"
                  v-decorator="decorator.macs(item.key, item.network)" />
              </a-form-item>
            </div>
            <div v-if="showDeviceConfig && item.deviceShow" class="network-config-item__field">
              <div class="network-config-item__field-label">{{ $t('compute.transparent_net') }}</div>
              <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
                <oc-select
                  v-decorator="decorator.devices(item.key)"
                  width="100%"
                  :data="gpuOptions"
                  :placeholder="$t('compute.sriov_device_tips')" />
              </a-form-item>
            </div>
            <div v-if="showSecgroupConfig && item.secgroupShow" class="network-config-item__field">
              <div class="network-config-item__field-label">{{ $t('dictionary.secgroup') }}</div>
              <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
                <base-select
                  v-decorator="decorator.secgroups(item.key)"
                  resource="secgroups"
                  :params="secgroupParams"
                  :select-props="{ allowClear: true, placeholder: $t('compute.secgroup_tips'), mode: 'multiple' }" />
              </a-form-item>
            </div>
            <div
              v-if="item.ipv6Show && ((isSupportIPv6(item) && item.requireIpv6) || (!isSupportIPv4(item) && isSupportIPv6(item)))"
              class="network-config-item__field">
              <div class="network-config-item__field-label">IPv6</div>
              <div class="network-config-item__ipv6-field">
                <span class="network-config-item__ipv6-prefix">{{ getIpv6Prefix(item.network?.guest_ip6_start) }}</span>
                <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
                  <a-input
                    :placeholder="$t('compute.complete_ipv6_address')"
                    @change="e => ipv6Change(e, i)"
                    v-decorator="decorator.ips6(item.key, item.network)" />
                </a-form-item>
              </div>
            </div>
          </div>

          <div
            v-if="showPortMapping && item.portMappingShow"
            class="network-port-mapping">
            <div class="network-port-mapping__title">{{ $t('compute.repo.port_mapping') }}</div>
            <labels
              class="network-port-mapping__labels"
              :ref="'portMappingRef_' + item.key"
              :create-form="form"
              :decorators="getPortMappingDecorators(item.key)"
              :init-pairs="item.port_mappings || []"
              :title="$t('compute.repo.port_mapping')"
              :keyLabel="$t('compute.repo.container_port')"
              :valueLabel="$t('compute.repo.host_port')"
              :keyPlaceholder="$t('compute.repo.example', ['443'])"
              :valuePlaceholder="$t('compute.repo.example', ['443'])"
              :valueTooltip="$t('compute.port_mappings.host_port_tip', [20000, 25000])"
              show-protocol
              @label-change="list => onPortMappingLabelChange(item, list)" />
          </div>
        </div>
      </div>
    </div>

    <div class="network-config__add" v-if="networkCountRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('compute.text_199')}}</a-button>
      <span class="network-count-tips">{{$t('compute.text_130')}}<span class="remain-num">{{ networkCountRemaining }}</span>{{$t('compute.text_200')}}</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import ipaddr from 'ipaddr.js'
import Labels from '@Compute/sections/Labels'
import { uuid } from '@/utils/utils'
import IpSelect from './IpSelect.vue'

export default {
  name: 'NetworkConfig',
  components: {
    IpSelect,
    Labels,
  },
  props: {
    count: {
      type: Number,
      default: () => 0,
    },
    networkParams: {
      type: Object,
      required: true,
    },
    limit: {
      type: Number,
      default: 8, // 默认支持最多 8 个ip子网
    },
    form: {
      type: Object,
      required: true,
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Function, val.vpcs) && R.is(Function, val.networks) && R.is(Function, val.ips) && R.is(Function, val.macs) && R.is(Function, val.ips6) && R.is(Function, val.secgroups),
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
    networkResourceMapper: {
      type: Function,
      default: (data) => { return data },
    },
    vpcParams: {
      type: Object,
      required: true,
    },
    vpcResource: {
      type: String,
      default: 'vpcs', // 还可能是这样的resource cloudregions/{region_id}/vpcs
    },
    vpcResourceMapper: {
      type: Function,
      default: data => { return data },
    },
    vpcObj: {
      type: Object,
      validator: val => val.id && val.name,
    },
    ipsDisable: {
      type: Boolean,
      default: false,
    },
    showVpc: {
      type: Boolean,
      default: true,
    },
    isDialog: {
      type: Boolean,
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
    showPortMapping: {
      type: Boolean,
      default: false,
    },
    secgroupParams: {
      type: Object,
      default: () => ({}),
    },
    hiddenAdd: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      networkList: [],
      ipsDisabled: this.ipsDisable,
      networkLoading: false,
      networkOpts: [],
      screenWidth: document.body.clientWidth,
      canDefaultSelect: true,
    }
  },
  computed: {
    networkCountRemaining () {
      if (this.hiddenAdd) return 0
      return this.limit - this.networkList.length
    },
    networkParamsC () {
      if (!this.networkList[0]?.vpc?.id) return {}
      return {
        limit: 20,
        ...this.networkParams,
        vpc: this.networkList[0].vpc.id,
      }
    },
    ipBtnTooltip () {
      return this.ipsDisabled ? this.$t('common_718') : null
    },
    gpuOptions () {
      const specs = this.form.fi.capability.specs || {}
      const data = specs.isolated_devices || {}
      const ret = []
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = data[key]
          if (item.dev_type.startsWith('NIC')) {
            ret.push({
              ...item,
              key: `${item.model}`,
              label: `${item.model}`,
            })
          }
        }
      }
      return ret
    },
    isBigScreen () {
      return this.screenWidth > 1650
    },
  },
  watch: {
    vpcObj (val) {
      if (val && val.id && val.name) {
        this.$set(this.networkList[0], 'vpc', val)
        this.form.fc.setFieldsValue({
          [this.decorator.vpcs(this.networkList[0].key)[0]]: this.vpcObj.id,
        })
      }
    },
    networkList (val) {
      this.$set(this.form.fi, 'networkList', val)
    },
  },
  created () {
    this.add()
  },
  mounted () {
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    initData (data) {
      this.canDefaultSelect = false
      this.networkList = data.map(item => {
        // 工单/草稿都可能是 string id，或 { id } / 仅有 network_id
        const networkId = typeof item.network === 'object'
          ? (item.network && (item.network.id || item.network.key))
          : (item.network || item.network_id)
        const vpcId = typeof item.vpc === 'object'
          ? (item.vpc && (item.vpc.id || item.vpc.key))
          : item.vpc
        const obj = {
          ...item,
          key: uuid(),
          // 不预填 network id，避免 BaseSelect / 表单回填无效 id；偏好仅存 _draft*
          network: {},
          _draftNetworkId: networkId || '',
          _draftVpcId: vpcId || '',
          vpc: { id: vpcId },
          ipShow: !!item.address,
          ipv6Show: false,
          requireIpv6: false,
          ipv6Mode: 'all',
          macShow: false,
          deviceShow: false,
          secgroupShow: false,
          portMappingShow: false,
          port_mappings: [],
          advancedShow: false,
          ip: item.address,
        }
        if (item.address) {
          obj.ipShow = true
          obj.advancedShow = true
        }
        if (item.mac) {
          obj.macShow = true
          obj.advancedShow = true
        }
        if (item.require_ipv6) {
          obj.requireIpv6 = true
          obj.ipv6Mode = 'all'
          obj.advancedShow = true
        }
        if (item.strict_ipv6 && item.require_ipv6) {
          obj.ipv6Mode = 'only'
        }
        if (item.address6) {
          obj.ipv6Show = true
          obj.advancedShow = true
        }
        if (item.sriov_device && item.sriov_device.model) {
          obj.deviceShow = true
          obj.advancedShow = true
        }
        if (item.secgroups && item.secgroups.length > 0) {
          obj.secgroupShow = true
          obj.advancedShow = true
        }
        if (this.showPortMapping && Array.isArray(item.port_mappings) && item.port_mappings.length > 0) {
          obj.portMappingShow = true
          obj.port_mappings = item.port_mappings
          obj.advancedShow = true
        }
        return obj
      })
      // 多网卡共用第一块 VPC：补齐后续项 vpc，保证 networkParamsC 能拉子网列表
      const firstVpc = this.networkList[0] && this.networkList[0].vpc
      if (firstVpc && firstVpc.id) {
        this.networkList.forEach((item, idx) => {
          if (idx > 0 && (!item.vpc || !item.vpc.id)) {
            item.vpc = { ...firstVpc }
          }
        })
      }
      const applyAllNetworkFields = () => {
        if (!this.form || !this.form.fc || !this.networkList.length) return
        const first = this.networkList[0]
        if (first.vpc && first.vpc.id) {
          this.form.fc.setFieldsValue({
            [this.decorator.vpcs(first.key)[0]]: first.vpc.id,
          })
        }
        this.networkList.forEach((item) => {
          const value = {}
          // 子网：仅写已在列表中 resolve 且可用的 id，禁止盲种草稿无效 id
          const netId = item.network && item.network.id
          if (netId && this.isNetworkAvailable(item.network)) {
            value[this.decorator.networks(item.key)[0]] = netId
          }
          const netKeyForDecorators = (netId && this.isNetworkAvailable(item.network)) ? netId : null
          if (item.address && netKeyForDecorators) {
            value[this.decorator.ips(item.key, netKeyForDecorators)[0]] = item.address
          }
          if (item.mac && netKeyForDecorators) {
            value[this.decorator.macs(item.key, netKeyForDecorators)[0]] = item.mac
          }
          if (netKeyForDecorators) {
            value[this.decorator.ipv6s(item.key, netKeyForDecorators)[0]] = item.requireIpv6
            value[this.decorator.ipv6_mode(item.key, netKeyForDecorators)[0]] = item.ipv6Mode
          }
          if (item.address6 && netKeyForDecorators) {
            value[this.decorator.ips6(item.key, netKeyForDecorators)[0]] = item.address6.replace(this.getIpv6Prefix(item.address6), '')
          }
          if (item.sriov_device && item.sriov_device.model) {
            value[this.decorator.devices(item.key)[0]] = item.sriov_device.model
          }
          if (item.secgroups && item.secgroups.length > 0) {
            value[this.decorator.secgroups(item.key)[0]] = item.secgroups
          }
          this.form.fc.setFieldsValue(value)
        })
      }
      this.$nextTick(() => {
        applyAllNetworkFields()
        // 子网列表异步拉取后再次写入，避免最后一块网卡装饰器尚未挂上 / options 未就绪
        setTimeout(applyAllNetworkFields, 1500)
        setTimeout(applyAllNetworkFields, 3000)
        setTimeout(applyAllNetworkFields, 5000)
      })
    },
    getVpcTag (data) {
      if (!data.cidr_block) return data.name
      return `${data.name}（${data.cidr_block}）`
    },
    vpcLabelFormat (item) {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.account ? item.account + ', ' : ''}${item.cidr_block}）`
    },
    vpcFormatter (v) {
      return { key: v.id, label: this.vpcLabelFormat(v), disabled: v.network_count === 0, ...v }
    },
    networkFormatter (v) {
      let addrLabel = `${v.guest_ip_start} - ${v.guest_ip_end}/${v.guest_ip_mask}`
      if (v.guest_ip6_start && v.guest_ip6_end) {
        addrLabel += `,${v.guest_ip6_start} - ${v.guest_ip6_end}/${v.guest_ip6_mask}`
      }
      return {
        key: v.id,
        label: `${v.name}(${addrLabel}, vlan=${v.vlan_id})`,
        rightLabel: `${this.$t('common.text00001')}: ${v.ports - v.ports_used}`,
        disabled: v.ports <= v.ports_used,
        ...v,
      }
    },
    ipChange (e, i) {
      this.networkList[i].ip = e
    },
    macChange (e, i) {
      this.networkList[i].mac = e.target.value
    },
    ipv6Change (e, i) {
      this.networkList[i].ipv6 = e.target.value
    },
    getIpv6Prefix (ipv6 = '') {
      if (ipv6) {
        const list = ipaddr.parse(ipv6).toNormalizedString().split(':')
        return list.slice(0, 4).join(':') + ':'
      }
      return ''
    },
    add () {
      const uid = uuid()
      const data = {
        network: {},
        vpc: {},
        ipShow: false,
        ipv6Show: false,
        requireIpv6: false,
        ipv6Mode: 'all',
        macShow: false,
        deviceShow: false,
        key: uid,
        ip: '',
        secgroupShow: false,
        portMappingShow: false,
        port_mappings: [],
        advancedShow: false,
      }
      if (this.vpcObj) {
        data.vpc = this.vpcObj
      }
      this.networkList.push(data)
      this.$nextTick(() => {
        if (this.vpcObj) {
          this.form.fc.setFieldsValue({
            [this.decorator.vpcs(uid)[0]]: this.vpcObj.id,
          })
        }
      })
    },
    triggerShowIp (item, i) {
      item.ipShow = !item.ipShow
    },
    triggerShowIpv6 (item, i) {
      item.ipv6Show = !item.ipv6Show
    },
    triggerIpv6Mode (item, e, i) {
      item.ipv6Mode = e.key
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          [`networkIPv6Modes[${item.key}]`]: e.key,
        })
      })
    },
    triggerRequireIpv6 (item, e) {
      item.requireIpv6 = e.target.checked
    },
    triggerShowMac (item, i) {
      item.macShow = !item.macShow
    },
    triggerShowDevice (item, i) {
      item.deviceShow = !item.deviceShow
    },
    triggerShowSecgroup (item, i) {
      item.secgroupShow = !item.secgroupShow
    },
    decrease (uid, index) {
      this.networkList.splice(index, 1)
    },
    reset (ipsDisabled) { // 重置成不可手动输入IP，并且仅保留1条数据
      if (this.networkList.length > 1) {
        const firstItem = this.networkList[0]
        this.networkList = [firstItem]
      }
      this.$set(this.networkList[0], 'ipShow', false)
      this.$set(this.networkList[0], 'ipv6Show', false)
      this.$set(this.networkList[0], 'requireIpv6', false)
      this.$set(this.networkList[0], 'ipv6Mode', 'all')
      this.$set(this.networkList[0], 'macShow', false)
      this.$set(this.networkList[0], 'deviceShow', false)
      this.$set(this.networkList[0], 'secgroupShow', false)
      this.$set(this.networkList[0], 'portMappingShow', false)
      this.$set(this.networkList[0], 'port_mappings', [])
      this.$set(this.networkList[0], 'advancedShow', false)
      this.ipsDisabled = ipsDisabled
    },
    getPortMappingDecorators (netKey) {
      const portMapping = this.decorator.portMapping || {}
      return {
        key: (rowKey) => portMapping.key(netKey, rowKey),
        value: (rowKey) => portMapping.value(netKey, rowKey),
        protocol: portMapping.protocol
          ? (rowKey) => portMapping.protocol(netKey, rowKey)
          : undefined,
      }
    },
    triggerShowPortMapping (item) {
      item.portMappingShow = !item.portMappingShow
      if (!item.portMappingShow) {
        item.port_mappings = []
        const ref = this.$refs[`portMappingRef_${item.key}`]
        const labelRef = Array.isArray(ref) ? ref[0] : ref
        if (labelRef?.reset) labelRef.reset()
        return
      }
      this.$nextTick(() => {
        const ref = this.$refs[`portMappingRef_${item.key}`]
        const labelRef = Array.isArray(ref) ? ref[0] : ref
        if (labelRef && (!labelRef.labelList || !labelRef.labelList.length) && labelRef.add) {
          labelRef.add()
        }
      })
    },
    onPortMappingLabelChange (item, list) {
      // 通过 - 删光后，关闭「设置端口映射」
      if (!list || !list.length) {
        item.portMappingShow = false
        item.port_mappings = []
      }
    },
    networkChange (val, item, i) {
      this.$nextTick(() => {
        const fieldKey = `networkExits[${item.key}]`
        this.form.fc.getFieldDecorator(fieldKey, {
          preserve: true,
        })
        this.form.fc.setFieldsValue({
          [fieldKey]: item.network.exit,
        })
        if (item.network.guest_ip_start && item.network.guest_ip_end) {
          this.form.fc.setFieldsValue({
            [`networkIPv6Modes[${item.key}]`]: 'all',
            [`networkIPv6s[${item.key}]`]: false,
          })
          this.$set(this.networkList[i], 'ipv6Mode', 'all')
          this.$set(this.networkList[i], 'requireIpv6', false)
        }
      })
    },
    networkSelectChange (curObjArr, item) {
      item.network = curObjArr[0]
      this.$nextTick(() => {
        const fieldKey = `networkExits[${item.key}]`
        this.form.fc.getFieldDecorator(fieldKey, {
          preserve: true,
        })
        this.form.fc.setFieldsValue({
          [fieldKey]: item.network?.exit,
        })
      })
    },
    vpcChange (v, i) {
      this.$nextTick(() => {
        if (this.form.fi) {
          const networkVpcObj = this.networkList[i].vpc
          if (R.is(Object, networkVpcObj)) {
            this.$set(this.form.fi, 'networkVpcObj', networkVpcObj)
          }
        }
      })
    },
    vpcSelectChange (curObjArr, i, item) {
      item.vpc = curObjArr[0]
      this.$nextTick(() => {
        if (this.form.fi) {
          const networkVpcObj = item.vpc || {}
          if (R.is(Object, networkVpcObj)) {
            this.$set(this.form.fi, 'networkVpcObj', networkVpcObj)
          }
        }
      })
    },
    beforeDefaultSelectCallBack (data = []) {
      // BaseSelect 默认只取 list[0]，故仅当首项可用时允许默认选
      return this.isNetworkAvailable(data[0])
    },
    isNetworkAvailable (net) {
      if (!net || typeof net !== 'object') return false
      return Number(net.ports) > Number(net.ports_used)
    },
    findNetworkInList (list, id) {
      if (id == null || id === '' || !Array.isArray(list)) return null
      return list.find(i => i.id === id || i.key === id || String(i.id) === String(id)) || null
    },
    /**
     * 草稿/工单回填（canDefaultSelect=false）：数据驱动，opts/resList 每次变化都重算并写回。
     * 1) _draftNetworkId 在列表且可用 → 始终优先
     * 2) 草稿在列表但不可用 / 不在列表 / 无草稿 → 可用第一项
     * 3) 都没有可用项 → 清空无效 id，不写不存在的网络
     */
    resolveNetworkFromFetchedList (list, item) {
      if (this.canDefaultSelect) return
      if (!item || !Array.isArray(list) || !list.length) return
      // 供 VPC 稳定后再用同一份 opts 重跑回填（params clear 后可能不再 emit）
      item._lastNetworkResList = list

      const field = this.decorator.networks(item.key)[0]
      const preferId = item._draftNetworkId || ''
      const curId = this.form?.fc?.getFieldValue(field) || item.network?.id || item.network?.key

      let target = null
      const preferHit = preferId ? this.findNetworkInList(list, preferId) : null
      if (preferHit && this.isNetworkAvailable(preferHit)) {
        target = preferHit
      } else {
        // 未命中 / 不可用 / 无草稿：绝不回填无效 id，改选列表内可用第一项
        target = list.find(n => this.isNetworkAvailable(n)) || null
      }

      if (!target) {
        const curHit = this.findNetworkInList(list, curId)
        if (curId && (!curHit || !this.isNetworkAvailable(curHit))) {
          item.network = {}
          if (this.form?.fc) this.form.fc.setFieldsValue({ [field]: undefined })
        }
        return
      }

      // opts 每次变化都写回，不因 curId===target 而跳过
      item.network = target
      this.$nextTick(() => {
        if (!this.form?.fc) return
        this.form.fc.setFieldsValue({ [field]: target.id })
        const idx = this.networkList.indexOf(item)
        if (idx >= 0) this.networkChange(target.id, item, idx)
      })
    },
    fetchVpcSuccessHandle (data = [], item) {
      let target = data[0] || {}
      if (item.vpc?.id && data.some(i => i.id === item.vpc?.id)) {
        target = data.filter(i => i.id === item.vpc?.id)[0]
      }
      item.vpc = target
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ [`vpcs[${item.key}]`]: target?.key, vpcs: { [item.key]: target?.key } })
        // VPC 写回后 params 可能 clear 网卡：用最近一次子网 opts 再回填一次
        if (item._lastNetworkResList && item._lastNetworkResList.length) {
          this.resolveNetworkFromFetchedList(item._lastNetworkResList, item)
        }
      })
      this.vpcSelectChange([target], 0, item)
      // this.fetchNetworkOpts(this.networkParamsC, item)
    },
    fetchNetworkSuccessHandle (data, item) {
      this.resolveNetworkFromFetchedList(data || [], item)
    },
    fetchNetworkOpts (params, item) {
      this.networkLoading = true
      // 未获取vpc时，network也不展示
      if (!params.vpc) {
        this.networkOpts = []
        item.network = {}
        this.form.fc.setFieldsValue({ [`networks[${item.key}]`]: '' })
        this.networkLoading = false
      } else {
        this.networkOpts = []
        new this.$Manager('networks').list({ params }).then((res) => {
          this.networkOpts = res.data.data || []
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ [`networks[${item.key}]`]: this.networkOpts?.[0]?.id })
          })
          item.network = this.networkOpts[0]
          this.networkLoading = false
        }).catch((err) => {
          this.networkLoading = false
          console.log(err)
          throw err
        })
      }
    },
    onResize () {
      this.screenWidth = document.body.clientWidth
    },
    hasExpandedAdvancedFields (item) {
      if (!item) return false
      if (item.ipShow && this.isSupportIPv4(item) && !(this.isSupportIPv6(item) && item.ipv6Mode === 'only' && item.requireIpv6)) return true
      if (this.showMacConfig && item.macShow) return true
      if (this.showDeviceConfig && item.deviceShow) return true
      if (this.showSecgroupConfig && item.secgroupShow) return true
      if (item.ipv6Show && ((this.isSupportIPv6(item) && item.requireIpv6) || (!this.isSupportIPv4(item) && this.isSupportIPv6(item)))) return true
      return false
    },
    /** 高级区内是否有任一可展示入口；没有则不显示「高级」按钮 */
    hasAdvancedOptions (item) {
      if (!item) return false
      if (this.isSupportIPv4(item) && !(this.isSupportIPv6(item) && item.ipv6Mode === 'only' && item.requireIpv6)) return true
      if (this.showMacConfig) return true
      if (this.showDeviceConfig) return true
      if (this.showSecgroupConfig) return true
      if (this.isSupportIPv6(item) && this.isSupportIPv4(item)) return true
      if ((this.isSupportIPv6(item) && item.requireIpv6) || (!this.isSupportIPv4(item) && this.isSupportIPv6(item))) return true
      if (this.showPortMapping) return true
      return false
    },
    isSupportIPv6 (item) {
      return !!item.network?.guest_ip6_start && !!item.network?.guest_ip6_end
    },
    isSupportIPv4 (item) {
      return !!item.network?.guest_ip_start && !!item.network?.guest_ip_end
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../src/styles/less/theme';

.network-config {
  -webkit-font-smoothing: antialiased;

  &__add {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }

  .network-count-tips {
    .remain-num {
      color: @primary-color;
    }
  }

  .network-config-item {
    margin-bottom: 12px;
    padding: 12px 14px;
    background: #fafafa;
    border: 1px solid #f0f0f0;

    &__top {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    &__tag {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      // 与改版前一致的小标签高度，相对 32px 选择框上下居中
      height: 22px;
      margin: 5px 0 0;
      line-height: 20px;
      font-size: 12px;
      padding: 0 7px;
    }

    &__selects {
      display: flex;
      flex: 0 1 auto;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 8px;
      min-width: 0;
    }

    &__vpc {
      flex: 0 0 auto;
      width: auto;
      max-width: 100%;

      ::v-deep .ant-form-item-control {
        line-height: 32px;
      }

      ::v-deep .ant-form-item-children {
        display: inline-flex;
        align-items: center;
        min-height: 32px;
      }

      ::v-deep .ant-select {
        width: auto;
        min-width: 96px;
      }

      ::v-deep .ant-select-selection {
        height: 32px;
      }

      ::v-deep .ant-select-selection__rendered {
        line-height: 30px;
      }
    }

    &__vpc-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 22px;
      margin: 0;
      padding: 0 7px;
      line-height: 20px;
      white-space: nowrap;
    }

    &__network {
      // 与改版前一致：dialog 200 / 页面 500，不拉满整行
      flex: 0 0 auto;
      width: auto;

      ::v-deep .ant-form-item-control {
        line-height: 32px;
      }

      ::v-deep .base-select-wrap,
      ::v-deep .base-select {
        width: auto !important;
      }
    }

    &__aside {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 4px;
      height: 32px;
    }

    &__advanced {
      margin-top: 10px;
      padding: 8px 0 4px;
      border-top: 1px solid #f0f0f0;
    }

    &__advanced-main {
      min-width: 0;
    }

    &__toggles {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      min-height: 32px;
      column-gap: 16px;
      row-gap: 4px;
    }

    &__toggle {
      display: inline-flex;
      align-items: center;
      height: 32px;
      margin: 0;
      vertical-align: top;
      color: rgba(0, 0, 0, 0.45);

      ::v-deep .ant-checkbox + span {
        color: rgba(0, 0, 0, 0.45);
        padding-right: 0;
      }

      ::v-deep .ant-checkbox-wrapper {
        margin: 0;
        color: rgba(0, 0, 0, 0.45);
      }
    }

    &__ipv6-toggle {
      display: inline-flex;
      align-items: center;
      height: 32px;
      gap: 4px;

      .ant-btn-link {
        padding: 0;
        color: rgba(0, 0, 0, 0.45);

        &:hover {
          color: @primary-color;
        }
      }
    }

    &__fields {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    &__field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 0 1 240px;
      min-width: 200px;
      max-width: 260px;

      ::v-deep .ant-form-item {
        margin-bottom: 0;
      }

      ::v-deep .ant-form-item-control {
        line-height: 32px;
      }

      ::v-deep .ant-input {
        height: 32px;
      }

      ::v-deep .ant-select-selection--single {
        height: 32px;
      }

      ::v-deep .ant-select-selection__rendered {
        line-height: 30px;
      }
    }

    &__field-label {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      line-height: 20px;
    }

    &__ipv6-field {
      display: flex;
      // error 文案会撑高 form-item，勿用 center，否则前缀相对输入框错位
      align-items: flex-start;
      gap: 8px;

      .ant-form-item {
        flex: 1;
        min-width: 0;
        margin-bottom: 0;
      }

      ::v-deep .ant-form-item-control {
        line-height: 32px;
      }

      ::v-deep .ant-form-explain,
      ::v-deep .ant-form-item-explain {
        line-height: 18px;
        min-height: 0;
      }
    }

    &__ipv6-prefix {
      flex-shrink: 0;
      height: 32px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      line-height: 32px;
      font-variant-numeric: tabular-nums;
    }
  }

  .network-port-mapping {
    margin-top: 12px;

    &__title {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      font-weight: normal;
      line-height: 20px;
      margin-bottom: 4px;
    }

    &__labels {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 12px 48px;

      // 每条端口映射：顶部对齐，error 文案在下方不影响同行控件
      ::v-deep > .d-flex:not(.align-items-center) {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: flex-start;
        max-width: 100%;
        min-height: 32px;

        .ant-form-item {
          flex: 0 0 auto;
          margin-bottom: 0;

          .ant-form-item-control {
            line-height: 32px;
          }

          .ant-form-explain,
          .ant-form-item-explain {
            min-height: 0;
            line-height: 18px;
            white-space: nowrap;
          }
        }

        .ant-input-group-addon {
          flex-shrink: 0;
          width: auto !important;
          white-space: nowrap;
          padding: 0 8px;
        }

        .ant-input-group > .ant-input {
          flex: 0 0 96px;
          width: 96px;
        }

        .labels-protocol {
          .ant-select {
            width: 88px;
          }

          .ant-select-selection {
            height: 32px;
          }

          .ant-select-selection__rendered {
            line-height: 30px;
          }
        }

        .mx-3 {
          flex-shrink: 0;
          height: 32px;
          margin-left: 8px !important;
          margin-right: 8px !important;
          line-height: 32px;
        }

        .ant-btn-circle {
          flex-shrink: 0;
          // 覆盖 Labels 上的 mt-2；相对 32px 输入框垂直居中
          margin-top: 4px !important;
          margin-left: 8px;
        }
      }

      // 「添加」与输入框顶部对齐后再垂直居中到 32px 行高
      ::v-deep > .d-flex.align-items-center {
        flex: 0 0 auto;
        align-items: center;
        height: 32px;
        min-height: 32px;
      }
    }
  }
}
</style>
