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
      <a-form-item label="路由">
        <ingress-rule :decorators="decorators.rule" :namespace="namespaceObj.name" :cluster="clusterObj.id"  />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import IngressRule from './IngressRule'

const validateValidPath = (rule, value, callback) => {
  if (value.startsWith('/')) {
    callback()
  } else {
    callback(new Error('挂载点以 / 开头'))
  }
}

export default {
  name: 'K8sIngressCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    IngressRule,
  },
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
        rule: {
          host: i => [
            `hosts[${i}]`,
            {
              rules: [
                { required: true, message: '请输入host', trigger: 'blur' },
              ],
            },
          ],
          services: i => ({
            serviceName: j => [
              `serviceNames[${i}][${j}]`,
              {
                rules: [
                  { required: true, message: '请选择服务' },
                ],
              },
            ],
            servicePath: j => [
              `servicePaths[${i}][${j}]`,
              {
                validateFirst: true,
                rules: [
                  { required: true, message: '请输入Path', trigger: 'blur' },
                  { validator: validateValidPath },
                ],
              },
            ],
            servicePort: j => [
              `servicePorts[${i}][${j}]`,
              {
                rules: [
                  { type: 'number', required: true, message: '请选择端口', trigger: 'blur' },
                ],
              },
            ],
          }),
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
      await new this.$Manager('ingresses', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        const rules = []
        R.forEachObjIndexed((value, key) => {
          const item = {
            host: value,
            paths: [],
          }
          R.forEachObjIndexed((val, k) => {
            item.paths.push({
              path: val,
              backend: {
                serviceName: values.serviceNames[key][k],
                servicePort: values.servicePorts[key][k],
              },
            })
          }, values.servicePaths[key])
          rules.push(item)
        }, values.hosts)
        const params = {
          name: values.name,
          cluster: values.cluster,
          namespace: values.namespace,
          rules,
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
