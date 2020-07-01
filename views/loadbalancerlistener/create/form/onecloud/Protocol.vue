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
    <redirect-form-items v-if="['http', 'https'].includes(form.fd.listener_type)" :form="form" />
    <!-- <a-divider orientation="left">高级配置</a-divider> -->
    <a-collapse :bordered="false">
      <a-collapse-panel header="高级配置" key="1" forceRender>
        <!-- 开启重定向 -->
        <div v-if="isLbRedirected">
          <acl :decorators="decorators" :form="form" />
          <a-form-item label="连接空闲超时时间" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_idle_timeout" addonAfter="秒" type="number" />
          </a-form-item>
          <a-form-item label="连接请求超时时间" v-if="['http'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_request_timeout" addonAfter="秒" type="number" />
          </a-form-item>
          <a-form-item label="启用HTTP2.0" v-if="['https'].includes(form.fd.listener_type)">
            <a-switch v-decorator="decorators.enable_http2" />
          </a-form-item>
        </div>
        <div v-if="!isLbRedirected">
          <a-form-item label="调度算法" class="mb-0">
            <scheduler-types :decorators="decorators" :form="form" :schedulerTypeOpts="schedulerTypeOpts" />
          </a-form-item>
          <sticky-session :decorators="decorators" :form="form" v-if="['http', 'https'].includes(form.fd.listener_type)" />
          <acl :decorators="decorators" :form="form" />
          <a-form-item label="后端连接超时时间" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.backend_connect_timeout" addonAfter="秒" type="number" />
          </a-form-item>
          <a-form-item label="后端连接空闲时间" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.backend_idle_timeout" addonAfter="秒" type="number" />
          </a-form-item>
          <a-form-item label="连接空闲超时时间" v-if="['http', 'tcp', 'udp'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_idle_timeout" addonAfter="秒" type="number" />
          </a-form-item>
          <a-form-item label="连接请求超时时间" v-if="['http'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.client_request_timeout" addonAfter="秒" type="number" />
          </a-form-item>
          <a-form-item label="限定接收请求速率" extra="0为默认，表示不限速" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.http_request_rate" addonAfter="次/秒" type="number" />
          </a-form-item>
          <a-form-item label="限定同源IP发送请求速率" extra="限制同一源地址对监听发送请求的速率，0为默认值，表示不限速" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-input v-decorator="decorators.http_request_rate_per_src" addonAfter="次/秒" type="number" />
          </a-form-item>
          <a-form-item label="启用HTTP2.0" v-if="['https'].includes(form.fd.listener_type)">
            <a-switch v-decorator="decorators.enable_http2" />
          </a-form-item>
          <a-form-item label="Gzip数据压缩" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-switch v-decorator="decorators.gzip" />
          </a-form-item>
          <a-form-item label="设置PROXY协议" extra="通过PROXY协议获取客户端真实IP" v-if="['tcp', 'http', 'https'].includes(form.fd.listener_type)">
            <a-select v-decorator="decorators.send_proxy">
              <a-select-option v-for="(v, k) in proxyOpts" :value="k" :key="k">
                {{v}}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- <a-form-item label="获取客户端真实IP" extra="通过X-Forwarded-For头字段获取客户端真实 IP" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-checkbox v-decorator="decorators.xforwarded_for">X-Forwarded-For</a-checkbox>
          </a-form-item> -->
          <a-form-item label="附加HTTP头部字段" v-if="['http', 'https'].includes(form.fd.listener_type)">
            <a-checkbox v-decorator="decorators.xforwarded_for">通过X-Forwarded-For字段获取客户端真实IP</a-checkbox>
          </a-form-item>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </a-form>
</template>

<script>
import { mapState } from 'vuex'
import mixin from '../mixins/formStepItem'
import RedirectFormItems from '../../../components/RedirectFormItems'

export default {
  name: 'LBListenerCreateProtocol',
  components: {
    RedirectFormItems,
  },
  mixins: [mixin],
  data () {
    return {
      proxyOpts: {
        off: '关闭',
        v1: 'V1',
        v2: 'V2',
        'v2-ssl': 'V2-SSL',
        'v2-ssl-cn': 'V2-SSL-CN',
      },
    }
  },
  computed: {
    ...mapState('common', {
      isLbRedirected: state => {
        return !!state.lbRedirected.isLbRedirected
      },
    }),
  },
  methods: {
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
