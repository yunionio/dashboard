<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_569')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" :message="$t('compute.text_910')" />
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.text_569')" :name="$t('compute.text_95')" />
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
        this.$message.success(this.$t('message.exec_success'))
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
