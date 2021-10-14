<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-form-item :label="$t('system.text_269')">
      <a-input v-decorator="decorators.hostname" />
    </a-form-item>
    <a-form-item label="SSL">
      <a-switch :checkedChildren="$t('system.text_134')" :unCheckedChildren="$t('system.text_135')" v-decorator="decorators.ssl_global" />
    </a-form-item>
    <a-form-item :label="$t('system.text_270')">
      <a-input-number v-decorator="decorators.hostport" :min="1" :max="65535" />
    </a-form-item>
    <a-form-item :label="$t('system.text_126')">
      <a-input v-decorator="decorators.username" />
    </a-form-item>
    <a-form-item :label="$t('system.text_221')">
      <a-input-password v-decorator="decorators.password" />
    </a-form-item>
    <a-form-item :wrapper-col="offsetWrapperCol">
      <a-button type="primary" @click="handleSubmit" :loading="submiting">{{ $t('common.ok') }}</a-button>
      <test-button v-if="false" class="ml-3" :post="testPost" />
    </a-form-item>
  </a-form>
</template>

<script>
import TestButton from '@/sections/TestButton'
export default {
  name: 'EmailConfig',
  components: {
    TestButton,
  },
  props: {
    formItemLayout: {
      required: true,
      type: Object,
    },
    offsetWrapperCol: {
      required: true,
      type: Object,
    },
    loading: Boolean,
  },
  data () {
    return {
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        hostname: [
          'hostname',
          {
            rules: [
              { required: true, message: this.$t('system.text_271') },
            ],
          },
        ],
        ssl_global: [
          'ssl_global',
          {
            valuePropName: 'checked',
          },
        ],
        hostport: [
          'hostport',
          {
            rules: [
              { required: true, message: this.$t('system.text_272') },
            ],
          },
        ],
        username: [
          'username',
          {
            rules: [
              { required: true, message: this.$t('system.text_238') },
            ],
          },
        ],
        password: [
          'password',
          {
            rules: [
              { required: true, message: this.$t('system.text_239') },
            ],
          },
        ],
      },
      contactData: null,
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('notifyconfigs', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.$emit('update:loading', true)
      try {
        const response = await this.manager.list({
          params: {
            type: 'email',
          },
        })
        const data = response.data.data[0] || {}
        this.contactData = data
        this.$nextTick(() => {
          this.form.fc.setFieldsValue(data.content)
        })
      } catch (error) {
        throw error
      } finally {
        this.$emit('update:loading', false)
      }
    },
    async handleSubmit () {
      const values = await this.form.fc.validateFields()
      try {
        this.submiting = true
        if (this.contactData && this.contactData.id) {
          await this.manager.update({
            id: this.contactData.id,
            data: {
              content: values,
              type: 'email',
            },
          })
        } else {
          await this.manager.create({
            data: {
              content: values,
              type: 'email',
            },
          })
        }
        await this.fetchData()
        this.$message.success(this.$t('system.text_124', [this.$t('system.text_302')]))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_302')]))
        throw error
      } finally {
        this.submiting = false
      }
    },
    async testPost () {
      try {
        const values = await this.form.fc.validateFields()
        await new this.$Manager('notifyconfigs', 'v1').performClassAction({
          action: 'validate',
          data: {
            content: values,
            type: 'email',
          },
        })
      } catch (error) {
        this.$message.error(this.$t('common_623', [this.$t('common_269')]))
        throw error
      }
    },
  },
}
</script>
