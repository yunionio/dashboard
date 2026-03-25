<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <llm-sku-create-form
        ref="form"
        :mode="params.type === 'edit' ? 'edit' : 'create'"
        :edit-data="params.data && params.data[0]"
        :on-manager="params.onManager"
        @success="onFormSuccess"
        @cancel="cancelDialog" />
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('dialog.ok') }}</a-button>
      <a-button :disabled="submitLoading" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import LlmSkuCreateForm from '../create/Form.vue'

export default {
  name: 'LlmSkuCreateDialog',
  components: {
    LlmSkuCreateForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      submitLoading: false,
    }
  },
  methods: {
    async handleSubmit () {
      const form = this.$refs.form
      if (!form || !form.handleConfirm) return
      this.submitLoading = true
      try {
        await form.handleConfirm()
      } catch (e) {
        // 表单内会处理校验错误提示
      } finally {
        this.submitLoading = false
      }
    },
    onFormSuccess () {
      if (this.params.callback) this.params.callback()
      this.cancelDialog()
    },
  },
}
</script>
