<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <llm-sku-create-form
        :mode="params.type === 'edit' ? 'edit' : 'create'"
        :edit-data="params.data && params.data[0]"
        :on-manager="params.onManager"
        @success="onFormSuccess"
        @cancel="cancelDialog" />
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import LlmSkuCreateForm from '../create/Form.vue'

export default {
  name: 'LlmSkuCreateDialog',
  components: {
    LlmSkuCreateForm,
  },
  mixins: [DialogMixin],
  methods: {
    onFormSuccess () {
      if (this.params.callback) this.params.callback()
      this.cancelDialog()
    },
  },
}
</script>
