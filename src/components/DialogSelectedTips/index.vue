<template>
  <div class="mb-2">
    <span>{{$t('common.text00002') }}</span>
    <span class="ml-2 mr-2 primary-color">{{ count }}{{ unit }}{{ name }}</span>
    <span>{{$t('common.text00004')}}</span>
    <span class="ml-2 mr-2 warning-color">{{ action }}</span>
    <span>{{$t('common.text00005')}}</span>
  </div>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'DialogSelectedTips',
  props: {
    count: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: i18n.t('common.text00006'),
    },
    action: {
      type: String,
      default: i18n.t('common.text00007'),
    },
    unit: {
      type: String,
      default: i18n.t('common.text00003'),
    },
    vm: {},
  },
}
</script>
