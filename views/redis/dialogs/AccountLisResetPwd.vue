<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">{{$t('db.text_201')}}</div>
        <div slot="body">
             <dialog-selected-tips :name="params.name ? params.name : $t('dictionary.elasticcaches')" :count="params.data.length" :action="$t('db.text_201')" />
            <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
            <a-form slot="body" :form="form.fc" class="mt-3">
              <a-form-item v-bind="formItemLayout" :label="$t('db.text_285')">
                  {{this.params.data[0].name}}
              </a-form-item>
              <a-form-item :label="$t('db.text_286')" v-bind="formItemLayout">
                <server-password :loginTypes="['random', 'password']" :decorator="decorators.loginConfig" />
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
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { passwordValidator } from '@/utils/validate'
// import validateForm from '@/utils/validate'

export default {
  name: 'RedisAccountLisResetPwdDialog',
  components: {
    ServerPassword,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      privileges: ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    decorators () {
      const decorators = {
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
            initialValue: undefined,
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
        if (values.loginType === 'random') {
          values.reset_password = true
        }
        const params = {
          ...values,
        }
        if (this.params.redisItem) {
          params.elasticcache = this.params.redisItem.id
        }
        delete params.checkPassword
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: this.params.steadyStatus,
          managerArgs: {
            action: 'reset-password',
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
