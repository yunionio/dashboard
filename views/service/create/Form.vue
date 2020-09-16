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
        <namespace-select v-decorator="decorators.namespace" @input="setNamespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_339')" class="mb-0">
        <a-radio-group v-model="form.fd.selectorType">
          <a-radio-button value="deployments">{{$t('k8s.text_4')}}</a-radio-button>
          <a-radio-button value="statefulsets">{{$t('k8s.text_5')}}</a-radio-button>
        </a-radio-group>
        <a-form-item>
          <base-select
            v-decorator="decorators.selector"
            :resource="form.fd.selectorType"
            version="v1"
            :need-params="true"
            :isDefaultSelect="true"
            :params="resParams"
            :select-props="{ placeholder: $t('k8s.text_77') }" />
        </a-form-item>
      </a-form-item>
      <a-form-item :label="$t('k8s.text_13')">
        <port-mapping
          :form="form"
          ignore-none
          :decorators="decorators.portMappings" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import PortMapping from '@K8S/sections/PortMapping'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sServiceCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    PortMapping,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
        fd: {
          selectorType: 'deployments',
        },
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
        portMappings: {
          serviceType: [
            'serviceType',
            {
              initialValue: 'internal',
            },
          ],
          loadBalancerNetwork: [
            'loadBalancerNetwork',
          ],
          loadBalancerCluster: [
            'loadBalancerCluster',
          ],
          ports: {
            port: i => [
              `ports[${i}]`,
              {
                initialValue: 1,
                rules: [
                  { required: true, message: this.$t('k8s.text_134') },
                ],
              },
            ],
            targetPort: i => [
              `targetPorts[${i}]`,
              {
                initialValue: 1,
                rules: [
                  { required: true, message: this.$t('k8s.text_135') },
                ],
              },
            ],
            protocol: i => [
              `protocols[${i}]`,
              {
                initialValue: 'TCP',
                rules: [
                  { required: true, message: this.$t('k8s.text_136') },
                ],
              },
            ],
          },
        },
        selector: [
          'selector',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_77'), trigger: 'blur' },
            ],
          },
        ],
      },
      namespaceObj: {},
    }
  },
  computed: {
    resParams () {
      const params = {}
      if (this.cluster && this.namespaceObj.name) {
        params.cluster = this.cluster
        params.limit = 0
        params.namespace = this.namespaceObj.name
      }
      return params
    },
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
      await new this.$Manager('k8s_services', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        const params = {
          name: values.name,
          cluster: values.cluster,
          namespace: values.namespace,
          selector: {
            app: values.selector,
          },
        }
        if (values.serviceType !== 'none') {
          params.isExternal = (values.serviceType === 'external')
          if (values.loadBalancerNetwork) params.loadBalancerNetwork = values.loadBalancerNetwork
          if (values.loadBalancerCluster) params.loadBalancerCluster = values.loadBalancerCluster
          const portMappings = Object.keys(values.ports).map(key => {
            return {
              port: +values.ports[key],
              targetPort: +values.targetPorts[key],
              protocol: values.protocols[key],
            }
          })
          params.portMappings = portMappings
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
