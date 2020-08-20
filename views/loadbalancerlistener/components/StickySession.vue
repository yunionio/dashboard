<template>
  <div>
    <a-form-item :label="$t('network.text_379')">
      <a-switch :disabled="disabled" v-decorator="decorators.sticky_session" @change="change" />
    </a-form-item>
    <template v-if="form.fc.getFieldValue('sticky_session')">
      <a-form-item :label="$t('network.text_380')">
        <a-select v-decorator="decorators.sticky_session_type">
          <a-select-option v-for="item in stickySessionTypeOpts" :key="item.key"  :value="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('network.text_381')" v-if="form.fc.getFieldValue('sticky_session_type') === 'server'">
        <a-input v-decorator="decorators.sticky_session_cookie" :placeholder="$t('network.text_382')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_383')" v-if="form.fc.getFieldValue('sticky_session_type') === 'insert'">
        <a-input v-decorator="sticky_session_cookie_timeout_decorator || decorators.sticky_session_cookie_timeout" :addonAfter="$t('network.text_76')" type="number" :disabled="disabledStickySessionCookieTimeout" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'LbStickySession',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.sticky_session,
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    stickySessionTypeOpts: {
      type: Array,
      default: () => [
        {
          key: 'insert',
          label: i18n.t('network.text_384'),
        },
        {
          key: 'server',
          label: i18n.t('network.text_385'),
        },
      ],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledStickySessionCookieTimeout: {
      type: Boolean,
      default: false,
    },
    sticky_session_cookie_timeout_decorator: { // huawei 会有动态规则
      type: Array,
    },
  },
  methods: {
    change (val) {
      if (val) {
        this.form.fc.getFieldDecorator(this.decorators.sticky_session_type[0], this.decorators.sticky_session_type[1])
        this.form.fc.setFieldsValue({
          [this.decorators.sticky_session_type[0]]: 'insert',
        })
      }
    },
  },
}
</script>
