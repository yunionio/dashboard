<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">{{$t('network.text_397')}}</a-divider>
    <a-form-item :label="$t('network.text_398')">
      <a-switch v-decorator="decorators.health_check" />
    </a-form-item>
    <template v-if="form.fd.health_check">
      <a-divider orientation="left">{{$t('network.text_94')}}</a-divider>
      <a-form-item :label="$t('network.text_400')" v-if="['tcp', 'udp'].includes(allFd.listener_type)">
        <a-radio-group v-decorator="decorators.health_check_type">
          <a-radio-button v-for="item in healthCheckTypeOptsC" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <template v-if="['http'].includes(form.fd.health_check_type)">
        <a-form-item :label="$t('network.text_401')">
          <a-input v-decorator="decorators.health_check_uri" :placeholder="$t('network.text_402')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_403')">
          <a-input v-decorator="decorators.health_check_domain" :placeholder="$t('network.text_404')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_405')">
          <a-checkbox-group name="checkboxgroup" :options="healthCheckHttpCodeOpts" v-decorator="decorators.health_check_http_code" />
        </a-form-item>
      </template>
      <a-form-item :label="$t('network.text_406')">
        <a-input v-decorator="decorators.health_check_timeout" :addonAfter="$t('network.text_76')" :placeholder="$t('network.text_407')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_408')">
        <a-input v-decorator="decorators.health_check_interval" :addonAfter="$t('network.text_76')" :placeholder="$t('network.text_409')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_410')">
        <a-input v-decorator="decorators.health_check_rise" :addonAfter="$t('network.text_411')" :placeholder="$t('network.text_412')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_413')">
        <a-input v-decorator="decorators.health_check_fall" :addonAfter="$t('network.text_411')" :placeholder="$t('network.text_412')" />
      </a-form-item>
    </template>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateHealcheck',
  mixins: [mixin],
  computed: {
    healthCheckTypeOptsC () {
      if (this.allFd.listener_type === 'udp') {
        return this.healthCheckTypeOpts.filter(v => v.key === 'ping')
      }
      return this.healthCheckTypeOpts.filter(v => v.key !== 'ping')
    },
  },
  watch: {
    healthCheckTypeOptsC (val) {
      this.setDefaultHealthCheckType(val)
    },
  },
  mounted () {
    const newField = {
      [this.decorators.health_check_type[0]]: this.healthCheckTypeOptsC[0].key,
    }
    if (this.allFd.listener_type === 'ping') {
      newField[this.decorators.health_check[0]] = false
    }
    this.form.fc.setFieldsValue(newField)
  },
  methods: {
    healthCheckChange (val) {
      if (val) {
        this.setDefaultHealthCheckType(this.healthCheckTypeOptsC)
      }
    },
  },

}
</script>
