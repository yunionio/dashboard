<template>
  <div>
    <page-header :title="$t('k8s.text_367')" />
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        :label="$t('k8s.text_41')"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('k8s.text_60')" />
      </a-form-item>
    </a-form>
    <page-footer>
      <div slot="right">
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('dialog.ok')}}</a-button>
        <a-button @click="cancel">{{ $t('dialog.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'FederatedclusterrolebindingCreate',
  mixins: [k8sCreateMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateTrigger: 'blur',
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
              { min: 2, max: 24, message: this.$t('k8s.text_132') },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_30') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
    }
  },
  created () {
    this.resourceM = new this.$Manager('federatedclusterrolebindings', 'v1')
  },
  destroyed () {
    this.resourceM = null
  },
  methods: {
    doCreate (data) {
      return this.resourceM.create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          ...values,
          spec: {
            template: {
              spec: {},
            },
          },
        }
        await this.doCreate(data)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-federatedclusterrolebinding')
    },
  },
}
</script>
