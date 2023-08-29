<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_276')}}</div>
    <div slot="body">
      <a-alert v-if="enableQgaAlert" class="mb-2" type="warning">
        <div slot="message">
          {{ $t('compute.qga.alert01') }}（<help-link :href="qgaDoc">{{ $t('compute.qga.alert02') }}</help-link>），{{ $t('compute.qga.alert03') }}
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_276')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item v-if="isSingle" :label="$t('common_312')">
          <a-input v-decorator="decorators.username" />
        </a-form-item>
        <a-form-item :label="$t('compute.qga.password')">
          <server-password :decorator="decorators.loginConfig" :login-types="loginTypes" />
        </a-form-item>
        <a-form-item v-if="enableAutoStart" :label="$t('compute.text_494')" :extra="$t('compute.text_1229')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_start" :disabled="form.fi.disableAutoStart" />
        </a-form-item>
        <p v-if="!checkQgaOK" class="error-color">{{ $t('compute.reset_password.qga_tooltip') }}</p>
      </a-form>
    </div>
    <div slot="footer">
      <a-tooltip :title="checkQgaOK ? undefined : $t('compute.reset_password.qga_tooltip')">
        <a-button :class="{ 'mr-1': !checkQgaOK }" type="primary" @click="handleConfirm" :loading="loading" :disabled="!checkQgaOK">{{ $t('dialog.ok') }}</a-button>
      </a-tooltip>
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
import { getDoc, DOC_MAP } from '@/utils/docs'

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
    const login_account = firstData.metadata?.login_account
    const userName = {
      Linux: 'root',
      Windows: 'Administrator',
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
        username: [
          'username',
          {
            initialValue: login_account || userName[firstData.os_type],
          },
        ],
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
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      qgaDoc: getDoc(DOC_MAP.QGA),
      checkQgaOK: true,
    }
  },
  computed: {
    enableMFA () {
      return this.$store.getters.userInfo.enable_mfa && this.$store.state.auth.auth.system_totp_on
    },
    selectedItems () {
      return this.params.data
    },
    selectedItem () {
      return this.selectedItems[0]
    },
    enableAutoStart () {
      return this.selectedItems.some(item => item.status === 'ready')
    },
    isAllKvm () {
      return this.selectedItems.every(item => item.hypervisor === hypervisorMap.kvm.key)
    },
    enableQgaAlert () {
      return this.isAllKvm && this.selectedItems.some(item => item.status === 'running')
    },
    isSingle () {
      return this.selectedItems?.length === 1
    },
    isAllRunning () {
      return this.selectedItems.every(item => item.status === 'running')
    },
    isSupportQgaPing () {
      return this.isAllKvm && this.isAllRunning && this.isSingle
    },
  },
  created () {
    this.isSupportQgaPing && this.fetchQgaPing()
  },
  methods: {
    async fetchQgaPing () {
      try {
        const res = await new this.$Manager('servers', 'v2').performAction({
          id: this.selectedItem.id,
          action: 'qga-ping',
          data: {
            timeout: 100,
          },
        })

        if (res.data?.ping_error) {
          this.checkQgaOK = false
        } else {
          this.checkQgaOK = true
        }
      } catch (error) {
        this.checkQgaOK = false
      }
    },
    async doSetPassword (values) {
      const ids = this.selectedItems.map(item => item.id)
      const data = { reset_password: true, auto_start: values.auto_start }

      if (values.loginType === LOGIN_TYPES_MAP.password.key) {
        data.password = values.password
      }
      if (this.isSingle && values.username) {
        data.username = values.username
      }

      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'set-password',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const callback = async () => {
          this.loading = true
          await this.doSetPassword(values)
          this.$message.success(this.$t('message.exec_success'))
          this.cancelDialog()
        }
        if (this.enableMFA) {
          this.createDialog('SecretVertifyDialog', {
            action: this.$t('table.title.mfa_validate'),
            success: callback,
          })
        } else {
          callback()
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
