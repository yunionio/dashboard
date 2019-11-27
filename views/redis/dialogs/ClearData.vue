<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'RedisClearDataDialog',
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
          await this.params.list.batchPerformAction('flush-instance', null, 'ready')
        } else {
          await this.params.list.onManager('performAction', {
            id: this.params.data[0].id,
            steadyStatus: 'running',
            managerArgs: {
              action: 'flush-instance',
            },
          })
        }
        this.cancelDialog()
        this.$message.success('操作成功')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
