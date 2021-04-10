<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_361')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_361')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('compute.text_1182')" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.keypair"
            resource="keypairs"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1183') }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" v-bind="formItemLayout" :extra="$t('compute.text_1184')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_start" :disabled="isSomeRunning" />
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
  name: 'VmBindKeypairDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const autoStart = this.params.data.some(val => val.status === 'running')
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        keypair: [
          'keypair',
          {
            rules: [
              { required: true, message: this.$t('compute.text_203'), trigger: 'blur' },
            ],
          },
        ],
        auto_start: [
          'auto_start',
          {
            initialValue: autoStart,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    isSomeRunning () {
      return this.params.data.some(val => val.status === 'running')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'deploy',
            data: values,
          },
        })
        this.$bus.$emit('VMInstanceListSingleUpdate', [this.params.data[0].id])
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
