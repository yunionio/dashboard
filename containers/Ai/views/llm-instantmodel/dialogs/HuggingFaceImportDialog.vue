<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.import') }}</div>
    <div slot="body">
      <hf-instant-import-form
        ref="form"
        :repo-id="fixed.repo_id"
        :revision="fixed.revision" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import HfInstantImportForm from '@Ai/views/llm-instantmodel/shared/HfInstantImportForm.vue'

export default {
  name: 'HuggingFaceImportDialog',
  components: {
    HfInstantImportForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const repoId = this.params?.repo_id
    return {
      loading: false,
      fixed: {
        repo_id: repoId,
        revision: this.params?.revision || 'main',
      },
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const data = await this.$refs.form.validateAndGetData()
        await new this.$Manager('llm_instant_models').create({ data })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        if (typeof this.params?.onSuccess === 'function') this.params.onSuccess()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
