<template>
  <a-form-item>
    <base-select
      filterable
      :params="params"
      resource="networks"
      v-decorator="decorator"
      :selectProps="{ placeholder: $t('k8s.text_87') }" />
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
    vpcId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      params: {
        cloudregion: 'default',
        scope: this.$store.getters.scope,
        vpc_id: this.vpcId,
      },
    }
  },
}
</script>
