<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建转发策略</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item label="名称">
          <a-input v-decorator="decorators.name"  placeholder="请输入" />
        </a-form-item>
        <a-form-item label="域名">
          <div slot="extra">
            <!-- - 泛解析域名：*.test.com，*一定在第一个字符，并且是*.或者*aaa.的格式，*不能在最后。<br /> -->
            域名仅支持精确匹配
          </div>
          <a-input v-decorator="decorators.domain" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="URL路径">
          <div slot="extra">
            以"/"开头，但不能只填“/”，URL路径支持前缀匹配，匹配所有以设置的路径开头的URL路径。
            <span v-if="isDomainOrPathProviders" :class="{'error-color': !isDomainOrPath}">域名和URL必须填写一项</span>
          </div>
          <a-input v-decorator="decorators.path" placeholder="请输入" />
        </a-form-item>
         <redirect-form-items v-if="isOneCloud" :form="form" @redirectChange="handleRedirectChange" />
         <template v-if="!isRedirect">
          <a-form-item label="后端服务器组">
            <base-select
              resource="loadbalancerbackendgroups"
              need-params
              :params="bgParams"
              filterable
              v-decorator="decorators.backend_group"
              :select-props="{ placeholder: '请选择后端服务器组' }" />
          </a-form-item>
          <a-form-item v-if="isOneCloud" label="限定接受请求速率">
            <div slot="extra">
              0为默认，表示不限速
            </div>
            <a-input :min="0" v-decorator="decorators.http_request_rate" addonAfter="次/秒" type="number" />
          </a-form-item>
          <a-form-item v-if="isOneCloud" label="限定同源IP发送请求速率">
            <div slot="extra">
              限制同一源地址对转发策略发送请求的速率，0为默认值，表示不限速
            </div>
            <a-input :min="0" v-decorator="decorators.http_request_rate_per_src" addonAfter="次/秒" type="number" />
          </a-form-item>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import RedirectFormItems from '@Network/views/loadbalancerlistener/components/RedirectFormItems'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { REGEXP } from '@/utils/validate'

export default {
  name: 'LoadbalancerlistenerruleCreateDialog',
  components: {
    RedirectFormItems,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const provider = this.params.lbListenerData.provider.toLowerCase()
    const customDomain = (rule, value, callback) => {
      // 泛解析域名：*.test.com，*一定在第一个字符，并且是*.或者*aaa.的格式，*不能在最后。
      // const reg = /^\*.*\..[a-zA-Z]+/
      if (value === '' || REGEXP.domain.regexp.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
      // else if (reg.test(value) && !value.endsWith('.')) {
      //   callback()
      // }
    }
    return {
      isRedirect: false,
      loading: false,
      isDomainOrPath: true,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        domain: [
          'domain',
          {
            rules: [
              { required: provider === 'qcloud', message: '请输入域名' },
              { validator: customDomain, message: '请根据提示输入规范域名', trigger: 'blur' },
            ],
          },
        ],
        path: [
          'path',
          {
            validateFirst: true,
            rules: [
              { required: provider === 'qcloud', message: '请输入URL' },
              { pattern: /^\/.+/, message: '请根据提示输入规范URL', trigger: 'blur' },
            ],
          },
        ],
        backend_group: [
          'backend_group',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请选择后端服务器组' },
            ],
          },
        ],
        http_request_rate: [
          'http_request_rate',
          {
            normalize: v => Number(v),
            initialValue: 0,
          },
        ],
        http_request_rate_per_src: [
          'http_request_rate_per_src',
          {
            normalize: v => Number(v),
            initialValue: 0,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    bgParams () {
      const params = {
        scope: this.$store.getters.scope,
        loadbalancer: this.params.lbListenerData.loadbalancer_id,
      }
      if (this.params.lbListenerData.provider && this.params.lbListenerData.provider.toLowerCase() === 'aliyun') {
        params.type = 'normal'
      }
      return params
    },
    provider () {
      return this.params.lbListenerData.provider.toLowerCase()
    },
    isOneCloud () {
      return this.provider === 'onecloud'
    },
    isDomainOrPathProviders () {
      return this.provider === 'huawei' || this.provider === 'aliyun' || this.provider === 'aws'
    },
  },
  created () {
    this.form.fc.getFieldDecorator('listener_type', {
      preserve: true,
      initialValue: this.params.lbListenerData.listener_type,
    })
  },
  methods: {
    handleRedirectChange (bool) {
      this.isRedirect = bool
    },
    async onValuesChange (props, values) {
      await this.$nextTick()
      const redirectKeys = ['redirect', 'redirect_scheme', 'redirect_host', 'redirect_path']
      if (redirectKeys.indexOf(Object.keys(values)[0]) > -1) {
        this.form.fc.resetFields(['check'])
        this.form.fc.validateFields(['check'])
      }
      const { path, domain } = this.form.fc.getFieldsValue(['path', 'domain'])
      if (this.isDomainOrPathProviders) {
        this.isDomainOrPath = path || domain
      }
    },
    async doCreate (values) {
      const data = {
        ...values,
        listener: this.params.lbListenerData.id,
      }
      await new this.$Manager('loadbalancerlistenerrules').create({
        data,
      })
    },
    async handleConfirm () {
      try {
        const { path, domain } = this.form.fc.getFieldsValue(['path', 'domain'])
        const values = await this.form.fc.validateFields()
        if (this.isDomainOrPathProviders) {
          this.isDomainOrPath = path || domain
          if (!(path || domain)) {
            return false
          }
        }
        this.loading = true
        values.redirect = values.redirect ? 'raw' : 'off'
        if (!values.redirect_host) {
          delete values.redirect_host
        }
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
