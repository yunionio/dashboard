<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">调整策略</div>
    <div slot="body">
      <schedpolicy-form ref="formRef" :update-value="params.data[0]" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import SchedpolicyForm from '../components/Form'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UpdateSchedpolicyDialog',
  components: {
    SchedpolicyForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    doCreate (data) {
      return this.params.list.singleUpdate(this.params.data[0].id, data)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$refs.formRef.validateForm()
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.$message.success('操作成功')
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
