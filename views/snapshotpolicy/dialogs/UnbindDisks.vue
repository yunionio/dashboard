<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="action" name="硬盘" />
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
  name: 'UnbindDisksDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: '解绑',
    }
  },
  computed: {
    columns () {
      return this.params.columns.slice(0, 3)
    },
  },
  methods: {
    async doSubmit () {
      const ids = this.params.data.map(item => item.id)
      const params = {
        snapshotpolicy: this.params.resId,
      }
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'ready',
        managerArgs: {
          action: 'bind-snapshotpolicy',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
