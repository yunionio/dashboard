<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-alert v-if="alertProps" v-bind="alertProps" class="mb-2" />
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="this.params.name" />
      <vxe-grid v-if="params.columns && params.columns.length" class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  computed: {
    alertProps () {
      const { alert } = this.params
      const data = {
        'String': { message: alert, type: 'warning' },
        'Object': alert,
      }
      const t = R.type(alert)
      return data[t] || null
    },
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
