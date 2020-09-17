<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('monitor.text_12', [title]) }}</div>
    <div slot="body" class="alertrecord-detail">
      <a-card class="mb-3" size="small" :title="item.metric" v-for="(item, i) in records" :key="i">
        <div class="Rheader"><span>{{ $t('dashboard.text_20') }}： </span><span>{{ item.metric }}</span></div>
        <div class="Rheader"><span>{{ $t('bill.text_176') }}： </span><span>{{ item.value_str }}</span></div>
        <div class="tag-title mt-3">{{ $t('common.text00012') }}</div>
        <div class="tag-wrapper">
          <div class="tag-item d-flex align-items-center" v-for="(v, k) in item.tags" :key="k">
            <span class="tag-item-key text-truncate" :title="k">{{ k }}： </span>
            <span>{{ v }}</span>
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
import { metric_zh } from '@Monitor/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ViewAlertrecordDetailDialog',
  mixins: [DialogMixin, WindowsMixin],
  computed: {
    title () {
      return this.params.alertData.name
    },
    records () {
      const { eval_data } = this.params.data[0]
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
    font-weight: 500;
  }
  .tag-item {
    height: 26px;
    line-height: 26px;
  }
  .tag-item-key {
    width: 120px;
  }
}
</style>
