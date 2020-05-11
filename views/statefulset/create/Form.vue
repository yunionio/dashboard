<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item label="名称">
        <a-input placeholder="请输入名称" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item label="集群">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" :clusterObj.sync="clusterObj" />
      </a-form-item>
      <a-form-item label="命名空间">
        <namespace-select v-decorator="decorators.namespace" @input="setNamespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
      </a-form-item>
      <a-form-item label="容器组个数">
        <a-input-number v-decorator="decorators.replicas" :min="1" :max="10" />
      </a-form-item>
      <a-form-item label="镜像密钥" class="mb-0">
        <image-secret
          :form="form"
          :decorators="decorators.imageSecrets"
          :namespace="namespaceObj.name"
          :cluster="cluster" />
      </a-form-item>
      <a-form-item label="服务">
        <port-mapping
          :form="form"
          :decorators="decorators.portMappings"
          :is-import-cluster="isImportCluster" />
      </a-form-item>
      <a-form-item label="重启策略">
        <restart-policy-select
          :decorator="decorators.restartPolicy"
          type="statefulset" />
      </a-form-item>
      <a-collapse :bordered="false" class="mb-3">
        <a-collapse-panel header="高级配置" key="1">
          <a-form-item label="标签">
            <labels :decorators="decorators.labels" />
          </a-form-item>
          <a-form-item label="备注">
            <labels :decorators="decorators.annotations" title="备注" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
      <spec-container
        :form="form"
        :panes.sync="containerPanes"
        :errPanes="errPanes"
        :decorators="decorators.containers"
        :namespace="namespaceObj.name"
        :cluster="cluster" />
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import ImageSecret from '@K8S/sections/ImageSecret'
import PortMapping from '@K8S/sections/PortMapping'
import RestartPolicySelect from '@K8S/sections/RestartPolicySelect'
import Labels from '@K8S/sections/Labels'
import SpecContainer from '@K8S/sections/SpecContainer'
import { getSpecContainerParams, getLabels, getCreateDecorators } from '@K8S/utils'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sStatefulsetCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    ImageSecret,
    PortMapping,
    RestartPolicySelect,
    Labels,
    SpecContainer,
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
      errPanes: [], // 表单校验错误的tabs
      containerPanes: [], // 子组件同步的tabs
      decorators: getCreateDecorators.call(this, 'statefulset'),
      clusterObj: {},
      namespaceObj: {},
    }
  },
  computed: {
    isImportCluster () {
      if (this.clusterObj.mode === 'import') { // 导入的集群新建外部服务时不能选择网络
        return true
      }
      return false
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            this.setErrorPane(err)
            reject(err)
          }
        })
      })
    },
    setErrorPane (err) {
      const keys = Object.keys(err).filter(v => v.startsWith('container'))
      const containerErrValues = keys.map(k => err[k])
      const errPanes = containerErrValues.map(v => Object.keys(v)).flat()
      this.errPanes = Array.from(new Set(errPanes))
    },
    async _doCreate (data) {
      await new this.$Manager('statefulsets', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        const spec = getSpecContainerParams(values, this.containerPanes)
        const labels = getLabels(values, 'labelKeys', 'labelValues')
        const annotations = getLabels(values, 'annotationsKeys', 'annotationsValues')
        const service = {}
        if (values.serviceType !== 'none') {
          service.isExternal = (values.serviceType === 'external')
          const portMappings = Object.keys(values.ports).map(key => {
            return {
              port: +values.ports[key],
              targetPort: +values.targetPorts[key],
              protocol: values.protocols[key],
            }
          })
          service.portMappings = portMappings
          if (service.isExternal) {
            if (values.loadBalancerCluster) service.loadBalancerCluster = values.loadBalancerCluster
            if (values.loadBalancerNetwork) service.loadBalancerNetwork = values.loadBalancerNetwork
          }
        }
        const template = {
          spec: {
            volumes: spec.volumes,
            containers: spec.containers,
            imagePullSecrets: values.imagePullSecrets,
            restartPolicy: values.restartPolicy,
          },
        }
        const params = {
          name: values.name,
          cluster: values.cluster,
          namespace: values.namespace,
          replicas: values.replicas,
          labels,
          annotations,
          template,
        }
        if (!R.isEmpty(service)) params.service = service
        await this._doCreate(params)
        this.$message.success('操作成功')
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
