<template>
  <div>
    <a-popover trigger="click" :getPopupContainer="triggerNode => triggerNode.parentNode">
      <div class="trigger d-flex align-items-center justify-content-center">
        <a-icon type="setting" style="font-size: 24px;" />
      </div>
      <template v-slot:content>
        <div class="setting-wrap">
          <div class="setting-item">
            <h3 class="setting-title">整体风格设置</h3>
            <theme-replacer />
          </div>
          <div class="setting-item">
            <h3 class="setting-title">主题色</h3>
            <theme-color-replacer />
          </div>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script>
import ThemeColorReplacer from '@/sections/ThemeColorReplacer'
import ThemeReplacer from '@/sections/ThemeReplacer'

export default {
  name: 'NotifyPopover',
  components: {
    ThemeColorReplacer,
    ThemeReplacer,
  },
}
</script>

<style lang="less" scoped>
.trigger {
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
.setting-item {
  margin-bottom: 24px;
}
.setting-title {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 22px;
}
</style>
