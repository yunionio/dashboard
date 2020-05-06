<template>
  <a-form-model :model="formData" size="small" ref="formRef" class="w-75" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-model-item label="启用 Elasticsearch">
      <a-switch v-model="formData.es.enabled" />
    </a-form-model-item>
    <template v-if="formData.es.enabled">
      <a-form-model-item label="Elasticsearch index 名称" prop="es.index">
        <a-input v-model="formData.es.index" placeholder="请输入Elasticsearch index 名称" />
      </a-form-model-item>
      <a-form-model-item label="Elasticsearch 集群连接地址" prop="es.host">
        <a-input v-model="formData.es.host" placeholder="请输入Elasticsearch集群连接地址，例如：10.168.26.182" />
      </a-form-model-item>
      <a-form-model-item label="端口" prop="es.port">
        <a-input v-model="formData.es.port" />
      </a-form-model-item>
      <a-form-model-item label="类型" prop="es.type">
        <a-input v-model="formData.es.type" />
      </a-form-model-item>
    </template>
    <a-divider />
    <a-form-model-item label="启用 Kafka">
      <a-switch v-model="formData.kafka.enabled" />
    </a-form-model-item>
    <template v-if="formData.kafka.enabled">
      <a-form-model-item label="kafka broker 地址">
        <a-form-model-item
          v-for="(val, i) in formData.kafka.brokers"
          :key="val.key"
          :prop="'kafka.brokers.' + i + '.value'"
          :rules="[
            { required: true, message: '请输入kafka broker 地址，例如：192.168.222.10:9092', trigger: 'blur' },
          ]">
          <div class="d-flex align-items-center">
            <a-input v-model="val.value" placeholder="请输入kafka broker 地址，例如：192.168.222.10:9092" />
            <a-icon type="minus-circle" style="color: #F56C6C;" class="a-icon-remove-outline cursor-pointer ml-2" v-if="formData.kafka.brokers.length > 1" @click="decreaseBroker(val)" />
          </div>
        </a-form-model-item>
        <a-button type="link" size="small" @click="addBroker">添加</a-button>
      </a-form-model-item>
      <a-form-model-item label="topics">
        <a-form-model-item
          v-for="(val, i) in formData.kafka.topics"
          :key="val.key"
          :prop="'kafka.topics.' + i + '.value'"
          :rules="[
            { required: true, message: '请输入topic，例如：fluent-bit', trigger: 'blur' },
          ]">
          <div class="d-flex align-items-center">
            <a-input v-model="val.value" placeholder="请输入topic，例如：fluent-bit" />
            <a-icon type="minus-circle" style="color: #F56C6C;" class="a-icon-remove-outline cursor-pointer ml-2" v-if="formData.kafka.topics.length > 1" @click="decreaseTopic(val)" />
          </div>
        </a-form-model-item>
        <a-button type="link" size="small" @click="addTopic">添加</a-button>
      </a-form-model-item>
    </template>
    <a-form-model-item :wrapper-col="{ span: 20, offset: 3 }">
      <a-button class="mr-2" type="primary" @click="submitForm('formRef')">确定</a-button>
      <a-button @click="cancel">取消</a-button>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import mixin from '../mixins'

export default {
  name: 'KubeComponentFluentbit',
  mixins: [mixin],
  data () {
    let formData = {
      es: {
        enabled: false,
        host: '',
        index: 'fluentbit',
        port: 9200,
        type: 'flb_type',
      },
      kafka: {
        enabled: false,
        brokers: [
          { key: +new Date(), value: '' },
        ],
        topics: [
          { key: +new Date(), value: '' },
        ],
      },
    }
    if (this.isUpdate) {
      formData = this.updateData.backend
      formData.kafka.brokers = formData.kafka.brokers.map((v, i) => ({ key: +new Date() + i, value: v }))
      formData.kafka.topics = formData.kafka.topics.map((v, i) => ({ key: +new Date() + i, value: v }))
    }
    return {
      rules: {
        'es.index': [
          { required: true, message: '请输入Elasticsearch index 名称', trigger: 'blur' },
        ],
        'es.host': [
          { required: true, message: '请输入Elasticsearch 集群连接地址', trigger: 'blur' },
        ],
        'es.port': [
          { required: true, message: '请输入端口', trigger: 'blur' },
        ],
        'es.type': [
          { required: true, message: '请输入类型', trigger: 'blur' },
        ],
      },
      formData,
      labelCol: { span: 5 },
      wrapperCol: { span: 13 },
    }
  },
  methods: {
    addBroker () {
      this.formData.kafka.brokers.push({ key: +new Date(), value: '' })
    },
    decreaseBroker (val) {
      const index = this.formData.kafka.brokers.findIndex(item => item.key === val.key)
      this.formData.kafka.brokers.splice(index, 1)
    },
    decreaseTopic (val) {
      const index = this.formData.kafka.topics.findIndex(item => item.key === val.key)
      this.formData.kafka.topics.splice(index, 1)
    },
    addTopic () {
      this.formData.kafka.topics.push({ key: +new Date(), value: '' })
    },
    submitForm (formName) {
      if (!this.formData.es.enabled && !this.formData.kafka.enabled) {
        this.$message.warning('请最少启用Es或者Kafka')
        return
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const brokers = this.formData.kafka.brokers.map(val => val.value)
          const topics = this.formData.kafka.topics.map(val => val.value)
          const data = {
            backend: {
              es: this.formData.es,
              kafka: {
                ...this.formData.kafka,
                topics,
                brokers,
              },
            },
          }
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
