<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('monitor.dashboard.dialog.project.clone')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('monitor.dashboard.dialog.project.title')" :count="params.data.length" :action="$t('monitor.dashboard.dialog.project.clone')" />
      <dialog-table :data="params.data" :columns="params.columns" />
    </div>
    <div slot="footer">
      <a-form :form="form" v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.clone_panel_name" :placeholder="$t('monitor.text_7')" />
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
  name: 'CloneMonitorDashboardChart',
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
        clone_panel_name: [
          'clone_panel_name',
          {
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
        const params = {
          panel_id: this.params.data[0].id,
          ...values,
        }
        await new this.$Manager('alertdashboards', 'v1').performAction({
          id: this.params.data[0].dashboard_id,
          action: 'clone-panel',
          data: params,
        })
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
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
