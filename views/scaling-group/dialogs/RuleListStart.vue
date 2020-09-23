<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_249')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.text_249')" :name="$t('compute.text_949')" />
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
        this.$message.success(this.$t('message.exec_success'))
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
