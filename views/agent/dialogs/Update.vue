<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置心跳超时时间</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.eip')" :count="params.data.length" action="设置心跳超时时间" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="转发实例心跳超时时间">
          <a-input v-decorator="decorators.hb_timeout" type="Number" addonAfter="秒" />
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
  name: 'AgentUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        hb_timeout: [
          'hb_timeout',
          {
            normalize: v => Number(v),
            initialValue: this.params.data[0].hb_timeout,
            rules: [
              { type: 'integer', min: 600, max: 3600, message: '请输入范围在 600-3600 之间', trigger: 'blur' },
            ],
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
  methods: {
    doUpdate (data) {
      return this.params.onManager('update', {
        id: data.id,
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          id: this.params.data[0].id,
        }
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
