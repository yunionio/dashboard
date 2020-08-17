<template>
  <a-dropdown
    v-model="visible"
    placement="bottomRight"
    :trigger="['click']"
    @visibleChange="handleVisibleChange">
    <action-button :class="{ 'ml-2': group }" :button-size="buttonSize" :row="row" :item="item" :button-type="buttonType" :button-style="buttonStyle" :button-block="buttonBlock" popover-trigger @clear-selected="clearSelected" />
    <a-menu slot="overlay">
      <template v-if="!isSubmenus">
        <template v-for="item of options">
          <a-menu-item v-if="!isSubmenus" :key="item.label">
            <action-button
              button-size="small"
              :button-style="{ fontSize: '12px' }"
              :item="item"
              :row="row"
              @hidden-popover="hiddenPopover"
              @clear-selected="clearSelected" />
          </a-menu-item>
        </template>
      </template>
      <a-sub-menu v-else v-for="item of options" :key="item.label" :title="item.label" class="submenu-item">
        <a-menu-item v-for="submenu of item.submenus" :key="submenu.label" class="submenu-item">
          <action-button
            :item="submenu"
            :row="row"
            button-size="small"
            :button-style="{ fontSize: '12px' }"
            @hidden-popover="hiddenPopover"
            @clear-selected="clearSelected" />
        </a-menu-item>
      </a-sub-menu>
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
  width: 130px;
}
.submenu-item-label {
  font-size: 12px;
  color: #3c73b9;
  padding-top: 8px;
}
</style>
