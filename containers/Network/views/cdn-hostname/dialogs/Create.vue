<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title || $t('network.create_cdn_custom_hostname')}}</div>
    <div slot="body">
      <a-form-model
        :model="form"
        :rules="rules"
        ref="form"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('network.cdn.hostname')" prop="hostname">
          <a-input v-model="form.hostname" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.min_tls_version')" prop="min_tls_version">
          <a-select v-model="form.min_tls_version">
            <a-select-option v-for="item in MIN_TLS_VERSIONS" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.certificate_type')" prop="certificate_type">
          <a-select v-model="form.certificate_type">
            <a-select-option value="cloudflare">
              {{ $t('network.cdn.certificate_type_cloudflare') }}
            </a-select-option>
            <a-select-option value="custom">
              {{ $t('network.cdn.certificate_type_custom') }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <template v-if="form.certificate_type === 'cloudflare'">
          <a-form-model-item :label="$t('network.cdn.certificate_authority')" prop="certificate_authority">
            <a-select v-model="form.certificate_authority">
              <a-select-option value="google">
                {{ $t('network.cdn.certificate_authority.google') }}
              </a-select-option>
              <a-select-option value="ssl_com">
                {{ $t('network.cdn.certificate_authority.ssl_com') }}
              </a-select-option>
              <a-select-option value="lets_encrypt">
                {{ $t('network.cdn.certificate_authority.lets_encrypt') }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('network.cdn.ceritificate_verify_method')" prop="method">
            <a-select v-model="form.method">
              <a-select-option value="http">
                {{ $t('network.cdn.certificate_verify_method.http') }}
              </a-select-option>
              <a-select-option value="txt">
                {{ $t('network.cdn.certificate_verify_method.txt') }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </template>
        <template v-else>
          <a-form-model-item :label="$t('network.cdn.certificate_type_custom')" prop="custom_certificate">
            <a-textarea v-model="form.custom_certificate" :placeholder="$t('common.pem_certificate.placeholder')" :rows="5" />
          </a-form-model-item>
          <a-form-model-item :label="$t('network.cdn.bundle_method')" prop="bundle_method">
            <a-select v-model="form.bundle_method">
              <a-select-option value="ubiquitous">
                {{ $t('network.cdn.bundle_method.ubiquitous') }}
              </a-select-option>
              <a-select-option value="optimal">
                {{ $t('network.cdn.bundle_method.optimal') }}
              </a-select-option>
              <a-select-option value="force">
                {{ $t('network.cdn.bundle_method.force') }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('network.cdn.custom_key')" prop="custom_key">
            <a-textarea v-model="form.custom_key" :placeholder="$t('common.pem_private_key.placeholder')" :rows="5" />
          </a-form-model-item>
        </template>
        <a-form-model-item :label="$t('network.cdn.wildcard_enabled')" required>
          <a-switch v-model="form.wildcard" :disabled="form.method === 'http'" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.origin_server')" prop="origin_server">
          <a-select v-model="form.origin_server">
            <a-select-option value="default">
              {{ $t('network.cdn.origin_server.default') }}
            </a-select-option>
            <a-select-option value="custom">
              {{ $t('network.cdn.origin_server.custom') }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item v-if="form.origin_server === 'custom'" :label="$t('network.cdn.origin_server.custom')" prop="custom_origin_server">
          <a-input v-model="form.custom_origin_server" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" v-if="params.type !== 'edit'" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { MIN_TLS_VERSIONS } from '../constants'

export default {
  name: 'CdnHostnameCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data.length ? this.params.data[0] : {}
    return {
      loading: false,
      MIN_TLS_VERSIONS,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      form: {
        hostname: data.hostname,
        min_tls_version: data.ssl?.settings?.min_tls_version || '1.0',
        certificate_type: data.ssl?.type === 'dv' || !this.params.data.length ? 'cloudflare' : 'custom',
        certificate_authority: data.ssl?.certificate_authority || 'google',
        method: data.ssl?.method || 'txt',
        custom_key: data.ssl?.private_key || '', // 私钥
        custom_certificate: data.ssl?.custom_certificate || '', // 自定义证书
        bundle_method: data.ssl?.bundle_method || 'ubiquitous', // 捆绑方法
        origin_server: data.custom_origin_server ? 'custom' : 'default', // 源服务器
        custom_origin_server: data.custom_origin_server || '', // 自定义源服务器
        wildcard: data.ssl?.wildcard || false,
      },
      rules: {
        hostname: [
          {
            required: true,
            validator: this.validateHostname,
          },
        ],
        min_tls_version: [
          { required: true },
        ],
        certificate_type: [
          { required: true },
        ],
        certificate_authority: [
          { required: true },
        ],
        method: [
          { required: true },
        ],
        custom_certificate: [
          {
            required: true,
            validator: this.$validate('pem_certificate'),
          },
        ],
        bundle_method: [
          { required: true },
        ],
        custom_key: [
          { required: true, validator: this.$validate('pem_private_key') },
        ],
        origin_server: [
          { required: true },
        ],
        custom_origin_server: [
          { required: true, validator: this.validateHostname },
        ],
      },
    }
  },
  computed: {
  },
  watch: {
    'form.method': {
      handler (val) {
        if (val === 'http') {
          this.form.wildcard = false
        }
      },
    },
  },
  methods: {
    validateHostname (rule, value, callback) {
      // 基本格式验证
      const basicPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
      if (!basicPattern.test(value)) {
        callback(new Error(this.$t('network.cdn.hostname.check.format')))
        return
      }
      // 长度验证（小于256字符）
      if (value.length >= 256) {
        callback(new Error(this.$t('network.cdn.hostname.check.length')))
        return
      }
      // 不能是IP地址
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
      if (ipPattern.test(value)) {
        callback(new Error(this.$t('network.cdn.hostname.check.ip')))
        return
      }
      // 不能包含特殊字符
      const specialCharPattern = /[_~`!@#$%^*()=+{}[\]|\\;:'",<>/?]/
      if (specialCharPattern.test(value)) {
        callback(new Error(this.$t('network.cdn.hostname.check.special')))
        return
      }
      // 不能以连字符开头或结尾
      if (value.startsWith('-') || value.endsWith('-')) {
        callback(new Error(this.$t('network.cdn.hostname.check.special_line')))
        return
      }
      // 不能以禁止的域名结尾
      const prohibitedPattern = /\.(example\.com|example\.net|example\.org)$/i
      if (prohibitedPattern.test(value)) {
        callback(new Error(this.$t('network.cdn.hostname.check.prohibited')))
        return
      }
      callback()
    },
    doCreate (data) {
      return new this.$Manager(`cdn_domains/${this.params.cdnDomainId}/add-custom-hostname`).create({ data })
    },
    genParams () {
      const ret = {
        hostname: this.form.hostname,
        ssl: {
          settings: { min_tls_version: this.form.min_tls_version },
          wildcard: this.form.wildcard,
        },
      }
      if (this.form.certificate_type === 'cloudflare') {
        ret.ssl.certificate_authority = this.form.certificate_authority
        ret.ssl.method = this.form.method
        ret.ssl.type = 'dv'
      } else {
        ret.ssl.custom_certificate = this.form.custom_certificate
        ret.ssl.private_key = this.form.custom_key
        ret.ssl.bundle_method = this.form.bundle_method
      }
      if (this.form.origin_server === 'custom') {
        ret.custom_origin_server = this.form.custom_origin_server
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        const values = this.genParams()
        await this.doCreate(values)
        this.loading = false
        this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
