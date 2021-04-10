<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{isUpdate ? $t('storage.text_192') : $t('storage.text_193')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('storage.text_194')" v-bind="formItemLayout">
          <a-textarea
            v-decorator="decorators.allowed_origins"
            :placeholder="$t('storage.text_195')"
            :auto-size="{ minRows: 5, maxRows: 8 }" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_196')" v-bind="formItemLayout">
          <a-checkbox-group
            v-decorator="decorators.allowed_methods"
            :options="methodsOptions" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_197')" v-bind="formItemLayout">
          <a-textarea
            v-decorator="decorators.allowed_headers"
            :auto-size="{ minRows: 5, maxRows: 8 }" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_198')" v-bind="formItemLayout">
          <a-textarea
            v-decorator="decorators.expose_headers"
            :auto-size="{ minRows: 5, maxRows: 8 }" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_199')" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.max_age_seconds" :min="0" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CreateCorsDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        allowed_origins: [
          'allowed_origins',
          {
            initialValue: this.params.data && this.params.data[0].allowed_origins ? this.params.data[0].allowed_origins.join('\n') : '',
            rules: [
              { required: true, message: this.$t('storage.text_200') },
            ],
          },
        ],
        allowed_methods: [
          'allowed_methods',
          {
            initialValue: this.params.data && this.params.data[0].allowed_methods ? this.params.data[0].allowed_methods : [],
            rules: [
              { required: true, message: this.$t('storage.text_201') },
            ],
          },
        ],
        allowed_headers: [
          'allowed_headers',
          {
            initialValue: this.params.data && this.params.data[0].allowed_headers ? this.params.data[0].allowed_headers.join('\n') : '',
            rules: [
              { required: true, message: this.$t('storage.text_202') },
            ],
          },
        ],
        expose_headers: [
          'expose_headers',
          {
            initialValue: this.params.data && this.params.data[0].expose_headers ? this.params.data[0].expose_headers.join('\n') : '',
            rules: [
              { required: true, message: this.$t('storage.text_203') },
            ],
          },
        ],
        max_age_seconds: [
          'max_age_seconds',
          {
            initialValue: this.params.data && this.params.data[0].max_age_seconds ? this.params.data[0].max_age_seconds : 0,
            rules: [
              { required: true, message: this.$t('storage.text_204') },
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
      methodsOptions: [
        { label: 'PUT', value: 'PUT' },
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'HEAD', value: 'HEAD' },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    isUpdate () {
      return !!(this.params.data && this.params.data[0])
    },
  },
  methods: {
    genData (data) {
      const ret = {
        ...data,
        allowed_headers: data.allowed_headers.trim().split('\n'),
        allowed_origins: data.allowed_origins.trim().split('\n'),
        expose_headers: data.expose_headers.trim().split('\n'),
      }
      if (this.params.data && this.params.data[0].id) ret.id = this.params.data[0].id
      return ret
    },
    doCreate (data) {
      return new this.$Manager('buckets').performAction({
        id: this.params.bucketID,
        action: 'set-cors',
        data: {
          data: [
            { ...data },
          ],
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = this.genData(values)
        await this.doCreate(data)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
