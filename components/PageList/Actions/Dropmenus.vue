<template>
  <a-dropdown
    v-model="visible"
    :trigger="['click']"
    @visibleChange="handleVisibleChange">
    <action-button ref="wrapBtn" :class="{ 'ml-2': group }" :button-size="buttonSize" :row="row" :item="item" :button-type="buttonType" :button-style="buttonStyle" :button-block="buttonBlock" popover-trigger @clear-selected="clearSelected" />
    <a-menu slot="overlay">
      <template v-if="!isSubmenus">
        <template v-for="item of options">
          <a-menu-item :key="item.label" class="sub-link-btn">
            <action-button
              button-size="small"
              :button-block="true"
              :button-style="{ fontSize: '12px' }"
              :item="item"
              :row="row"
              @hidden-popover="hiddenPopover"
              @clear-selected="clearSelected" />
          </a-menu-item>
        </template>
      </template>
      <template v-else>
        <template v-for="item of options">
          <a-sub-menu v-if="!getSubmenusHidden(item.submenus)" :key="item.label" :title="item.label" class="submenu-item">
            <template v-for="submenu of item.submenus">
              <a-menu-item v-if="!getHidden(submenu)" :key="submenu.label" class="submenu-item sub-link-btn">
                <action-button
                  :item="submenu"
                  :row="row"
                  button-size="small"
                  :button-block="true"
                  :button-style="{ fontSize: '12px' }"
                  @hidden-popover="hiddenPopover"
                  @clear-selected="clearSelected" />
              </a-menu-item>
            </template>
          </a-sub-menu>
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
    item: {
      type: Object,
      required: true,
    },
    row: {
      type: Object,
    },
    buttonType: {
      type: String,
    },
    buttonSize: {
      type: String,
    },
    buttonStyle: {
      type: Object,
    },
    group: {
      type: Boolean,
    },
    buttonBlock: {
      type: Boolean,
    },
  },
  data () {
    return {
      visible: false,
      options: [],
      // 是否为组模式
      isSubmenus: false,
    }
  },
  methods: {
    genOptions () {
      if (!R.is(Function, this.item.actions)) {
        throw new Error('actions must be a function')
      }
      const options = this.item.actions(this.row)
      if (options.every(item => item.hasOwnProperty('submenus'))) {
        this.isSubmenus = true
      }
      this.options = options
    },
    handleVisibleChange (visible) {
      // if (this.$ref.wrapBtn.disabled) {
      //   this.visible = false
      //   return
      // }
      if (visible) {
        this.genOptions()
      }
    },
    hiddenPopover () {
      this.visible = false
    },
    clearSelected () {
      this.$emit('clear-selected')
    },
    getHidden (item) {
      return R.is(Function, item.hidden) ? item.hidden(this.row) : item.hidden === true
    },
    getSubmenusHidden (submenus) {
      // 默认隐藏，当遇到任意一个不隐藏的按钮，直接跳出循环返回
      let hidden = true
      for (let i = 0, len = submenus.length; i < len; i++) {
        const option = submenus[i]
        const optionHidden = this.getHidden(option)
        if (!optionHidden) {
          hidden = false
          break
        }
      }
      return hidden
    },
  },
}
</script>

<style lang="less">
.page-list-actions-dropmenus-wrap {
  .ant-popover-inner-content {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }
}
</style>

<style lang="less" scoped>
@import "../../../styles/less/theme";

.submenu-item {
  cursor: pointer;
  min-width: 130px;
}
.sub-link-btn {
  .ant-btn-link {
    color: rgba(0, 0, 0, 0.65)
  }
  .ant-btn-link[disabled] {
    color: rgba(0, 0, 0, 0.25)
  }
}
.submenu-item-label {
  font-size: 12px;
  color: #3c73b9;
  padding-top: 8px;
}
.ant-dropdown-menu-item, .ant-dropdown-menu-submenu-title {
  padding: 5px 0 !important;
}
</style>
