<template>
  <a-form-model :model="formData" size="small" ref="formRef" class="w-75" :rules="rules" v-bind="formItemLayout">
    <a-form-model-item :label="$t('k8s.text_250')">
      <a-switch v-model="formData.es.enabled" />
    </a-form-model-item>
    <template v-if="formData.es.enabled">
      <a-form-model-item :label="$t('k8s.text_251')" prop="es.index">
        <a-input v-model="formData.es.index" :placeholder="$t('k8s.text_252')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('k8s.text_253')" prop="es.host">
        <a-input v-model="formData.es.host" :placeholder="$t('k8s.text_254')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('k8s.text_255')" prop="es.port">
        <a-input v-model="formData.es.port" />
      </a-form-model-item>
      <a-form-model-item :label="$t('k8s.text_34')" prop="es.type">
        <a-input v-model="formData.es.type" />
      </a-form-model-item>
    </template>
    <a-divider />
    <a-form-model-item :label="$t('k8s.text_256')">
      <a-switch v-model="formData.kafka.enabled" />
    </a-form-model-item>
    <template v-if="formData.kafka.enabled">
      <a-form-model-item :label="$t('k8s.text_257')">
        <a-form-model-item
          v-for="(val, i) in formData.kafka.brokers"
          :key="val.key"
          :prop="'kafka.brokers.' + i + '.value'"
          :rules="[
            { required: true, message: $t('k8s.text_258'), trigger: 'blur' },
          ]">
          <div class="d-flex align-items-center">
            <a-input v-model="val.value" :placeholder="$t('k8s.text_258')" />
            <a-icon type="minus-circle" style="color: #F56C6C;" class="a-icon-remove-outline cursor-pointer ml-2" v-if="formData.kafka.brokers.length > 1" @click="decreaseBroker(val)" />
          </div>
        </a-form-model-item>
        <a-button type="link" size="small" @click="addBroker">{{$t('k8s.text_249')}}</a-button>
      </a-form-model-item>
      <a-form-model-item label="topics">
        <a-form-model-item
          v-for="(val, i) in formData.kafka.topics"
          :key="val.key"
          :prop="'kafka.topics.' + i + '.value'"
          :rules="[
            { required: true, message: $t('k8s.text_259'), trigger: 'blur' },
          ]">
          <div class="d-flex align-items-center">
            <a-input v-model="val.value" :placeholder="$t('k8s.text_259')" />
            <a-icon type="minus-circle" style="color: #F56C6C;" class="a-icon-remove-outline cursor-pointer ml-2" v-if="formData.kafka.topics.length > 1" @click="decreaseTopic(val)" />
          </div>
        </a-form-model-item>
        <a-button type="link" size="small" @click="addTopic">{{$t('k8s.text_249')}}</a-button>
      </a-form-model-item>
    </template>
    <a-form-model-item v-bind="offsetFormItemLayout">
      <a-button class="mr-2" type="primary" @click="submitForm('formRef')">{{$t('k8s.text_260')}}</a-button>
      <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
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
          { required: true, message: this.$t('k8s.text_252'), trigger: 'blur' },
        ],
        'es.host': [
          { required: true, message: this.$t('k8s.text_261'), trigger: 'blur' },
        ],
        'es.port': [
          { required: true, message: this.$t('k8s.text_262'), trigger: 'blur' },
        ],
        'es.type': [
          { required: true, message: this.$t('k8s.text_263'), trigger: 'blur' },
        ],
      },
      formData,
      formItemLayout: {
        wrapperCol: {
          md: { span: 14 },
          xl: { span: 16 },
          xxl: { span: 18 },
        },
        labelCol: {
          md: { span: 10 },
          xl: { span: 8 },
          xxl: { span: 6 },
        },
      },
      offsetFormItemLayout: {
        wrapperCol: {
          md: { span: 14, offset: 10 },
          xl: { span: 16, offset: 8 },
          xxl: { span: 18, offset: 6 },
        },
      },
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
        this.$message.warning(this.$t('k8s.text_264'))
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
