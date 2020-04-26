<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">基础配置</a-divider>
    <a-form-item label="开启健康检查">
      <a-switch v-decorator="decorators.health_check" @change="healthCheckChange" />
    </a-form-item>
    <template v-if="form.fd.health_check">
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item label="健康检查协议">
        <a-radio-group v-decorator="decorators.health_check_type">
          <a-radio-button v-for="item in healthCheckTypeOptsC" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="健康检查路径" v-if="['tcp', 'http', 'https'].includes(allFd.listener_type) && ['http'].includes(form.fd.health_check_type)">
        <a-input v-decorator="decorators.health_check_uri" placeholder="请输入健康检查路径" />
      </a-form-item>
      <a-form-item label="健康检查域名" v-if="['tcp', 'http', 'https'].includes(allFd.listener_type) && ['http'].includes(form.fd.health_check_type)">
        <a-input v-decorator="decorators.health_check_domain" placeholder="请输入健康检查域名" />
      </a-form-item>
      <a-form-item label="正常状态码" v-if="['tcp', 'http', 'https'].includes(allFd.listener_type) && ['http'].includes(form.fd.health_check_type)">
        <a-checkbox-group name="checkboxgroup" :options="healthCheckHttpCodeOpts" v-decorator="decorators.health_check_http_code" />
      </a-form-item>
      <a-form-item label="健康检查响应超时时间" v-if="['tcp', 'udp', 'http'].includes(allFd.listener_type)">
        <a-input v-decorator="decorators.health_check_timeout" addonAfter="秒" placeholder="请输入健康检查响应超时时间" />
      </a-form-item>
      <a-form-item label="健康检查间隔时间" v-if="['http', 'https'].includes(allFd.listener_type)">
        <a-input v-decorator="decorators.health_check_interval" addonAfter="秒" placeholder="请输入健康检查间隔时间" />
      </a-form-item>
      <a-form-item label="健康检查健康阈值">
        <a-input v-decorator="decorators.health_check_rise" addonAfter="次" placeholder="请输入健康检查健康阈值" />
      </a-form-item>
      <a-form-item label="健康检查不健康阈值">
        <a-input v-decorator="decorators.health_check_fall" addonAfter="次" placeholder="请输入健康检查健康阈值" />
      </a-form-item>
      <!-- 仅在阿里云有效 -->
      <!-- <a-form-item label="健康检查请求">
        <a-input v-decorator="decorators.health_check_req" placeholder="自定义健康检查请求" />
      </a-form-item>
      <a-form-item label="健康检查返回结果">
        <a-input v-decorator="decorators.health_check_exp" placeholder="UDP监听健康检查的响应串" />
      </a-form-item> -->
    </template>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateHealcheck',
  mixins: [mixin],
  computed: {
    healthCheckTypeOptsC () { // onecloud 独有逻辑，udp的监听只能配udp的健康检查
      if (this.allFd.listener_type === 'udp') {
        return this.healthCheckTypeOpts.filter(v => v.key === 'udp')
      }
      return this.healthCheckTypeOpts.filter(v => v.key !== 'udp')
    },
  },
  watch: {
    healthCheckTypeOptsC (val) {
      this.setDefaultHealthCheckType(val)
    },
  },
  mounted () {
    const newField = {
      [this.decorators.health_check_type[0]]: this.healthCheckTypeOptsC[0].key,
    }
    if (this.allFd.listener_type === 'udp') {
      newField[this.decorators.health_check[0]] = false
    }
    this.form.fc.setFieldsValue(newField)
  },
  methods: {
    healthCheckChange (val) {
      if (val) {
        this.setDefaultHealthCheckType(this.healthCheckTypeOptsC)
      }
    },
  },
}
</script>
