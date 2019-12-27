<template>
  <div class="d-flex">
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
export default {
  name: 'NetSelect',
  inject: ['form'],
  data () {
    return {
      ipShow: false,
      networkId: '',
      network: {},
      ip: '',
      networkParams: {
        is_on_premise: true,
        usable: true,
      },
    }
  },
  methods: {
    handleShowIp () {
      this.ipShow = true
    },
    handleChange () {
      this.$nextTick(() => {
        this.$emit('change', {
          access_net: this.network,
          access_ip: this.ip,
        })
      })
    },
  },
}
</script>
