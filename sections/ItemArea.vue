<template>
  <div>
    <area-selects
     v-bind="formItemLayout"
    :names="names"
    :defaultActiveFirstOption="defaultActiveFirstOption"
    :cityParams="{cloud_env: 'public', ...scopeParams}"
    :zoneParams="{service: 'elasticcaches', ...scopeParams}"
    :providerParams="scopeParams"
    :cloudregionParams="{service: 'elasticcaches', ...scopeParams}"
    @cityFetchSuccess="cityFetchSuccess"
    @providerFetchSuccess="providerFetchSuccess" />
  </div>
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
  },
  inject: ['form', 'formItemLayout'],
  computed: {
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.values.domain || this.$store.getters.userInfo.projectDomainId,
        }
      }
      return { scope: this.$store.getters.scope }
    },
  },
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
