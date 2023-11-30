<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.rdp_password_tip')}}</div>
    <div slot="body">
      <a-alert type="warning" class="mb-2">
        <div slot="message">{{$t('common.rdp_login_err')}}<help-tooltip :text="errorMsg" class="ml-1" />，{{$t('common.rdp_login_err_msg')}}</div>
      </a-alert>
      <a-form-model ref="form" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item :label="$t('common.operation_object')">
          <list-body-cell-wrap copy :row="{...params.data, text: `${params.data.name} (${params.data.ip || '-'})`}" field="text" hideField>
            <span v-if="params.data.name">{{params.data.name}}</span><span v-if="params.data.ip">{{` （${params.data.ip}）`}}</span>
          </list-body-cell-wrap>
        </a-form-model-item>
        <a-form-model-item :label="$t('scope.text_406')" prop="username">
          <a-input v-model="formData.username" :placeholder="$t('common.tips.input', [$t('scope.text_406')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('common_328')" prop="password">
          <a-input-password v-model="formData.password" :placeholder="$t('common.tips.input', [$t('common_328')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('compute.text_349')" prop="port">
          <a-input v-model="formData.port" :placeholder="$t('compute.text_350')" />
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
import { showErrorNotification } from '@/utils/http'
import { validateModelForm } from '@/utils/validate'

export default {
  name: 'RdpAuthDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initPort = this.params.params?.data?.port || 3389
    const errorMsg = this.params.errorMsg || '-'
    return {
      loading: false,
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      formData: {
        username: '',
        password: '',
        port: initPort,
      },
      rules: {
        username: { required: true, message: this.$t('common.tips.input', [this.$t('scope.text_406')]) },
        password: { required: true, message: this.$t('common.tips.input', [this.$t('common_328')]) },
        port: { required: true, message: this.$t('compute.text_350') },
      },
      errorMsg,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        this.params.manager.performAction({ ...this.params.params, data: { ...this.params.params.data, ...this.formData } }).then(({ data }) => {
          this.params.success && this.params.success(data)
          this.cancelDialog()
        })
      } catch (ex) {
        const { details } = ex.response.data
        showErrorNotification({
          errorMsg: {
            class: this.$t('scope.text_517'),
            detail: details,
          },
        })
      } finally {
        this.loading = false
      }
    },
  },

}
</script>
