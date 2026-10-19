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
          <a-radio-group v-decorator="decorators.type" buttonStyle="solid">
            <a-radio-button value="common">{{ $t('k8s.repo.type.common') }}</a-radio-button>
            <a-radio-button value="custom">{{ $t('k8s.repo.type.custom') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('k8s.repo.url')" :extra="isCustomType ? $t('k8s.repo.url.extra.custom') : $t('k8s.repo.url.extra')">
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

export default {
  name: 'ReposCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
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
            initialValue: 'common',
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
              { validator: this.validateUsernamePasswordPair },
            ],
          },
        ],
        password: [
          'password',
          {
            rules: [
              { validator: this.validateUsernamePasswordPair },
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
            // 账密成对校验：改一侧时联动校验另一侧
            if ('username' in values || 'password' in values) {
              this.$nextTick(() => {
                this.form.fc.validateFields(['username', 'password'], { force: true }).catch(() => {})
              })
            }
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
  computed: {
    isCustomType () {
      return this.form.fd.type === 'custom'
    },
  },
  methods: {
    validateUsernamePasswordPair (rule, value, callback) {
      const username = (this.form.fc.getFieldValue('username') || '').trim()
      const password = this.form.fc.getFieldValue('password') || ''
      const hasUsername = !!username
      const hasPassword = !!password
      if ((hasUsername && !hasPassword) || (!hasUsername && hasPassword)) {
        const missing = hasUsername ? this.$t('k8s.text_56') : this.$t('k8s.text_54')
        return callback(new Error(this.$t('common.tips.input', [missing])))
      }
      return callback()
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { username, password, type, ...rest } = await this.form.fc.validateFields()
        const manager = new this.$Manager('container_registries', 'v1')
        const data = {
          ...rest,
          type,
        }
        if (username && password) {
          const configKey = type || 'common'
          data.config = {
            [configKey]: {
              username,
              password,
            },
          }
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
