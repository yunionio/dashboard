<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-divider orientation="left">{{$t('network.text_397')}}</a-divider>
    <a-form-item :label="$t('network.text_398')">
      <a-tooltip :title="$t('network.text_430')" placement="top">
        <a-switch v-decorator="decorators.health_check" :disabled="true" />
      </a-tooltip>
    </a-form-item>
    <template v-if="form.fd.health_check">
      <a-divider orientation="left">{{$t('network.text_94')}}</a-divider>
      <a-form-item :label="$t('network.text_400')" v-if="['tcp', 'http', 'https'].includes(allFd.listener_type)">
        <a-radio-group v-decorator="decorators.health_check_type">
          <a-radio-button v-for="item in healthCheckTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('network.text_401')" v-if="['http', 'https'].includes(allFd.listener_type)">
        <a-input v-decorator="decorators.health_check_uri" :placeholder="$t('network.text_402')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_408')">
        <a-input v-decorator="decorators.health_check_interval" :addonAfter="$t('network.text_76')" :placeholder="$t('network.text_409')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_410')">
        <a-input v-decorator="decorators.health_check_rise" :addonAfter="$t('network.text_411')" :placeholder="$t('network.text_412')" />
      </a-form-item>
    </template>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateHealcheck',
  mixins: [mixin],
}
</script>
