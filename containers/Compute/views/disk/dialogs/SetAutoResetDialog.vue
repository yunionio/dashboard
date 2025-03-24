<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk_set_auto_reset')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('dictionary.disk')" :action="$t('compute.disk_set_auto_reset')" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.shutdown_auto_reset')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" v-decorator="decorators.auto_reset" />
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
  name: 'DiskSetAutoResetDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        auto_reset: [
          'auto_reset',
          {
            valuePropName: 'checked',
            initialValue: this.params.data[0].auto_reset || false,
          },
        ],
      },
      formItemLayout: {
        labelCol: {
          sm: { span: 3 },
        },
        wrapperCol: {
          sm: { span: 21 },
        },
      },
    }
  },
  computed: {
    domain () {
      return this.params.data[0].domain_id
    },
    tenant () {
      return this.params.data[0].tenant_id
    },
  },
  created () {
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        await this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: {
            data: {
              auto_reset: values.auto_reset,
            },
          },
        })
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
