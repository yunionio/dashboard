<template>
  <area-selects
    :decorators="decorators"
    v-bind="formItemLayout"
    :names="names"
    :isRequired="isRequired"
    :defaultActiveFirstOption="defaultActiveFirstOption"
    :cityParams="cityParams"
    :zoneParams="zoneParams"
    :providerParams="scopeParams"
    :cloudregionParams="cloudregionParams"
    @cityFetchSuccess="cityFetchSuccess"
    @providerFetchSuccess="providerFetchSuccess" />
</template>
<script>
import AreaSelects from '@/sections/AreaSelects'
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
    values: {
      type: Object,
    },
    isRequired: {
      type: Boolean,
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
              required: this.isRequired, message: '请选择平台',
            },
            {
              validator: (rule, value, _callback) => {
                if (!this.providerList || this.providerList.length === 0) {
                  return _callback(new Error(`该项目下没有可用平台`))
                }
                _callback()
              },
            }],
        }],
      }
    },
    cityParams () {
      return { cloud_env: 'public', ...this.scopeParams }
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
  methods: {
    providerFetchSuccess (list = []) {
      const needProvider = ['Aliyun', 'Huawei']
      const _list = list.filter(({ name }) => needProvider.indexOf(name) > -1)
      this.providerList = _list
      this.form.fc.validateFields(['provider'])
      if (this.providerList.length === 0) {
        this.form.setFieldsValue({
          sku: undefined,
        })
      }
      return _list
    },
    cityFetchSuccess (names) {
      this.$emit('cityFetchSuccess', names)
    },
  },
}
</script>
