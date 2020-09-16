<template>
  <div>
    <a-form-model-item :label="$t('k8s.text_269')">
      <a-switch v-model="formData.enabled" />
    </a-form-model-item>
    <template v-if="formData.enabled">
      <a-form-model-item :label="$t('k8s.text_270')">
        <a-input-number v-model="formData.sizeMB" :min="1" /> GB
      </a-form-model-item>
      <a-form-model-item :label="$t('k8s.text_271')" :prop="prop">
        <base-select
          v-model="formData.storageClassName"
          resource="storageclasses"
          version="v1"
          :params="params" />
      </a-form-model-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'KubeComponentMonitorStorage',
  props: {
    value: {
      type: Object,
      required: true,
    },
    prop: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      params: {
        scope: this.$store.getters.scope,
        cluster: this.$route.query.cluster,
        limit: 0,
      },
      formData: this.value,
    }
  },
}
</script>

<style>

</style>
