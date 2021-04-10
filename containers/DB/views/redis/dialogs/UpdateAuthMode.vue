<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <div class="mb-3">
        <a-alert :showIcon="false" :message="alertMsg" banner />
      </div>
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" class="mt-3">
        <a-form-item
          :label="$t('db.text_286')"
          v-bind="formItemLayout"
          v-if="params.data[0].provider === 'Qcloud' && params.data[0].auth_mode === 'off'"
          :extra="$t('db.text_359')">
          <server-password :loginTypes="['random', 'password']" :decorator="decorators.loginConfig" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { BUY_DURATIONS_OPTIONS } from '../constants/index.js'
import { CreateServerForm } from '@Compute/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisUpdateAuthModeDialog',
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
      BUY_DURATIONS_OPTIONS,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      decorators: {
        loginConfig: {
          loginType: [
            'loginType',
            {
              initialValue: 'random',
            },
          ],
        },
      },
    }
  },
  computed: {
    alertMsg () {
      const data = this.params.data[0]
      if (data.auth_mode !== 'on') {
        return this.$t('db.text_292')
      } else {
        return this.$t('db.text_293')
      }
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (this.params.data[0].provider === 'Qcloud' && this.params.data[0].auth_mode === 'off') {
          const values = await this.form.fc.validateFields()
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
        } else {
          await this.params.onManager('performAction', {
            steadyStatus: 'running',
            id: this.params.data[0].id,
            managerArgs: {
              action: 'update-auth-mode',
              data: {
                auth_mode: this.params.data[0].auth_mode === 'on' ? 'off' : 'on',
              },
            },
          })
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
