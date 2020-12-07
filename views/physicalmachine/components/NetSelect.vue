<template>
  <div class="d-flex align-items-center">
    <base-select
      class="w-100"
      resource="networks"
      v-model="networkId"
      :item.sync="network"
      :params="networkParams"
      :select-props="{ placeholder: $t('compute.text_195') }"
      @change="handleChange" />
    <a-input
      class="ml-2"
      v-if="ipShow"
      :placeholder="$t('compute.text_197')"
      v-model="ip"
      @change="handleChange" />
    <a-button v-if="ipShow" type="link" @click="handleHiddenIp" class="pl-0 pr-0 ml-2">{{$t('common_115')}}</a-button>
    <a-button v-else type="link" @click="handleShowIp" class="pl-0 pr-0 ml-2">{{$t('compute.text_198')}}</a-button>
  </div>
</template>

<script>
export default {
  name: 'NetSelect',
  props: {
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
    projectDomain (val, oldVal) {
      this.form.fc.resetFields(['project_domain'])
    },
  },
  methods: {
    handleShowIp () {
      this.ipShow = true
    },
    handleHiddenIp () {
      this.ipShow = false
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
