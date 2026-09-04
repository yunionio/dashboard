<template>
  <a-collapse
    class="advance-config-block"
    :class="{ 'is-static': !collapsible }"
    :bordered="false"
    :activeKey="activeKeys"
    @change="onCollapseChange">
    <!-- forceRender：折叠后内容仍挂载，提交可收集字段（对齐旧高级配置） -->
    <a-collapse-panel
      key="1"
      :header="displayTitle"
      :forceRender="true"
      :showArrow="collapsible">
      <slot />
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
const PANEL_KEY = '1'

export default {
  name: 'AdvanceConfigBlock',
  model: {
    prop: 'expanded',
    event: 'update:expanded',
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    /** 是否可折叠；false 时始终展开（非创建页旧用法） */
    collapsible: {
      type: Boolean,
      default: false,
    },
    /** 受控展开（配合 .sync / v-model） */
    expanded: {
      type: Boolean,
      default: undefined,
    },
    /** 非受控初始展开；可折叠时默认收起 */
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      localExpanded: this.defaultExpanded,
      /** 用户点过折叠后，代码不再改展开状态 */
      userInteracted: false,
      /** 进页自动打开是否已用过（只允许一次） */
      autoOpenedOnce: false,
    }
  },
  computed: {
    displayTitle () {
      return this.title || this.$t('common.adv_config')
    },
    isControlled () {
      return this.expanded !== undefined
    },
    innerExpanded () {
      if (!this.collapsible) return true
      return this.isControlled ? !!this.expanded : !!this.localExpanded
    },
    activeKeys () {
      return this.innerExpanded ? [PANEL_KEY] : []
    },
  },
  watch: {
    defaultExpanded (val) {
      if (!this.isControlled && !this.userInteracted && !this.autoOpenedOnce) {
        this.localExpanded = !!val
      }
    },
  },
  methods: {
    onCollapseChange (keys) {
      if (!this.collapsible) return
      // 用户手势：之后完全遵循客户选择
      this.userInteracted = true
      const list = Array.isArray(keys) ? keys : (keys != null && keys !== '' ? [keys] : [])
      this.applyExpanded(list.map(String).includes(PANEL_KEY))
    },
    applyExpanded (open) {
      const next = !!open
      if (!this.isControlled) this.localExpanded = next
      this.$emit('update:expanded', next)
      this.$emit('change', next)
    },
    /**
     * 进页回填用：有草稿/工单内容时调用。
     * 最多成功一次；用户已手动操作则不再打开。
     * @returns {boolean} 是否实际打开
     */
    tryAutoOpenOnce () {
      if (!this.collapsible) return false
      if (this.userInteracted || this.autoOpenedOnce) return false
      this.autoOpenedOnce = true
      this.applyExpanded(true)
      return true
    },
    /** @deprecated 请用 tryAutoOpenOnce；保留兼容，语义相同 */
    open () {
      return this.tryAutoOpenOnce()
    },
    close () {
      if (!this.collapsible) return
      if (this.userInteracted) return
      this.applyExpanded(false)
    },
  },
}
</script>

<style lang="less">
.advance-config-block.ant-collapse {
  margin: 12px 0 20px;
  background: #fafafa;
  border: 0;
  border-radius: 4px;
  overflow: hidden;

  > .ant-collapse-item {
    border: 0;
    background: transparent;
  }

  .ant-collapse-header {
    margin: 0 !important;
    padding: 12px 16px 12px 40px !important;
    background: transparent !important;
    color: var(--antd-wave-shadow-color) !important;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }

  .ant-collapse-arrow {
    left: 16px !important;
    color: var(--antd-wave-shadow-color) !important;
  }

  .ant-collapse-content {
    background: transparent;
    border-top: none;
  }

  .ant-collapse-content-box {
    padding: 0 16px 16px;
  }

  &.is-static {
    .ant-collapse-header {
      cursor: default;
      pointer-events: none;
    }
  }
}
</style>
