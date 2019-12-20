<template>
  <div class="d-flex">
    <a-row :gutter="8" class="w-100">
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select
            :allowClear="allowClear"
            class="w-100"
            style="width:100%"
            :labelInValue="labelInValue"
            v-decorator="decorators.brand"
            :loading="brandLoading"
            placeholder="请选择云账号"
            @change="brandChange"
            :filterOption="filterOption"
            showSearch>
            <a-select-option v-for="item of brands" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select
            :allowClear="allowClear"
            class="w-100"
            :labelInValue="labelInValue"
            v-decorator="decorators.account"
            :loading="accountLoading"
            placeholder="请选择账号"
            @change="accountChange"
            :filterOption="filterOption"
            showSearch>
            <a-select-option v-for="item of accounts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'ProviderAccount',
  props: {
    labelInValue: {
      type: Boolean,
      default: true,
    },
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.brand) && R.is(Array, val.account),
    },
    fc: {
      type: Object,
      required: true,
    },
    allowClear: Boolean,
  },
  data () {
    return {
      brands: [],
      brandLoading: false,
      accountData: {},
      accounts: [],
      accountLoading: false,
    }
  },
  computed: mapGetters(['scope', 'capability']),
  mounted () {
    this.am = new Manager('cloudaccounts')
    this.fetchBrands()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
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
    async fetchBrands () {
      this.brandLoading = true
      try {
        this.brands = this.capability.brands.map(item => {
          return {
            key: item,
            label: item,
          }
        }) || []
        let defaultData = { key: this.capability.brands[0], label: this.capability.brands[0] }
        if (!this.brands.find(val => val.key === this.capability.brands[0])) return // 如果下拉列表没有当前域值，return
        const initialValue = _.get(this.decorators, 'provider[1].initialValue')
        if (initialValue) {
          const findInitValue = this.brands.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this._setInitBrand(defaultData)
        this.brandChange(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.brandLoading = false
      }
    },
    async fetchAccounts (brandId) {
      this.accountLoading = true
      try {
        const params = {
          scope: this.scope,
          brand: brandId,
        }
        const response = await this.am.list({ params })
        const data = response.data.data
        this.accounts = data.map(val => ({ ...val, key: val.id, label: val.name })) || []
        let defaultData = this.accounts[0]
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
    /**
     * brand {Object|String}
     */
    brandChange (brand) {
      const brandId = R.is(Object, brand) ? brand.key : brand
      if (brandId) {
        this.fetchAccounts(brandId)
        this.fc.setFieldsValue({
          account: undefined,
        })
        this.$emit('update:brand', brandId)
      } else {
        this.fc.setFieldsValue({
          brand: undefined,
          account: undefined,
        })
        this.accounts = []
      }
    },
    accountChange (account) {
      this.accountData = account
      this.$emit('update:account', account)
      this.fc.getFieldDecorator('account', { preserve: true, initialValue: account })
    },
  },
}
</script>
