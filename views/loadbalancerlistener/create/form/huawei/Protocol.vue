<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">基础配置</a-divider>
    <a-form-item label="名称">
      <a-input :disabled="isUpdate" v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceName')" />
      <name-repeated v-if="!isUpdate" v-slot:extra res="loadbalancerlisteners" :name="form.fd.generate_name" />
    </a-form-item>
    <a-form-item label="监听端口">
      <a-input :disabled="isUpdate" type="number" v-decorator="decorators.listener_port" placeholder="请填写负载均衡对外服务的端口, 端口范围 1-65535" />
    </a-form-item>
    <a-form-item label="协议" class="mb-0">
      <listener-types :decorators="decorators" :disabled="isUpdate" />
    </a-form-item>
    <a-form-item label="证书" v-if="form.fd.listener_type === 'https'">
      <base-select
        v-decorator="decorators.certificate"
        resource="loadbalancercertificates"
        :params="certificateParams"
        show-sync
        :select-props="{ placeholder: '请选择证书' }" />
      <div slot="extra">没有想要的？可以前往<help-link href="/lbcert"> 新建证书</help-link></div>
    </a-form-item>
    <a-divider orientation="left">高级配置</a-divider>
    <a-form-item label="调度算法" class="mb-0">
      <scheduler-types :decorators="decorators" :form="form" :schedulerTypeOpts="schedulerTypeOpts" />
    </a-form-item>
    <sticky-session :decorators="decorators" :form="form" :stickySessionTypeOpts="stickySessionTypeOpts" :sticky_session_cookie_timeout_decorator="sticky_session_cookie_timeout_decorator" />
    <acl :decorators="decorators" :form="form" :aclTypeOpts="aclTypeOpts" />
    <a-form-item label="启用HTTP2.0" v-if="['https'].includes(form.fd.listener_type)">
      <a-switch v-decorator="decorators.enable_http2" />
    </a-form-item>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateProtocol',
  mixins: [mixin],
  data () {
    return {
      aclTypeOpts: [
        { key: 'white', label: '白名单：允许特定IP访问负载均衡' },
      ],
      stickySessionTypeOpts: [
        {
          key: 'insert',
          label: '植入 Cookie',
        },
        {
          key: 'server',
          label: '重写 Cookie',
        },
      ],
    }
  },
  computed: {
    sticky_session_cookie_timeout_decorator () {
      const httpArr = ['http', 'https']
      let max = 60
      const validator = (rule, value, cb) => {
        if (+value % 60 === 0) {
          cb()
        } else {
          cb(Error('请输入 60 的整数倍'))
        }
      }
      if (httpArr.includes(this.form.fd.listener_type)) max = 1440
      return [
        this.decorators.sticky_session_cookie_timeout[0],
        {
          initialValue: 60,
          normalize: v => Number(v),
          rules: [
            { validator, trigger: 'blur' },
            { type: 'integer', min: 60, max, message: `请输入监听端口在 60-${max} 之间`, trigger: 'blur' },
          ],
        },
      ]
    },
  },
  watch: {
    'form.fd.listener_type' (val) {
      this.setStickySessionTypeOpts(val)
    },
  },
  methods: {
    setStickySessionTypeOpts (listenerType) {
      if (listenerType === 'http') {
        this.stickySessionTypeOpts = [
          { key: 'insert', label: '植入 Cookie' },
          { key: 'server', label: '重写 Cookie' },
        ]
      } else {
        this.stickySessionTypeOpts = [
          { key: 'insert', label: '植入 Cookie' },
        ]
        if (this.form.fc.getFieldValue(this.decorators.sticky_session_type[0]) === 'server') {
          this.form.fc.setFieldsValue({
            [this.decorators.sticky_session_type[0]]: 'insert',
          })
        }
      }
    },
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
