<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{$t('network.ssl_certificate.create')}}</div>
    <div slot="body">
      <a-form-model :model="form" :rules="rules" ref="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-model-item :label="$t('network.ssl_certificate.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('network.ssl_certificate.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.ssl_certificate.dns_zone')" prop="dns_zone_id">
          <base-select v-model="form.dns_zone_id" isDefaultSelect resource="dns_zones" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.ssl_certificate.issuer')" prop="issuer">
          <base-select v-model="form.issuer" isDefaultSelect :options="issuerOptions" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.ssl_certificate.sans')" prop="sans">
          <a-textarea v-model="form.sans" :rows="4" :placeholder="$t('network.ssl_certificate.sans.placeholder')" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('network.text_33') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'

function validateHostnameOrWildcard (hostname) {
  // 基本格式检查
  if (!hostname || typeof hostname !== 'string') {
    return false
  }
  const trimmedHostname = hostname.trim()
  if (!trimmedHostname) {
    return false
  }
  // 长度检查
  if (trimmedHostname.length > 253) {
    return false
  }
  // 通配符检查
  if (trimmedHostname.startsWith('*.')) {
    // 通配符格式：*.example.com
    const domainPart = trimmedHostname.substring(2)
    if (!domainPart) {
      return false
    }
    // 验证域名部分
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/
    if (!domainRegex.test(domainPart)) {
      return false
    }
    return true
  } else {
    // 普通主机名格式：example.com
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/
    if (!hostnameRegex.test(trimmedHostname)) {
      return false
    }
    return true
  }
}

export default {
  name: 'SslCertificateCreateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  props: {
    parmas: Object,
  },
  data () {
    return {
      loading: false,
      form: {
        dns_zone_id: undefined,
        issuer: "Let's Encrypt",
        sans: undefined,
        name: undefined,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('resourceName') }],
        dns_zone_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('network.ssl_certificate.dns_zone')]) }],
        issuer: [{ required: true, message: this.$t('common.tips.select', [this.$t('network.ssl_certificate.issuer')]) }],
        sans: [{
          required: true,
          validator: (rule, value, callback) => {
            console.log('value', value)
            if (!value) {
              callback(new Error(this.$t('common.tips.input', [this.$t('network.ssl_certificate.sans')])))
            }
            const lines = value.split('\n').map(line => line.trim()).filter(line => line)
            if (!lines.length) {
              callback(new Error(this.$t('common.tips.input', [this.$t('network.ssl_certificate.sans')])))
            }
            if (lines.some(line => {
              const validation = validateHostnameOrWildcard(line)
              console.log('validation', validation)
              if (!validation) {
                return true
              }
              return false
            })) {
              callback(new Error(this.$t('network.ssl_certificate.sans.invalid')))
            }
            callback()
          },
        }],
      },
      issuerOptions: [
        { id: "Let's Encrypt", name: "Let's Encrypt" },
        { id: 'ZeroSSL', name: 'ZeroSSL' },
      ],
    }
  },
  computed: {
  },
  watch: {
  },
  created () {
  },
  methods: {
    genParams () {
      const {
        name,
        dns_zone_id,
        issuer,
        sans,
      } = this.form
      const ret = {
        name,
        dns_zone_id,
        issuer,
        sans: sans.split('\n').map(line => line.trim()).filter(line => line),
      }
      return ret
    },
    async handleConfirm () {
      try {
        this.loading = true
        await validateModelForm(this.$refs.form)
        const data = this.genParams()
        await this.params.onManager('create', {
          managerArgs: { data },
        })
        this.loading = false
        this.cancelDialog()
      } catch (e) {
        this.loading = false
        throw e
      }
    },
  },
}
</script>
