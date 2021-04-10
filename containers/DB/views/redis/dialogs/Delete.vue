<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisDeletedialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = false
        if (this.params.data && this.params.data.length > 1) {
          const ids = this.params.data.map(({ id }) => id)
          await this.params.list.batchPerformAction('delete', { ids })
        } else {
          await this.params.list.onManager('delete', {
            steadyStatus: 'running',
            id: this.params.data[0].id,
          })
        }
        this.cancelDialog()
        this.$message.success(this.$t('db.text_149'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
