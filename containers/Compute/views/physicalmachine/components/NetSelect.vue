<template>
  <div class="d-flex align-items-center net-select">
    <base-select
      class="net-select__network"
      resource="networks"
      v-model="networkId"
      :item.sync="network"
      :params="networkParams"
      :select-props="{ placeholder: $t('compute.text_195') }"
      @change="handleNetworkChange" />
    <ip-select
      v-if="ipShow"
      class="ml-2 net-select__ip"
      :value="ip || undefined"
      :network="network"
      @change="onIpChange" />
    <a-button v-if="ipShow" type="link" @click="handleHiddenIp" class="pl-0 pr-0 ml-2">{{$t('common_115')}}</a-button>
    <a-button v-else type="link" @click="handleShowIp" class="pl-0 pr-0 ml-2">{{$t('compute.text_198')}}</a-button>
  </div>
</template>

<script>
import IpSelect from '@Compute/sections/ServerNetwork/IpSelect'

export default {
  name: 'NetSelect',
  components: {
    IpSelect,
  },
  props: {
    value: {
      type: Object,
    },
    projectDomain: String,
  },
  inject: ['form'],
  data () {
    return {
      ipShow: false,
      networkId: undefined,
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
      if (this.$store.getters.isDomainMode) ret.scope = this.$store.getters.scope
      return ret
    },
  },
  watch: {
    value: {
      handler (val) {
        if (!val || typeof val !== 'object') return
        if (val.access_net) {
          this.network = val.access_net
          this.networkId = val.access_net.id
        }
        if (val.access_ip) {
          this.ip = val.access_ip
          this.ipShow = true
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleShowIp () {
      this.ipShow = true
      this.emitValue()
    },
    handleHiddenIp () {
      this.ipShow = false
      this.ip = ''
      this.emitValue()
    },
    handleNetworkChange () {
      this.ip = ''
      this.emitValue()
    },
    onIpChange (val) {
      this.ip = val || ''
      this.emitValue()
    },
    emitValue () {
      this.$nextTick(() => {
        this.$emit('change', {
          access_net: this.network,
          access_ip: this.ipShow ? this.ip : '',
        })
      })
    },
  },
}
</script>

<style lang="less" scoped>
.net-select {
  width: 100%;
  &__network {
    flex: 1;
    min-width: 0;
  }
  &__ip {
    width: 200px;
    flex-shrink: 0;
    /deep/ .ant-select {
      width: 100%;
    }
  }
}
</style>
