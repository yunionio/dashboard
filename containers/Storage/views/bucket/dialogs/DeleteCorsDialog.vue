<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" :name="this.params.name" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'DeleteCorsDialog',
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
        const { bucketID, data } = this.params
        const manager = new this.$Manager('buckets')
        await manager.performAction({
          id: bucketID,
          action: 'delete-cors',
          data: {
            id: data.map(item => { return item.id }),
          },
        })
        this.cancelDialog()
        this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
