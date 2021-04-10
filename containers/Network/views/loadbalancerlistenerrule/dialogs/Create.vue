<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_521')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('network.text_21')">
          <a-input v-decorator="decorators.name"  :placeholder="$t('network.text_522')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_156')">
          <div slot="extra">
            <!-- - 泛解析域名：*.test.com，*一定在第一个字符，并且是*.或者*aaa.的格式，*不能在最后。<br /> -->{{$t('network.text_523')}}</div>
          <a-input v-decorator="decorators.domain" :placeholder="$t('network.text_522')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_524')">
          <div slot="extra">
            {{$t('network.text_525')}}
            <span v-if="isDomainOrPathProviders" :class="{'error-color': !isDomainOrPath}">{{$t('common_465')}}</span>
          </div>
          <a-input v-decorator="decorators.path" :placeholder="$t('network.text_522')" />
        </a-form-item>
         <redirect-form-items v-if="isOneCloud" :form="form" @redirectChange="handleRedirectChange" />
         <template v-if="!isRedirect">
          <a-form-item :label="$t('network.text_139')">
            <base-select
              resource="loadbalancerbackendgroups"
              need-params
              :params="bgParams"
              filterable
              v-decorator="decorators.backend_group"
              :select-props="{ placeholder: $t('network.text_394') }" />
          </a-form-item>
          <a-form-item v-if="isOneCloud" :label="$t('network.text_527')">
            <div slot="extra">{{$t('network.text_438')}}</div>
            <a-input :min="0" v-decorator="decorators.http_request_rate" :addonAfter="$t('network.text_439')" type="number" />
          </a-form-item>
          <a-form-item v-if="isOneCloud" :label="$t('network.text_440')">
            <div slot="extra">{{$t('network.text_528')}}</div>
            <a-input :min="0" v-decorator="decorators.http_request_rate_per_src" :addonAfter="$t('network.text_439')" type="number" />
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
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        domain: [
          'domain',
          {
            rules: [
              { required: provider === 'qcloud', message: this.$t('network.text_530') },
              { validator: customDomain, message: this.$t('network.text_531'), trigger: 'blur' },
            ],
          },
        ],
        path: [
          'path',
          {
            validateFirst: true,
            rules: [
              { required: provider === 'qcloud', message: this.$t('network.text_530') },
              { pattern: /^\/.+/, message: this.$t('network.text_529'), trigger: 'blur' },
            ],
          },
        ],
        backend_group: [
          'backend_group',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_394') },
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
      return this.provider === 'huawei' || this.provider === 'aliyun' || this.provider === 'aws' || this.provider === 'openstack'
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
