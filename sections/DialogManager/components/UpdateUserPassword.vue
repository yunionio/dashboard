<template>
  <base-dialog @cancel="cancelDialog" :width="620">
    <div slot="header">{{$t('common_135')}}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item :label="$t('common_136')" v-bind="formItemLayout">
          <a-input-password v-decorator="decorators.password_old" :placeholder="$t('common_137')" />
        </a-form-item>
        <a-form-item :label="$t('common_138')" v-bind="formItemLayout">
          <a-input-password v-decorator="decorators.password_new" :placeholder="$t('common_139')" />
        </a-form-item>
        <a-form-item :label="$t('common_140')" v-bind="formItemLayout">
          <a-input-password v-decorator="decorators.com_password" :placeholder="$t('common_141')" />
        </a-form-item>
        <a-form-item :label="$t('common_142')" v-bind="formItemLayout" v-if="userInfo.enable_mfa && userInfo.system_totp_on">
          <a-input v-decorator="decorators.passcode" :placeholder="$t('common_142')" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { passwordLevel } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UpdateUserPasswordDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validatePassword = async (rule, value, callback) => {
      if (R.isNil(this.minPasswordLen) || R.isNil(this.complexity)) {
        const manager = new this.$Manager('services', 'v1')
        try {
          const response = await manager.list({
            params: {
              type: 'identity',
            },
          })
          const id = response.data.data && response.data.data[0] && response.data.data[0].id
          if (id) {
            const configRes = await manager.getSpecific({
              id,
              spec: 'config',
            })
            const len = configRes.data.config && configRes.data.config.default && configRes.data.config.default.password_minimal_length
            const complexity = configRes.data.config && configRes.data.config.default && configRes.data.config.default.password_char_complexity
            if (!R.isNil(len)) {
              this.minPasswordLen = len
            }
            if (!R.isNil(complexity)) {
              this.complexity = complexity
            }
          }
        } catch (error) {
          callback()
          throw error
        }
      }
      const passLevel = passwordLevel(value)
      const passMaxLen = Math.max(this.minPasswordLen, this.complexity)
      if (passLevel < this.complexity || passMaxLen < passLevel || value.length < passMaxLen) {
        return callback(new Error(this.$t('validator.passwordLevel', [this.complexity === 0 ? 1 : this.complexity, passMaxLen])))
      }
      return callback()
    }
    return {
      loading: false,
      minPasswordLen: null,
      complexity: null,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        password_old: [
          'password_old',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('common_144') },
            ],
          },
        ],
        password_new: [
          'password_new',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('common_145') },
              { validator: validatePassword },
            ],
          },
        ],
        com_password: [
          'com_password',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('common_146') },
              { validator: this.checkComPassword },
            ],
          },
        ],
        passcode: [
          'passcode',
          {
            rules: [
              { required: true, message: this.$t('common_147') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
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
    checkComPassword (rule, value, callback) {
      const password = this.form.fc.getFieldValue('password_new')
      if (password !== value) {
        callback(new Error(this.$t('common_148')))
      }
      callback()
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
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        await this.$store.dispatch('auth/logout')
        this.$router.push('/auth')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
