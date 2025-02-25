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
        <a-radio-button v-if="showTag" value="schedtag">{{ $t('dictionary.schedtag') }}</a-radio-button>
      </a-radio-group>
      <a-form-item :wrapperCol="{ span: 24 }" v-if="regionAccountType === 'region'">
        <a-select
          allowClear
          class="w-100"
          :labelInValue="labelInValue"
          v-decorator="decorators.region"
          :placeholder="$t('dashboard.text_99')"
          @change="regionChange"
          :filterOption="filterOption"
          :loading="regionLoading">
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
          :filterOption="filterOption"
          :loading="accountLoading">
          <a-select-option v-for="item of accounts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :wrapperCol="{ span: 24 }" v-if="showTag && regionAccountType === 'schedtag'">
        <a-select
          allowClear
          class="w-100"
          :labelInValue="labelInValue"
          v-decorator="decorators.schedtag"
          :placeholder="$t('dashboard.text_99')"
          @change="schedtagChange"
          :filterOption="filterOption"
          :loading="schedtagLoading">
          <a-select-option v-for="item of schedtags" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form-item>
    <!--a-form-item :label="$t('dashboard.host_type')" v-if="showHostType && isOneCloud">
      <a-radio-group v-decorator="decorators.host_type">
        <a-radio-button value="all">{{ $t('dashboard.text_99') }}</a-radio-button>
        <a-radio-button value="hypervisor">{{ $t('dashboard.hypervisor') }}</a-radio-button>
        <a-radio-button value="baremetal">{{ $t('dashboard.baremetal') }}</a-radio-button>
      </a-radio-group>
    </a-form-item-->
    <a-form-model-item :label="$t('iam.project_tag')" prop="__meta__" v-if="showTag">
      <pairs-tag v-decorator="decorators.tags" />
    </a-form-model-item>
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
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { USAGE_CONFIG, getMetricDocs } from '@Dashboard/constants'
import { typeClouds } from '@/utils/common/hypervisor'
import { usageMap } from '@/constants/generalUsage'
import PairsTag from '@/sections/PairsTag'
import UsageSelect from './UsageSelect'

export default {
  name: 'QuotaConfig',
  components: {
    UsageSelect,
    PairsTag,
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
    showTag: {
      type: Boolean,
      default: false,
    },
    /* showHostType: {
      type: Boolean,
      default: false,
    }, */
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
      metricDoc: getMetricDocs(this.$store.getters.scope),
      schedtags: [],
      schedtagLoading: false,
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
    isOneCloud () {
      return this.brand === typeClouds.brandMap.OneCloud.key
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
    this.sm = new this.$Manager('schedtags')
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
        if (val === 'schedtag') {
          this.fetchSchedtags()
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
      for (let i = 0, len = brands.length; i < len; i++) {
        const data = R.find(R.propEq('key', typeClouds.brandMap[brands[i]].cloud_env))(cloudEnvs)
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
        if (this.regionAccountType === 'schedtag') {
          this.fetchSchedtags()
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
          if (R.is(Array, usageMap[res].field.total[this.scope])) {
            usageMap[res].field.total[this.scope].map(key => {
              keys.push(key)
            })
          } else {
            keys.push(usageMap[res].field.total[this.scope])
          }
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
            if (R.is(String, usageMap[res].field.total[this.scope]) && usageMap[res].field.total[this.scope] !== totalKey) {
              continue
            }
            if (R.is(Array, usageMap[res].field.total[this.scope]) && !usageMap[res].field.total[this.scope].includes(totalKey)) {
              continue
            }
          }
          for (const part in usageMap[res].field) {
            if (part !== 'total') {
              if (usageMap[res].field[part][this.scope]) {
                if (R.is(Array, usageMap[res].field[part][this.scope])) {
                  usageMap[res].field[part][this.scope].map(key => {
                    keys.push(key)
                  })
                } else {
                  keys.push(usageMap[res].field[part][this.scope])
                }
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
        const k = USAGE_CONFIG[key].origin_key || key
        ret.push({
          key: k,
          scope: USAGE_CONFIG[key].scope,
          label: this.translateUsage[k] ? this.translateUsage[k] : k,
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
    async fetchSchedtags () {
      this.schedtagLoading = true
      try {
        const params = {
          scope: this.scope,
        }
        if (this.cloudEnv) params.cloud_env = this.cloudEnv
        if (this.brand) params.brand = this.brand
        const response = await this.sm.list({ params })
        const data = response.data.data
        this.schedtags = data.map(val => ({ ...val, key: val.id, label: val.name })) || []
        let defaultData
        const initialValue = _.get(this.decorators, 'account[1].initialValue')
        if (initialValue) {
          const findInitValue = this.schedtags.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this.schedtagChange(defaultData || {})
        this._setInitSchedtag()
      } catch (error) {
        throw error
      } finally {
        this.schedtagLoading = false
      }
    },
    schedtagChange (schedtag) {
      const schedtagId = R.is(Object, schedtag) ? schedtag.key : schedtag
      this.$emit('update:schedtag', schedtagId)
    },
    _setInitSchedtag (schedtag) {
      if (!R.isNil(schedtag) && !R.isEmpty(schedtag)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            schedtag: { key: schedtag.key, label: schedtag.label },
          })
        } else {
          this.fc.setFieldsValue({
            schedtag: schedtag.key,
          })
        }
      }
    },
  },
}
</script>
