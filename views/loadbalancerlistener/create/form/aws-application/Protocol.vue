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
      <listener-types :decorators="decorators" :disabled="isUpdate" :listenerTypeOpts="listenerTypeOpts" />
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
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateProtocol',
  mixins: [mixin],
  data () {
    return {
      listenerTypeOpts: [
        { label: 'HTTP', key: 'http' },
        { label: 'HTTPS', key: 'https' },
      ],
    }
  },
  methods: {
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
