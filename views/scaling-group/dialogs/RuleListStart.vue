<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">立即执行</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="立即执行" name="伸缩策略" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'FlexRuleStartDialog',
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
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'trigger',
            data: {
              manual: true,
            },
          },
        })
        this.cancelDialog()
        this.$message.success('执行成功')
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
