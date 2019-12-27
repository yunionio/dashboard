<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="columns" />
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
  name: 'VmResumeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: '恢复',
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'ip', 'instance_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doResetSubmit () {
      const ids = this.params.data.map(item => item.id)
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'running',
        managerArgs: {
          action: 'resume',
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doResetSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
