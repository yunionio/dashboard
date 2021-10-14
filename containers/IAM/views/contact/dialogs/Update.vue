<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_141', [$t('system.text_317')])}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('system.text_142')" :name="$t('system.text_317')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 5)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('system.text_131')">
          <mobile-input v-decorator="decorators.international_mobile" />
        </a-form-item>
        <a-form-item :label="$t('system.text_132')">
          <a-input v-decorator="decorators.email" />
        </a-form-item>
        <a-form-item>
          <span slot="label">
            {{ $t('common_599') }}
            <a-tooltip effect="dark" placement="top">
              <a-icon type="info-circle" />
              <div slot="title">{{$t('system.contact')}}</div>
            </a-tooltip>
          </span>
          <a-checkbox-group
            v-decorator="decorators.enabled_contact_types">
            <a-checkbox
              v-for="(v, index) in contactArrOpts"
              :key="index"
              :value="v.value"
              :disabled="v.disabled">
              {{ v.label }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { contactMap } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import MobileInput from '@/sections/MobileInput'
import { findAndUnshift } from '@/utils/utils'

export default {
  name: 'ContactUpdateDialog',
  components: { MobileInput },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      contactArrOpts: [],
      decorators: {
        international_mobile: [
          'international_mobile',
          {
            initialValue: { mobile: '', area_code: '86' },
            rules: [
              {
                type: 'object',
                required: true,
              },
              { validator: this.checkInternationalMobile },
            ],
          },
        ],
        email: [
          'email',
          {
            rules: [
              {
                required: true,
                message: this.$t('system.text_139'),
                whitespace: true,
              },
              {
                validator: this.$validate('email'),
                message: this.$t('system.text_140'),
                whitespace: true,
              },
            ],
          },
        ],
        enabled_contact_types: [
          'enabled_contact_types',
          {
            initialValue: [],
          },
        ],
      },
      formItemLayout: { // 兼容英文版
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    const domain_id = this.params.data[0]?.domain_id
    this.manager = new this.$Manager('receivers', 'v1')
    this.generateContactArrOpts({ domain_ids: [domain_id] })
  },
  mounted () {
    this.$nextTick(() => {
      const { international_mobile, email, enabled_contact_types } = this.params.data[0]
      this.form.fc.setFieldsValue({
        international_mobile,
        email,
        enabled_contact_types,
      })
    })
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { domain, email, international_mobile, enabled_contact_types } = values
        const data = {
          email,
          domain,
          international_mobile,
          enabled_contact_types,
        }
        await this.manager.update({
          id: this.params.data[0].id,
          data,
        })
        this.loading = false
        this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async generateContactArrOpts (params) {
      let config_contact_types = []
      try {
        config_contact_types = await this.fetchConfig(params)
      } catch (error) {
        throw error
      }
      const contactArrOpts = config_contact_types.filter((item) => {
        return !item.includes('robot')
      }).map((item) => {
        return {
          label: contactMap[item].label || item,
          value: item,
          disabled: item === 'webconsole',
        }
      })
      this.contactArrOpts = contactArrOpts
    },
    fetchConfig (params) {
      return new Promise((resolve, reject) => {
        new this.$Manager('receivers', 'v1').performClassAction({ action: 'get-types', data: params }).then((res) => {
          const { types } = res.data
          const sortData = findAndUnshift(types, item => item === 'webconsole')
          resolve(sortData)
        }).catch((err) => {
          reject(err)
        })
      })
    },
    checkInternationalMobile (rule, value, callback) {
      if (!value.mobile) {
        callback(this.$t('system.text_138'))
      }
      if (!/^[0-9-]{6,14}$/.test(value.mobile)) {
        callback(this.$t('validator.phone'))
      }
      if (!value.area_code) {
        callback(this.$t('system.country_code'))
      }
      callback()
    },
  },
}
</script>
