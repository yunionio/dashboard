<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_202')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_727')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.text_728')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_725')" v-bind="formItemLayout">
          <a-textarea v-decorator="decorators.public_key" :placeholder="$t('compute.text_729')" :rows="4" />
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
import debounce from 'lodash/debounce'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CreateKeyPairDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const publicKeyNameDuplicate = debounce((rule, value, callback) => {
      const manager = new this.$Manager('keypairs')
      manager.list({
        params: { filter: `name.equals(${value})` },
      }).then((res) => {
        const len = res.data.data.length
        let msg
        if (len === 0) {
          callback()
        } else {
          msg = this.$t('compute.text_730')
          callback(msg)
        }
      }).catch((e) => {
        // 忽略服务器端错误。直接在页面显示错误提示即可
        callback()
      })
    }, 500)
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_728') },
              { validator: this.$validate('secretKeyName') },
              { validator: publicKeyNameDuplicate },
            ],
          },
        ],
        public_key: [
          'public_key',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_729') },
              { validator: this.$validate('publicKey') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
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
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
