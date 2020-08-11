<template>
  <div class="setting-wrap">
    <div class="setting-item">
      <h3 class="setting-title">{{$t('common_459')}}</h3>
      <a-button-group size="small">
        <a-button :type="language === 'zh-CN' ? 'primary' : 'default'" @click="() => handleChangeLanguage('zh-CN')">简体中文</a-button>
        <a-button :type="language === 'en' ? 'primary' : 'default'" @click="() => handleChangeLanguage('en')">En</a-button>
      </a-button-group>
    </div>
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
import { mapGetters } from 'vuex'
import ThemeColorReplacer from '@/sections/ThemeColorReplacer'
import ThemeReplacer from '@/sections/ThemeReplacer'
import { setLanguage } from '@/utils/common/cookie'

export default {
  name: 'SettingPopover',
  components: {
    ThemeColorReplacer,
    ThemeReplacer,
  },
  props: {
    settingMenuTitleUsedText: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['setting']),
    language () {
      return this.setting.language
    },
  },
  methods: {
    handleChangeLanguage (val) {
      setLanguage(val)
      window.location.reload()
    },
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
