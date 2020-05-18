<template>
  <div class="vm-sched-policy">
    <a-form-item>
      <a-radio-group v-decorator="decorators.schedPolicyType" @change="change">
        <a-radio-button v-for="(item, key) of schedPolicyOptionsMap" :value="key" :key="key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'host'" class="host-form-item">
      <template v-if="serverType === 'baremetal'">
        <base-select
          class="w-50"
          :options="hostData"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :label-format="labelFormat"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          @change="hostChange"
          :select-props="{ placeholder: schedPolicyOptionsMap.host.label }" />
      </template>
      <template v-else>
        <base-select
          class="w-50"
          resource="hosts"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :label-format="labelFormat"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          :select-props="{ placeholder: schedPolicyOptionsMap.host.label }" />
      </template>
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'schedtag'">
      <policy-schedtag
        :decorators="decorators.policySchedtag"
        :schedtag-params="policySchedtagParams" />
    </a-form-item>
  </div>
</template>

<script>
import lodash from 'lodash'
import { SERVER_TYPE, SCHED_POLICY_OPTIONS_MAP } from '@Compute/constants'
import PolicySchedtag from './PolicySchedtag'

export default {
  name: 'SchedPolicy',
  components: {
    PolicySchedtag,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.schedPolicyType && val.schedPolicyHost && val.policySchedtag,
    },
    serverType: {
      type: String,
      required: true,
      validator: val => SERVER_TYPE[val],
    },
    policySchedtagParams: {
      type: Object,
      default: () => ({}),
    },
    policyHostParams: {
      type: Object,
      default: () => ({}),
    },
    disabledHost: {
      type: Array,
      default: () => [],
    },
    hostData: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      schedPolicyComponent: '',
    }
  },
  computed: {
    schedPolicyOptionsMap () {
      const { default: _default, host, ...rest } = SCHED_POLICY_OPTIONS_MAP
      let ret = {}
      ret.default = { ..._default }
      ret.host = {
        ...host,
        label: host['label'][this.serverType],
      }
      if (this.serverType !== SERVER_TYPE.public) {
        ret = {
          ...ret,
          ...rest,
        }
      }
      // 限制非管理后台模式下不能指定宿主机(私有云)、云账号(公有云)
      if (!this.$store.getters.isAdminMode && !this.$store.getters.isDomainMode) {
        delete ret['host']
      }
      return ret
    },
  },
  methods: {
    change (e) {
      const schedPolicyType = lodash.isString(e) ? e : e.target.value
      switch (schedPolicyType) {
        case lodash.get(this.schedPolicyOptionsMap, 'default.key'):
          this.schedPolicyComponent = ''
          break
        case lodash.get(this.schedPolicyOptionsMap, 'host.key'):
          this.schedPolicyComponent = 'host'
          break
        case lodash.get(this.schedPolicyOptionsMap, 'schedtag.key'):
          this.schedPolicyComponent = 'schedtag'
          break
        case lodash.get(this.schedPolicyOptionsMap, 'cloudprovider.key'):
          this.schedPolicyComponent = 'cloudprovider'
          break
      }
    },
    labelFormat (item) {
      if (this.serverType === SERVER_TYPE.public) {
        return `${item.account} / ${item.manager} / ${item.zone}`
      }
      return item.name
    },
    hostChange (e) {
      this.$emit('change', e)
    },
  },
}
</script>

<style lang="scss" scoped>
.vm-sched-policy {
  .host-form-item ::v-deep .ant-form-item-control {
    width: 100%;
  }
}
</style>
