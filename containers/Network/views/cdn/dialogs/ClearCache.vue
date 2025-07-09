<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.cdn.clear_cache')}}</div>
    <div slot="body">
      <a-form-model
        :model="form"
        :rules="rules"
        ref="form"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('network.cdn.clear_method')" prop="clear_method" :extra="$t(`network.cdn.clear_method.${form.clear_method}.extra`)">
          <a-select v-model="form.clear_method" @change="handleClearMethodChange">
            <a-select-option v-for="item in clearMethodOptions" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item v-if="form.clear_method !== 'all'" :label="clearListLabel" prop="clear_list">
          <a-textarea v-model="form.clear_list" :rows="4" :placeholder="$t('network.cdn.clear_list_placeholder', [$t(`network.cdn.clear_method.${form.clear_method}`)])" />
        </a-form-model-item>
        <a-collapse :bordered="false" v-model="collapseActive" v-if="form.clear_method === 'url'">
          <a-collapse-panel :header="$t('network.cdn.clear_cache_advanced')" key="1">
            <a-alert :message="$t('network.cdn.clear_cache_advanced_description')" type="info" />
            <a-form-model-item class="mt-3" :label="$t('network.cdn.clear_cache_device_type')">
              <a-select v-model="form.clear_cache_device_type">
                <a-select-option v-for="item in clearCacheDeviceTypeOptions" :key="item.key" :value="item.key">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item :label="$t('network.cdn.clear_cache_country')">
              <a-select v-model="form.clear_cache_country">
                <a-select-option v-for="item in COUNTRYS" :key="item.key" :value="item.key">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-collapse-panel>
        </a-collapse>
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
import { validateModelForm } from '@/utils/validate'
import { COUNTRYS } from '../constants'

export default {
  name: 'CdnDomainClearCacheDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      collapseActive: false,
      form: {
        clear_method: 'all',
        clear_list: '',
        clear_cache_device_type: undefined,
        clear_cache_country: undefined,
      },
      clearMethodOptions: [
        {
          key: 'all',
          label: this.$t('network.cdn.clear_method.all'),
        },
        {
          key: 'url',
          label: this.$t('network.cdn.clear_method.url'),
        },
        {
          key: 'host',
          label: this.$t('network.cdn.clear_method.host'),
        },
        {
          key: 'tag',
          label: this.$t('network.cdn.clear_method.tag'),
        },
        {
          key: 'prefix',
          label: this.$t('network.cdn.clear_method.prefix'),
        },
      ],
      clearCacheDeviceTypeOptions: [
        {
          key: 'desktop',
          label: this.$t('network.cdn.clear_cache_device_type.desktop'),
        },
        {
          key: 'tablet',
          label: this.$t('network.cdn.clear_cache_device_type.tablet'),
        },
        {
          key: 'mobile',
          label: this.$t('network.cdn.clear_cache_device_type.mobile'),
        },
      ],
      COUNTRYS,
      rules: {
        clear_method: { required: true, message: this.$t('common.tips.select', [this.$t('network.cdn.clear_method')]) },
        clear_list: {
          required: true,
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error(this.$t('common.tips.input', [this.clearListLabel])))
              return
            }
            if (this.form.clear_method === 'url') {
              const files = value.split('\n')
              if (files.some(file => !this.validateFileURL(file))) {
                callback(new Error(this.$t('network.cdn.clear_url_invalid')))
                return
              }
              callback()
            }
          },
        },
      },
    }
  },
  computed: {
    clearListLabel () {
      return this.$t(`network.cdn.clear_method.${this.form.clear_method}`)
    },
  },
  methods: {
    validateFileURL (fileContent) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      return urlRegex.test(fileContent)
    },
    handleClearMethodChange () {
      this.form.clear_list = ''
      this.collapseActive = false
    },
    doUpdate (data) {
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'clear-cache',
          data,
        },
      })
    },
    genParams () {
      const ret = {}
      const files = this.form.clear_list.split('\n')
      if (this.form.clear_method === 'all') {
        ret.purge_everything = true
      }
      if (this.form.clear_method === 'url') {
        if (this.collapseActive || this.form.clear_cache_device_type || this.form.clear_cache_country) {
          ret.files = files.map(url => {
            return {
              url,
              headers: {
                'CF-Device-Type': this.form.clear_cache_device_type,
                'CF-IPCountry': this.form.clear_cache_country,
              },
            }
          })
        } else {
          ret.files = files
        }
      }
      if (this.form.clear_method === 'host') {
        ret.hosts = files
      }
      if (this.form.clear_method === 'tag') {
        ret.tags = files
      }
      if (this.form.clear_method === 'prefix') {
        ret.prefixes = files
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
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
