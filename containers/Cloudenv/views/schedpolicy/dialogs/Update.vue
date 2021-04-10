<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_383')}}</div>
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
      this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$refs.formRef.validateForm()
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.$message.success(this.$t('cloudenv.text_381'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
