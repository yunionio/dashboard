<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更新账号密码</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="更新账号密码" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc" v-bind="formItemLayout">
         <a-form-item label="private_key_id">
            <a-input v-decorator="decorators.private_key_id" placeholder="请输入private_key_id" />
        </a-form-item>
        <a-form-item label="private_key">
            <a-textarea :autosize="{ minRows: 3, maxRows: 7 }" v-decorator="decorators.private_key" placeholder="请输入private_key" />
        </a-form-item>
        <a-form-item label="client_email">
            <a-input v-decorator="decorators.client_email" placeholder="请输入client_email" />
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
  name: 'CloudaccountGcpUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const provider = this.params.data[0].brand.toLowerCase()
    return {
      provider,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      decorators: {
        private_key_id: [
          'private_key_id',
          {
            rules: [
              { required: true, message: '请输入private_key_id' },
            ],
          },
        ],
        private_key: [
          'private_key',
          {
            rules: [
              { required: true, message: '请输入private_key' },
            ],
          },
        ],
        client_email: [
          'client_email',
          {
            rules: [
              { required: true, message: '请输入client_email' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ],
          },
        ],
      },
      endpointTypeOpts: [
        { key: 'internal', label: 'internal' },
        { key: 'admin', label: 'admin' },
        { key: 'public', label: 'public' },
      ],
    }
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        const { data } = await this.params.list.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'update-credential',
            data: values,
          },
        })
        this.loading = false
        if (data && data.data && data.data.length === 1 && data.data[0].status !== 200) {
          return false
        }
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
