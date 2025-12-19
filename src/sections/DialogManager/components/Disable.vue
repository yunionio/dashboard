<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-alert v-if="alertProps" v-bind="alertProps" class="mb-2" />
      <dialog-selected-tips :count="params.data.length" :action="params.title" :name="params.name" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ submitButtonText }}</a-button>
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
  name: 'DisableDialog',
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
        if (this.params.workflow && this.params.workflow.enabled) {
          await this.handleWorkflow()
        } else if (this.params.ok) {
          await this.params.ok()
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    async handleWorkflow () {
      const { workflow } = this.params
      const { orderSetBuilder, orderSetData, variablesBuilder, variables, onSuccess } = workflow
      const orderSetManager = new this.$Manager('resource_order_sets')

      // 构建工单参数
      const buildOrderSetData = orderSetBuilder ? await orderSetBuilder() : orderSetData
      const orderSetRes = await orderSetManager.create({ data: buildOrderSetData })

      // 构建流程变量，默认补充 ids
      const buildVariables = variablesBuilder
        ? await variablesBuilder(orderSetRes)
        : { ...(variables || {}), ids: orderSetRes.data.id }

      await this.createWorkflow(buildVariables)
      if (onSuccess && R.is(Function, onSuccess)) {
        await onSuccess(orderSetRes)
      }
      this.$message.success(this.$t('common.worflow_tip', [this.params.title]))
    },
  },
}
</script>
