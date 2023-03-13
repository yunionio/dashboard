<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_478')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="this.params.cloudEnv === 'images' ? $t('dictionary.image') : $t('compute.text_98')" :count="params.data.length" :action="$t('compute.text_478')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'ImageRestoreDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    doUpdate () {
      const selectedIds = this.params.data.map((item) => {
        return item.id
      })
      return new this.$Manager(this.params.cloudEnv, 'v1').batchPerformAction({
        ids: selectedIds,
        action: 'cancel-delete',
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        await this.doUpdate()
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
