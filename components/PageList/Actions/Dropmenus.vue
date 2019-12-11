<template>
  <a-popover
    trigger="click"
    v-model="visible"
    placement="bottomRight"
    destroyTooltipOnHide
    overlayClassName="page-list-actions-dropmenus-wrap"
    @visibleChange="handleVisibleChange">
    <action-button :class="{ 'ml-2': group }" :button-size="buttonSize" :row="row" :item="item" :button-type="buttonType" :button-style="buttonStyle" :button-block="buttonBlock" popover-trigger />
    <div slot="content">
      <template v-if="options.length > 0">
        <template v-if="!isSubmenus">
          <template v-for="item of options">
            <div :key="item.label" class="menu-item">
              <action-button button-size="small" :button-style="{ fontSize: '12px' }" :item="item" :row="row" @hidden-popover="hiddenPopover" />
            </div>
          </template>
        </template>
        <template v-else>
          <div class="pl-3 pr-3">
            <template v-for="item of options">
              <div class="submenu-item" :key="item.label">
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
                        <action-button
                          :item="submenu"
                          :row="row"
                          button-size="small"
                          :button-style="{ fontSize: '12px' }"
                          @hidden-popover="hiddenPopover" />
                      </a-col>
                    </a-row>
                  </a-col>
                </a-row>
              </div>
            </template>
          </div>
        </template>
      </template>
    </div>
  </a-popover>
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
  },
}
</script>

<style lang="scss">
.page-list-actions-dropmenus-wrap {
  .ant-popover-inner-content {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }
}
</style>

<style lang="scss" scoped>
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
  padding-top: 8px;
}
.submenu-item-action-wrap {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  color: rgba(0, 0, 0, 0.65);
  button {
    color: rgba(0, 0, 0, 0.65);
    &:hover {
      color: #1890ff;
    }
    &:disabled {
      color: rgba(0, 0, 0, 0.25);
      cursor: not-allowed;
      &:hover {
        color: rgba(0, 0, 0, 0.25);
      }
    }
  }
}
.menu-item {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  color: rgba(0, 0, 0, 0.65);
  button {
    color: rgba(0, 0, 0, 0.65);
    &:hover {
      color: #1890ff;
    }
    &:disabled {
      color: rgba(0, 0, 0, 0.25);
      cursor: not-allowed;
      &:hover {
        color: rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style>
