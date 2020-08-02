<template>
  <a-form-model :model="formData" size="small" ref="formRef" class="w-75" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="rules">
    <a-divider content-position="left">Grafana</a-divider>
    <a-form-model-item label="grafana 登录用户名" prop="grafana.adminUser">
      <a-input v-model="formData.grafana.adminUser" placeholder="请输入grafana 登录用户名，如：admin" />
    </a-form-model-item>
    <a-form-model-item label="grafana 登录密码" prop="grafana.adminPassword">
      <a-input-password v-model="formData.grafana.adminPassword" placeholder="请输入grafana 登录密码" />
    </a-form-model-item>
    <storage v-model="formData.grafana.storage" prop="grafana.storage" />
    <a-divider content-position="left">Loki</a-divider>
    <storage v-model="formData.loki.storage" prop="loki.storage" />
    <a-divider content-position="left">Prometheus</a-divider>
    <storage v-model="formData.prometheus.storage" prop="prometheus.storage" />
    <a-form-model-item :wrapper-col="{ span: 20, offset: 3 }">
      <a-button class="mr-2" type="primary" @click="submitForm('formRef')">确定</a-button>
      <a-button @click="cancel">取消</a-button>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import * as R from 'ramda'
import mixin from '../../mixins'
import Storage from './Storage'

export default {
  name: 'KubeComponentMonitor',
  components: {
    Storage,
  },
  mixins: [mixin],
  data () {
    let formData = {
      grafana: {
        adminUser: 'admin',
        adminPassword: 'prom-operator',
        storage: {
          enabled: false,
          sizeMB: 1,
          storageClassName: '',
        },
      },
      loki: {
        storage: {
          enabled: false,
          sizeMB: 50,
          storageClassName: '',
        },
      },
      prometheus: {
        storage: {
          enabled: false,
          sizeMB: 50,
          storageClassName: '',
        },
      },
    }
    if (this.isUpdate) {
      formData = this.updateData
      formData.grafana.storage.sizeMB = this.updateData.grafana.storage.sizeMB ? this.updateData.grafana.storage.sizeMB / 1024 : 1
      formData.loki.storage.sizeMB = this.updateData.loki.storage.sizeMB ? this.updateData.loki.storage.sizeMB / 1024 : 1
      formData.prometheus.storage.sizeMB = this.updateData.prometheus.storage.sizeMB ? this.updateData.prometheus.storage.sizeMB / 1024 : 1
    }
    return {
      rules: {
        'grafana.adminUser': [
          { required: true, message: '请输入 grafana 登录用户名', trigger: 'blur' },
        ],
        'grafana.adminPassword': [
          { required: true, message: '请输入 grafana 登录密码', trigger: 'blur' },
        ],
        'grafana.storage': [
          { required: true, message: '请输入 storageClass 名称', trigger: 'blur' },
        ],
      },
      labelCol: { span: 5 },
      wrapperCol: { span: 13 },
      formData,
    }
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = R.clone(this.formData)
          data.grafana.storage.sizeMB = this.formData.grafana.storage.sizeMB * 1024
          data.loki.storage.sizeMB = this.formData.loki.storage.sizeMB * 1024
          data.prometheus.storage.sizeMB = this.formData.prometheus.storage.sizeMB * 1024
          this.$emit('submit', data)
        }
      })
    },
    cancel () {
      this.$router.push('/k8s-kubecomponent')
    },
  },
}
</script>
