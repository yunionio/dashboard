<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1100')}}</div>
    <div slot="body">
      <a-form-model
        :model="form"
        :rules="rules"
        ref="form"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('network.cdn.ssl_setting')" prop="ssl_setting" :extra="$t(`network.cdn.ssl_setting.${form.ssl_setting}.extra`)">
          <a-select v-model="form.ssl_setting">
            <a-select-option v-for="item in SSL_SETTINGS" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.https_enabled')" prop="https_enabled" :extra="$t(`network.cdn.https_enabled.extra`)">
          <a-switch v-model="form.https_enabled" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.https_rewrites')" prop="https_rewrites">
          <a-switch v-model="form.https_rewrites" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.cache_level')" prop="cache_level">
          <a-select v-model="form.cache_level">
            <a-select-option v-for="item in CACHE_LEVELS" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.browser_cache_ttl')" prop="browser_cache_ttl">
          <a-select v-model="form.browser_cache_ttl">
            <a-select-option v-for="item in BROWSER_CACHE_TTL" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('network.cdn.dnssec_enabled')" prop="dnssec_enabled">
          <a-switch v-model="form.dnssec_enabled" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { SSL_SETTINGS, CACHE_LEVELS, BROWSER_CACHE_TTL } from '../constants'

export default {
  name: 'CdnDomainChangeConfigDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data[0]
    return {
      loading: false,
      SSL_SETTINGS,
      BROWSER_CACHE_TTL,
      CACHE_LEVELS,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      form: {
        ssl_setting: data.ssl_setting,
        https_enabled: data.https?.enabled,
        https_rewrites: data.https_rewrites,
        cache_level: data.cache_level,
        browser_cache_ttl: data.browser_cache_ttl,
        dnssec_enabled: data.dnssec_enabled,
      },
    }
  },
  computed: {
  },
  methods: {
    doUpdate (data) {
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'change-config',
          data,
        },
      })
    },
    genParams () {
      const ret = {
        ...this.form,
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = this.genParams()
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
