<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item :label="$t('scope.text_244')">
      {{ userInfo.name }}
    </a-form-item>
    <a-form-item :label="$t('scope.text_226')">
      <mobile-input v-decorator="decorators.international_mobile" />
    </a-form-item>
    <a-form-item :label="$t('scope.text_204')">
      <a-input v-decorator="decorators.email" />
    </a-form-item>
    <a-form-item :label="$t('common_599')">
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
</template>

<script>
import { mapGetters } from 'vuex'
import { contactMap } from '@/constants'
import MobileInput from '@/sections/MobileInput'

export default {
  name: 'UserInfoUpdate',
  components: { MobileInput },
  props: {
    contacts: {
      required: true,
      type: Object,
    },
  },
  data () {
    return {
      contactArrOpts: [],
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        international_mobile: [
          'international_mobile',
          {
            initialValue: this.contacts.international_mobile || {},
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
            validateFirst: true,
            initialValue: this.contacts.email || '',
            rules: [
              { required: true, message: this.$t('scope.text_228') },
              { validator: this.$validate('email') },
            ],
          },
        ],
        enabled_contact_types: [
          'enabled_contact_types',
          {
            initialValue: this.contacts.enabled_contact_types || ['webconsole'],
          },
        ],
      },
      formItemLayout: {
        labelCol: {
          sm: { span: 5 },
        },
        wrapperCol: {
          sm: { span: 19 },
        },
      },
    }
  },
  computed: mapGetters(['userInfo']),
  created () {
    this.fetchConfig()
  },
  methods: {
    async getValues () {
      try {
        const values = await this.form.fc.validateFields()
        return { ...values }
      } catch (error) {
        throw error
      }
    },
    async fetchConfig () {
      try {
        const { data: { types } } = await new this.$Manager('receivers', 'v1').performClassAction({ action: 'get-types' })
        this.contactArrOpts = types.filter((item) => {
          return !item.includes('robot')
        }).map((item) => {
          return {
            label: contactMap[item].label,
            value: item,
            disabled: item === 'webconsole',
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
