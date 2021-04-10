<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_276')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_276')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_308')">
          <server-password :decorator="decorators.loginConfig" :login-types="loginTypes" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_1229')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_start" :disabled="form.fi.disableAutoStart" />
        </a-form-item>
        <template v-if="enableMFA">
          <a-form-item :label="$t('table.title.mfa_validate')">
            <a-input type="number" v-decorator="decorators.mfa" />
          </a-form-item>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ServerPassword from '@Compute/sections/ServerPassword'
import { LOGIN_TYPES_MAP } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap
export default {
  name: 'VmResetPasswordDialog',
  components: {
    ServerPassword,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let autoStartInitialValue = true
    let disableAutoStart = false
    const noAutoStartHyper = [hypervisorMap.azure.key, hypervisorMap.openstack.key]
    const firstData = this.params.data && this.params.data[0]
    if (firstData && firstData.status === 'running') {
      autoStartInitialValue = false
      disableAutoStart = true
    }
    if (firstData && firstData.hypervisor) {
      const hyper = firstData.hypervisor.toLowerCase()
      if (noAutoStartHyper.includes(hyper)) {
        autoStartInitialValue = false
        disableAutoStart = true
      }
    }
    return {
      loading: false,
      loginTypes: [LOGIN_TYPES_MAP.random.key, LOGIN_TYPES_MAP.password.key],
      form: {
        fc: this.$form.createForm(this),
        fi: {
          disableAutoStart,
        },
      },
      decorators: {
        loginConfig: {
          loginType: [
            'loginType',
            {
              initialValue: LOGIN_TYPES_MAP.random.key,
            },
          ],
        },
        auto_start: [
          'auto_start',
          {
            initialValue: autoStartInitialValue,
            valuePropName: 'checked',
          },
        ],
        mfa: [
          'mfa',
          {
            rules: [
              { required: true, message: this.$t('table.validate.mfa') },
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
  computed: {
    enableMFA () {
      return this.$store.getters.userInfo.enable_mfa && this.$store.state.auth.auth.system_totp_on
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (values.mfa) {
          await this.$http({
            method: 'POST',
            url: '/v1/auth/passcode',
            data: {
              passcode: values.mfa,
            },
          })
        }
        delete values.mfa
        const ids = this.params.data.map(item => item.id)
        const data = { reset_password: true, auto_start: values.auto_start }
        if (values.loginType === LOGIN_TYPES_MAP.password.key) {
          data.password = values.password
        }
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'deploy',
            data,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
