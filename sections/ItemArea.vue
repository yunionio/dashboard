<template>
  <area-selects
    :decorators="decorators"
    v-bind="formItemLayout"
    :names="names"
    :isRequired="isRequired"
    :defaultActiveFirstOption="defaultActiveFirstOption"
    :cityParams="{cloud_env: 'public', ...scopeParams}"
    :zoneParams="{service: 'elasticcaches', ...scopeParams}"
    :providerParams="scopeParams"
    :cloudregionParams="{service: 'elasticcaches', ...scopeParams}"
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
                const city = this.form.getFieldValue('city')
                if (!this.providerList || this.providerList.length === 0) {
                  return _callback(new Error(`${this.$t('citys')[city] || this.$t('citys')[city] || city}暂无任何可用平台`))
                }
                _callback()
              },
            }],
        }],
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
