<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">创建账号</div>
        <div slot="body">
            <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
            <a-form slot="body" :form="form.fc" class="mt-3">
              <a-form-item label="账号名称">
                  {{this.params.data[0].name}}
              </a-form-item>
              <a-form-item label="新密码">
                  <a-input placeholder="请输入新密码" v-decorator="decorators.password" />
              </a-form-item>
              <a-form-item label="确认密码">
                  <a-input placeholder="请再次确认密码" v-decorator="decorators.checkPassword" />
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
import { ACCOUNT_PRIVILEGES } from '../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import validateForm from '@/utils/validate'

export default {
  name: 'RedisAccountLisResetPwdDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      privileges: ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  computed: {
    decorators () {
      const decorators = {
        password: [
          'password',
          {
            initialValue: undefined,
            rules: [
              { required: true, message: '请输入密码' },
            ],
          },
        ],
        checkPassword: [
          'checkPassword',
          {
            initialValue: undefined,
            rules: [
              { required: true, message: '请再次确认密码' },
              { validator: this.rulesCheckPassword },
            ],
          },
        ],
      }
      return decorators
    },
  },
  methods: {
    rulesCheckPassword (rule, value, callback) {
      const form = this.form.fc
      if (value && value !== form.getFieldValue('password')) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
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
        const params = {
          ...values,
          elasticcache: this.params.redisItem.id,
        }
        delete params.checkPassword
        await this.params.list.onManager('batchPost', {
          managerArgs: {
            data: params,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
