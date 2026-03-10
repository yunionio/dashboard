<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <llm-sku-create-form
        mode="create"
        @success="onFormSuccess"
        @cancel="onFormCancel" />
    </page-body>
  </div>
</template>

<script>
import LlmSkuCreateForm from './Form.vue'

export default {
  name: 'LlmSkuCreate',
  components: {
    LlmSkuCreateForm,
  },
  computed: {
    headerTitle () {
      return this.$t('common.create') + ' - ' + this.$t('aice.llm_sku')
    },
  },
  methods: {
    onFormSuccess () {
      this.$message.success(this.$t('common.success'))
      this.$router.push('/llm-sku')
    },
    onFormCancel () {
      this.$router.push('/llm-sku')
    },
  },
}
</script>
