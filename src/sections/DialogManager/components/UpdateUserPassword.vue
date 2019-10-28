<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更新用户密码</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item label="旧密码" v-bind="formItemLayout">
          <a-input v-decorator="decorators.password_old" placeholder="输入旧密码" type="password" />
        </a-form-item>
        <a-form-item label="新密码" v-bind="formItemLayout">
          <a-input v-decorator="decorators.password_new" placeholder="输入新密码" type="password" />
        </a-form-item>
        <a-form-item label="确认密码" v-bind="formItemLayout">
          <a-input v-decorator="decorators.password_confirm" placeholder="确认密码" type="password" />
        </a-form-item>
        <a-form-item label="MFA安全码" v-bind="formItemLayout" v-if="userInfo.enable_mfa && userInfo.system_totp_on">
          <a-input v-decorator="decorators.passcode" placeholder="MFA安全码" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UpdateUserPasswordDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const passwordConfirmValidator = (rule, value, callback) => {
      let msg = '两次密码输入不一致'
      if (value !== this.form.fc.getFieldValue('password_new')) {
        return callback(msg)
      }
      callback()
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        password_old: [
          'password_old',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '旧密码不能为空' },
              { min: 6, message: '最少六位字符' },
            ],
          },
        ],
        password_new: [
          'password_new',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '新密码不能为空' },
              { min: 6, message: '最少六位字符' },
            ],
          },
        ],
        password_confirm: [
          'password_confirm',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '确认密码不能为空' },
              { validator: passwordConfirmValidator },
            ],
          },
        ],
        passcode: [
          'passcode',
          {
            rules: [
              { required: true, message: 'MFA安全码不能为空' },
            ],
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
  computed: mapGetters(['userInfo']),
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('user', 'v1')
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
    doUpdatePassword (values) {
      return this.manager.performAction({
        action: 'password',
        data: values,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doUpdate(values)
        this.cancelDialog()
        this.$store.dispatch('auth/logout')
        this.$router.push('/auth')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
