<template>
  <div class="d-flex flex-wrap">
    <a-tooltip>
      <template slot="title">{{$t('common_272')}}</template>
      <div class="setting-theme-item" @click="changeTheme('dark')">
        <img src="./assets/dark-theme-icon.svg" alt="dark" />
        <div class="setting-theme-selectIcon" v-if="theme === 'dark'">
          <a-icon type="check" />
        </div>
      </div>
    </a-tooltip>
    <a-tooltip>
      <template slot="title">{{$t('common_273')}}</template>
      <div class="setting-theme-item" @click="changeTheme('light')">
        <img src="./assets/light-theme-icon.svg" alt="light" />
        <div class="setting-theme-selectIcon" v-if="theme === 'light'">
          <a-icon type="check" />
        </div>
      </div>
    </a-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { colorList } from '@/utils/theme/utils'

export default {
  name: 'ThemeReplacer',
  data () {
    return {
      colorList,
    }
  },
  computed: {
    ...mapGetters(['theme']),
  },
  methods: {
    async changeTheme (theme) {
      if (this.theme !== theme) {
        try {
          await this.$store.dispatch('profile/update', {
            theme,
          })
          await this.$store.commit('setting/SET_THEME', theme)
        } catch (error) {
          throw error
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.setting-theme-item {
  margin-right: 16px;
  position: relative;
  border-radius: 4px;
  cursor: pointer;
  img {
    width: 48px;
  }
  .setting-theme-selectIcon {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    padding-top: 15px;
    padding-left: 24px;
    height: 100%;
    color: #1890ff;
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
