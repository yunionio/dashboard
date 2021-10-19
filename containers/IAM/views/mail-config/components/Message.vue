<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-alert type="warning" :message="$t('system.text_285')" class="mb-2" />
    <a-form-item label="Access Key ID">
      <template v-slot:extra>
        <div>{{$t('system.text_286')}}</div>
        <div class="mb-0">{{ $t('system.text_573') }}</div>
      </template>
      <a-input v-decorator="decorators.access_key_id" />
    </a-form-item>
    <a-form-item label="Access Key Secret">
      <template v-slot:extra>
        <div>{{$t('system.text_287')}}</div>
        <div class="mb-0">{{ $t('system.text_573') }}</div>
      </template>
      <a-input-password v-decorator="decorators.access_key_secret" />
    </a-form-item>
    <a-form-item :label="$t('system.text_288')">
      <template v-slot:extra>
        <div>{{$t('system.text_289')}}</div>
        <div class="mb-0">{{$t('system.text_574')}}</div>
      </template>
      <a-input v-decorator="decorators.signature" />
    </a-form-item>
    <a-form-item :wrapper-col="offsetWrapperCol">
      <a-button type="primary" class="mr-4" @click="handleSubmit" :loading="submiting">{{ $t('common.ok') }}</a-button>
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
      testLoding: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        access_key_id: [
          'access_key_id',
          {
            rules: [
              { required: true, message: this.$t('system.text_291') },
            ],
          },
        ],
        access_key_secret: [
          'access_key_secret',
          {
            rules: [
              { required: true, message: this.$t('system.text_292') },
            ],
          },
        ],
        signature: [
          'signature',
          {
            rules: [
              { required: true, message: this.$t('system.text_293') },
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
            type: 'mobile',
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
              type: 'mobile',
            },
          })
        } else {
          await this.manager.create({
            data: {
              content: values,
              type: 'mobile',
            },
          })
        }
        await this.fetchData()
        this.$message.success(this.$t('system.text_124', [this.$t('system.text_305')]))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_305')]))
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
            type: 'mobile',
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
