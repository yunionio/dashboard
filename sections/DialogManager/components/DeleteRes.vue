<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-alert v-if="alertProps" v-bind="alertProps" class="mb-2" />
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="this.params.name" :unit="params.unit" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <dialog-content :content="params.content" />
    </div>
    <div slot="footer">
      <a-button v-bind="okButtonProps" @click="handleConfirm">{{ $t("dialog.ok") }}</a-button>
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
  components: {
    DialogContent: {
      props: {
        content: {
          type: Function,
        },
      },
      render () {
        if (this.content) {
          return this.content()
        }
        return null
      },
    },
  },
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
        String: { message: alert, type: 'warning' },
        Object: alert,
      }
      const t = R.type(alert)
      return data[t] || null
    },
    okButtonProps () {
      const defaultProps = {
        type: 'primary',
        loading: this.loading,
      }
      const { okButtonProps } = this.params
      if (okButtonProps && R.type(okButtonProps) === 'Object') {
        return Object.assign(defaultProps, okButtonProps)
      }
      return defaultProps
    },
    idKey () {
      return this.params.idKey || 'id'
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item[this.idKey])
        if (this.params.ok) {
          await this.params.ok(ids, this.params.data)
        } else {
          let params = {}
          params = {
            ...params,
            ...this.params.requestParams,
          }
          const response = await this.params.onManager('batchDelete', {
            id: ids,
            managerArgs: { params, data: this.params.requestData },
          })
          if (this.params.vm && this.params.vm.destroySidePages) {
            this.params.vm.destroySidePage(this.params.vm.windowId)
          }
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success(response)
          }
          // this.$message.success(this.$t('common.success'))
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
