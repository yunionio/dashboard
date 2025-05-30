<template>
  <div class="page-header" :class="title ? ['d-flex', 'align-items-center'] : []">
    <template>
      <slot name="title" />
      <h3 v-if="title">{{ title }}</h3>
      <div class="mini-title mb-2" v-if="miniTitle">
        {{ miniTitle }}
      </div>
      <template v-if="tabs">
        <div class="ml-4 position-relative h-100" style="flex: 1 1 auto">
          <a-tabs
            :defaultActiveKey="currentTab"
            class="page-header-tabs"
            :animated="false"
            :tab-bar-style="{ padding: '0 30px', marginBottom: 0, width: '100%' }"
            size="large"
            @change="handleTabChange">
            <template v-for="item of tabs">
              <a-tab-pane :tab="item.label" :key="item.key" />
            </template>
          </a-tabs>
        </div>
      </template>
    </template>
    <slot name="res-status-tab" />
    <div v-if="isShowResStatusTab" style="position: absolute; right: 0; top: 10px;">
      <res-status-tab
        :status-opts="statusOpts"
        @click="statusClickHandle" />
    </div>
  </div>
</template>

<script>
import ResStatusTab from '@/sections/ResStatusTab'

export default {
  name: 'PageHeader',
  components: {
    ResStatusTab,
  },
  props: {
    title: {
      type: String,
    },
    miniTitle: {
      type: String,
    },
    tabs: Array,
    currentTab: String,
    isShowResStatusTab: {
      type: Boolean,
      default: false,
    },
    statusOpts: Array,
    statusClickHandle: Function,
  },
  methods: {
    handleTabChange (val) {
      this.$emit('update:currentTab', val)
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../src/styles/less/theme';

.page-header {
  height: 60px;
  position: relative;
  > h3 {
    font-size: 28px;
    color: #000;
    margin: 0;
    padding: 0;
    font-weight: bold;
  }
  &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    content: "";
    box-shadow: inset 0 -1px 0 0 @border-color-base;
    opacity: .3;
  }
  .mini-title {
    font-size: 12px;
    color: @text-color-secondary;
  }
}
.page-header-tabs {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  ::v-deep {
    .ant-tabs-bar {
      border-bottom: 0;
    }
    .ant-tabs-nav .ant-tabs-tab {
      padding: 16px 16px 20px 16px;
      font-weight: bold;
    }
    .ant-tabs-nav-wrap {
      margin-bottom: 0;
    }
  }
}
</style>
