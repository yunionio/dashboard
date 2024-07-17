<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.setup_ssh_authentication')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('res.cloudaccount')" :count="params.data.length" :action="$t('cloudenv.setup_ssh_authentication')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('cloudenv.ssh_authentication')" prop="saml_auth">
          <a-radio-group v-model="fd.saml_auth">
            <a-radio :value="true">{{$t('cloudenv.turn_on')}}</a-radio>
            <a-radio :value="false">{{$t('cloudenv.turn_off')}}</a-radio>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
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
  name: 'CloudaccountSetSamlAuthDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      fd: {
        saml_auth: this.params.data[0].saml_auth || false,
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  created () {
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        await this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: {
            data: {
              saml_auth: this.fd.saml_auth,
            },
          },
        })
        this.cancelDialog()
        this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
