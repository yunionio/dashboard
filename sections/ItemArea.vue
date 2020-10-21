<template>
  <area-selects
    ref="areaSelects"
    :decorators="decorators"
    v-bind="formItemLayout"
    :names="names"
    :isRequired="isRequired"
    :defaultActiveFirstOption="defaultActiveFirstOption"
    :cityParams="cityParams"
    :zoneParams="zoneParams"
    :providerParams="providerParams"
    :cloudregionParams="cloudregionParams"
    @cityFetchSuccess="cityFetchSuccess"
    @providerFetchSuccess="providerFetchSuccess"
    @cloudregionFetchSuccess="cloudregionFetchSuccess" />
</template>
<script>
import AreaSelects from '@/sections/AreaSelects'
const PROVIDERS = {
  postpaid: ['Aliyun', 'Huawei', 'Google', 'Qcloud'],
  prepaid: ['Aliyun', 'Huawei', 'Qcloud'],
}
export default {
  name: 'ItemArea',
  components: {
    // 区域
    AreaSelects,
  },
  props: {
    names: {
      type: Array,
    },
    defaultActiveFirstOption: {
      type: Array,
    },
    isRequired: {
      type: Boolean,
    },
    billingType: {
      type: String,
    },
  },
  data () {
    return {
      providerList: [],
    }
  },
  computed: {
    isRds () {
      return this.$route.path.indexOf('rds') > -1
    },
    service () {
      return this.isRds ? 'dbinstances' : 'elasticcaches'
    },
    decorators () {
      return {
        provider: ['provider', {
          validateFirst: true,
          rules: [
            {
              required: this.isRequired, message: this.$t('db.text_30'),
            },
            {
              validator: (rule, value, _callback) => {
                if (!this.providerList || this.providerList.length === 0) {
                  return _callback(new Error(this.$t('db.text_31')))
                }
                _callback()
              },
            }],
        }],
      }
    },
    cityParams () {
      return { service: this.service, cloud_env: 'public', ...this.scopeParams }
    },
    providerParams () {
      return {
        service: this.service,
        ...this.scopeParams,
      }
    },
    zoneParams () {
      return {
        service: this.service,
        ...this.scopeParams,
      }
    },
    cloudregionParams () {
      return {
        service: this.service,
        ...this.scopeParams,
      }
    },
  },
  inject: ['form', 'formItemLayout', 'scopeParams'],
  watch: {
    billingType (type) {
      this.doFetchs(type)
    },
  },
  created () {
    if (this.isRds) {
      this.providers = PROVIDERS.postpaid
    }
  },
  methods: {
    doFetchs (billingType) {
      this.providers = PROVIDERS[billingType]
      this.$refs.areaSelects.fetchs(['provider', 'cloudregion'])
    },
    providerFetchSuccess (list = []) {
      const _list = list.filter(({ name }) => {
        if (this.providers) {
          return this.providers.indexOf(name) > -1
        }
        return true
      })
      this.providerList = _list
      this.form.fc.validateFields(['provider'])
      if (this.providerList.length === 0) {
        this.form.setFieldsValue({
          sku: undefined,
        })
      }
      return _list
    },
    cloudregionFetchSuccess (list = []) {
      if (this.providerList.length === 0) {
        return []
      }
      return list.filter(({ provider }) => {
        if (this.providers) {
          return this.providers.indexOf(provider) > -1
        }
        return true
      })
    },
    cityFetchSuccess (names) {
      this.$emit('cityFetchSuccess', names)
    },
  },
}
</script>
