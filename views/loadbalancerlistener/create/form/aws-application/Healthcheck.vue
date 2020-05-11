<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">基础配置</a-divider>
    <a-form-item label="开启健康检查">
      <a-tooltip title="【AWS】的的监听不能关闭健康检查" placement="top">
        <a-switch v-decorator="decorators.health_check" :disabled="true" />
      </a-tooltip>
    </a-form-item>
    <template v-if="form.fd.health_check">
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item label="健康检查协议">
        <a-radio-group v-decorator="decorators.health_check_type" :disabled="isUpdate">
          <a-radio-button v-for="item in healthCheckTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="健康检查路径" v-if="['http', 'https'].includes(allFd.listener_type)">
        <a-input v-decorator="decorators.health_check_uri" placeholder="请输入健康检查路径" />
      </a-form-item>
      <a-form-item label="正常状态码">
        <a-checkbox-group name="checkboxgroup" :options="healthCheckHttpCodeOpts" v-decorator="decorators.health_check_http_code" />
      </a-form-item>
      <a-form-item label="健康检查响应超时时间">
        <a-input v-decorator="decorators.health_check_timeout" addonAfter="秒" placeholder="请输入健康检查响应超时时间" />
      </a-form-item>
      <a-form-item label="健康检查间隔时间">
        <a-input v-decorator="decorators.health_check_interval" addonAfter="秒" placeholder="请输入健康检查间隔时间" />
      </a-form-item>
      <a-form-item label="健康检查健康阈值">
        <a-input v-decorator="decorators.health_check_rise" addonAfter="次" placeholder="请输入健康检查健康阈值" />
      </a-form-item>
      <a-form-item label="健康检查不健康阈值">
        <a-input v-decorator="decorators.health_check_fall" addonAfter="次" placeholder="请输入健康检查健康阈值" />
      </a-form-item>
    </template>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateHealcheck',
  mixins: [mixin],
}
</script>
