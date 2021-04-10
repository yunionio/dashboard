<template>
  <a-form-model :model="formData" size="small" ref="formRef" class="w-75" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="rules">
    <a-divider content-position="left">Grafana</a-divider>
    <a-form-model-item :label="$t('k8s.text_272')" prop="grafana.adminUser">
      <a-input v-model="formData.grafana.adminUser" :placeholder="$t('k8s.text_273')" />
    </a-form-model-item>
    <a-form-model-item :label="$t('k8s.text_274')" prop="grafana.adminPassword">
      <a-input-password v-model="formData.grafana.adminPassword" :placeholder="$t('k8s.text_275')" />
    </a-form-model-item>
    <a-form-model-item :label="$t('k8s.text_405')" prop="grafana.publicAddress">
      <a-input v-model="formData.grafana.publicAddress" addon-before="https://" addon-after="/grafana" :placeholder="$t('k8s.text_404')" />
    </a-form-model-item>
    <storage v-model="formData.grafana.storage" prop="grafana.storage" />
    <a-divider content-position="left">Loki</a-divider>
    <storage v-model="formData.loki.storage" prop="loki.storage" />
    <a-divider content-position="left">Prometheus</a-divider>
    <storage v-model="formData.prometheus.storage" prop="prometheus.storage" />
    <a-form-model-item :wrapper-col="{ span: 20, offset: 3 }">
      <a-button class="mr-2" type="primary" @click="submitForm('formRef')">{{$t('k8s.text_260')}}</a-button>
      <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import * as R from 'ramda'
import mixin from '../../mixins'
import Storage from './Storage'
import { validate } from '@/utils/validate'

export default {
  name: 'KubeComponentMonitor',
  components: {
    Storage,
  },
  mixins: [mixin],
  data () {
    const { host } = window.location

    const checkPublicAddress = (rule, value, callback) => {
      const arr = value.split(':')
      if (arr.length > 1) {
        const ip = arr[0]
        const port = arr[1]
        if (validate(ip, 'IPv4') === false || validate(ip, 'IPv4').result === false ||
          validate(port, 'ports') === false || validate(port, 'ports').result === false) {
          callback(new Error(this.$t('k8s.text_406')))
        } else {
          callback()
        }
      } else {
        if ((validate(value, 'IPv4') === false || validate(value, 'IPv4').result === false) &&
          (validate(value, 'domain') === false || validate(value, 'domain').result === false)) {
          callback(new Error(this.$t('k8s.text_406')))
        } else {
          callback()
        }
      }
    }
    let formData = {
      grafana: {
        adminUser: 'admin',
        adminPassword: 'prom-operator',
        publicAddress: host,
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
          { required: true, message: this.$t('k8s.text_276'), trigger: 'blur' },
        ],
        'grafana.adminPassword': [
          { required: true, message: this.$t('k8s.text_277'), trigger: 'blur' },
        ],
        'grafana.publicAddress': [
          { required: true, message: this.$t('k8s.text_404'), trigger: 'blur' },
          { validator: checkPublicAddress },
        ],
        'grafana.storage': [
          { required: true, message: this.$t('k8s.text_278'), trigger: 'blur' },
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
