<template>
  <div class="network-config">
    <div class="d-flex align-items-start mb-2" v-for="(item, i) in networkList" :key="item.key">
      <a-tag color="blue" class="mr-1" style="margin-top: 10px;">{{ isBonding ? 'bond' : $t('compute.text_193')}}{{i + count}}</a-tag>
      <a-form-item
        :wrapperCol="{ span: 24 }"
        class="mb-0 mr-1">
        <base-select
          v-if="i === 0"
          class="w-100"
          style="width: 200px;"
          v-decorator="decorator.vpcs(item.key)"
          :resource="vpcResource"
          remote
          :label-format="vpcLabelFormat"
          :isDefaultSelect="i === 0"
          :item.sync="item.vpc"
          :need-params="true"
          :params="vpcParams"
          :mapper="vpcResourceMapper"
          :disabled="vpcObj && !!vpcObj.id"
          :select-props="{ allowClear: true, placeholder: $t('compute.text_194') }" />
        <a-tag v-else color="blue" class="w-100 mr-1">{{ getVpcTag(networkList[0].vpc) }}</a-tag>
      </a-form-item>
      <a-form-item
        :wrapperCol="{ span: 24 }"
        style="flex: 1;"
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
          :select-props="{ allowClear: true, placeholder: $t('compute.text_195') }" />
          <div slot="extra" v-if="i === 0">{{$t('compute.text_196')}}<help-link href="/network2">{{$t('compute.text_18')}}</help-link>
          </div>
      </a-form-item>
      <template v-if="item.ipShow">
        <a-form-item class="mb-0"  :wrapperCol="{ span: 24 }">
          <a-input
            style="width: 200px"
            :placeholder="$t('compute.text_197')"
            @change="e => ipChange(e, i)"
            v-decorator="decorator.ips(item.key, item.network)" />
        </a-form-item>
        <a-button type="link" class="mt-1" @click="triggerShowIp(item)">{{$t('compute.text_135')}}</a-button>
      </template>
      <a-tooltip v-else :title="ipBtnTooltip">
        <a-button type="link" class="mr-1 mt-1" :disabled="ipsDisabled" @click="triggerShowIp(item)">{{$t('compute.text_198')}}</a-button>
      </a-tooltip>
      <a-button shape="circle" icon="minus" size="small" v-if="i !== 0" @click="decrease(item.key, i)" class="mt-2" />
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

export default {
  name: 'NetworkConfig',
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
      validator: val => R.is(Function, val.vpcs) && R.is(Function, val.networks) && R.is(Function, val.ips),
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
  },
  data () {
    return {
      networkList: [],
      ipsDisabled: false,
    }
  },
  computed: {
    networkCountRemaining () {
      return this.limit - this.networkList.length
    },
    networkParamsC () {
      if (!this.networkList[0].vpc.id) return {}
      return {
        vpc: this.networkList[0].vpc.id,
        ...this.networkParams,
      }
    },
    ipBtnTooltip () {
      return this.ipsDisabled ? this.$t('common_718') : null
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
  methods: {
    getVpcTag (data) {
      if (!data.cidr_block) return data.name
      return `${data.name}（${data.cidr_block}）`
    },
    vpcLabelFormat (item) {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.cidr_block}）`
    },
    ipChange (e, i) {
      this.networkList[i].ip = e.target.value
    },
    add () {
      const uid = uuid()
      const data = {
        network: {},
        vpc: {},
        ipShow: false,
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
    decrease (uid, index) {
      this.networkList.splice(index, 1)
    },
    reset (ipsDisabled) { // 重置成不可手动输入IP，并且仅保留1条数据
      if (this.networkList.length > 1) {
        const firstItem = this.networkList[0]
        this.networkList = [firstItem]
      }
      this.$set(this.networkList[0], 'ipShow', false)
      this.ipsDisabled = ipsDisabled
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
