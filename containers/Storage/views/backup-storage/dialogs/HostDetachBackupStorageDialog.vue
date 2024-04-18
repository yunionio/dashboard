<!-- 宿主机列表-取消关联宿主机 -->
<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('storage.text_50')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostDetachBackupStorageDialog',
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
        await this.params.list.onManager('batchDelete', {
          id: this.params.data.map(({ id }) => id),
          managerArgs: {
            ctx: [['backupstorages', this.params.resId]],
          },
        })
        // this.$bus.$emit('BlockStorageListSingleUpdate', [this.params.resId])
        this.cancelDialog()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
