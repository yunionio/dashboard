<template>
    <base-dialog @cancel="cancelDialog" :width="900">
        <div slot="header">{{params.title}}</div>
        <a-form slot="body" :form="form.fc" class="mt-3">
            <a-form-item  v-bind="formItemLayout" :label="$t('db.text_60')">
              <a-input :placeholder="$t('validator.dbName')" v-decorator="decorators.name" />
            </a-form-item>
            <a-form-item  v-bind="formItemLayout" :label="$t('db.text_344')" v-if="params.rdsItem.provider === 'Qcloud'">
              <template #extra>
                <div>
                  <p class="mb-0">{{$t('db.text_345')}}</p>
                  <p class="mb-0">{{$t('db.text_346')}}</p>
                </div>
              </template>
              <a-textarea :auto-size="{ minRows: 3, maxRows: 5 }" v-decorator="decorators.host" />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" :label="$t('db.text_28')" v-if="this.params.rdsItem.brand !== 'Google'">
              <account-privileges :rdsItem="params.rdsItem" />
            </a-form-item>
            <a-form-item :label="$t('db.text_195')" v-bind="formItemLayout">
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
import AccountPrivileges from '../components/AccountPrivileges'
import { CreateServerForm } from '@Compute/constants'
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm, { passwordValidator } from '@/utils/validate'

export default {
  name: 'RDSAccountCreateDialog',
  components: {
    AccountPrivileges,
    ServerPassword,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loginTypes: ['random', 'password'],
      loading: false,
      privileges: RDS_ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
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
        host: [
          'host',
          {
            initialValue: initialValues.host,
            rules: [
              { required: true, message: this.$t('db.text_347') },
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
  created () {
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
          dbinstance: this.params.rdsItem.id,
        }
        delete params.checkPassword
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
