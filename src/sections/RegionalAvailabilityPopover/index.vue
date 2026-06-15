<template>
  <span class="regional-availability-cell">
    <span v-if="!hasTriggerContent" class="regional-availability-empty">-</span>
    <span v-else class="regional-availability-root" @click.stop="handleWrapClick">
    <a-popover
      v-model="visible"
      trigger="click"
      placement="left"
      overlay-class-name="regional-availability-popover-overlay"
      destroy-tooltip-on-hide
      @visibleChange="handleVisibleChange">
      <div slot="content" class="regional-availability-popover">
        <div class="regional-availability-popover-header">
          <a-icon type="close" class="regional-availability-close" @click.stop="handleClose" />
        </div>
        <div class="regional-availability-popover-body">
          <div class="regional-availability-popover-content">
            <!-- 当前区域和可用区 -->
            <div class="regional-availability-current">
              <span
                class="regional-availability-indicator status-dot"
                :class="isCurrentRegionAvailable ? 'status-success' : 'status-danger'" />
              <a-tooltip
                :title="currentRegionTooltip || null"
                placement="top"
                :get-popup-container="getTooltipContainer">
                <span class="regional-availability-region-name">{{ region || '-' }}</span>
              </a-tooltip>
              <div v-if="!hiddenZone && currentRegionZones.length" class="regional-availability-zone-list">
                <a-tooltip
                  v-for="zoneItem in currentRegionZones"
                  :key="zoneItem.zone_id || zoneItem.zone"
                  :title="getAvailabilityTooltip('zone', zoneItem) || null"
                  placement="top"
                  :get-popup-container="getTooltipContainer">
                  <span
                    class="regional-availability-zone-item"
                    :class="{ 'is-current': zoneItem.zone === zone }">
                    <span
                      class="regional-availability-indicator status-dot"
                      :class="isZoneAvailable(zoneItem) ? 'status-success' : 'status-danger'" />
                    {{ formatZoneName(zoneItem.zone) }}
                  </span>
                </a-tooltip>
              </div>
            </div>
            <!-- 其他区域和可用区 -->
            <template v-if="otherRegions.length">
              <div
                class="regional-availability-other-header"
                @click.stop="toggleExpanded">
                <span class="regional-availability-other-title">{{ $t('compute.regional_availability_other_regions') }}</span>
                <a-icon class="regional-availability-other-icon" :type="expanded ? 'caret-up' : 'caret-down'" />
              </div>
              <div
                v-show="expanded"
                class="regional-availability-other-body"
                :class="{ 'is-region-only': hiddenZone || isRegionOnlyData }">
                <div
                  v-for="item in otherRegions"
                  :key="item.id"
                  class="regional-availability-region-row">
                  <span
                    class="regional-availability-indicator status-dot"
                    :class="isRegionAvailable(item) ? 'status-success' : 'status-danger'" />
                  <a-tooltip
                    :title="getAvailabilityTooltip('region', item) || null"
                    placement="top"
                    :get-popup-container="getTooltipContainer">
                    <span class="regional-availability-region-name">{{ item.cloudregion }}</span>
                  </a-tooltip>
                  <div v-if="!hiddenZone && item.zones.length" class="regional-availability-zone-list">
                    <a-tooltip
                      v-for="zoneItem in item.zones"
                      :key="zoneItem.zone_id || zoneItem.zone"
                      :title="getAvailabilityTooltip('zone', zoneItem) || null"
                      placement="top"
                      :get-popup-container="getTooltipContainer">
                      <span class="regional-availability-zone-item">
                        <span
                          class="regional-availability-indicator status-dot"
                          :class="isZoneAvailable(zoneItem) ? 'status-success' : 'status-danger'" />
                        {{ formatZoneName(zoneItem.zone) }}
                      </span>
                    </a-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- 触发器 -->
      <span class="regional-availability-trigger">
        <list-body-cell-wrap v-if="region && !hiddenRegion" hide-field copy field="region" :row="{ region }">
          <a @click.prevent>{{ region }}</a>
        </list-body-cell-wrap>
        <list-body-cell-wrap v-if="zone && !hiddenZone" hide-field copy field="zone" :row="{ zone }">
          <a class="link-color-light" @click.prevent>{{ zone }}</a>
        </list-body-cell-wrap>
      </span>
    </a-popover>
    </span>
  </span>
</template>

<script>
export default {
  name: 'RegionalAvailabilityPopover',
  props: {
    skuData: {
      type: Object,
      default: () => ({}),
    },
    chargeTypes: {
      type: Array,
      default: () => [],
    },
    region: {
      type: String,
      default: '',
    },
    hiddenRegion: {
      type: Boolean,
      default: false,
    },
    zone: {
      type: String,
      default: '',
    },
    hiddenZone: {
      type: Boolean,
      default: false,
    },
    regionalAvailability: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      expanded: false,
      visible: false,
    }
  },
  computed: {
    hasTriggerContent () {
      return (this.region && !this.hiddenRegion) || (this.zone && !this.hiddenZone)
    },
    currentRegionItem () {
      if (!Array.isArray(this.regionalAvailability) || !this.region) return null
      return this.regionalAvailability.find(item => item.cloudregion === this.region) || null
    },
    currentRegionZones () {
      const item = this.currentRegionItem
      if (item && Array.isArray(item.zones) && item.zones.length) {
        return item.zones
      }
      if (this.zone && this.skuData && Object.keys(this.skuData).length) {
        return [this.skuData]
      }
      if (this.zone) {
        return [{ zone: this.zone }]
      }
      return []
    },
    currentSkuRegionItem () {
      const item = this.currentRegionItem
      if (item) {
        if (this.isRegionOnlyItem(item)) {
          return {
            cloudregion: item.cloudregion,
            prepaid_status: item.prepaid_status,
            postpaid_status: item.postpaid_status,
            zones: [],
          }
        }
        return {
          cloudregion: item.cloudregion,
          zones: item.zones || [],
        }
      }
      if (!this.skuData || !Object.keys(this.skuData).length) return null
      return { cloudregion: this.region, zones: [this.skuData] }
    },
    isCurrentRegionAvailable () {
      return this.isRegionAvailable(this.currentSkuRegionItem)
    },
    currentRegionTooltip () {
      return this.getAvailabilityTooltip('region', this.currentSkuRegionItem)
    },
    isRegionOnlyData () {
      if (!Array.isArray(this.regionalAvailability) || !this.regionalAvailability.length) return false
      return this.regionalAvailability.every(item => this.isRegionOnlyItem(item))
    },
    otherRegions () {
      if (!Array.isArray(this.regionalAvailability)) return []

      return this.regionalAvailability
        .filter(item => item.cloudregion !== this.region)
        .map(item => {
          if (this.isRegionOnlyItem(item)) {
            return {
              id: item.cloudregion_id,
              cloudregion: item.cloudregion,
              prepaid_status: item.prepaid_status,
              postpaid_status: item.postpaid_status,
              zones: [],
              isRegionOnly: true,
            }
          }
          if (this.hiddenZone) {
            return {
              id: item.cloudregion_id,
              cloudregion: item.cloudregion,
              zones: item.zones || [],
            }
          }
          return {
            id: item.cloudregion_id,
            cloudregion: item.cloudregion,
            zones: (item.zones || []).filter(z => z.zone !== this.zone),
          }
        })
        .filter(item => item.isRegionOnly || item.zones.length > 0)
    },
  },
  watch: {
    regionalAvailability () {
      this.expanded = false
    },
  },
  methods: {
    getTooltipContainer () {
      return document.body
    },
    handleWrapClick (e) {
      e.stopPropagation()
    },
    handleClose () {
      this.visible = false
    },
    handleVisibleChange (visible) {
      if (!visible) {
        this.expanded = false
      }
    },
    toggleExpanded () {
      this.expanded = !this.expanded
    },
    formatZoneName (name) {
      if (!name) return name
      const index = name.indexOf('可用区')
      return index >= 0 ? name.slice(index) : name
    },
    isRegionOnlyItem (item) {
      return !Array.isArray(item?.zones) || !item.zones.length
    },
    isRegionAvailable (regionItem) {
      if (!regionItem) return !this.chargeTypes.length
      if (!this.chargeTypes.length) return true
      const zones = regionItem.zones || []
      if (!zones.length) {
        return this.chargeTypes.some(type => regionItem[`${type}_status`] === 'available')
      }
      return this.chargeTypes.some(type => {
        const field = `${type}_status`
        return zones.some(zone => zone[field] === 'available')
      })
    },
    isZoneAvailable (zoneItem) {
      if (!zoneItem) return !this.chargeTypes.length
      if (!this.chargeTypes.length) return true
      return this.chargeTypes.every(type => zoneItem[`${type}_status`] === 'available')
    },
    getChargeTypeLabel (type) {
      return this.$t(`compute.sku.${type}_status`)
    },
    getScopeLabel (scope) {
      return scope === 'zone' ? this.$t('compute.text_270') : this.$t('dictionary.region')
    },
    isChargeTypeAvailable (scope, item, chargeType) {
      if (!item) return false
      if (scope === 'zone') {
        return item[`${chargeType}_status`] === 'available'
      }
      const zones = item.zones || []
      if (!zones.length) {
        return item[`${chargeType}_status`] === 'available'
      }
      return zones.some(zone => zone[`${chargeType}_status`] === 'available')
    },
    getAvailabilityTooltip (scope, item) {
      if (!item || !this.chargeTypes.length) return ''
      const scopeLabel = this.getScopeLabel(scope)
      const availableText = this.$t('status.sku.available')
      const unavailableText = this.$t('compute.regional_availability.unavailable')
      const entries = this.chargeTypes.map(type => ({
        label: this.getChargeTypeLabel(type),
        available: this.isChargeTypeAvailable(scope, item, type),
      }))
      if (entries.length === 1) {
        const { label, available } = entries[0]
        return this.$t('compute.regional_availability.tooltip.single', [
          label,
          scopeLabel,
          available ? availableText : unavailableText,
        ])
      }
      const allAvailable = entries.every(e => e.available)
      const allUnavailable = entries.every(e => !e.available)
      if (allAvailable || allUnavailable) {
        return this.$t('compute.regional_availability.tooltip.both_same', [
          entries[0].label,
          entries[1].label,
          scopeLabel,
          allAvailable ? availableText : unavailableText,
        ])
      }
      return this.$t('compute.regional_availability.tooltip.mixed', [
        entries[0].label,
        scopeLabel,
        entries[0].available ? availableText : unavailableText,
        entries[1].label,
        entries[1].available ? availableText : unavailableText,
      ])
    },
  },
}
</script>

<style lang="less">
@import '../../styles/less/theme';
.regional-availability-popover-overlay {
  .ant-popover-inner-content {
    padding: 0 !important;
  }
}
.regional-availability-empty {
  color: @text-color-secondary;
  cursor: default;
}
.regional-availability-root {
  display: inline-block;
  max-width: 100%;
  vertical-align: top;
}
.regional-availability-trigger {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;
  cursor: pointer;
  .list-body-cell-wrap {
    width: auto;
  }
}
.regional-availability-popover {
  &-header {
    display: flex;
    justify-content: flex-end;
    padding: 8px 12px 0;
  }
  .regional-availability-close {
    font-size: 12px;
    color: #8c8c8c;
    cursor: pointer;
    &:hover {
      color: #595959;
    }
  }
  &-body {
    max-height: 400px;
    width: 500px;
    overflow-y: auto;
  }
  &-content {
    padding: 4px 12px 12px;
  }
  .regional-availability-indicator {
    display: inline-block;
    margin-top: 6px;
    margin-right: 8px;
    flex-shrink: 0;
    &.status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      &.status-success {
        background-color: @success-color;
      }
      &.status-danger {
        background-color: @error-color;
      }
    }
  }
  .regional-availability-region-name {
    width: 170px;
    flex-shrink: 0;
    color: #0A1F44;
    line-height: 22px;
  }
  .regional-availability-zone-item {
    display: inline-flex;
    align-items: center;
    color: #0064c8;
    line-height: 22px;
    white-space: nowrap;
    .regional-availability-indicator {
      margin-top: 0;
      margin-right: 4px;
    }
    &.is-current {
      margin-left: 8px;
      padding: 0 6px;
      background-color: #e6f4ff;
      border-radius: 2px;
    }
  }
  .regional-availability-current {
    display: flex;
    align-items: flex-start;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  .regional-availability-other-header {
    display: flex;
    align-items: center;
    padding: 12px 0 8px;
    cursor: pointer;
    user-select: none;
  }
  .regional-availability-other-title {
    color: #0A1F44;
    font-weight: 500;
    line-height: 22px;
  }
  .regional-availability-other-icon {
    margin-left: 4px;
    font-size: 12px;
    color: #53627C;
  }
  .regional-availability-other-body {
    padding-bottom: 4px;
    &.is-region-only {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      .regional-availability-region-row {
        padding: 4px 0;
        border-bottom: none;
      }
      .regional-availability-region-name {
        width: auto;
        flex: 1;
      }
    }
  }
  .regional-availability-region-row {
    display: flex;
    align-items: flex-start;
    padding: 8px 0;
    &:not(:last-child) {
      border-bottom: 1px solid #fafafa;
    }
  }
  .regional-availability-zone-list {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 4px 24px;
  }
}
</style>
