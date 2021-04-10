<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body" class="alertrecord-detail">
      <div class="tag-wrapper">
        <div class="tag-item d-flex align-items-center" v-for="(v, k) in tags" :key="k">
          <span class="tag-item-key text-truncate" :title="k">{{ k }}： </span>
          <span>{{ format(k, v) }}</span>
        </div>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { BRAND_MAP } from '@/constants'

export default {
  name: 'ViewItemTagsDialog',
  mixins: [DialogMixin, WindowsMixin],
  computed: {
    title () {
      return this.params.title || this.$t('common_730')
    },
    tags () {
      const { field = 'tags' } = this.params
      return _.get(this.params.data[0], field)
    },
  },
  methods: {
    format (k, v) {
      if (k === 'brand') {
        return BRAND_MAP[v] ? BRAND_MAP[v].label : v
      }
      return v
    },
  },
}
</script>

<style lang="scss" scoped>
.alertrecord-detail {
  max-height: 600px;
  overflow-y: auto;
  .tag-item {
    height: 26px;
    line-height: 26px;
  }
  .tag-item-key {
    width: 120px;
  }
}
</style>
