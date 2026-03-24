<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <llm-sku-create-form
        ref="createForm"
        mode="create"
        hide-footer
        @success="onFormSuccess"
        @cancel="onFormCancel" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="submitLoading" @click="handleConfirm">{{ $t('common.create') }}</a-button>
        <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import LlmSkuCreateForm from './Form.vue'

export default {
  name: 'LlmSkuCreate',
  components: {
    LlmSkuCreateForm,
  },
  data () {
    return {
      submitLoading: false,
    }
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
    async handleConfirm () {
      const form = this.$refs.createForm
      if (!form) return
      this.submitLoading = true
      try {
        await form.handleConfirm()
      } catch (e) {
        // 校验失败等由表单处理
      } finally {
        this.submitLoading = false
      }
    },
    handleCancel () {
      this.$refs.createForm && this.$refs.createForm.handleCancel()
    },
    onFormSuccess () {
      this.$router.push(this.isApplyType ? '/app-llm-sku' : '/llm-sku')
    },
    onFormCancel () {
      this.$router.push(this.isApplyType ? '/app-llm-sku' : '/llm-sku')
    },
  },
}
</script>
