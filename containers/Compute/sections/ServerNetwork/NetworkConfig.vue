<template>
  <div class="network-config">
    <!-- 适配大、小屏幕 -->
    <div class="mb-2" :class="{ 'd-flex align-items-start' : isBigScreen }" v-for="(item, i) in networkList" :key="item.key">
      <div class="d-flex">
        <a-tag color="blue" class="mr-1" style="height: 20px; margin-top: 10px;">{{ isBonding ? 'bond' : $t('compute.text_193')}}{{i + count}}</a-tag>
        <a-form-item
          v-show="showVpc"
          :wrapperCol="{ span: 24 }"
          class="mb-0 mr-1">
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
          <a-tag v-else color="blue" class="w-100 mr-1">{{ getVpcTag(networkList[0].vpc) }}</a-tag>
        </a-form-item>
        <a-form-item
          :wrapperCol="{ span: 24 }"
          :style="isDialog ? { flex: 1 } : ''"
          class="mb-0 mr-1 network-item">
          <base-select
            class="w-100"
            v-decorator="decorator.networks(item.key)"
            resource="networks"
            remote
            show-sync
            :item.sync="item.network"
            :isDefaultSelect="i === 0"
            :need-params="true"
            :params="{ ...networkParamsC, $t: item.key }"
            :mapper="networkResourceMapper"
            :remote-fn="q => ({ search: q })"
            :beforeDefaultSelectCallBack="beforeDefaultSelectCallBack"
            @change="v => networkChange(v, item)"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_195') }"
            :min-width="isDialog ? '200px' : '500px'" />
            <div slot="extra" v-if="i === 0">{{$t('compute.text_196')}}<help-link href="/network2">{{$t('compute.perform_create')}}</help-link>
            </div>
        </a-form-item>
      </div>
      <div :class="{ 'd-flex ml-1' : isBigScreen }">
        <template v-if="item.ipShow">
          <a-form-item class="mb-0"  :wrapperCol="{ span: 24 }">
            <ip-select v-decorator="decorator.ips(item.key, item.network)" :value="item.ip" :network="item.network" @change="e => ipChange(e, i)" />
          </a-form-item>
          <a-button type="link" class="mt-1" @click="triggerShowIp(item)">{{$t('compute.text_135')}}</a-button>
        </template>
        <a-tooltip v-else :title="ipBtnTooltip">
          <a-button type="link" class="mr-1 mt-1" :disabled="ipsDisabled" @click="triggerShowIp(item)">{{$t('compute.text_198')}}</a-button>
        </a-tooltip>
        <template v-if="showMacConfig">
          <template v-if="item.macShow">
            <a-form-item class="mb-0"  :wrapperCol="{ span: 24 }">
              <a-input
                style="width: 164px"
                :placeholder="$t('compute.text_806')"
                @change="e => macChange(e, i)"
                v-decorator="decorator.macs(item.key, item.network)" />
            </a-form-item>
            <a-button type="link" class="mt-1" @click="triggerShowMac(item)">{{$t('compute.text_135')}}</a-button>
          </template>
          <a-tooltip v-else :title="ipBtnTooltip">
            <a-button type="link" class="mr-1 mt-1" :disabled="ipsDisabled" @click="triggerShowMac(item)">{{$t('compute.mac_config')}}</a-button>
          </a-tooltip>
        </template>
        <template v-if="showDeviceConfig">
          <template v-if="item.deviceShow">
            <a-form-item class="mb-0"  :wrapperCol="{ span: 24 }">
              <oc-select
                style="width: 164px"
                v-decorator="decorator.devices(item.key)"
                :data="gpuOptions"
                :placeholder="$t('compute.sriov_device_tips')" />
            </a-form-item>
            <a-button type="link" class="mt-1" @click="triggerShowDevice(item)">{{$t('compute.text_135')}}</a-button>
          </template>
          <a-button v-else type="link" class="mr-1 mt-1" @click="triggerShowDevice(item)">{{ $t('compute.config_transparent_net') }}</a-button>
        </template>
        <template v-if="isSupportIPv6(item)">
          <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
            <a-checkbox v-decorator="decorator.ipv6s(item.key, item.network)">{{ $t('compute.server_create.require_ipv6') }}</a-checkbox>
          </a-form-item>
        </template>
        <a-button shape="circle" icon="minus" size="small" v-if="i !== 0" @click="decrease(item.key, i)" class="mt-2" />
      </div>
    </div>
    <div class="d-flex align-items-center" v-if="networkCountRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('compute.text_199')}}</a-button>
      <span class="network-count-tips">{{$t('compute.text_130')}}<span class="remain-num">{{ networkCountRemaining }}</span>{{$t('compute.text_200')}}</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import IpSelect from './IpSelect.vue'

export default {
  name: 'NetworkConfig',
  components: {
    IpSelect,
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
      validator: val => R.is(Function, val.vpcs) && R.is(Function, val.networks) && R.is(Function, val.ips) && R.is(Function, val.macs),
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
        vpc: this.networkList[0].vpc?.id,
        ...this.networkParams,
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
      return this.screenWidth > 1440
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
    add () {
      const uid = uuid()
      const data = {
        network: {},
        vpc: {},
        ipShow: false,
        macShow: false,
        deviceShow: false,
        key: uid,
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
    triggerShowMac (item, i) {
      console.log(item)
      item.macShow = !item.macShow
    },
    triggerShowDevice (item, i) {
      item.deviceShow = !item.deviceShow
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
      this.$set(this.networkList[0], 'macShow', false)
      this.$set(this.networkList[0], 'deviceShow', false)
      this.ipsDisabled = ipsDisabled
    },
    networkChange (val, item) {
      this.$nextTick(() => {
        const fieldKey = `networkExits[${item.key}]`
        this.form.fc.getFieldDecorator(fieldKey, {
          preserve: true,
        })
        this.form.fc.setFieldsValue({
          [fieldKey]: item.network.exit,
        })
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
      const cur = data[0]
      if (cur) {
        return cur.ports > cur.ports_used
      }
      return false
    },
    fetchVpcSuccessHandle (data, item) {
      item.vpc = data[0]
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ [`vpcs[${item.key}]`]: data?.[0]?.key, vpcs: { [item.key]: data?.[0]?.key } })
      })
      this.vpcSelectChange([data[0]], 0, item)
      // this.fetchNetworkOpts(this.networkParamsC, item)
    },
    fetchNetworkSuccessHandle (data, item) {
      item.network = data[0]
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ [`networks[${item.key}]`]: data?.[0]?.key })
      })
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
    isSupportIPv6 (item) {
      return !!item.network.guest_ip6_start && !!item.network.guest_ip6_end
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../src/styles/less/theme';

.network-config {
  .network-count-tips {
    .remain-num {
      color: @primary-color;
    }
  }
}
</style>
