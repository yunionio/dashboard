<template>
  <a-card :title="progress.title">
    <div class="text-center">
      <a-progress :type="type" v-bind="progressProps" :percent="percent" :status="status" :format="format" />
      <div class="content mt-4" v-if="progress.msg">
        <div>
          <span class="label">{{ progress.msg.currentLabel || $t('common_233') }}：</span>
          <span class="text">{{ progress.msg.current }}</span>
        </div>
        <div>
          <span class="label">{{ progress.msg.totalLabel || $t('common_234') }}：</span>
          <span class="value">{{ progress.msg.total }}</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script>
import numerify from 'numerify'
import * as R from 'ramda'

export default {
  name: 'ProgressCard',
  props: {
    progress: {
      type: Object,
      validator: val => R.is(Number, val.percent),
    },
    unit: {
      type: String,
      default: '%',
    },
    numerifyFloat: {
      type: String,
      default: '0.00',
    },
    percentFormat: {
      type: Function,
    },
  },
  computed: {
    progressProps () {
      if (this.progress.progressProps) {
        return this.progress.progressProps
      }
      return {}
    },
    type () {
      if (this.progressProps.type) return this.progressProps.type
      return 'circle'
    },
    percent () {
      const per = this.progress.percent * 100
      if (!per) return 0
      return per
    },
    status () {
      if (this.percent >= 90) {
        return 'exception'
      } else if (this.percent >= 60) {
        return 'normal'
      }
      return 'success'
    },
  },
  methods: {
    format () {
      if (this.percentFormat) {
        return this.percentFormat(this)
      }
      const per = this.percent || 0
      const oversell = per > 100 ? <a-tag color="red">{ this.$t('common_714') }</a-tag> : null
      return (<div>{oversell}<div class="mt-2 text-color">{ numerify(per, this.numerifyFloat) }{ this.unit }</div></div>)
    },
  },
}
</script>
