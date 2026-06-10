<template>
  <span class="regional-availability-root" @click.stop="handleWrapClick">
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
              <span class="regional-availability-indicator status-dot status-success" />
              <a-tooltip
                :title="currentRegionTooltip || null"
                placement="top"
                :get-popup-container="getTooltipContainer">
                <span class="regional-availability-region-name">{{ region || '-' }}</span>
              </a-tooltip>
              <a-tooltip
                v-if="zone && !hiddenZone"
                :title="currentZoneTooltip || null"
                placement="top"
                :get-popup-container="getTooltipContainer">
                <span class="regional-availability-zone-item is-current">
                  <span class="regional-availability-indicator status-dot status-success" />
                  {{ formatZoneName(zone) }}
                </span>
              </a-tooltip>
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
                :class="{ 'is-region-only': hiddenZone }">
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
                  <div v-if="!hiddenZone" class="regional-availability-zone-list">
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
        <span v-if="!region && !zone">-</span>
      </span>
    </a-popover>
  </span>
</template>

<script>
export default {
  name: 'RegionalAvailabilityPopover',
  props: {
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
    currentRegionItem () {
      if (!Array.isArray(this.regionalAvailability)) return null
      return this.regionalAvailability.find(item => item.cloudregion === this.region) || null
    },
    currentZoneItem () {
      if (!this.zone) return null
      if (this.currentRegionItem) {
        const matched = this.findZoneItem(this.currentRegionItem.zones, this.zone)
        if (matched) return matched
      }
      if (Array.isArray(this.regionalAvailability)) {
        for (const item of this.regionalAvailability) {
          const matched = this.findZoneItem(item.zones, this.zone)
          if (matched) return matched
        }
      }
      return null
    },
    currentRegionTooltip () {
      const item = this.currentRegionItem || this.buildRegionFallbackItem()
      return this.getAvailabilityTooltip('region', item)
    },
    currentZoneTooltip () {
      const item = this.currentZoneItem || this.buildZoneFallbackItem()
      return this.getAvailabilityTooltip('zone', item)
    },
    otherRegions () {
      if (!Array.isArray(this.regionalAvailability)) return []
      if (this.hiddenZone) {
        return this.regionalAvailability
          .filter(item => item.cloudregion !== this.region)
          .map(item => ({
            id: item.cloudregion_id,
            cloudregion: item.cloudregion,
            zones: item.zones || [],
          }))
      }
      return this.regionalAvailability
        .map(item => ({
          id: item.cloudregion_id,
          cloudregion: item.cloudregion,
          zones: (item.zones || []).filter(z => z.zone !== this.zone),
        }))
        .filter(item => item.zones.length > 0)
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
    findZoneItem (zones, zoneName) {
      if (!Array.isArray(zones) || !zoneName) return null
      const formattedName = this.formatZoneName(zoneName)
      return zones.find(z => z.zone === zoneName) || zones.find(z => this.formatZoneName(z.zone) === formattedName) || zones.find(z => z.zone && (z.zone.endsWith(zoneName) || zoneName.endsWith(z.zone))) || null
    },
    buildRegionFallbackItem () {
      if (!this.chargeTypes.length) return null
      const zoneStatus = {}
      this.chargeTypes.forEach(type => {
        zoneStatus[`${type}_status`] = 'available'
      })
      return { cloudregion: this.region, zones: [zoneStatus] }
    },
    buildZoneFallbackItem () {
      if (!this.chargeTypes.length) return null
      const item = { zone: this.zone }
      this.chargeTypes.forEach(type => {
        item[`${type}_status`] = 'available'
      })
      return item
    },
    isRegionAvailable (regionItem) {
      if (!regionItem) return !this.chargeTypes.length
      if (!this.chargeTypes.length) return true
      const zones = regionItem.zones || []
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
