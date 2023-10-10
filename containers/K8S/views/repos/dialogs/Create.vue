<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('common.name')">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('k8s.text_34')">
          <base-select
            v-decorator="decorators.type"
            :options="TYPE_OPTIONS"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('k8s.text_34')])}" />
        </a-form-item>
        <a-form-item :label="$t('k8s.repo.url')" :extra="$t('k8s.repo.url.extra')">
          <a-input
            v-decorator="decorators.url"
            :placeholder="$t('common.tips.input', [$t('k8s.repo.url')])" />
        </a-form-item>
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
import { TYPE_OPTIONS } from '../constants'

export default {
  name: 'ReposCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      TYPE_OPTIONS,
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        type: [
          'type',
          {
            initialValue: TYPE_OPTIONS[0].value,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('k8s.text_34')]) },
            ],
          },
        ],
        url: [
          'url',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('k8s.repo.url')]) },
            ],
          },
        ],
        username: [
          'username',
          {
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
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
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
      try {
        const { username, password, ...rest } = await this.form.fc.validateFields()
        const manager = new this.$Manager('container_registries', 'v1')
        const data = {
          ...rest,
          config: {
            common: {
              username,
              password,
            },
          },
        }
        await manager.create({ data })
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
