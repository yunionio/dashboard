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
    isApplyType () {
      return this.$route.path.includes('app-llm')
    },
    headerTitle () {
      return this.$t('common.create') + ' - ' + (this.isApplyType ? this.$t('aice.app_llm_sku') : this.$t('aice.llm_sku'))
    },
  },
  methods: {
    onFormSuccess () {
      this.$message.success(this.$t('common.success'))
      this.$router.push(this.isApplyType ? '/app-llm-sku' : '/llm-sku')
    },
    onFormCancel () {
      this.$router.push(this.isApplyType ? '/app-llm-sku' : '/llm-sku')
    },
  },
}
</script>
