<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" name="主机" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 1)" />
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

export default {
  name: 'AnsibleTemplateUnbindServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      const manager = new this.$Manager('devtool_templates')
      this.loading = true
      try {
        if (this.params.data.length > 1) {
          await manager.batchPerformAction({
            ids: this.params.data.map(item => item.id),
            action: `${this.params.resId}/unbind`,
          })
        } else {
          await manager.performAction({
            id: this.params.resId,
            action: 'unbind',
            data: {
              id: this.params.data[0].server_id,
              server_id: this.params.data[0].server_id,
            },
          })
        }
        this.cancelDialog()
        this.params.list.fetchData()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
