<template>
  <div class="k8s-deployment-create w-75">
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
      <a-form-item label="容器组个数">
        <a-input-number v-decorator="decorators.replicas" :min="1" :max="10" />
      </a-form-item>
      <a-form-item label="镜像密钥" class="mb-0">
        <image-secret
          :decorators="decorators.imageSecrets"
          :namespace="namespaceObj.name"
          :cluster="clusterObj.id" />
      </a-form-item>
      <a-form-item label="服务">
        <port-mapping
          :form="form"
          :decorators="decorators.portMappings"
          :network-disabled="networkDisabled" />
      </a-form-item>
      <a-form-item label="重启策略">
        <restart-policy-select
          :decorator="decorators.restartPolicy"
          type="deployment" />
      </a-form-item>
      <a-collapse :bordered="false" class="mb-3">
        <a-collapse-panel header="高级配置" key="1">
          <a-form-item label="标签">
            <labels :decorators="decorators.labels" />
          </a-form-item>
          <a-form-item label="备注">
            <labels :decorators="decorators.labels" title="备注" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
      <spec-container
        :decorators="decorators.containers"
        :namespace="namespaceObj.name"
        :cluster="clusterObj.id" />
    </a-form>
  </div>
</template>

<script>
import { RESTART_POLICY_OPTS } from '@K8S/constants'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import ImageSecret from '@K8S/sections/ImageSecret'
import PortMapping from '@K8S/sections/PortMapping'
import RestartPolicySelect from '@K8S/sections/RestartPolicySelect'
import Labels from '@K8S/sections/Labels'
import SpecContainer from '@K8S/sections/SpecContainer'

const validateValidPath = (rule, value, callback) => {
  if (value.startsWith('/')) {
    if (value === '/') {
      callback(new Error('挂载点不能为 /'))
    } else {
      callback()
    }
  } else {
    callback(new Error('挂载点以 / 开头'))
  }
}

export default {
  name: 'K8sDeploymentCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    ImageSecret,
    PortMapping,
    RestartPolicySelect,
    Labels,
    SpecContainer,
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
        onValueChange (v) {
          console.log(v, 'v')
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
              { validator: this.$validate('resourceName') },
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
        replicas: [
          'replicas',
          {
            initialValue: 1,
          },
        ],
        imageSecrets: {
          secretType: [
            'secretType',
            {
              initialValue: 'new',
            },
          ],
          imagePullSecrets: [
            'imagePullSecrets',
          ],
        },
        portMappings: {
          serviceType: [
            'serviceType',
            {
              initialValue: 'none',
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
        restartPolicy: [
          'restartPolicy',
          {
            initialValue: RESTART_POLICY_OPTS.deployment[0].key,
          },
        ],
        labels: {
          key: i => [
            `labelKeys[${i}]`,
            {
              rules: [
                { required: true, message: '请输入键' },
              ],
            },
          ],
          value: i => [
            `labelValues[${i}]`,
            {
              rules: [
                { required: true, message: '请输入值' },
              ],
            },
          ],
        },
        annotations: {
          key: i => [
            `annotationsKeys[${i}]`,
            {
              rules: [
                { required: true, message: '请输入键' },
              ],
            },
          ],
          value: i => [
            `annotationsValues[${i}]`,
            {
              rules: [
                { required: true, message: '请输入值' },
              ],
            },
          ],
        },
        containers: {
          name: i => [
            `containerNames[${i}]`,
            {
              rules: [
                { required: true, message: '请输入名称' },
              ],
            },
          ],
          image: i => [
            `containerimages[${i}]`,
            {
              rules: [
                { required: true, message: '请输入镜像' },
              ],
            },
          ],
          cpu: i => [
            `containerCpus[${i}]`,
            {
              rules: [
                { required: true, message: '请输入CPU' },
              ],
            },
          ],
          memory: i => [
            `containerMemorys[${i}]`,
            {
              rules: [
                { required: true, message: '请输入内存' },
              ],
            },
          ],
          command: i => [
            `containerCommands[${i}]`,
          ],
          arg: i => [
            `containerArgs[${i}]`,
          ],
          volumeMount: i => ({
            key: k => [
              `containerVolumeMountNames[${i}][${k}]`,
              {
                rules: [
                  { required: true, message: '请选择' },
                ],
              },
            ],
            value: k => [
              `containerVolumeMountPaths[${i}][${k}]`,
              {
                rules: [
                  { required: true, message: '请输入' },
                  { validator: validateValidPath, trigger: 'blur' },
                ],
              },
            ],
          }),
          env: i => ({
            key: k => [
              `containerEnvNames[${i}][${k}]`,
              {
                rules: [
                  { required: true, message: '请输入' },
                ],
              },
            ],
            value: k => [
              `containerEnvValues[${i}][${k}]`,
              {
                rules: [
                  { required: true, message: '请输入' },
                ],
              },
            ],
          }),
          privileged: i => [
            `containerPrivilegeds[${i}]`,
            {
              valuePropName: 'checked',
            },
          ],
        },
      },
      clusterObj: {},
      namespaceObj: {},
    }
  },
  computed: {
    networkDisabled () {
      if (this.clusterObj.mode === 'import') { // 导入的集群新建外部服务时不能选择网络
        return true
      }
      return false
    },
  },
  methods: {
    async doCreate () {
      const values = await this.form.fc.validateFields()
      console.log(values, 'vv')
    },
  },
}
</script>

<style>

</style>
