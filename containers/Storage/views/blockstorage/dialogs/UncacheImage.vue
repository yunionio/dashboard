<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('dictionary.image')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-checkbox v-model="force_checked">{{$t('compute.force_delete.extra')}}</a-checkbox>
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
  name: 'UncacheImageDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      force_checked: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const manager = new this.$Manager('cachedimages')
        await manager.batchPerformAction({
          action: 'uncache-image',
          ids: this.params.data.map(item => item.cachedimage_id),
          data: {
            storagecache_id: this.params.resItem.storagecache_id,
            is_force: this.force_checked,
          },
        })
        this.cancelDialog()
        this.params.refresh()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
