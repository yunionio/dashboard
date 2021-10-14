<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-form-item :label="$t('system.text_295')">
      <template v-slot:extra>
        <div>{{$t('system.text_296')}}</div>
        <div>{{$t('system.text_575')}}</div>
        <div>{{$t('system.text_298')}}</div>
        <div class="mb-0">{{$t('system.text_299')}}</div>
      </template>
      <a-input v-decorator="decorators.content" />
    </a-form-item>
    <a-form-item :wrapper-col="offsetWrapperCol">
      <a-button type="primary" @click="handleSubmit" :loading="submiting">{{ $t('common.ok') }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'EmailConfig',
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
        content: [
          'content',
          {
            rules: [
              { required: true, message: this.$t('system.text_300') },
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
    this.manager = new this.$Manager('notifytemplates', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.$emit('update:loading', true)
      try {
        const response = await this.manager.list({
          params: {
            topic: 'VERIFY',
            template_type: 'remote',
            contact_type: 'mobile',
          },
        })
        const data = response.data.data || []
        if (data.length > 0) {
          this.contactData = data[0]
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({
              content: data[0].content,
            })
          })
        }
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_306')]))
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
              content: R.trim(values.content),
            },
          })
        } else {
          await this.manager.create({
            data: {
              contact_type: 'mobile',
              topic: 'VERIFY',
              template_type: 'remote',
              content: R.trim(values.content),
              example: '',
            },
          })
        }
        await this.fetchData()
        this.$message.success(this.$t('system.text_124', [this.$t('system.text_306')]))
      } catch (error) {
        this.$message.error(this.$t('common_622', [this.$t('system.text_306')]))
        throw error
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
