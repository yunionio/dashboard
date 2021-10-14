<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_276')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.user')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('system.text_221')">
          <a-input-password :placeholder="$t('system.text_239')" v-decorator="decorators.password" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UserUpdatePasswordDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    // const validatePassword = async (rule, value, callback) => {
    //   if (this.minPasswordLen) {
    //     if (value.length < this.minPasswordLen) return callback(new Error(this.$t('system.text_485', [this.minPasswordLen])))
    //     return callback()
    //   }
    //   const manager = new this.$Manager('services', 'v1')
    //   try {
    //     const response = await manager.list({
    //       params: {
    //         type: 'identity',
    //       },
    //     })
    //     const id = response.data.data && response.data.data[0] && response.data.data[0].id
    //     if (id) {
    //       const configRes = await manager.getSpecific({
    //         id,
    //         spec: 'config',
    //       })
    //       const len = configRes.data.config && configRes.data.config.default && configRes.data.config.default.password_minimal_length
    //       if (len) {
    //         this.minPasswordLen = len
    //         if (value.length < len) return callback(new Error(this.$t('system.text_485', [len])))
    //       }
    //     }
    //     return callback()
    //   } catch (error) {
    //     callback()
    //     throw error
    //   }
    // }
    return {
      loading: false,
      minPasswordLen: null,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        password: [
          'password',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('system.text_486'), trigger: 'blur' },
              // { validator: validatePassword, trigger: 'blur' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const { data, onManager } = this.params
      try {
        const values = await this.form.fc.validateFields()
        onManager('patch', {
          id: data[0].id,
          managerArgs: {
            data: {
              ...values,
              skip_password_complexity_check: true,
            },
          },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
