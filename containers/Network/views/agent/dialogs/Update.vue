<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_74')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.eip')" :count="params.data.length" :action="$t('network.text_74')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" layout="vertical">
        <a-form-item :label="$t('network.text_75')">
          <a-input v-decorator="decorators.hb_timeout" type="Number" :addonAfter="$t('network.text_76')" />
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
              { type: 'integer', min: 600, max: 3600, message: this.$t('network.text_77'), trigger: 'blur' },
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
