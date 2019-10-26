<template>
  <a-card :title="progress.title">
    <div class="text-center">
      <a-progress type="circle" :percent="percent" :format="format" :status="status" />
      <div class="content mt-4">
        <div>
          <span class="label">{{ progress.msg.currentLabel || '已分配' }}：</span>
          <span class="text">{{ progress.msg.current }}</span>
        </div>
        <div>
          <span class="label">{{ progress.msg.totalLabel || '总量' }}：</span>
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
      validator: val => R.is(Number, val.msg.percent),
    },
  },
  computed: {
    percent () {
      const per = this.progress.msg.percent * 100
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
      const per = this.percent || 0
      const oversell = per > 100 ? <a-tag color="red">超售</a-tag> : null
      return (<div>{oversell}<div class="mt-2 text-color">{ numerify(per, '0.00') }%</div></div>)
    },
  },
}
</script>
