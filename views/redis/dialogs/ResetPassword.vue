<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" class="mt-3">
        <a-form-item v-if="this.params.data[0].provider === 'Huawei'" :label="$t('db.text_291')" v-bind="formItemLayout">
           <a-input-password v-decorator="decorators.old_password" />
        </a-form-item>
        <a-form-item :label="$t('db.text_286')" v-bind="formItemLayout">
            <server-password :loginTypes="['random', 'password']" :decorator="decorators.loginConfig" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ServerPassword from '@Compute/sections/ServerPassword'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { passwordValidator } from '@/utils/validate'

export default {
  name: 'RedisResetPassworddialog',
  components: {
    ServerPassword,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      loading: false,
    }
  },
  computed: {
    decorators () {
      const decorators = {
        old_password: [
          'old_password',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_207') },
              { validator: passwordValidator },
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
        this.loading = false
        const values = await this.validateForm()
        if (values.loginType === 'random') {
          values.reset_password = true
        }
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: 'running',
          managerArgs: {
            action: 'reset-password',
            data: {
              ...values,
            },
          },
        })
        this.cancelDialog()
        this.params.refresh()
        this.$message.success(this.$t('db.text_149'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
