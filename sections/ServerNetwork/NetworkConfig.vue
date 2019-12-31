<template>
  <div class="network-config">
    <div class="d-flex align-items-start mb-2" v-for="(item, i) in networkList" :key="item.key">
      <a-tag color="blue" class="mr-1 mt-2">{{ isBonding ? 'bond' : 'eth'}}{{i}}</a-tag>
      <a-form-item
        class="w-50 mb-0 mr-1">
        <base-select
          class="w-100"
          v-decorator="decorator.networks(item.key)"
          resource="networks"
          :item.sync="item.network"
          :need-params="true"
          :params="networkParams"
          :mapper="networkResourceMapper"
          :select-props="{ allowClear: true, placeholder: '请选择IP子网' }" />
      </a-form-item>
      <a-form-item class="w-25 mb-0 mr-2" v-if="item.ipShow">
        <a-input
          placeholder="请输入子网内的IP地址"
          @change="e => ipChange(e, i)"
          v-decorator="decorator.ips(item.key, item.network)" />
      </a-form-item>
      <a-button v-else type="link" class="mr-1 mt-1" @click="showIp(item)">手动配置IP</a-button>
      <a-button shape="circle" icon="minus" size="small" @click="decrease(item.key, i)" class="mt-2" />
    </div>
    <div class="d-flex align-items-center" v-if="networkCountRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">添加IP子网</a-button>
      <span class="network-count-tips">您还可以添加 <span class="remain-num">{{ networkCountRemaining }}</span> 个</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'

export default {
  name: 'NetworkConfig',
  props: {
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
      validator: val => R.is(Function, val.networks) && R.is(Function, val.ips),
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
    networkResourceMapper: {
      type: Function,
      default: (data) => { return data },
    },
  },
  data () {
    return {
      networkList: [],
    }
  },
  computed: {
    networkCountRemaining () {
      return this.limit - this.networkList.length
    },
  },
  created () {
    this.add()
  },
  methods: {
    ipChange (e, i) {
      this.networkList[i].ip = e.target.value
    },
    add () {
      const uid = uuid()
      this.networkList.push({
        network: {},
        ipShow: false,
        key: uid,
      })
    },
    showIp (item, i) {
      item.ipShow = true
    },
    decrease (uid, index) {
      this.networkList.splice(index, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../../src/styles/variables';

.network-config {
  .network-count-tips {
    .remain-num {
      color: $primary-color;
    }
  }
}
</style>
