<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_479')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.user')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('scope.text_245')" v-if="params.data.length<=1">
          <a-input :placeholder="$t('system.displayname_tip')" v-decorator="decorators.displayname" />
        </a-form-item>
        <a-form-item :label="$t('system.text_475')">
          <a-switch :checkedChildren="$t('system.text_134')" :unCheckedChildren="$t('system.text_135')" v-decorator="decorators['allow_web_console']" />
        </a-form-item>
        <a-form-item :label="$t('system.text_483')" :extra="mfaExtra">
          <a-switch :disabled="!!mfaExtra" :checkedChildren="$t('system.text_134')" :unCheckedChildren="$t('system.text_135')" v-decorator="decorators['enable_mfa']" />
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
  name: 'UserUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        allow_web_console: [
          'allow_web_console',
          {
            initialValue: this.params.data[0].allow_web_console,
            valuePropName: 'checked',
          },
        ],
        enable_mfa: [
          'enable_mfa',
          {
            initialValue: this.params.data[0].enable_mfa,
            valuePropName: 'checked',
          },
        ],
        displayname: [
          'displayname',
          {
            initialValue: this.params.data[0].displayname || '',
            rules: [{ required: false }],
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
      mfaExtra: '',
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('services', 'v1')
    this.fetchApiServiceConfig()
  },
  methods: {
    async fetchApiServiceConfig () {
      try {
        const serviceRes = await this.manager.list({
          params: {
            type: ['yunionapi'],
          },
        })
        if (serviceRes.data.data && serviceRes.data.data[0]) {
          const id = serviceRes.data.data[0].id
          const configRes = await this.manager.getSpecific({
            id,
            spec: 'config',
          })
          const config = (configRes.data.config && configRes.data.config.default) || {}
          if (!config.enable_totp) {
            this.mfaExtra = this.$t('system.text_509')
          }
          return config
        }
      } catch (error) {
        if (error.response && error.response.status) {
          this.mfaExtra = this.$t('system.text_510')
        }
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      const { data = [], onManager } = this.params
      try {
        const values = await this.form.fc.validateFields()
        let isSelf = false
        await onManager('batchUpdate', {
          id: data.map(({ id }) => {
            if (id === this.userInfo.id) isSelf = true
            return id
          }),
          managerArgs: {
            data: values,
          },
        })
        this.cancelDialog()
        // 当是本人时，更新用户信息
        if (data.length === 1 && isSelf) {
          await this.$store.dispatch('auth/getInfo')
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
