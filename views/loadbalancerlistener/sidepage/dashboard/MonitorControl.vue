<template>
  <div class="d-flex">
    <a-form-model :model="form" layout="inline">
      <a-form-model-item :label="$t('network.text_496')">
        <a-range-picker :ranges="ranges" v-model="form.timeRange" />
      </a-form-model-item>
      <a-form-model-item :label="$t('network.text_497')">
        <a-select v-model="form.aggregate" style="width: 150px;">
          <a-select-option v-for="item in aggregateOpts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
    <refresh-button class="flex-shrink-0 mt-1" @refresh="refresh" :loading="loading" />
  </div>
</template>

<script>
import RefreshButton from '@/components/PageList/RefreshButton'

export default {
  name: 'LblistenerDashboardMonitorControl',
  components: {
    RefreshButton,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      form: {
        timeRange: [this.$moment(+new Date() - 1000 * 600), this.$moment()], // 1个月
        aggregate: 'mean',
      },
      aggregateOpts: [
        { key: 'mean', label: this.$t('network.text_498') },
        { key: 'max', label: this.$t('network.text_499') },
        { key: 'min', label: this.$t('network.text_500') },
      ],
      ranges: {
        最近十分钟: [this.$moment(+new Date() - 1000 * 600), this.$moment()],
        最近1小时: [this.$moment(+new Date() - 1000 * 3600), this.$moment()],
        最近6小时: [this.$moment(+new Date() - 1000 * 3600 * 6), this.$moment()],
        最近1天: [this.$moment(+new Date() - 1000 * 3600 * 24), this.$moment()],
        最近1周: [this.$moment(+new Date() - 1000 * 3600 * 24 * 7), this.$moment()],
        最近1月: [this.$moment(+new Date() - 1000 * 3600 * 24 * 30), this.$moment()],
        最近1年: [this.$moment(+new Date() - 1000 * 3600 * 24 * 365), this.$moment()],
      },
    }
  },
  watch: {
    form: {
      deep: true,
      handler (val) {
        this.$emit('input', val)
      },
    },
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
  },
}
</script>
