<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">{{$t('network.text_397')}}</a-divider>
    <a-form-item :label="$t('network.text_21')">
      <a-input :disabled="isUpdate" v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceName')" />
      <name-repeated v-if="!isUpdate" v-slot:extra res="loadbalancerlisteners" :name="form.fd.generate_name" />
    </a-form-item>
    <a-form-item :label="$t('network.text_418')">
      <a-input :disabled="isUpdate" type="number" v-decorator="decorators.listener_port" :placeholder="$t('network.text_419')" />
    </a-form-item>
    <a-form-item :label="$t('network.text_420')" class="mb-0">
      <listener-types :decorators="decorators" :disabled="isUpdate" />
    </a-form-item>
    <a-form-item :label="$t('network.text_143')" v-if="form.fd.listener_type === 'https'">
      <base-select
        v-decorator="decorators.certificate"
        resource="loadbalancercertificates"
        :params="certificateParams"
        show-sync
        :select-props="{ placeholder: $t('network.text_421') }" />
      <div slot="extra">{{$t('network.text_422')}}<help-link href="/lbcert">{{$t('network.text_321')}}</help-link></div>
    </a-form-item>
    <a-collapse :bordered="false">
      <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
        <a-form-item :label="$t('network.text_423')" class="mb-0">
          <scheduler-types :decorators="decorators" :form="form" :schedulerTypeOpts="schedulerTypeOpts" />
        </a-form-item>
        <sticky-session :decorators="decorators" :form="form" :stickySessionTypeOpts="stickySessionTypeOpts" :sticky_session_cookie_timeout_decorator="sticky_session_cookie_timeout_decorator" />
        <acl :decorators="decorators" :form="form" :lbDetail="lbDetail" :aclTypeOpts="aclTypeOpts" :listenerData="listenerData" />
        <a-form-item :label="$t('network.text_426')" v-if="['https'].includes(form.fd.listener_type)">
          <a-switch v-decorator="decorators.enable_http2" />
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
    <!-- <a-divider orientation="left">{{$t('network.text_94')}}</a-divider> -->
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateProtocol',
  mixins: [mixin],
  data () {
    return {
      aclTypeOpts: [
        { key: 'white', label: this.$t('network.text_364') },
      ],
      stickySessionTypeOpts: [
        {
          key: 'insert',
          label: this.$t('network.text_384'),
        },
        {
          key: 'server',
          label: this.$t('network.text_385'),
        },
      ],
    }
  },
  computed: {
    sticky_session_cookie_timeout_decorator () {
      const httpArr = ['http', 'https']
      let max = 60
      const validator = (rule, value, cb) => {
        if (+value % 60 === 0) {
          cb()
        } else {
          cb(Error(this.$t('network.text_431')))
        }
      }
      if (httpArr.includes(this.form.fd.listener_type)) max = 1440
      return [
        this.decorators.sticky_session_cookie_timeout[0],
        {
          initialValue: 60,
          normalize: v => Number(v),
          rules: [
            { validator, trigger: 'blur' },
            { type: 'integer', min: 60, max, message: this.$t('network.text_432', [max]), trigger: 'blur' },
          ],
        },
      ]
    },
  },
  watch: {
    'form.fd.listener_type' (val) {
      this.setStickySessionTypeOpts(val)
    },
  },
  methods: {
    setStickySessionTypeOpts (listenerType) {
      if (listenerType === 'http') {
        this.stickySessionTypeOpts = [
          { key: 'insert', label: this.$t('network.text_384') },
          { key: 'server', label: this.$t('network.text_385') },
        ]
      } else {
        this.stickySessionTypeOpts = [
          { key: 'insert', label: this.$t('network.text_384') },
        ]
        if (this.form.fc.getFieldValue(this.decorators.sticky_session_type[0]) === 'server') {
          this.form.fc.setFieldsValue({
            [this.decorators.sticky_session_type[0]]: 'insert',
          })
        }
      }
    },
    async submit () {
      try {
        const values = await this.form.fc.validateFields()
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
