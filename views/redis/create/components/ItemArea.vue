<template>
  <area-selects
    :cityParams="{cloud_env: 'public'}"
    v-bind="formItemLayout"
    :defaultActiveFirstOption="['city']"
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
  inject: ['form', 'formItemLayout'],
  methods: {
    providerFetchSuccess (list = []) {
      const needProvider = ['Aliyun', 'Huawei']
      return list.filter(({ name }) => needProvider.indexOf(name) > -1)
    },
    cityFetchSuccess (names) {
      this.$emit('cityFetchSuccess', names)
    },
  },
}
</script>
