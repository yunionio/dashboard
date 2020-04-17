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

const OPTS = [
  {
    key: 'none',
    label: '不设置',
  },
  {
    key: '1h',
    label: '1小时',
  },
  {
    key: '6h',
    label: '6小时',
  },
  {
    key: '1d',
    label: '1天',
  },
  {
    key: '3d',
    label: '3天',
  },
  {
    key: '1w',
    label: '1周',
  },
  {
    key: '1m',
    label: '1月',
  },
  {
    key: 'custom',
    label: '自定义',
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
