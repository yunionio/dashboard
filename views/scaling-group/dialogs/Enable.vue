<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">启用</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" message="启用弹性伸缩组之后，将会根据策略触发伸缩，可能会进行虚拟机创建或删除" />
      <dialog-selected-tips :count="params.data.length" action="启用" name="弹性伸缩组" />
      <dialog-table :data="params.data" :columns="columns" />
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
  name: 'ScalingGroupEnable',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    columns () {
      const fields = ['name', 'desire_instance_number', 'max_instance_number']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.onManager('batchPerformAction', {
          id: this.params.data.map(item => item.id),
          managerArgs: {
            action: 'enable',
          },
        })
        this.cancelDialog()
        this.$message.success('执行成功')
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
