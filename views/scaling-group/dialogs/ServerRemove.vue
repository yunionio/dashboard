<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">移除</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="移除" name="虚拟机" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form v-bind="formItemLayout">
        <a-form-item label="移除方式">
          <a-radio-group v-model="isDelete">
            <a-radio :value="true">移除且删除</a-radio>
            <a-radio :value="false">仅移除</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
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
  name: 'ScalingGroupServerRemoveDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      isDelete: true,
      formItemLayout: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
      },
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const { data } = this.params
      const manager = new this.$Manager('servers')
      try {
        const ids = data.map(({ id }) => id)
        await manager.batchPerformAction({
          ids,
          action: 'detach-scaling-group',
          data: {
            scaling_group: this.resId,
            delete_server: this.isDelete,
          },
        })
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
