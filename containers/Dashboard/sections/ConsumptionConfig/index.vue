<template>
  <div>
    <!-- 币种 -->
    <a-form-model-item :label="$t('scope.text_453')" prop="currency">
      <a-select v-decorator="decorators.currency">
        <a-select-option v-for="obj in newCurrencys" :key="obj.item_id" :value="obj.item_id">
          {{ obj.item_name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <!-- 云环境和云平台 -->
    <a-form-item v-if="decorators.cloud_env" :label="$t('dashboard.text_98')">
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
    <!-- 云账号 -->
    <a-form-item v-if="decorators.account" :label="$t('scope.text_568')" class="mb-0">
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
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'
import { CURRENCYS } from '@/constants'
import { currencyUnitMap } from '@/constants/currency'
import { typeClouds } from '@/utils/common/hypervisor'

export default {
  name: 'ConsumptionConfig',
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
  },
  data () {
    return {
      CURRENCYS,
      cloudEnvs: [],
      cloudEnvData: {},
      brands: [],
      brandData: {},
      accounts: [],
      accountLoading: false,
    }
  },
  computed: {
    ...mapState('common', {
      currency: state => state.bill.currency,
      currencyOpts: state => state.bill.currencyOpts,
    }),
    ...mapGetters(['scope', 'capability']),
    cloudEnv () {
      return R.is(Object, this.cloudEnvData) ? this.cloudEnvData.key : this.cloudEnvData
    },
    brand () {
      return R.is(Object, this.brandData) ? this.brandData.key : this.brandData
    },
    newCurrencys () {
      return this.currencyOpts.map(val => {
        const localItem = currencyUnitMap[val.item_id]
        const text = localItem ? localItem.label : val.item_name
        return {
          ...val,
          item_name: val.item_id.indexOf('_') === -1 ? this.$t('bill.text_39', [text]) : this.$t('bill.text_287', [val.item_name.replace('_', '')]),
        }
      })
    },
  },
  destroyed () {
    this.am = null
    this.rm = null
  },
  mounted () {
    this.am = new this.$Manager('cloudaccounts')
    this.fetchCloudEnvs()
    this.fetchAccounts()
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
          account: undefined,
        })
        this.fetchBrands()
        this.fetchAccounts()
        this.$emit('update:env', cloudEnvId)
      } else {
        this.fc.setFieldsValue({
          cloud_env: undefined,
          brand: undefined,
          account: undefined,
        })
      }
      // this.updateUsages()
    },
    brandChange (brand) {
      const brandId = R.is(Object, brand) ? brand.key : brand
      this.brandData = brand
      if (brandId) {
        this.fc.setFieldsValue({
          account: undefined,
        })
        this.fetchAccounts()
        this.$emit('update:brand', brandId)
        this.fc.getFieldDecorator('brand', { preserve: true, initialValue: brand })
      } else {
        this.fc.setFieldsValue({
          brand: undefined,
          account: undefined,
        })
      }
    },
    accountChange (account) {
      const accountId = R.is(Object, account) ? account.key : account
      this.$emit('update:account', accountId)
    },
  },
}
</script>
