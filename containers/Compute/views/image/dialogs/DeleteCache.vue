<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.perform_delete')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1394')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('common.text00107')" :count="params.data.length" :action="$t('compute.perform_delete')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-checkbox v-model="force_checked">{{$t('compute.force_delete.extra')}}</a-checkbox>
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
  name: 'DeleteCacheDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      force_checked: false,
    }
  },
  methods: {
    async doDelete (data) {
      const manager = new this.$Manager('storagecaches')
      for (let i = 0; i < this.params.data.length; i++) {
        await manager.performAction({
          id: this.params.data[i].storagecache_id,
          action: 'uncache-image',
          data: {
            image: this.params.data[i].cachedimage_id,
            is_force: this.force_checked,
          },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        await this.doDelete()
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
