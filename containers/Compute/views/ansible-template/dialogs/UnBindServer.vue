<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" :name="$t('dictionary.ansibletemplate')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 1)" />
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
        await manager.batchPerformAction({
          action: `${this.params.resId}/unbind`,
          data: {
            server_id: this.params.data.map(item => item.id),
          },
        })
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
