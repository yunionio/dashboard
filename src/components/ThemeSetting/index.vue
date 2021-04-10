<template>
  <div class="setting-wrap">
    <div class="setting-item">
      <h3 class="setting-title">{{$t('common_196')}}</h3>
      <theme-replacer />
    </div>
    <div class="setting-item">
      <h3 class="setting-title">{{$t('common_197')}}</h3>
      <theme-color-replacer />
    </div>
  </div>
</template>

<script>
import ThemeColorReplacer from '@/sections/ThemeColorReplacer'
import ThemeReplacer from '@/sections/ThemeReplacer'

export default {
  name: 'SettingPopover',
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
