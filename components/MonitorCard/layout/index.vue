<template>
  <a-row>
    <a-col style="padding-left: 6px; padding-right: 6px;" :span="24">
      <div class="monitor-overview-card mb-2">
        <div>
          <slot name="header" />
        </div>
        <div>
          <slot>{{ '' }}</slot>
        </div>
        <div>
          <slot name="footer" />
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'MonitorCardLayout',
}
</script>

<style lang="less" scoped>
.monitor-overview-card {
  border: 1px solid #F1F1F1;
  padding: 12px 24px;
  .header {
    font-weight: 500;
    .title-wrapper {
      .subtitle {
        font-size: 12px;
        color: #ccc;
      }
    }
  }
}
</style>
