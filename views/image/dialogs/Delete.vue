<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">删除</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="删除" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
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
    }
  },
  methods: {
    doDelete (data) {
      return new this.$Manager('storagecaches').performAction({
        id: this.params.data[0].storagecache_id,
        action: 'uncache-image',
        data: {
          image: this.params.imageId,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        await this.doDelete()
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
