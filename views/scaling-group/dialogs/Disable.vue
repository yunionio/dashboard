<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">禁用</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" message="禁用弹性伸缩组之后，伸缩组将不再自动触发伸缩活动，但已开始的伸缩活动会继续执行、已存在的虚拟机将继续保留。" />
      <dialog-selected-tips :count="params.data.length" action="禁用" name="弹性伸缩组" />
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
  name: 'ScalingGroupDisable',
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
            action: 'disable',
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
