<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('monitor.edit_name')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('monitor.dashboard.title')" :count="params.data.length" :action="$t('monitor.edit_name')" />
      <dialog-table :data="params.data" :columns="params.columns" />
    </div>
    <div slot="footer">
      <a-form :form="form" v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('monitor.text_7')" />
        </a-form-item>
      </a-form>
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MonitorDashboardChangeName',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this),
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.params.data[0].name,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
      },
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.validateFields()
        await new this.$Manager('alertdashboards', 'v1').update({
          id: this.params.data[0].id,
          data: values,
        })
        this.loading = false
        this.cancelDialog()
        this.params.ok(values.name)
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style scoped>

</style>
