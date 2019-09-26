<template>
  <a-dropdown :trigger="['click']" v-model="visible" @visibleChange="handleVisibleChange">
    <a class="menu">{{ label }}<a-icon type="down" class="ml-1" /></a>
    <a-menu slot="overlay">
      <template v-if="options.length > 0">
        <template v-if="!submenusMode">
          <a-menu-item
            class="menu-item"
            v-for="item of options"
            :key="item.label"
            :disabled="!item.meta.validate">
            <action-button :option="item" @hidden-dropdown="hiddenDropdown" :button-mode="buttonMode" />
          </a-menu-item>
        </template>
        <template v-else>
          <a-menu-item
            class="submenu-item"
            v-for="item of options"
            :key="item.label">
            <a-row :gutter="20">
              <a-col :span="6">
                <div class="submenu-item-label">{{ item.label }}</div>
              </a-col>
              <a-col :span="18">
                <a-row :gutter="20">
                  <a-col
                    :span="12"
                    v-for="submenu of item.submenus"
                    :key="submenu.label"
                    class="submenu-item-action-wrap">
                    <action-button :option="submenu" @hidden-dropdown="hiddenDropdown" :button-mode="buttonMode" />
                  </a-col>
                </a-row>
              </a-col>
            </a-row>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </a-dropdown>
</template>

<script>
import * as R from 'ramda'
import ActionButton from './ActionButton'

export default {
  name: 'PageListDropmenus',
  components: {
    ActionButton,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    actions: {
      type: [Array, Function],
      required: true,
    },
    row: {
      type: Object,
      required: true,
    },
    buttonMode: {
      type: Boolean,
    },
  },
  data () {
    return {
      visible: false,
      submenusMode: false,
      options: [],
    }
  },
  methods: {
    handleVisibleChange (val) {
      if (val) {
        this.options = this.getOptions()
      }
    },
    getOptions () {
      if (!R.is(Function, this.actions)) {
        throw new Error('actions must be a function')
      }
      let options = this.actions(this.row)
      if (options.every(item => item.hasOwnProperty('submenus'))) {
        options = options.map(item => {
          const { submenus, ...rest } = item
          return {
            ...rest,
            submenus: submenus.map(submenu => this.getSubmenu(submenu)),
          }
        })
        this.submenusMode = true
      } else {
        options = options.map(item => {
          return {
            ...item,
            meta: this.getMeta(item),
          }
        })
        this.submenusMode = false
      }
      return options
    },
    handleClick (item) {
      if (!item.meta.validate) return
      item.action()
      this.visible = false
    },
    hiddenDropdown () {
      this.visible = false
    },
    getMeta (item) {
      const { validate = true, ...rest } = R.is(Function, item.meta) ? item.meta() : {}
      return {
        validate,
        ...rest,
      }
    },
    getSubmenu (submenu) {
      const { meta, ...rest } = submenu
      return {
        ...rest,
        meta: this.getMeta(submenu),
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.menu {
  & + .menu {
    margin-left: 5px;
  }
}
.submenu-item {
  cursor: default;
  width: 320px;
  border-bottom: 1px solid #eee;
  &:hover {
    background-color: #fff;
  }
  &:last-child {
    border-bottom: 0;
  }
}
.submenu-item-label {
  font-size: 12px;
  color: #3c73b9;
  padding-top: 6px;
}
.submenu-item-action-wrap {
  padding-top: 5px;
  padding-bottom: 5px;
  color: rgba(0, 0, 0, 0.65);
  a {
    color: rgba(0, 0, 0, 0.65);
    &:hover {
      color: #3c73b9;
    }
    &.disabled {
      color: rgba(0, 0, 0, 0.25);
      cursor: not-allowed;
    }
  }
}
</style>
