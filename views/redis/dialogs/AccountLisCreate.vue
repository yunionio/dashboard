<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('db.text_282')}}</div>
    <a-form slot="body" :form="form.fc" class="mt-3" v-bind="formItemLayout">
      <a-form-item :label="$t('db.text_283')">
        <a-input :placeholder="$t('validator.dbName')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('db.text_284')">
        <a-radio-group v-decorator="decorators.account_privilege">
          <a-radio v-for="k in Object.keys(privileges)" :key="k" :value="k">
            {{privileges[k]}}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('db.text_195')">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm, { passwordValidator } from '@/utils/validate'

export default {
  name: 'RedisAccountDialog',
  components: {
    ServerPassword,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      loginTypes: ['random', 'password'],
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 19 },
        labelCol: { span: 5 },
      },
    }
  },
  computed: {
    privileges () {
      const ret = ACCOUNT_PRIVILEGES
      if (this.params.redisItem.brand === 'Qcloud') {
        delete ret.repl
      }
      return ret
    },
    decorators () {
      const { initialValues = {} } = this.params
      const decorators = {
        name: [
          'name',
          {
            initialValue: initialValues.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_136') },
              { validator: validateForm('dbName') },
            ],
          },
        ],
        account_privilege: [
          'account_privilege',
          {
            initialValue: 'read',
            rules: [{ required: true, message: this.$t('db.text_136') }],
          },
        ],
        password: [
          'password',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_207') },
              { validator: passwordValidator },
            ],
          },
        ],
        checkPassword: [
          'checkPassword',
          {
            initialValue: initialValues.ip_list,
            rules: [
              { required: true, message: this.$t('db.text_208') },
              { validator: this.rulesCheckPassword },
            ],
          },
        ],
        loginConfig: {
          loginType: [
            'loginType',
            {
              initialValue: 'random',
            },
          ],
        },
      }
      return decorators
    },
  },
  methods: {
    rulesCheckPassword (rule, value, callback) {
      const form = this.form.fc
      if (value && value !== form.getFieldValue('password')) {
        callback(new Error(this.$t('db.text_209')))
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
        if (params.loginType === 'random') {
          params.reset_password = true
        }
        delete params.checkPassword
        delete params.loginType
        await this.params.list.onManager('create', {
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
