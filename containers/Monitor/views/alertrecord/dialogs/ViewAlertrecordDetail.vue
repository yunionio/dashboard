<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('monitor.text_12', [title]) }}</div>
    <div slot="body" class="alertrecord-detail">
      <a-card class="mb-3" size="small" :title="metricFormat(item.metric)" v-for="(item, i) in records" :key="i">
        <div class="Rheader"><span>{{ $t('dashboard.text_20') }}： </span><span>{{ metricFormat(item.metric) }}</span></div>
        <div class="Rheader"><span>{{ $t('common.current_value') }}： </span><span>{{ item.value_str }}</span></div>
        <div class="tag-title mt-3">{{ $t('common.text00012') }}</div>
        <div class="tag-wrapper">
          <div class="tag-item d-flex" v-for="(v, k) in item.tags" :key="k">
            <span class="tag-item-key text-truncate" :title="kFormat(k)">{{ kFormat(k) }}： </span>
            <span class="tag-item-value">{{ format(k, v) }}</span>
          </div>
        </div>
      </a-card>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import _ from 'lodash'
import { metric_zh } from '@Monitor/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { BRAND_MAP } from '@/constants'
import { metricItems } from '@Compute/views/node-alert/constants'
import { ResourceKeyLabelsMap } from '../constants'

export default {
  name: 'ViewAlertrecordDetailDialog',
  mixins: [DialogMixin, WindowsMixin],
  computed: {
    title () {
      return _.get(this.params, 'data[0].name', '')
    },
    records () {
      const { eval_data = [] } = this.params.data[0]
      const ret = eval_data.map(item => {
        let metric = item.metric
        if (item.measurement_desc) {
          metric = metric_zh[item.measurement_desc] || item.measurement_desc
        }
        return {
          ...item,
          metric,
        }
      })
      return ret
    },
  },
  methods: {
    format (k, v) {
      if (k === 'brand') {
        return BRAND_MAP[v] ? BRAND_MAP[v].label : v
      }
      return v
    },
    kFormat (key) {
      return ResourceKeyLabelsMap[key] || key
    },
    metricFormat (metric) {
      return metricItems[metric] ? metricItems[metric].label : metric
    },
  },
}
</script>

<style lang="scss" scoped>
.alertrecord-detail {
  max-height: 600px;
  overflow-y: auto;
  .Rheader {
    font-size: 20px;
    font-weight: 600;
  }
  .tag-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .tag-item {
    min-height: 26px;
    line-height: 26px;
  }
  .tag-item-key {
    width: 120px;
  }
  .tag-item-value {
    width: 80%;
    margin-left: 20px;
    word-wrap: break-word;
    word-break: break-all;
  }
}
</style>
