<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('k8s.text_199')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name" :count="params.data.length" :action="$t('k8s.text_199')" />
      <dialog-table :data="params.data" :columns="params.columns" />
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
  name: 'DetachClusterDialog',
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
          id: this.params.data[0].federatedresource_id,
          managerArgs: {
            action: 'detach-cluster',
            data: {
              cluster_id: this.params.data[0].cluster_id,
            },
          },
        })
        this.cancelDialog()
        this.params.success && this.params.success()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
