<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.mounted_apps')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('aice.mounted_apps.auto_cache.enable')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_cache" />
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
  name: 'InstantAppAutoCacheDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const isAllClose = this.params.data.every((item) => { return !item.auto_cache })
    return {
      loading: false,
      action: this.$t('aice.mounted_apps.auto_cache.enable'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        auto_cache: [
          'auto_cache',
          {
            initialValue: !isAllClose,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'package', 'version']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doSubmit () {
      const ids = this.params.data.map(item => item.id)
      const values = await this.form.fc.validateFields()
      const params = { auto_cache: values.auto_cache }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'enable-auto-cache',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doSubmit()
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
