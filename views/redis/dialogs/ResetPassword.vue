<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" class="mt-3">
        <a-form-item label="管理员密码" v-bind="formItemLayout">
            <server-password :loginTypes="['random', 'password']" :decorator="decorators.loginConfig" />
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
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import { decorators } from '@DB/views/utils/createElasticcache'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisResetPassworddialog',
  components: {
    ServerPassword,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      decorators,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      loading: false,
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
        this.loading = false
        const values = await this.validateForm()
        if (values.loginType === 'random') {
          values['reset_password'] = true
        } else {
          values['password'] = values.loginPassword
        }
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'reset-password',
            data: {
              ...values,
            },
          },
        })
        this.cancelDialog()
        this.$message.success('操作成功')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
