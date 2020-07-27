<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')">
        <namespace-select v-decorator="decorators.namespace" :cluster="cluster" @input="setNamespace" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_82')" required>
        <labels :decorators="decorators.labels" ref="labelRef" :firstCanDelete="false" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import Labels from '@K8S/sections/Labels'
import { getLabels } from '@K8S/utils'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sConfigmapCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    Labels,
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
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
              { min: 2, max: 24, message: this.$t('k8s.text_132'), trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            initialValue: this.$store.state.common.k8s.cluster,
            rules: [
              { required: true, message: this.$t('k8s.text_30'), trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            initialValue: this.$store.state.common.k8s.namespace,
            rules: [
              { required: true, message: this.$t('k8s.text_61'), trigger: 'blur' },
            ],
          },
        ],
        labels: {
          key: i => [
            `labelKeys[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('k8s.text_138') },
              ],
            },
          ],
          value: i => [
            `labelValues[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('k8s.text_139') },
              ],
            },
          ],
        },
      },
      namespaceObj: {},
    }
  },
  mounted () {
    this.$refs.labelRef.add()
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async _doCreate (data) {
      await new this.$Manager('configmaps', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        const labels = getLabels(values, 'labelKeys', 'labelValues')
        const params = {
          name: values.name,
          cluster: values.cluster,
          namespace: values.namespace,
          data: labels,
        }
        await this._doCreate(params)
        this.$message.success(this.$t('k8s.text_46'))
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
