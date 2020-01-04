<template>
  <div class="page-header" :class="title ? ['d-flex', 'align-items-center'] : []">
    <h3 v-if="title">{{ title }}</h3>
    <div class="mini-title mb-2" v-if="miniTitle">
      {{ miniTitle }}
    </div>
    <template v-if="tabs">
      <div class="ml-4 position-relative h-100">
        <a-tabs
          :defaultActiveKey="currentTab"
          class="page-header-tabs"
          :animated="false"
          :tab-bar-style="{ padding: '0 30px', marginBottom: 0 }"
          size="large"
          @change="handleTabChange">
          <template v-for="item of tabs">
            <a-tab-pane :tab="item.label" :key="item.key" />
          </template>
        </a-tabs>
      </div>
    </template>

  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
    },
    miniTitle: {
      type: String,
    },
    tabs: Array,
    currentTab: String,
  },
  methods: {
    handleTabChange (val) {
      this.$emit('update:currentTab', val)
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../src/styles/antd/index.less';

.page-header {
  height: 60px;
  padding: 0 20px;
  position: relative;
  > h3 {
    font-size: 20px;
    color: #1a2736;
    margin: 0;
    padding: 0;
    font-weight: normal;
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
  ::v-deep {
    .ant-tabs-bar {
      border-bottom: 0;
    }
    .ant-tabs-nav .ant-tabs-tab {
      padding: 16px 16px 20px 16px;
    }
  }
}
</style>
