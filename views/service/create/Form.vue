<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item label="名称">
        <a-input placeholder="请输入名称" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item label="集群">
        <cluster-select v-decorator="decorators.cluster" :clusterObj.sync="clusterObj" />
      </a-form-item>
      <a-form-item label="命名空间">
        <namespace-select v-decorator="decorators.namespace" :cluster="clusterObj.id" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <a-form-item label="选择器" class="mb-0">
        <a-radio-group v-model="form.fd.selectorType">
          <a-radio-button value="deployments">无状态</a-radio-button>
          <a-radio-button value="statefulsets">有状态</a-radio-button>
        </a-radio-group>
        <a-form-item>
          <base-select
            v-decorator="decorators.selector"
            :resource="form.fd.selectorType"
            version="v1"
            :need-params="true"
            :isDefaultSelect="true"
            idKey="name"
            :params="resParams"
            :select-props="{ placeholder: '请选择' }" />
        </a-form-item>
      </a-form-item>
      <a-form-item label="服务">
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

export default {
  name: 'K8sServiceCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    PortMapping,
  },
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
              { required: true, message: '请输入名称' },
              { min: 2, max: 24, message: '长度在 2 到 24 个字符', trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [
              { required: true, message: '请选择集群', trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            rules: [
              { required: true, message: '请选择命名空间', trigger: 'blur' },
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
            {
              rules: [
                { required: true, message: '请输入服务端口' },
              ],
            },
          ],
          ports: {
            port: i => [
              `ports[${i}]`,
              {
                initialValue: 1,
                rules: [
                  { required: true, message: '请输入服务端口' },
                ],
              },
            ],
            targetPort: i => [
              `targetPorts[${i}]`,
              {
                initialValue: 1,
                rules: [
                  { required: true, message: '请输入目标端口' },
                ],
              },
            ],
            protocol: i => [
              `protocols[${i}]`,
              {
                initialValue: 'TCP',
                rules: [
                  { required: true, message: '请选择协议' },
                ],
              },
            ],
          },
        },
        selector: [
          'selector',
          {
            rules: [
              { required: true, message: '请选择存储类', trigger: 'blur' },
            ],
          },
        ],
      },
      clusterObj: {},
      namespaceObj: {},
    }
  },
  computed: {
    resParams () {
      const params = {}
      if (this.clusterObj.id && this.namespaceObj.name) {
        params.cluster = this.clusterObj.id
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
        this.$message.success('操作成功')
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
