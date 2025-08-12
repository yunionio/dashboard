<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="action" :name="$t('dictionary.snapshotpolicy')" />
      <dialog-table :data="params.data" :columns="columns" />
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
  name: 'UnbindResourcesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_723'),
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
        snapshotpolicy_id: this.params.resId,
      }
      if (this.params.resourceType === 'disk') {
        return this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: 'ready',
          managerArgs: {
            action: 'unbind-snapshotpolicy',
            data: params,
          },
        })
      } else {
        return new this.$Manager('snapshotpolicies').performAction({
          id: this.params.resId,
          action: 'unbind-resources',
          data: {
            resources: this.params.data.map(item => { return { id: item.id, type: this.params.resourceType } }),
          },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doSubmit()
        this.$bus.$emit('refresh-snapshotpolicy-list')
        this.loading = false
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
