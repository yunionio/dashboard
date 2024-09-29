<template>
  <scrollbar class="products-list-wrap" :class="{ 'light-theme': light }" id="products-list-wrap">
    <ul class="list-unstyled p-0 mb-0">
      <!-- 产品与服务 -->
      <li class="l1-menu-type" @click="changeType('product')">
        <a class="d-flex align-items-center">
          <div class="l1-menu-type-icon flex-shrink-0 flex-grow-0">
            <icon type="menu-dashboard" />
          </div>
          <div class="l1-menu-type-label flex-fill text-truncate mr-2" :title="$t('common.product_service')">{{ $t('common.product_service') }}</div>
          <div class="l1-menu-type-right-icon flex-shrink-0 flex-grow-0">
            <a-icon :type="productOpen ? 'down' : 'up'" />
          </div>
        </a>
      </li>
      <template v-for="(item, index) of menus">
        <li v-show="productOpen" class="l1-menu-item" :class="{ active: activeMenu.index === item.index }" :key="index">
          <a class="d-flex align-items-center" @click="handleL1LinkClick(item)">
            <div class="l1-menu-item-icon flex-shrink-0 flex-grow-0">
              <icon :type="item.meta.icon" />
            </div>
            <div class="l1-menu-item-label flex-fill text-truncate mr-2" :title="getLabel(item.meta)">{{ getLabel(item.meta) }}</div>
          </a>
        </li>
      </template>
      <!-- 收藏 -->
      <li class="l1-menu-type" @click="changeType('star')">
        <a class="d-flex align-items-center">
          <div class="l1-menu-type-icon flex-shrink-0 flex-grow-0">
            <icon type="menu-star" />
          </div>
          <div class="l1-menu-type-label flex-fill text-truncate mr-2" :title="$t('common.star_menu')">{{ $t('common.star_menu') }}</div>
          <div class="l1-menu-type-right-icon flex-shrink-0 flex-grow-0">
            <a-icon :type="starOpen ? 'down' : 'up'" />
          </div>
        </a>
      </li>
      <!-- 控制面板 -->
      <li class="l1-menu-star" v-show="starOpen">
        <a class="d-flex align-items-center" @click="handleL1StarClick({ path: '/dashboard' })">
          <div class="l1-menu-star-icon flex-shrink-0 flex-grow-0 drag-icon" style="opacity:0">
            <icon type="drag" />
          </div>
          <div class="l1-menu-star-label flex-fill text-truncate mr-2" :title="$t('dashboard.text_77')">{{ $t('dashboard.text_77') }}</div>
        </a>
      </li>
      <draggable
        v-show="starOpen"
        handle=".drag-icon"
        ghost-class="ghost"
        :value="staredMenus"
        @change="handleDragChange">
        <transition-group type="transition" name="flip-list">
          <li class="l1-menu-star" v-for="item in staredMenus" :key="item.path">
            <a class="d-flex align-items-center" @click="handleL1StarClick(item)">
              <div class="l1-menu-star-icon flex-shrink-0 flex-grow-0 drag-icon">
                <icon type="drag" />
              </div>
              <div class="l1-menu-star-label flex-fill text-truncate mr-2" :title="item.title">{{ item.title }}</div>
              <div class="l1-menu-star-right-icon flex-shrink-0 flex-grow-0" @click="e => handleUnStar(e, item)">
                <icon type="unstar" />
              </div>
            </a>
          </li>
        </transition-group>
      </draggable>
    </ul>
  </scrollbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import draggable from 'vuedraggable'
import * as R from 'ramda'

export default {
  name: 'ProductsList',
  components: {
    draggable,
  },
  props: {
    activeMenu: Object,
    popoverAlign: Object,
    menus: Array,
    staredMenus: Array,
  },
  data () {
    return {
      productOpen: false,
      starOpen: true,
      popoverOpen: false,
    }
  },
  computed: {
    ...mapGetters(['theme']),
    ...mapState('common', {
      staredList: state => state.sidebar.staredList,
    }),
    light () {
      return this.theme === 'light'
    },
    starMenus () {
      return []
    },
  },
  methods: {
    handleL1LinkClick (menu) {
      this.$emit('activeMenuChange', menu)
    },
    handleL1StarClick (menu) {
      this.$emit('routerChange', menu)
      this.$emit('close')
    },
    handleUnStar (e, menu) {
      e.stopPropagation()
      const list = this.staredList.filter((item, index) => item !== menu.path)
      this.$emit('updateStaredMenu', list)
    },
    closeSubMenu () {
      this.popoverOpen = false
    },
    popoverOpenChange () {
      this.popoverOpen = true
    },
    changeType (v) {
      if (v === 'product') {
        this.productOpen = !this.productOpen
      } else {
        this.starOpen = !this.starOpen
        if (!this.starOpen) {
          this.productOpen = true
        }
      }
    },
    getLabel (meta) {
      if (meta.t) {
        return this.$t(meta.t)
      }
      return R.is(Function, meta.label) ? meta.label() : meta.label
    },
    handleDragChange (el) {
      const { element, oldIndex, newIndex } = el.moved
      const list = this.staredList.filter((item, index) => index !== oldIndex)
      list.splice(newIndex, 0, element.path)
      this.$emit('updateStaredMenu', list)
    },
  },
}
</script>

<style lang="less">
@import "../../styles/less/theme";

.products-list-wrap {
  flex: 0 0 200px;
  height: 100%;
  background-color: @sidebar-dark-bg-color;
  .scrollbar-wrap {
    overflow-x: hidden;
  }
  &.light-theme {
    background-color: @sidebar-light-bg-color;
    .l1-menu-item {
      > a {
        color: @sidebar-light-text-color;
      }
      &:hover {
        // background-color: @primary-1;
        > a {
          color: @primary-color!important;
        }
      }
      &.active {
        // background-color: @primary-1 !important;
        > a {
          color: @primary-color;
        }
      }
      .l1-menu-item-right-icon {
        color: @sidebar-light-text-color!important;
        width: 26px;
        text-align: left;
        > i {
          font-size: 12px;
        }
      }
    }
    // 分类
    .l1-menu-type {
      border-top:1px solid #ddd;
      border-bottom:1px solid #ddd;
      background-color: @sidebar-light-text-bg-color;
      > a {
        color: @sidebar-light-text-color;
      }
      .l1-menu-type-right-icon {
        color: @sidebar-light-text-color!important;
      }
    }
    // 收藏
    .l1-menu-star {
      > a {
        color: @sidebar-light-text-color;
      }
      &:hover {
        background-color: @sidebar-light-text-bg-color;
        > a {
          color: @primary-color!important;
        }
      }
    }
  }
}
// 分类
.l1-menu-type {
  border-top:1px solid #222;
  border-bottom:1px solid #222;
  background-color: @sidebar-dark-text-bg-color;
  > a {
    height: 44px;
    color: @sidebar-dark-text-color;
  }
  .l1-menu-type-icon {
    width: 50px;
    height: 18px;
    text-align: center;
    > i {
      font-size: 18px;
    }
  }
  .l1-menu-type-right-icon {
    width: 26px;
    text-align: left;
    > i {
      font-size: 12px;
    }
  }
}
.l1-menu-item {
  > a {
    height: 44px;
    color: @sidebar-dark-text-color;
  }
  .l1-menu-item-icon {
    width: 50px;
    height: 18px;
    text-align: center;
    > i {
      font-size: 18px;
    }
  }
  .l1-menu-item-right-icon {
    width: 26px;
    text-align: left;
    > i {
      font-size: 12px;
    }
  }
  &.active {
    // background-color: @primary-7 !important;
    > a {
      color: @sidebar-light-active-text-color;
    }
  }
  &:hover {
    // background-color: @sidebar-dark-text-bg-color;
    > a {
      color: @sidebar-light-active-text-color!important;
    }
  }
  .l1-menu-item-right-icon {
    color: @sidebar-light-text-color!important;
  }
}
// 收藏
.l1-menu-star {
  > a {
    height: 44px;
    color: @sidebar-dark-text-color;
  }
  .l1-menu-star-icon {
    opacity: 0;
    width: 50px;
    height: 18px;
    text-align: center;
    > i {
      font-size: 16px;
    }
    &:hover {
      cursor: move;
    }
  }
  .l1-menu-star-right-icon {
    opacity: 0;
    width: 26px;
    text-align: left;
    > i {
      font-size: 13px;
    }
  }

  &.active {
    // background-color: @sidebar-light-text-bg-color;
    > a {
      color: @primary-color;
    }
  }
  &:hover {
    background-color: @sidebar-dark-text-bg-color;
    > a {
      color: @primary-color!important;
    }
    .l1-menu-star-icon {
      opacity: 0.9;
    }
    .l1-menu-star-right-icon {
      opacity: 1;
    }
  }
}

.flip-list-move {
  transition: transform 0.5s;
}
.ghost {
  opacity: 0.7;
}
</style>
