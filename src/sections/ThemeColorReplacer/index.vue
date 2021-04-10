<template>
  <div class="d-flex flex-wrap">
    <a-tooltip class="color-item" v-for="(item, index) in colorList" :key="index">
      <template slot="title">
        {{ item.key }}
      </template>
      <a-tag :color="item.color" @click="changeColor(item.color)">
        <a-icon type="check" v-if="item.color === themeColor" />
      </a-tag>
    </a-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { colorList } from '@/utils/theme/utils'

export default {
  name: 'ThemeColorReplacer',
  data () {
    return {
      colorList,
    }
  },
  computed: {
    ...mapGetters(['profile', 'themeColor']),
  },
  methods: {
    async changeColor (color) {
      if (this.themeColor !== color) {
        try {
          await this.$store.dispatch('profile/update', {
            themeColor: color,
          })
          await this.$store.commit('setting/SET_THEME_COLOR', color)
        } catch (error) {
          throw error
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.color-item {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
  margin-right: 8px;
  padding-left: 0px;
  padding-right: 0px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  i {
    font-size: 14px;
  }
}
</style>
