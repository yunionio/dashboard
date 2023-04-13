<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.bill_tasks')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.bill_tasks')" :count="params.data.length" :action="$t('dialog.cancel')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0,3)" />
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
  name: 'BilltasksCancelDialog',
  components: {
  },
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
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          ids,
          managerArgs: {
            ids,
            action: 'cancel',
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
