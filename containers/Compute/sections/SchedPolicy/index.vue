<template>
  <div class="vm-sched-policy">
    <a-form-item>
      <a-radio-group v-decorator="decorators.schedPolicyType" @change="change">
        <a-radio-button v-for="(item, key) of schedPolicyOptionsMap" :value="key" :key="key">{{ item.t ? $t(item.t) : item.label }}</a-radio-button>
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
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || ''  }" />
      </template>
      <template v-else>
        <!-- <base-select
          class="w-50"
          resource="cloudproviders"
          v-if="showCloudproviderSelect"
          v-decorator="decorators.schedPolicyHost"
          :params="policycloudproviderParams"
          :disabledItems="disabledCloudproviders"
          :label-format="cloudproviderLabel"
          :resList.sync="allCloudproviders"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || '' }" /> -->
        <base-select
          v-if="!showCloudproviderSelect"
          class="w-50"
          resource="hosts"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :label-format="labelFormat"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || '' }" />
      </template>
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'schedtag'">
      <policy-schedtag
        ref="policySchedtagRef"
        :form="form"
        :decorators="decorators.policySchedtag"
        :schedtag-params="policySchedtagParams" />
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'cloudprovider'">
      <base-select
        class="w-50"
        v-decorator="decorators.cloudprovider"
        resource="cloudproviders"
        :params="cloudproviderParams"
        :isDefaultSelect="true"
        :showSync="true"
        :select-props="{ placeholder: $t('compute.text_149') }" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import lodash from 'lodash'
import { SERVER_TYPE, SCHED_POLICY_OPTIONS_MAP } from '@Compute/constants'
import { arrayToObj, uuid } from '@/utils/utils'
import { HYPERVISORS_MAP } from '@/constants'
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
    form: {
      type: Object,
      validator: val => !val || val.fc, // 不传 或者 传就有fc
    },
    hideCloudaccountSched: { // 隐藏 指定云订阅(hosts接口)
      type: Boolean,
      default: false,
    },
    showSchedCloudprovider: { // 指定显示云账号(cloudprovider接口)
      type: Boolean,
      default: false,
    },
    cloudproviderParamsExtra: {
      type: Object,
      default: () => ({}),
    },
    provider: {
      type: String,
    },
    policycloudproviderParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      schedPolicyComponent: '',
      lodash,
      usableCloudproviderMaps: {},
      allCloudproviders: [],
    }
  },
  computed: {
    schedPolicyOptionsMap () {
      const { default: _default, host, ...rest } = SCHED_POLICY_OPTIONS_MAP
      let ret = {}
      ret.default = { ..._default }
      ret.host = {
        ...host,
        label: host.label[this.serverType],
      }
      if (this.serverType !== SERVER_TYPE.public) {
        ret = {
          ...ret,
          ...rest,
        }
      }
      // 限制非管理后台模式下不能指定宿主机(私有云)、云账号(公有云)
      if (!this.$store.getters.isAdminMode && !this.$store.getters.isDomainMode) {
        delete ret.host
      }
      if (this.hideCloudaccountSched) {
        delete ret.host
      }
      if (this.serverType === SERVER_TYPE.public) {
        delete ret.host
        delete ret.cloudprovider
      }
      return ret
    },
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: true,
        'filter.0': 'status.equals("connected")',
        'filter.1': 'health_status.equals("normal")',
        ...this.cloudproviderParamsExtra,
      }
      if (!params.scope && !params.project_domain) {
        params.scope = this.$store.getters.scope
      }
      return params
    },
    showCloudproviderSelect () { // 在公有云的情况下
      if (this.form && this.serverType === SERVER_TYPE.public) {
        const schedPolicyType = this.form.fc.getFieldsValue([this.decorators.schedPolicyType[0]])[this.decorators.schedPolicyType[0]]
        if (schedPolicyType === 'host') { // 公有云 此时 host 表示 指定云订阅
          return true
        }
      }
      return this.provider === HYPERVISORS_MAP.hcso.provider || this.provider === HYPERVISORS_MAP.hcs.provider
    },
    disabledCloudproviders () {
      return this.allCloudproviders.filter(val => !this.usableCloudproviderMaps[val.id]).map(val => val.id)
    },
  },
  watch: {
    schedPolicyOptionsMap (val) {
      this.$nextTick(() => {
        const keys = Object.keys(val)
        if (keys.length) {
          if (this.form && this.form.fc) {
            const schedPolicyType = this.schedPolicyOptionsMap[keys[0]].key
            this.form.fc.setFieldsValue({
              [this.decorators.schedPolicyType[0]]: schedPolicyType,
            })
            this.change(schedPolicyType)
          }
        }
      })
    },
    policycloudproviderParams (val, oldV) {
      if (!R.equals(val, oldV)) {
        this.fetchUsagebleCloudprovider()
      }
    },
  },
  created () {
    this.cloudproviderM = new this.$Manager('cloudproviders')
    this.fetchUsagebleCloudprovider()
  },
  methods: {
    cloudproviderLabel (item) {
      let label = item.name
      if (!this.usableCloudproviderMaps[item.id]) {
        if (item.status !== 'connected') {
          label += this.$t('compute.text_184')
        } else if (item.health_status !== 'normal') {
          label += this.$t('compute.text_185')
        } else if (item.enabled === false) {
          label += this.$t('compute.text_186')
        } else {
          label += this.$t('compute.text_187')
        }
      }
      return label
    },
    async fetchUsagebleCloudprovider () {
      try {
        const usageParmas = {
          enabled: true,
          'filter.0': 'status.equals("connected")',
          'filter.1': 'health_status.equals("normal")',
          usable: true,
          $t: uuid(),
        }
        const { data: { data = [] } } = await this.cloudproviderM.list({ params: { ...this.policycloudproviderParams, ...usageParmas } })
        this.usableCloudproviderMaps = arrayToObj(data)
      } catch (error) {
        throw error
      }
    },
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

<style lang="less" scoped>
.vm-sched-policy {
  .host-form-item ::v-deep .ant-form-item-control {
    width: 100%;
  }
}
</style>
