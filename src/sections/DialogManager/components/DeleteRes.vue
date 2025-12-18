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
      <a-popconfirm v-if="params.showConfirm && params.confirmText" placement="topRight" :okText="submitButtonText" :cancelText="$t('dialog.cancel')" @confirm="handleConfirm">
        <template slot="title">
          <p>{{ params.confirmText }}</p>
        </template>
        <a-button type="danger">{{ submitButtonText }}</a-button>
      </a-popconfirm>
      <a-button v-else v-bind="okButtonProps" @click="handleConfirm">{{ submitButtonText }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import workflowMixin from '@/mixins/workflow'

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
  mixins: [DialogMixin, WindowsMixin, workflowMixin],
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
    submitButtonText () {
      if (this.params.workflow && this.params.workflow.enabled) {
        return this.params.workflow.submitText || this.$t('system.text_532')
      }
      return this.$t('dialog.ok')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item[this.idKey])
        // 如果启用了工单，则创建工单
        if (this.params.workflow && this.params.workflow.enabled) {
          await this.handleWorkflow(ids)
        } else if (this.params.ok) {
          // 使用自定义回调函数
          await this.params.ok(ids, this.params.data)
          this.cancelDialog()
        } else {
          // 使用默认的 onManager 删除
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
          this.cancelDialog()
        }
      } finally {
        this.loading = false
      }
    },
    async handleWorkflow (ids) {
      const { workflow } = this.params
      const { orderSetBuilder, orderSetData, variablesBuilder, variables, onSuccess } = workflow
      const orderSetManager = new this.$Manager('resource_order_sets')

      // 构建工单参数
      const buildOrderSetData = orderSetBuilder ? await orderSetBuilder(ids, this.params.data) : orderSetData
      const orderSetRes = await orderSetManager.create({ data: buildOrderSetData })

      // 构建流程变量，默认补充 ids
      const buildVariables = variablesBuilder
        ? await variablesBuilder(orderSetRes, ids, this.params.data)
        : { ...(variables || {}), ids: orderSetRes.data.id }

      await this.createWorkflow(buildVariables)
      if (onSuccess && R.is(Function, onSuccess)) {
        await onSuccess(orderSetRes, ids, this.params.data)
      }
      this.$message.success(this.$t('common.text00075'))
      this.cancelDialog()
      if (this.params.vm && this.params.vm.destroySidePages) {
        this.params.vm.destroySidePage(this.params.vm.windowId)
      }
      if (this.params.success && R.is(Function, this.params.success)) {
        this.params.success(orderSetRes)
      }
    },
  },
}
</script>
