<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_950')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.text_950')" :name="$t('compute.text_91')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_951')">
          <a-radio-group v-model="isDelete">
            <a-radio :value="true">{{$t('compute.text_952')}}</a-radio>
            <a-radio :value="false">{{$t('compute.text_953')}}</a-radio>
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
  computed: {
    columns () {
      const fields = ['name', 'scaling_status', 'status']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
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
            scaling_group: this.params.resId,
            delete_server: this.isDelete,
          },
        })
        this.cancelDialog()
        this.params.refresh()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
