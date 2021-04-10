<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="this.params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" class="mt-3">
        <a-form-item v-if="params.data[0].provider === 'Qcloud' && params.data[0].auth_mode === 'on'" :label="$t('db.text_195')" v-bind="formItemLayout">
          <a-input-password v-decorator="decorators.password" :plcaeholder="$t('db.text_360')" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { passwordValidator } from '@/utils/validate'

export default {
  name: 'RedisClearDataDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      loading: false,
      decorators: {
        password: [
          'password',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_360') },
              { validator: passwordValidator },
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
        this.loading = false
        const values = await this.form.fc.validateFields()
        if (this.params.data && this.params.data.length > 1) {
          await this.params.onManager('batchPerformAction', {
            id: this.params.data.map(({ id }) => id),
            steadyStatus: 'running',
            managerArgs: {
              action: 'flush-instance',
            },
          })
        } else {
          await this.params.onManager('performAction', {
            id: this.params.data[0].id,
            steadyStatus: 'running',
            managerArgs: {
              action: 'flush-instance',
              data: values,
            },
          })
        }
        this.cancelDialog()
        this.params.refresh()
        this.$message.success(this.$t('db.text_149'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
