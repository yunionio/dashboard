<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
     <a-alert :message="params.alert" class="mb-2" type="warning" />
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="this.params.name" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
// import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsDeleteDialog',
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
        const { resId, data } = this.params
        const manager = new this.$Manager('buckets', 'v2')
        const keys = data.map(({ key }) => key)
        await manager.performAction({
          id: resId,
          action: 'delete',
          data: {
            keys,
          },
        })
        keys.forEach(k => {
          if (this.params.list.data[k]) {
            this.$delete(this.params.list.data, k)
          }
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
