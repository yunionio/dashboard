<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group @change="change" v-decorator="decorators.durationStandard">
        <a-radio-button v-for="item in opts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showDuration">
      <duration-input v-decorator="decorators.duration" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'

const OPTS = [
  {
    key: 'none',
    label: i18n.t('compute.text_138'),
  },
  {
    key: '1h',
    label: i18n.t('compute.text_139'),
  },
  {
    key: '6h',
    label: i18n.t('compute.text_140'),
  },
  {
    key: '1d',
    label: i18n.t('compute.text_141'),
  },
  {
    key: '3d',
    label: i18n.t('compute.text_142'),
  },
  {
    key: '1w',
    label: i18n.t('compute.text_24'),
  },
  {
    key: '1m',
    label: i18n.t('compute.text_143'),
  },
  {
    key: 'custom',
    label: i18n.t('compute.text_144'),
  },
]

export default {
  name: 'Duration',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => !R.isNil(val.durationStandard) && !R.isNil(val.duration),
    },
    form: {
      type: Object,
    },
  },
  data () {
    return {
      opts: OPTS,
      showDuration: this.decorators.durationStandard[1].initialValue === 'custom',
    }
  },
  methods: {
    change (e) {
      if (e.target.value === 'custom') {
        this.showDuration = true
      } else {
        this.showDuration = false
      }
    },
  },
}
</script>
