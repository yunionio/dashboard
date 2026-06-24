<template>
  <div
    v-if="hasContent"
    :class="wrapperClass"
    :title="displayTitle"
    @click.stop>
    <span v-if="showLabel" class="meta-label">{{ $t('aice.llm_instantmodel.menu') }}：</span>
    <template v-if="mountedItems.length">
      <template v-for="(item, idx) in mountedItems">
        <list-body-cell-wrap
          :key="item.id"
          copy
          hide-field
          field="id"
          :row="item"
          :message="item.fullname">
          <side-page-trigger
            permission="llm_instant_models_get"
            name="LlmInstantModelSidePage"
            :id="item.id"
            :vm="vm">
            <span class="meta-ellipsis-text">{{ item.fullname }}</span>
          </side-page-trigger>
        </list-body-cell-wrap>
        <span v-if="idx < mountedItems.length - 1" :key="`${item.id}-sep`">, </span>
      </template>
    </template>
    <span v-else class="meta-ellipsis-text">{{ fallbackText }}</span>
  </div>
</template>

<script>
import { getSkuModelDisplayText } from '../utils/modelDisplay'

export default {
  name: 'LlmSkuMountedModels',
  props: {
    row: {
      type: Object,
      required: true,
    },
    vm: {
      type: Object,
      default: null,
    },
    showLabel: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    mountedItems () {
      const list = this.row?.mounted_model_details || []
      return list.filter(v => v && v.id && v.fullname)
    },
    fallbackText () {
      if (this.mountedItems.length) return ''
      return getSkuModelDisplayText(this.row)
    },
    hasContent () {
      return this.mountedItems.length > 0 || Boolean(this.fallbackText)
    },
    displayTitle () {
      if (this.mountedItems.length) {
        return this.mountedItems.map(v => v.fullname).join(', ')
      }
      return this.fallbackText
    },
    wrapperClass () {
      if (!this.showLabel) return ''
      return 'meta-row meta-row--copy meta-ellipsis'
    },
  },
}
</script>
