<template>
  <div class="level-1-menu">
    <div
      v-for="(item, idx) of menus"
      :key="idx"
      class="level-1-item"
      @click="toPage(item)">
      <div class="level-1-item-wrap" :class="{ 'active': item.meta.group === currentGroup }">
        <div class="level-1-item-icon">
          <icon :type="item.meta.icon" />
        </div>
        <p class="level-1-item-text">{{ getLabel(item.meta) }}</p>
      </div>
      <div class="bottom-line" v-if="item.meta.bottomLine" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Level1Menu',
  props: {
    menuitems: {
      type: Array,
      required: true,
    },
    showMenu: {
      type: Function,
      required: true,
    },
  },
  computed: {
    currentGroup () {
      const firstMatched = this.$route.matched[0]
      if (firstMatched) {
        return firstMatched['meta']['group']
      }
      return null
    },
    menus () {
      const res = []
      this.menuitems.forEach(m1item => {
        let flag = false
        if (this.showMenu(m1item)) {
          if (m1item.menus) {
            m1item.menus.forEach(m2item => {
              if (this.showMenu(m2item)) {
                if (m2item.submenus) {
                  m2item.submenus.forEach(m3item => {
                    if (this.showMenu(m3item)) {
                      flag = true
                    }
                  })
                } else {
                  flag = true
                }
              }
            })
          } else {
            flag = true
          }
        }
        if (flag) {
          res.push(m1item)
        }
      })
      return res
    },
  },
  methods: {
    searchPath (menus) {
      for (let i = 0, len = menus.length; i < len; i++) {
        const m2 = menus[i]
        if (this.showMenu(m2)) {
          if (m2.submenus) {
            for (let j = 0, jlen = m2.submenus.length; j < jlen; j++) {
              const m3 = m2.submenus[j]
              if (this.showMenu(m3)) {
                return m3.path
              }
            }
          } else {
            return m2.path
          }
        }
      }
    },
    toPage (item) {
      let path
      if (item.menus) {
        path = this.searchPath(item.menus)
      } else {
        path = item.menu.path
      }
      this.$router.push(path)
    },
    getLabel (meta) {
      if (meta.i18n) {
        return this.$t(meta.label)
      }
      return meta.label
    },
  },
}
</script>

<style lang="scss" scoped>
.level-1-menu {
  position: absolute;
  left: 0;
  top: 0;
  background-color: #092c4d;
  width: 64px;
  height: 100%;
  z-index: 4;
  overflow: hidden;
  border-right: 1px solid #e6e9f0;
  transition: all .15s ease;
  overflow-y: auto;
}
.level-1-item-wrap {
  cursor: pointer;
  height: 64px;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  border: none;
  display: block;
  width: 100%;
  position: relative;
  justify-content: center;
  display: flex;
  flex-direction: column;
  &:hover {
    color: #fff;
    background-color: #007fdf;
  }
  &.active {
    border-left-color: #007fdf;
    color: #fff;
    background-color: #007fdf;
  }
  .level-1-item-icon {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: 24px;
  }
}
.level-1-item-text {
  text-align: center;
  font-size: 12px;
  margin: 2px 0 0 0;
}
.bottom-line {
  height: 1px;
  background: rgba(255, 255, 255, .2);
  margin: 0;
  position: relative;
}
</style>
