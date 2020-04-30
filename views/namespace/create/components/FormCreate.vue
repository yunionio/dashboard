<template>
  <a-form
    class="mt-3"
    :form="form.fc">
    <a-form-item
      label="名称"
      v-bind="formItemLayout">
      <a-input v-decorator="decorators.name" placeholder="请输入名称" />
    </a-form-item>
    <a-form-item
      label="集群"
      v-bind="formItemLayout">
      <cluster-select
      :clusterObj.sync="clusterObj"
      v-decorator="decorators.cluster"
      style="width: 140px;" />
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
      <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">部署</a-button>
      <a-button @click="cancel">取消</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'

export default {
  name: 'FormCreate',
  components: {
    ClusterSelect,
  },
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
              { required: true, message: '请输入名称' },
              { min: 2, max: 24, message: '长度在 2 到 24 个字符' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [
              { required: true, message: '请选择集群' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      clusterObj: {},
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
        this.$message.success('创建成功')
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
