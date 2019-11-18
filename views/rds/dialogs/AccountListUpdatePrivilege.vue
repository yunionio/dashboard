<template>
    <base-dialog @cancel="cancelDialog" :width="900">
        <div slot="header">修改权限</div>
        <a-form slot="body" :form="form.fc" class="mt-3">
           {{params.data[0].dbinstanceprivileges}}
          <dialog-selected-tips :count="params.data.length" :action="params.title" />
          <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
          <account-privileges :privileges="params.data[0].dbinstanceprivileges || []" />
        </a-form>
         <div slot="footer">
            <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
            <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
         </div>
    </base-dialog>
</template>

<script>
import AccountPrivileges from '../components/AccountPrivileges'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm, { passwordValidator } from '@/utils/validate'

export default {
  name: 'RDSAccountListUpdatePrivilegeDialog',
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
              { required: true, message: '请输入名称' },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        account_privilege: [
          'account_privilege',
          {
            initialValue: 'read',
            rules: [{ required: true, message: '请输入名称' }],
          },
        ],
        password: [
          'password',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入密码' },
              { validator: passwordValidator },
            ],
          },
        ],
        checkPassword: [
          'checkPassword',
          {
            initialValue: initialValues.ip_list,
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
          dbinstance: this.params.redisItem.id,
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
