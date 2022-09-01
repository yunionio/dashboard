<template>
  <div>
    <a-form-item label="Application Key">
      <template v-slot:extra>
        <div>
          {{$t('notify.smshuawei.application_key.prompt')}}
          {{ $t('iam.help') }} <help-link :href="docUrl">{{ $t('common_386') }}</help-link>
        </div>
        <div class="mb-0">{{ $t('notify.smshuawei.application_key.guid') }}</div>
      </template>
      <a-input v-decorator="decorators.access_key_id" />
    </a-form-item>
    <a-form-item label="Application Secret">
      <template v-slot:extra>
        <div>{{$t('notify.smshuawei.application_secret.prompt')}}</div>
        <div class="mb-0">{{ $t('notify.smshuawei.application_secret.guid') }}</div>
      </template>
      <a-input-password v-decorator="decorators.access_key_secret" />
    </a-form-item>
    <a-form-item :label="$t('notify.smshuawei.app_access_url')">
      <template v-slot:extra>
        <div>{{$t('notify.smshuawei.service_url.prompt')}}</div>
        <div class="mb-0">{{$t('notify.smshuawei.service_url.guid')}}</div>
      </template>
      <a-input v-decorator="decorators.service_url" />
    </a-form-item>
    <a-form-item :label="$t('system.text_288')">
      <template v-slot:extra>
        <div>{{$t('notify.smshuawei.signature.prompt')}}</div>
        <div class="mb-0">{{$t('notify.smshuawei.signature.guid')}}</div>
      </template>
      <a-input v-decorator="decorators.signature" />
    </a-form-item>
    <a-collapse :border="false">
      <a-collapse-panel key="1" :header="$t('system.mobile_cn_tpl')">
        <a-form-item :label="$t('system.text_295')">
          <template v-slot:extra>
            <div>{{ $t('system.verify_code_tpl_extra_1') }}</div>
            <div>{{ $t('notify.smshuawei.template.verify_code.guid') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_3') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_4') }}</div>
          </template>
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="12">
                <a-input v-decorator="decorators.verifiyCode" :placeholder="$t('notify.smshuawei.template_id.placeholder')" />
              </a-col>
              <a-col :span="12">
                <a-input v-decorator="decorators.verifiyCodeChannel" :placeholder="$t('notify.smshuawei.channel_no.placeholder')" />
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
        <a-form-item :label="$t('system.alert_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.alert_tpl_extra_1') }}</div>
            <div>{{ $t('notify.smshuawei.template.alarm_message.guid') }}</div>
            <div>{{ $t('system.alert_tpl_extra_3') }}</div>
            <div>{{ $t('system.alert_tpl_extra_4') }}</div>
          </template>
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="12">
                <a-input v-decorator="decorators.alertsCode" :placeholder="$t('notify.smshuawei.template_id.placeholder')" />
              </a-col>
              <a-col :span="12">
                <a-input v-decorator="decorators.alertsCodeChannel" :placeholder="$t('notify.smshuawei.channel_no.placeholder')" />
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
        <a-form-item :label="$t('system.error_login_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.error_login_tpl_extra_1') }}</div>
            <div>{{ $t('notify.smshuawei.template.abnormal_login.guid') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_3') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_4') }}</div>
          </template>
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="12">
                <a-input v-decorator="decorators.errorCode" :placeholder="$t('notify.smshuawei.template_id.placeholder')" />
              </a-col>
              <a-col :span="12">
                <a-input v-decorator="decorators.errorCodeChannel" :placeholder="$t('notify.smshuawei.channel_no.placeholder')" />
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
    <a-collapse :border="false">
      <a-collapse-panel key="1" :header="$t('system.mobile_en_tpl')">
        <a-form-item :label="$t('system.text_295')">
          <template v-slot:extra>
            <div>{{ $t('system.verify_code_tpl_extra_1') }}</div>
            <div>{{ $t('notify.smshuawei.template.verify_code.en.guid') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_3') }}</div>
            <div>{{ $t('system.verify_code_tpl_extra_4') }}</div>
          </template>
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="12">
                <a-input v-decorator="decorators.verifiyCodeEn" :placeholder="$t('notify.smshuawei.template_id.placeholder')" />
              </a-col>
              <a-col :span="12">
                <a-input v-decorator="decorators.verifiyCodeEnChannel" :placeholder="$t('notify.smshuawei.channel_no.placeholder')" />
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
        <a-form-item :label="$t('system.alert_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.alert_tpl_extra_1') }}</div>
            <div>{{ $t('notify.smshuawei.template.alarm_message.en.guid') }}</div>
            <div>{{ $t('system.alert_tpl_extra_3') }}</div>
            <div>{{ $t('system.alert_tpl_extra_4') }}</div>
          </template>
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="12">
                <a-input v-decorator="decorators.alertsCodeEn" :placeholder="$t('notify.smshuawei.template_id.placeholder')" />
              </a-col>
              <a-col :span="12">
                <a-input v-decorator="decorators.alertsCodeEnChannel" :placeholder="$t('notify.smshuawei.channel_no.placeholder')" />
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
        <a-form-item :label="$t('system.error_login_tpl')">
          <template v-slot:extra>
            <div>{{ $t('system.error_login_tpl_extra_1') }}</div>
            <div>{{ $t('notify.smshuawei.template.abnormal_login.en.guid') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_3') }}</div>
            <div>{{ $t('system.error_login_tpl_extra_4') }}</div>
          </template>
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="12">
                <a-input v-decorator="decorators.errorCodeEn" :placeholder="$t('notify.smshuawei.template_id.placeholder')" />
              </a-col>
              <a-col :span="12">
                <a-input v-decorator="decorators.errorCodeEnChannel" :placeholder="$t('notify.smshuawei.channel_no.placeholder')" />
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import { getNotifyDocsUrl } from '../../utils/docs'
export default {
  name: 'smshuawei',
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
              { required: true, message: this.$t('notify.smshuawei.application_key.prompt') },
            ],
          },
        ],
        access_key_secret: [
          'access_key_secret',
          {
            rules: [
              { required: true, message: this.$t('notify.smshuawei.application_secret.prompt') },
            ],
          },
        ],
        service_url: [
          'service_url',
          {
            rules: [
              { required: true, message: this.$t('notify.smshuawei.service_url.prompt') },
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
        verifiyCodeChannel: [
          'verifiyCodeChannel',
        ],
        alertsCode: [
          'alertsCode',
        ],
        alertsCodeChannel: [
          'alertsCodeChannel',
        ],
        errorCode: [
          'errorCode',
        ],
        errorCodeChannel: [
          'errorCodeChannel',
        ],
        verifiyCodeEn: [
          'verifiyCodeEn',
        ],
        verifiyCodeEnChannel: [
          'verifiyCodeEnChannel',
        ],
        alertsCodeEn: [
          'alertsCodeEn',
        ],
        alertsCodeEnChannel: [
          'alertsCodeEnChannel',
        ],
        errorCodeEn: [
          'errorCodeEn',
        ],
        errorCodeEnChannel: [
          'errorCodeEnChannel',
        ],
      },
      docUrl: getNotifyDocsUrl('mobile_huawei'),
    }
  },
}
</script>
