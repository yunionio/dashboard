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
      <a-form-item label="标签" required>
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

export default {
  name: 'K8sConfigmapCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    Labels,
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
      },
      clusterObj: {},
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
        this.$message.success('操作成功')
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
