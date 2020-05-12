<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更改密码</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item label="旧密码" v-bind="formItemLayout">
          <a-input-password v-decorator="decorators.password_old" placeholder="输入旧密码" />
        </a-form-item>
        <a-form-item label="新密码" v-bind="formItemLayout">
          <a-input-password v-decorator="decorators.password_new" placeholder="输入新密码" />
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
    const validatePassword = async (rule, value, callback) => {
      if (this.minPasswordLen) {
        if (value.length < this.minPasswordLen) return callback(new Error(`最少${this.minPasswordLen}位字符`))
        return callback()
      }
      const manager = new this.$Manager('services', 'v1')
      try {
        const response = await manager.list({
          params: {
            type: 'identity',
          },
        })
        const id = response.data.data && response.data.data[0] && response.data.data[0]['id']
        if (id) {
          const configRes = await manager.getSpecific({
            id,
            spec: 'config',
          })
          const len = configRes.data.config && configRes.data.config.default && configRes.data.config.default.password_minimal_length
          if (len) {
            this.minPasswordLen = len
            if (value.length < len) return callback(new Error(`最少${len}位字符`))
          }
        }
        return callback()
      } catch (error) {
        callback()
        throw error
      }
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
            ],
          },
        ],
        password_new: [
          'password_new',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '新密码不能为空' },
              { validator: validatePassword },
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
    this.manager = new this.$Manager('auth', 'v1')
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
      return this.manager.performClassAction({
        action: 'password',
        data: values,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const data = {
          ...values,
        }
        data.password_confirm = values.password_new
        this.loading = true
        await this.doUpdatePassword(data)
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
