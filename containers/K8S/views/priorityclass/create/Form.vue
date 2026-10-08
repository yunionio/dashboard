<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_priority_value')">
        <a-input-number v-decorator="decorators.value" style="width: 200px" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_global_default')">
        <a-switch v-decorator="decorators.globalDefault" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_description')">
        <a-input v-decorator="decorators.description" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sPriorityclassForm',
  components: {
    ClusterSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        value: [
          'value',
          {
            initialValue: 100,
            rules: [{ required: true, message: this.$t('k8s.vc_priority_value_invalid') }],
          },
        ],
        globalDefault: [
          'globalDefault',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        description: ['description'],
      },
    }
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async doCreate () {
      const values = await this.validateForm()
      const value = Number(values.value)
      const name = (values.name || '').trim()
      if (!Number.isInteger(value)) {
        this.$message.error(this.$t('k8s.vc_priority_value_invalid'))
        throw new Error('value')
      }
      if (name === 'system-cluster-critical' || name === 'system-node-critical') {
        this.$message.error(this.$t('k8s.vc_system_priority_class'))
        throw new Error('reserved')
      }
      await new this.$Manager('priorityclasses', 'v1').create({
        data: {
          name,
          cluster: values.cluster,
          value,
          globalDefault: values.globalDefault === true,
          description: (values.description || '').trim(),
        },
      })
      this.$message.success(this.$t('k8s.text_46'))
    },
  },
}
</script>
