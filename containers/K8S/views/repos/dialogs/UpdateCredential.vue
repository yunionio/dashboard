<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('k8s.repo.credential.update') }}</div>
    <div slot="body">
      <a-spin :spinning="loadingDetail">
        <a-form v-if="!loadingDetail" :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
          <a-form-item :label="$t('k8s.text_54')">
            <a-input
              v-decorator="decorators.username"
              :placeholder="$t('common.tips.input', [$t('k8s.text_54')])" />
          </a-form-item>
          <a-form-item :label="$t('k8s.text_56')">
            <a-input-password
              v-decorator="decorators.password"
              :placeholder="$t('common.tips.input', [$t('k8s.text_56')])" />
          </a-form-item>
        </a-form>
      </a-spin>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="loadingDetail">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog" :disabled="loading">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

function pickUsername (config) {
  if (!config) return ''
  return config.common?.username || config.custom?.username || config.harbor?.username || ''
}

export default {
  name: 'ReposUpdateCredentialDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      loadingDetail: true,
      initialUsername: '',
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
    }
  },
  computed: {
    record () {
      const data = this.params.data
      return Array.isArray(data) ? data[0] : data
    },
    decorators () {
      return {
        username: [
          'username',
          {
            initialValue: this.initialUsername,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('k8s.text_54')]) },
            ],
          },
        ],
        password: [
          'password',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('k8s.text_56')]) },
            ],
          },
        ],
      }
    },
  },
  created () {
    this.fetchUsername()
  },
  methods: {
    async fetchUsername () {
      const id = this.record?.id
      if (!id) {
        this.loadingDetail = false
        return
      }
      try {
        const manager = new this.$Manager('container_registries', 'v1')
        const { data } = await manager.getSpecific({ id, spec: 'config' })
        this.initialUsername = pickUsername(data)
      } catch (e) {
        this.initialUsername = ''
      } finally {
        this.loadingDetail = false
      }
    },
    async handleConfirm () {
      const values = await this.form.fc.validateFields().catch(() => null)
      if (!values) return
      this.loading = true
      try {
        const manager = new this.$Manager('container_registries', 'v1')
        await manager.performAction({
          id: this.record.id,
          action: 'update-credential',
          data: {
            username: values.username,
            password: values.password,
          },
        })
        this.$message.success(this.$t('common.success'))
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
