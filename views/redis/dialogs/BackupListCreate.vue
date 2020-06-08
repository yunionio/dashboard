<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">创建备份</div>
    <a-form slot="body" :form="form.fc" class="mt-3">
      <a-form-item v-bind="formItemLayout" label="名称">
        <a-input placeholder="以字母开头，由小写字母，数字、下划线组成。长度不超过16个字符" v-decorator="decorators.name" />
        <name-repeated v-slot:extra res="dbinstancebackups" :name="form.fc.getFieldValue('name')" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" label="描述">
        <a-textarea placeholder="请输入描述信息"
        :autosize="{ minRows: 4, maxRows: 7 }"
        v-decorator="decorators.description" />
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
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'

export default {
  name: 'BackupListCreate',
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
        description: [
          'description',
          {
            initialValue: initialValues.ip_list,
            rules: [
              { max: 200, message: '长度不能大于200' },
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
