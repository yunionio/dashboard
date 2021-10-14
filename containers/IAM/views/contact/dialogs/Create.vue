<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('system.text_130', [$t('system.text_317')]) }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.domain')" v-if="isAdminMode">
          <base-select
            style="width: 300px;"
            v-decorator="decorators.domain"
            resource="domains"
            version="v1"
            @change="handleDomainChange"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ placeholder: $t('rules.domain') }" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.user')">
          <base-select
            style="width: 300px;"
            v-decorator="decorators.user"
            need-params
            filterable
            :options="userOptions"
            :select-props="{ placeholder: $t('rules.user') }" />
        </a-form-item>
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
import { mapGetters } from 'vuex'
import { contactMap } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import MobileInput from '@/sections/MobileInput'
import { findAndUnshift } from '@/utils/utils'

export default {
  name: 'ContactCreateDialog',
  components: { MobileInput },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      userParams: {
        is_system_account: false,
        have_contacts: false,
        scope: this.$store.getters.scope,
      },
      form: {
        fc: this.$form.createForm(this),
      },
      contactArrOpts: [],
      userOptions: [],
      decorators: {
        domain: [
          'domain',
        ],
        user: [
          'user',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.user'),
                whitespace: true,
              },
            ],
          },
        ],
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
            initialValue: ['webconsole'],
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
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('receivers', 'v1')
    this.generateContactArrOpts()
    this.isDomainMode && this.fetchUsers()
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { user: uid, domain, email, international_mobile, enabled_contact_types } = values
        const data = {
          uid,
          email,
          international_mobile,
          domain,
          enabled_contact_types,
        }
        await this.manager.create({
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
    handleDomainChange (val) {
      this.form.fc.setFieldsValue({
        user: '',
      })
      this.userParams = {
        ...this.userParams,
        domain_id: val,
      }
      this.fetchUsers()
      this.generateContactArrOpts({ domain_ids: [val] })
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
    async fetchUsers () {
      const userManager = new this.$Manager('users', 'v1')
      const receiverManager = new this.$Manager('receivers', 'v1')
      try {
        const userRes = await userManager.list({ params: this.userParams })
        const users = userRes.data.data
        const receiverRes = await receiverManager.list({ params: { scope: this.scope } })
        const receivers = receiverRes.data.data
        const receiverUsers = receivers.map((item) => { return item.name })
        const noExsitUser = users.filter((item) => { return !receiverUsers.includes(item.name) })
        this.userOptions = noExsitUser.map((item) => {
          return {
            label: item.name,
            value: item.id,
          }
        })
      } catch (error) {
        throw error
      }
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
