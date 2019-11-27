<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="this.params.name" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DeleteResDialog',
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
        if (this.params.ok) {
          await this.params.ok()
        } else {
          const ids = this.params.data.map(item => item.id)
          let params = {}
          params = {
            ...params,
            ...this.params.requestParams,
          }
          const response = await this.params.list.onManager('batchDelete', {
            id: ids,
            managerArgs: { params },
          })
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success(response)
          }
        }
        this.cancelDialog()
        this.$message.success('操作成功')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
