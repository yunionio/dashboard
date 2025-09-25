<template>
  <a-form-item :label="label" :extra="extraStr">
    <base-select
      v-decorator="decorator"
      class="w-100"
      :filterable="true"
      resource="robots"
      version="v1"
      :params="getParams"
      :select-props="{ placeholder: placeholder, allowClear: true, mode: 'multiple' }" />
  </a-form-item>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'NotifyTypes',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    getParams: {
      type: Object,
      default: () => ({
        robot: 'only',
      }),
    },
    placeholder: {
      type: String,
      default: i18n.t('common.budget_alert_user_placeholder'),
    },
    label: {
      type: String,
      default: i18n.t('monitor.channel'),
    },
  },
}
</script>
