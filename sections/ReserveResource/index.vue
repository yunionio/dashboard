<template>
  <div>
    <a-form-item :label="label" />
    <a-form-item label="CPU">
      <a-input-number v-decorator="decorators.cpu" :min="1" :step="1" :precision="0" /> {{$t('compute.text_167')}}
    </a-form-item>
    <a-form-item :label="$t('compute.text_168')">
      <a-input-number v-decorator="decorators.memory" :min="1" :step="1" :precision="0" /> G
    </a-form-item>
    <a-form-item :label="$t('compute.text_169')">
      <a-input-number v-decorator="decorators.disk" :min="1" :step="1" :precision="0" /> G
    </a-form-item>
  </div>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'ReserveResource',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: i18n.t('compute.text_170'),
    },
    form: {
      type: Object,
    },
  },
}
</script>
