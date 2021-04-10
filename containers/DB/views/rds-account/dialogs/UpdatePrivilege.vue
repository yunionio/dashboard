<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{$t('db.text_203')}}</div>
    <a-form :form="form.fc" class="mt-3" slot="body">
      <dialog-selected-tips :name="$t('dictionary.dbinstanceaccounts')" :action="params.title" :count="params.data.length" />
      <dialog-table :columns="params.columns.slice(0, 3)" :data="params.data" />
      <a-form-item  v-bind="formItemLayout" :label="$t('db.text_344')" v-if="params.rdsItem.provider === 'Qcloud'">
        <template #extra>
          <div>
            <p class="mb-0">{{$t('db.text_345')}}</p>
            <p class="mb-0">{{$t('db.text_346')}}</p>
          </div>
        </template>
        <a-textarea :auto-size="{ minRows: 3, maxRows: 5 }" v-decorator="decorators.host" disabled />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :label="$t('db.text_28')">
        <account-privileges
          :privileges="params.data[0].dbinstanceprivileges || []"
          :rdsItem="params.rdsItem" />
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import AccountPrivileges from '../components/AccountPrivileges'
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm, { passwordValidator } from '@/utils/validate'

export default {
  name: 'RDSAccountUpdatePrivilegeDialog',
  components: {
    AccountPrivileges,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
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
              { validator: validateForm('serverName') },
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
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: ['available'],
          managerArgs: {
            action: 'set-privileges',
            data: values,
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
