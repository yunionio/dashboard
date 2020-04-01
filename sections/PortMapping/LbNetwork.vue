<template>
  <a-form-item>
    <base-select
      filterable
      :params="params"
      resource="networks"
      v-decorator="decorator"
      :selectProps="{ placeholder: '请选择负载均衡网络' }" />
  </a-form-item>
</template>

<script>
export default {
  name: 'K8SPortMappingLbNetwork',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      params: {
        cloudregion: 'default',
        scope: this.$store.getters.scope,
      },
    }
  },
}
</script>
