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
            - 标准域名：例如，www.test.com;(www可以省略)
          </div>
          <a-input v-decorator="decorators.domain" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="URL">
          <div slot="extra">
            - 长度限制为2-80个字符，只能使用字母、数字、‘-’、‘/’、‘.’、‘%’、‘?’、‘#’、‘&’这些字符<br />
            - URL不能只为"/"，但必须以"/"开头<br />
            - 域名、服务器组为必填，URL默认值“/”，备注为选填
          </div>
          <a-input v-decorator="decorators.path" placeholder="请输入" />
        </a-form-item>
         <redirect-form-items :form="form" @redirectChange="handleRedirectChange" />
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
          <a-form-item label="限定接受请求速率">
            <div slot="extra">
              0为默认，表示不限速
            </div>
            <a-input :min="0" v-decorator="decorators.http_request_rate" addonAfter="次/秒" type="number" />
          </a-form-item>
          <a-form-item label="限定同源IP发送请求速率">
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
    const urlRules = [
      { pattern: /^\/.+/, message: '请根据提示输入规范URL', trigger: 'blur' },
    ]
    if (this.params.lbListenerData.provider && this.params.lbListenerData.provider.toLowerCase() === 'qcloud') {
      urlRules.unshift({ required: true, message: '请输入URL' })
    }
    return {
      isRedirect: false,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
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
              { required: true, message: '请输入域名' },
              { validator: customDomain, message: '请根据提示输入规范域名', trigger: 'blur' },
            ],
          },
        ],
        path: [
          'path',
          {
            validateFirst: true,
            rules: urlRules,
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
      if (this.params.provider && this.params.provider.toLowerCase() === 'aliyun') {
        params.type = 'normal'
      }
      return params
    },
  },
  methods: {
    handleRedirectChange (bool) {
      this.isRedirect = bool
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
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.redirect = values.redirect ? 'raw' : 'off'
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
