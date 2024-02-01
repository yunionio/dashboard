<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.stop_rescue') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.stop_rescue')" />
      <dialog-table :data="params.data" :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { is } from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmStopRescueDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    columns () {
      const fields = ['name', 'ips', 'brand']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const { data, onManager, refresh } = this.params
        const ids = data.map(item => item.id)
        await onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready', 'rescving'],
          managerArgs: {
            action: 'stop-rescue',
          },
        })
        this.$message.success(this.$t('common.success'))
        is(Function, refresh) && refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
