<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-alert type="warning" :message="$t('system.text_274')" class="mb-2" />
    <a-form-item :label="$t('system.text_275')">
      <a-input v-decorator="decorators.address" />
    </a-form-item>
    <a-form-item :wrapper-col="offsetWrapperCol">
      <a-button type="primary" @click="handleSubmit" :loading="submiting">{{ $t('common.ok') }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'EmailCallbackConfig',
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
      mailCallbackId: null,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        address: [
          'address',
          {
            rules: [
              { required: true, message: this.$t('system.text_276') },
            ],
          },
        ],
      },
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('parameters', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.$emit('update:loading', true)
      try {
        const response = await this.manager.get({
          id: 'mail-call-back-address',
          params: {
            service: 'itsm',
            scope: this.$store.getters.scope,
          },
        })
        this.mailCallbackId = response.data && response.data.id
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({
            ...response.data.value || {},
          })
        })
      } catch (error) {
        throw error
      } finally {
        this.$emit('update:loading', false)
      }
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.mailCallbackId) {
          await this.manager.update({
            id: this.mailCallbackId,
            data: {
              service: 'itsm',
              value: values,
            },
          })
        } else {
          await this.manager.create({
            data: {
              service: 'itsm',
              name: 'mail-call-back-address',
              value: values,
            },
          })
        }
        this.$message.success(this.$t('system.text_277'))
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
