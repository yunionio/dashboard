<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('db.text_287')}}</div>
    <a-form slot="body" :form="form.fc" class="mt-3">
      <a-form-item v-bind="formItemLayout" :label="$t('db.text_60')">
        <a-input :placeholder="$t('db.text_288')" v-decorator="decorators.name" />
        <name-repeated v-slot:extra res="dbinstancebackups" :name="form.fc.getFieldValue('name')" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :label="$t('db.text_219')">
        <a-textarea :placeholder="$t('db.text_220')"
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
              { required: true, message: this.$t('db.text_136') },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        description: [
          'description',
          {
            initialValue: initialValues.ip_list,
            rules: [
              { max: 200, message: this.$t('db.text_289') },
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
