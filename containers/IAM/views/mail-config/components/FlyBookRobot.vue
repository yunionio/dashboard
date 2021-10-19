<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-form-item label="webhook">
      <template v-slot:extra>
        <div>{{$t('system.text_283')}}</div>
        <div class="mb-0">{{ $t('system.text_572') }}</div>
      </template>
      <a-input v-decorator="decorators.webhook" />
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
  name: 'FlyBookRobotConfig',
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
        webhook: [
          'webhook',
          {
            rules: [
              { required: true, message: this.$t('system.text_267') },
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
            type: 'feishu-robot',
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
              type: 'feishu-robot',
            },
          })
        } else {
          await this.manager.create({
            data: {
              content: values,
              type: 'feishu-robot',
            },
          })
        }
        await this.fetchData()
        this.$message.success(this.$t('system.text_124', [this.$t('system.text_304')]))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_304')]))
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
            type: 'feishu-robot',
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
