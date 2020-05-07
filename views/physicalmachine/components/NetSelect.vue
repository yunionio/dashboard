<template>
  <div class="d-flex align-items-center">
    <base-select
      class="w-100"
      resource="networks"
      v-model="networkId"
      :item.sync="network"
      :params="networkParams"
      :select-props="{ placeholder: '请选择IP子网' }"
      @change="handleChange" />
    <a-input
      class="ml-2"
      v-if="ipShow"
      placeholder="请输入子网内的IP地址"
      v-model="ip"
      @change="handleChange" />
    <a-button v-else type="link" @click="handleShowIp" class="pl-0 pr-0 ml-2">手动配置IP</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'NetSelect',
  props: {
    projectDomain: String,
  },
  inject: ['form'],
  data () {
    return {
      ipShow: false,
      networkId: '',
      network: {},
      ip: '',
    }
  },
  computed: {
    networkParams () {
      const ret = {
        is_on_premise: true,
        usable: true,
        vpc: 'default',
      }
      if (this.projectDomain) ret.project_domain = this.projectDomain
      return ret
    },
  },
  watch: {
    projectDomain (val, oldVal) {
      this.networkId = ''
      this.network = {}
      this.ip = ''
    },
  },
  methods: {
    handleShowIp () {
      this.ipShow = true
    },
    handleChange () {
      let value = null
      if (
        (!R.isEmpty(this.networkId) && !R.isNil(this.networkId)) ||
        (!R.isEmpty(this.network) && !R.isNil(this.network)) ||
        (!R.isEmpty(this.ip) && !R.isNil(this.ip))
      ) {
        value = {
          access_net: this.network,
          access_ip: this.ip,
        }
      }
      this.$nextTick(() => {
        this.$emit('change', value)
      })
    },
  },
}
</script>
