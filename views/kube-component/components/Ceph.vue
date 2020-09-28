<template>
  <div>
    <page-header :title="$t('k8s.text_49')" />
    <a-form-model
      class="mt-3"
      ref="formRef"
      :model="formData"
      :label-col="labelCol"
      :wrapper-col="wrapperCol">
      <a-card class="mb-2 card" hoverable v-for="(item, i) in formData.config" :key="item.key">
        <a-form-model-item
          :label="$t('k8s.text_243')"
          :prop="'config.' + i + '.clusterId'"
          :rules="[
            { required: true, message: $t('k8s.text_244'), trigger: 'blur' },
          ]">
          <a-input v-model="item.clusterId" :placeholder="$t('k8s.text_245')" />
        </a-form-model-item>
        <a-form-model-item label="Mon Hosts">
          <a-form-model-item
            v-for="(val, k) in item.monitors"
            :key="val.key"
            :prop="'config.' + i + '.monitors.' + k + '.monitor'"
            :rules="[
              { required: true, message: $t('k8s.text_246'), trigger: 'blur' },
            ]">
            <div class="d-flex align-items-center">
              <a-input v-model="val.monitor" :placeholder="$t('k8s.text_247')" />
              <a-icon type="minus-circle" style="color: #F56C6C;" class="cursor-pointer ml-2" v-if="item.monitors.length > 1" @click="decreaseMonitor(item, k)" />
              <!-- <i style="color: #F56C6C;" class="cursor-pointer ml-2" v-if="item.monitors.length > 1" @click="decreaseMonitor(item, k)" /> -->
            </div>
          </a-form-model-item>
          <a-button type="link" size="small" @click="addMonitor(item)">{{$t('k8s.text_248')}}</a-button>
        </a-form-model-item>
        <div class="d-flex flex-row-reverse">
          <a-button style="color: #F56C6C;" type="link" v-if="formData.config.length > 1" @click="decreaseConfig(item)">{{$t('k8s.text_201')}}</a-button>
        </div>
      </a-card>
      <a-button type="link" size="small" @click="addConfig">{{$t('k8s.text_249')}}</a-button>
      <a-form-model-item :wrapper-col="{ span: 20, offset: 3 }">
        <a-button class="mr-2" type="primary" @click="handleConfirm('formRef')" :loading="loading">{{$t('common.create')}}</a-button>
        <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { uuid } from '@/utils/utils'

export default {
  name: 'KubeComponentCeph',
  props: {
    updateData: {
      type: Object,
    },
  },
  data () {
    let formData = {
      config: [
        {
          key: uuid(),
          clusterId: '',
          monitors: [{
            monitor: '',
            key: uuid(),
          }],
        },
      ],
    }
    if (this.updateData && R.is(Array, this.updateData.config)) {
      formData = {
        config: this.updateData.config.map(val => {
          return {
            key: uuid(),
            clusterId: val.clusterId,
            monitors: val.monitors.map(v => ({
              monitor: v,
              key: uuid(),
            })),
          }
        }),
      }
    }
    return {
      loading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      formData,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'scope', 'isAdminMode']),
  },
  methods: {
    addConfig () {
      this.formData.config.push({
        key: uuid(),
        clusterId: '',
        monitors: [{
          monitor: '',
          k: uuid(),
        }],
      })
    },
    decreaseConfig (item) {
      const index = this.formData.config.findIndex(val => val.key === item.key)
      this.formData.config.splice(index, 1)
    },
    decreaseMonitor (item, k) {
      item.monitors.splice(k, 1)
    },
    addMonitor (item) {
      const index = this.formData.config.findIndex(val => val.key === item.key)
      this.formData.config[index].monitors.push({
        monitor: '',
        k: uuid(),
      })
    },
    cancel () {
      this.$router.push('/k8s-kubecomponent')
    },
    async handleConfirm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = this.formData.config.map(val => {
            return {
              clusterId: val.clusterId,
              monitors: val.monitors.map(v => v.monitor),
            }
          })
          this.$emit('submit', { config: data })
        }
      })
    },
  },
}
</script>
