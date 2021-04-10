<template>
  <a-form
    class="mt-3"
    :form="form.fc">
    <a-form-item
      :label="$t('k8s.text_41')"
      v-bind="formItemLayout">
      <a-input v-decorator="decorators.name" :placeholder="$t('k8s.text_60')" />
    </a-form-item>
    <a-form-item
      :label="$t('k8s.text_19')"
      v-bind="formItemLayout">
      <cluster-select
        @input="setCluster"
        v-decorator="decorators.cluster"
        style="width: 140px;" />
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
      <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('k8s.text_49')}}</a-button>
      <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'FormCreate',
  components: {
    ClusterSelect,
  },
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
    this.resourceM = new this.$Manager('namespaces', 'v1')
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
        await this.doCreate(values)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/k8s-namespace')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-namespace')
    },
  },
}
</script>
