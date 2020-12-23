<template>
  <div class="cloudprovider-region-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12">
        <a-form-item>
          <a-select label-in-value v-decorator="decorator.cloudprovider" @change="handleChange" :placeholder="$t('common.text00044')">
            <a-select-option v-for="item in providerOpts" :key="item.id">{{ _$t(item) }}/{{item.cloudaccount}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.region" allow-clear @change="emit" :placeholder="$t('dictionary.region')">
            <a-select-option v-for="item in regionOpts" :key="item.id">{{ _$t(item) }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'ProviderRegionSelect',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudprovider) && R.is(Array, obj.region),
    },
    platform: {
      type: String,
      validator: val => ['public_cloud', 'private_cloud', 'is_on_premise'].includes(val),
    },
    providerProp: {
      type: String,
    },
    cloudproviderParams: {
      type: Object,
      default: () => ({}),
    },
    regionParamsExtra: {
      type: Object,
      default: () => ({}),
    },
    capability: {
      type: String,
      default: 'network',
    },
  },
  inject: ['form'],
  data () {
    return {
      providerOpts: [],
      regionOpts: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  watch: {
    cloudproviderParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchProviders()
        }
      },
    },
  },
  created () {
    this.regionsM = new Manager('cloudregions', 'v2')
    this.cloudprovidersM = new Manager('cloudproviders', 'v2')
    this.fetchProviders()
  },
  methods: {
    emit (item, emitStr) {
      const opts = this.providerOpts.concat(this.regionOpts)
      let itemObj = {}
      if (R.is(String, item)) {
        itemObj = opts.find(val => val.id === item)
      } else if (R.is(Object, item)) {
        itemObj = opts.find(val => val.id === item.id)
      }
      this.$emit(`update:${emitStr}`, itemObj)
    },
    fetchProviders () {
      let params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
      }
      if (this.platform) params[this.platform] = true
      if (this.providerProp) params.provider = this.providerProp
      if (this.isAdminMode) params.admin = true
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
        delete params.domain_id
      }
      if (this.form) {
        this.form.fc.setFieldsValue({
          cloudprovider: { key: '', label: '' },
          region: { key: '', label: '' },
        })
      }
      if (!R.isNil(this.cloudproviderParams) && !R.isEmpty(this.cloudproviderParams)) params = this.cloudproviderParams
      this.cloudprovidersM.list({ params: params })
        .then(({ data: { data = [] } }) => {
          this.providerOpts = data.filter(item => item.enabled && item.status === 'connected' && item.provider.toLowerCase() !== 'zstack')
          this.$emit('update:closeproviderOpts', this.providerOpts)
          if (this.providerOpts.length && this.form) {
            const firstProvider = this.providerOpts[0]
            this.emit(firstProvider, 'cloudprovider')
            this.fetchRegions(firstProvider.id)
            this.form.fc.setFieldsValue({
              cloudprovider: { key: firstProvider.id, label: firstProvider.name },
            })
          } else {
            this.form.fc.resetFields(['cloudprovider', 'region'])
          }
        })
    },
    fetchRegions (cloudproviderId) {
      const params = Object.assign({}, this.regionParamsExtra, { manager: cloudproviderId, limit: 0, scope: this.scope, capability: this.capability })
      // 清空可用区
      this.regionOpts = []
      this.emit({}, 'region')
      if (this.cloudproviderParams.project_domain) {
        params.project_domain = this.cloudproviderParams.project_domain
        delete params.scope
      }
      if (this.form) {
        this.form.fc.setFieldsValue({
          region: { key: '', label: '' },
        })
      }
      this.regionsM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.regionOpts = data
          if (this.regionOpts.length && this.form) {
            const firstRegion = this.regionOpts[0]
            this.emit(firstRegion, 'region')
            this.form.fc.setFieldsValue({
              region: { key: firstRegion.id, label: firstRegion.name },
            })
          } else {
            this.form.fc.resetFields(['region'])
          }
        })
    },
    handleChange (value) {
      let cloudproviderId
      if (R.is(String, value)) {
        cloudproviderId = value
      } else if (R.is(Object, value)) {
        cloudproviderId = value.key
      }
      const selectedProviderOption = this.providerOpts.filter(item => item.id === cloudproviderId)[0]
      this.emit(selectedProviderOption, 'cloudProvider')
      this.fetchRegions(cloudproviderId)
    },
  },
}
</script>
