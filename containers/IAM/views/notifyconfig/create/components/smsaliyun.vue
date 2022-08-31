<template>
  <div>
    <a-form-item label="Access Key ID">
      <template v-slot:extra>
        <div>{{$t('system.text_286')}}</div>
        <div class="mb-0">{{ $t('system.text_573') }}</div>
      </template>
      <a-input v-decorator="decorators.access_key_id" />
    </a-form-item>
    <a-form-item label="Access Key Secret">
      <template v-slot:extra>
        <div>{{$t('system.text_287')}}</div>
        <div class="mb-0">{{ $t('system.text_573') }}</div>
      </template>
      <a-input-password v-decorator="decorators.access_key_secret" />
    </a-form-item>
    <a-form-item :label="$t('system.text_288')">
      <template v-slot:extra>
        <div>{{$t('system.text_289')}}</div>
        <div class="mb-0">{{$t('system.text_574')}}</div>
      </template>
      <a-input v-decorator="decorators.signature" />
    </a-form-item>
    <a-collapse :border="false">
      <a-collapse-panel key="1" :header="$t('system.mobile_cn_tpl')">
        <a-form-item :label="$t('system.text_295')">
          <template v-slot:extra>
            <div>{{ $t('system.verify_code_tpl_extra_1') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_2') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_3') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_4') }}</div>
          </template>
          <a-input v-decorator="decorators.verifiyCode" />
        </a-form-item>
        <a-form-item :label="$t('system.alert_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.alert_tpl_extra_1') }}</div>
            <div>{{ $t('system.alert_tpl_extra_2') }}</div>
            <div>{{ $t('system.alert_tpl_extra_3') }}</div>
            <div>{{ $t('system.alert_tpl_extra_4') }}</div>
          </template>
          <a-input v-decorator="decorators.alertsCode" />
        </a-form-item>
        <a-form-item :label="$t('system.error_login_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.error_login_tpl_extra_1') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_2') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_3') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_4') }}</div>
          </template>
          <a-input v-decorator="decorators.errorCode" />
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
    <a-collapse :border="false">
      <a-collapse-panel key="1" :header="$t('system.mobile_en_tpl')">
        <a-form-item :label="$t('system.text_295')">
          <template v-slot:extra>
            <div>{{ $t('system.verify_code_tpl_extra_1') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_2') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_3') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_4') }}</div>
          </template>
          <a-input v-decorator="decorators.verifiyCodeEn" />
        </a-form-item>
        <a-form-item :label="$t('system.alert_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.alert_tpl_extra_1') }}</div>
            <div>{{ $t('system.alert_tpl_extra_2') }}</div>
            <div>{{ $t('system.alert_tpl_extra_3') }}</div>
            <div>{{ $t('system.alert_tpl_extra_4') }}</div>
          </template>
          <a-input v-decorator="decorators.alertsCodeEn" />
        </a-form-item>
        <a-form-item :label="$t('system.error_login_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.error_login_tpl_extra_1') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_2') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_3') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_4') }}</div>
          </template>
          <a-input v-decorator="decorators.errorCodeEn" />
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
export default {
  name: 'smsaliyun',
  props: {
    formItemLayout: {
      required: true,
      type: Object,
    },
    offsetWrapperCol: {
      required: true,
      type: Object,
    },
    loading: Boolean,
    form: Object,
  },
  data () {
    return {
      submiting: false,
      testLoding: false,
      decorators: {
        access_key_id: [
          'access_key_id',
          {
            rules: [
              { required: true, message: this.$t('system.text_291') },
            ],
          },
        ],
        access_key_secret: [
          'access_key_secret',
          {
            rules: [
              { required: true, message: this.$t('system.text_292') },
            ],
          },
        ],
        signature: [
          'signature',
          {
            rules: [
              { required: true, message: this.$t('system.text_293') },
            ],
          },
        ],
        verifiyCode: [
          'verifiyCode',
        ],
        alertsCode: [
          'alertsCode',
        ],
        errorCode: [
          'errorCode',
        ],
        verifiyCodeEn: [
          'verifiyCodeEn',
        ],
        alertsCodeEn: [
          'alertsCodeEn',
        ],
        errorCodeEn: [
          'errorCodeEn',
        ],
      },
    }
  },
}
</script>
