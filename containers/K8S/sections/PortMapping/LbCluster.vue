<template>
  <a-form-item>
    <base-select
      filterable
      :params="params"
      resource="loadbalancerclusters"
      v-decorator="decorator"
      :selectProps="{ placeholder: $t('k8s.text_86') }" />
  </a-form-item>
</template>

<script>
export default {
  name: 'K8SPortMappingLbCluster',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      params: {
        limit: 0,
        scope: this.$store.getters.scope,
      },
    }
  },
}
</script>
