<template>
  <div>
    <a-form-item :label="$t('dashboard.text_98')">
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item :wrapperCol="{ span: 24 }" class="mb-0">
            <a-select
              allowClear
              class="w-100"
              :labelInValue="labelInValue"
              v-decorator="decorators.cloud_env"
              :placeholder="$t('dashboard.text_99')"
              @change="cloudEnvChange"
              :filterOption="filterOption">
              <a-select-option v-for="item of cloudEnvs" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :wrapperCol="{ span: 24 }" class="mb-0">
            <a-select
              allowClear
              class="w-100"
              :labelInValue="labelInValue"
              v-decorator="decorators.brand"
              :placeholder="$t('dashboard.text_99')"
              @change="brandChange"
              :filterOption="filterOption">
              <a-select-option v-for="item of brands" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item :label="$t('dashboard.text_100')" class="mb-0">
      <a-radio-group v-decorator="decorators.regionAccountType" @change="regionAccountTypeChange">
        <a-radio-button value="region">{{$t('dashboard.text_101')}}</a-radio-button>
        <a-radio-button value="account">{{$t('dashboard.text_102')}}</a-radio-button>
      </a-radio-group>
      <a-form-item :wrapperCol="{ span: 24 }" v-if="regionAccountType === 'region'">
        <a-select
          allowClear
          class="w-100"
          :labelInValue="labelInValue"
          v-decorator="decorators.region"
          :placeholder="$t('dashboard.text_99')"
          @change="regionChange"
          :filterOption="filterOption">
          <a-select-option v-for="item of regions" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :wrapperCol="{ span: 24 }" v-if="regionAccountType === 'account'">
        <a-select
          allowClear
          class="w-100"
          :labelInValue="labelInValue"
          v-decorator="decorators.account"
          :placeholder="$t('dashboard.text_99')"
          @change="accountChange"
          :filterOption="filterOption">
          <a-select-option v-for="item of accounts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form-item>
    <a-form-item :label="$t('dashboard.text_96')" class="mb-0" v-if="decorators.all_usage_key">
      <a-form-item :wrapperCol="{ span: 24 }">
        <usage-select
          class="w-100"
          v-decorator="decorators.all_usage_key"
          :usages="totalUsageOptions"
          @change="allUsageChange" />
        <div slot="extra">
          <i18n path="metricConfig.create_form.all_usage_extra">
            <template #link>
              <help-link :href="metricDoc">{{$t('metricConfig.create_form.all_usage_link')}}</help-link>
            </template>
          </i18n>
        </div>
      </a-form-item>
    </a-form-item>
    <a-form-item :label="usageLabel || $t('dashboard.text_97')" class="mb-0" v-if="decorators.usage_key">
      <a-form-item :wrapperCol="{ span: 24 }">
        <usage-select
          class="w-100"
          v-decorator="decorators.usage_key"
          :usages="partUsageOptions"
          @change="usageChange" />
        <div slot="extra">
          <i18n :path="usageLabel?'metricConfig.create_form.metric_extra':'metricConfig.create_form.usage_extra'">
            <template #link>
              <help-link :href="metricDoc">{{$t('metricConfig.create_form.usage_link')}}</help-link>
            </template>
          </i18n>
        </div>
      </a-form-item>
    </a-form-item>
    <a-form-item :label="$t('dashboard.usage_metric_name')" class="mb-0" v-if="decorators.usage_label">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input class="w-100" v-decorator="decorators.usage_label" />
      </a-form-item>
    </a-form-item>
    <a-form-item :label="$t('dashboard.remaining_usage_metric_name')" class="mb-0" v-if="decorators.un_usage_label">
      <a-form-item :wrapperCol="{ span: 24 }">
        <a-input class="w-100" v-decorator="decorators.un_usage_label" />
      </a-form-item>
    </a-form-item>
    <a-form-item :label="colorLabel || $t('dashboard.color.scheme')" class="mb-0" v-if="isRing">
      <a-select
        @change="colorChange"
        v-decorator="decorators.color">
        <a-select-option v-for="item in colors" :key="item.key" :value="item.key">
          <div>
            <a-progress :show-info="false" :stroke-color="{ '60%': item.percent60, '80%': item.percent80, '100%': item.percent100}" :percent="100" />
          </div>
          <div class="text-color-help">{{ item.label }}</div>
        </a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import UsageSelect from './UsageSelect'
import { USAGE_CONFIG, getMetricDocs } from '@Dashboard/constants'
import { typeClouds } from '@/utils/common/hypervisor'
import { usageMap } from '@/constants/generalUsage'

export default {
  name: 'QuotaConfig',
  components: {
    UsageSelect,
  },
  props: {
    labelInValue: {
      type: Boolean,
    },
    decorators: {
      type: Object,
    },
    fc: {
      type: Object,
      required: true,
    },
    fd: {
      type: Object,
      required: false,
    },
    usageLabel: {
      type: String,
    },
    colorLabel: {
      type: String,
    },
  },
  data () {
    return {
      regionAccountType: _.get(this.decorators, 'regionAccountType[1].initialValue') || 'region',
      cloudEnvs: [],
      cloudEnvData: {},
      brands: [],
      brandData: {},
      accounts: [],
      accountLoading: false,
      regions: [],
      regionLoading: false,
      translateUsage: this.$t('usage'),
      totalUsageOptions: [],
      partUsageOptions: [],
      colors: [
        {
          key: 'default',
          percent60: '#52c41a',
          percent80: '#faad14',
          percent100: '#f5222d',
          label: this.$t('dashboard.color.scheme.default'),
        },
        {
          key: 'reverse',
          percent60: '#f5222d',
          percent80: '#faad14',
          percent100: '#52c41a',
          label: this.$t('dashboard.color.scheme.reverse'),
        },
      ],
      metricDoc: getMetricDocs(this.$store.getters.scope),
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability']),
    cloudEnv () {
      return R.is(Object, this.cloudEnvData) ? this.cloudEnvData.key : this.cloudEnvData
    },
    brand () {
      return R.is(Object, this.brandData) ? this.brandData.key : this.brandData
    },
    isRing () {
      if (this.usageLabel) {
        return false
      } else {
        return true
      }
    },
  },
  destroyed () {
    this.am = null
    this.rm = null
  },
  mounted () {
    this.fc.setFieldsValue({
      regionAccountType: this.regionAccountType,
    })
    this.am = new this.$Manager('cloudaccounts')
    this.rm = new this.$Manager('cloudregions')
    this.fetchCloudEnvs()
    this.$watch('regionAccountType', {
      handler (val) {
        this.fc.setFieldsValue({
          region: undefined,
          account: undefined,
        })
        if (val === 'region') {
          this.fetchRegions()
        }
        if (val === 'account') {
          this.fetchAccounts()
        }
      },
      immediate: true,
    })
    this.totalUsageOptions = this.totalUsages()
    let key = ''
    if (this.fd && this.fd.all_usage_key) {
      key = this.fd.all_usage_key
    }
    this.partUsageOptions = this.partUsages(key)
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    /*
     * @params {Object} cloudEnv { key: <cloudEnvId> }
     */
    _setInitCloudEnv (cloudEnv) {
      if (!R.isNil(cloudEnv) && !R.isEmpty(cloudEnv)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            cloud_env: { key: cloudEnv.key, label: cloudEnv.label },
          })
        } else {
          this.fc.setFieldsValue({
            cloud_env: cloudEnv.key,
          })
        }
      }
    },
    /*
     * @params {Object} brand { key: <brandId> }
     */
    _setInitBrand (brand) {
      if (!R.isNil(brand) && !R.isEmpty(brand)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            brand: { key: brand.key, label: brand.label },
          })
        } else {
          this.fc.setFieldsValue({
            brand: brand.key,
          })
        }
      }
    },
    /*
     * @params {Object} region { key: <regionId> }
     */
    _setInitRegion (region) {
      if (!R.isNil(region) && !R.isEmpty(region)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            region: { key: region.key, label: region.label },
          })
        } else {
          this.fc.setFieldsValue({
            region: region.key,
          })
        }
      }
    },
    /*
     * @params {Object} account { key: <accountId> }
     */
    _setInitAccount (account) {
      if (!R.isNil(account) && !R.isEmpty(account)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            account: { key: account.key, label: account.label },
          })
        } else {
          this.fc.setFieldsValue({
            account: account.key,
          })
        }
      }
    },
    fetchCloudEnvs () {
      const cloudEnvs = []
      let brands = this.capability.brands
      brands = R.concat(brands, this.capability.disabled_brands)
      brands = R.uniq(brands)
      console.log('brands', brands)
      for (let i = 0, len = brands.length; i < len; i++) {
        console.log('brand', brands[i])
        const data = R.find(R.propEq('key', typeClouds.brandMap[brands[i]].cloud_env))(cloudEnvs)
        console.log('data', data)
        if (!data) {
          cloudEnvs.push({ key: typeClouds.brandMap[brands[i]].cloud_env, label: this.$t(`cloud_env.${typeClouds.brandMap[brands[i]].cloud_env}`) })
        }
      }
      this.cloudEnvs = cloudEnvs.map(val => ({ ...val, key: val.key, label: val.label }))
      let defaultData
      const initialValue = _.get(this.decorators, 'cloud_env[1].initialValue')
      if (initialValue) {
        const findInitValue = this.cloudEnvs.find(val => val.key === (initialValue.key || initialValue))
        if (findInitValue) {
          defaultData = { key: findInitValue.key, label: findInitValue.label }
        }
      }
      this._setInitCloudEnv(defaultData)
      this.cloudEnvChange(defaultData || {})
    },
    fetchBrands () {
      let brands = []
      R.forEachObjIndexed((value, key) => {
        if (value.cloud_env === this.cloudEnv) {
          brands.push(value)
        }
      }, typeClouds.brandMap)
      brands = brands.filter(item => this.capability.brands.includes(item.brand) || this.capability.disabled_brands.includes(item.brand))
      this.brands = brands.map(val => ({ ...val, key: val.key, label: val.label }))
      let defaultData
      const initialValue = _.get(this.decorators, 'brand[1].initialValue')
      if (initialValue) {
        const findInitValue = this.brands.find(val => val.key === (initialValue.key || initialValue))
        if (findInitValue) {
          defaultData = { key: findInitValue.key, label: findInitValue.label }
        }
      }
      this._setInitBrand(defaultData)
      this.brandChange(defaultData || {})
    },
    async fetchRegions () {
      this.regionLoading = true
      try {
        const params = {
          scope: this.scope,
        }
        if (this.cloudEnv) params.cloud_env = this.cloudEnv
        if (this.brand) params.brand = this.brand
        const response = await this.rm.list({ params })
        const data = response.data.data
        this.regions = data.map(val => ({ ...val, key: val.id, label: val._i18n && val._i18n.name ? val._i18n.name : val.name })) || []
        let defaultData
        const initialValue = _.get(this.decorators, 'region[1].initialValue')
        if (initialValue) {
          const findInitValue = this.regions.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this.regionChange(defaultData || {})
        this._setInitRegion(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.regionLoading = false
      }
    },
    async fetchAccounts () {
      this.accountLoading = true
      try {
        const params = {
          scope: this.scope,
        }
        if (this.cloudEnv) params.cloud_env = this.cloudEnv
        if (this.brand) params.brand = this.brand
        const response = await this.am.list({ params })
        const data = response.data.data
        this.accounts = data.map(val => ({ ...val, key: val.id, label: val.name })) || []
        let defaultData
        const initialValue = _.get(this.decorators, 'account[1].initialValue')
        if (initialValue) {
          const findInitValue = this.accounts.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this.accountChange(defaultData || {})
        this._setInitAccount(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.accountLoading = false
      }
    },
    cloudEnvChange (cloudEnv) {
      const cloudEnvId = R.is(Object, cloudEnv) ? cloudEnv.key : cloudEnv
      this.cloudEnvData = cloudEnv
      if (cloudEnvId) {
        this.fc.setFieldsValue({
          brand: undefined,
          region: undefined,
          account: undefined,
        })
        this.fetchBrands()
        if (this.regionAccountType === 'region') {
          this.fetchRegions()
        }
        if (this.regionAccountType === 'account') {
          this.fetchAccounts()
        }
        this.$emit('update:env', cloudEnvId)
      } else {
        this.fc.setFieldsValue({
          cloud_env: undefined,
          brand: undefined,
          region: undefined,
          account: undefined,
        })
      }
      this.updateUsages()
    },
    brandChange (brand) {
      const brandId = R.is(Object, brand) ? brand.key : brand
      this.brandData = brand
      if (brandId) {
        this.fc.setFieldsValue({
          region: undefined,
          account: undefined,
        })
        if (this.regionAccountType === 'region') {
          this.fetchRegions()
        }
        if (this.regionAccountType === 'account') {
          this.fetchAccounts()
        }
        this.$emit('update:brand', brandId)
        this.fc.getFieldDecorator('brand', { preserve: true, initialValue: brand })
      } else {
        this.fc.setFieldsValue({
          brand: undefined,
          region: undefined,
          account: undefined,
        })
      }
    },
    regionChange (region) {
      const regionId = R.is(Object, region) ? region.key : region
      this.$emit('update:region', regionId)
    },
    accountChange (account) {
      const accountId = R.is(Object, account) ? account.key : account
      this.$emit('update:account', accountId)
    },
    allUsageChange (allUsage) {
      this.partUsageOptions = this.partUsages(allUsage)
      this.fc.setFieldsValue({ usage_key: undefined })
      this.$emit('update:all_usage_key', allUsage)
    },
    usageChange (usage) {
      this.$emit('update:usage_key', usage)
    },
    colorChange (color) {
      this.$emit('update:color', color)
    },
    regionAccountTypeChange (e) {
      this.regionAccountType = e.target.value
    },
    totalKeys () {
      const keys = []
      for (const res in usageMap) {
        if (usageMap[res].field && usageMap[res].field.total && usageMap[res].field.total[this.scope]) {
          keys.push(usageMap[res].field.total[this.scope])
        }
      }
      return keys
    },
    partKeys (totalKey) {
      const keys = []
      for (const res in usageMap) {
        if (usageMap[res].field) {
          if (totalKey) {
            if (!usageMap[res].field.total) {
              continue
            }
            if (!usageMap[res].field.total[this.scope]) {
              continue
            }
            if (usageMap[res].field.total[this.scope] !== totalKey) {
              continue
            }
          }
          for (const part in usageMap[res].field) {
            if (part !== 'total') {
              if (usageMap[res].field[part][this.scope]) {
                keys.push(usageMap[res].field[part][this.scope])
              }
            }
          }
        }
      }
      return keys
    },
    updateUsages () {
      this.totalUsageOptions = this.totalUsages()
      let key = ''
      if (this.fd && this.fd.all_usage_key) {
        key = this.fd.all_usage_key
      }
      this.partUsageOptions = this.partUsages(key)
    },
    usages () {
      const ret = []
      for (const key in USAGE_CONFIG) {
        if (USAGE_CONFIG[key].scope && USAGE_CONFIG[key].scope !== this.$store.getters.scope) {
          continue
        }
        if (USAGE_CONFIG[key].clouds && USAGE_CONFIG[key].clouds.length > 0 && this.cloudEnv && !USAGE_CONFIG[key].clouds.includes(this.cloudEnv)) {
          continue
        }
        ret.push({
          key,
          scope: USAGE_CONFIG[key].scope,
          label: this.translateUsage[key] ? this.translateUsage[key] : key,
        })
      }
      return ret
    },
    totalUsages () {
      const usages = this.usages()
      if (!this.isRing) {
        return usages
      }
      const totalKeys = this.totalKeys()
      const ret = []
      for (var i = 0; i < usages.length; i++) {
        if (totalKeys.includes(usages[i].key)) {
          ret.push(usages[i])
        }
      }
      return ret
    },
    partUsages (val) {
      const usages = this.usages()
      if (!this.isRing) {
        return usages
      }
      const partKeys = this.partKeys(val)
      const ret = []
      for (var i = 0; i < usages.length; i++) {
        if (partKeys.includes(usages[i].key)) {
          ret.push(usages[i])
        }
      }
      return ret
    },
  },
}
</script>
