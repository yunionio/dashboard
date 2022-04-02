<template>
  <div class="d-flex mt-3 mb-4">
    <div class="res-title flex-grow-0 flex-shrink-0">{{ resource.label }}</div>
    <div class="flex-fill">
      <!-- 全选 -->
      <a-checkbox
        class="mr-2"
        :checked="resource.checkAll"
        @change="handleCheckAllChange"
        :indeterminate="resource.isIndeterminate"
        :disabled="resource.disabled">{{$t('system.text_320')}}</a-checkbox>
      <a-checkbox-group
        v-model="normalChecked"
        @change="handleCheckedActionsChange"
        :options="normalActions" />
      <!-- 执行操作 -->
      <a-checkbox
        class="ml-2"
        :checked="performActionShowChecked"
        @change="performActionCheckedChange"
        :indeterminate="isPerformActionIndeterminate"
        :disabled="resource.disabled">{{performAction.label}}</a-checkbox>
      <template v-if="extraActions.length">
        <a-button type="link" @click="showExtraActionConfig">{{extraActionName}}</a-button>
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import { DEFAULT_ACTIONS_KEY } from '../../../constants'

const EXPECT_PERFORM_DEFAULT_ACTION_KEY = DEFAULT_ACTIONS_KEY.slice(0, DEFAULT_ACTIONS_KEY.length - 1)

export default {
  name: 'PolicyRuleCheckboxItem',
  mixins: [WindowsMixin],
  props: {
    resource: Object,
    permissions: Object,
    itemPolicy: Object,
  },
  data () {
    return {
      normalChecked: [],
    }
  },
  computed: {
    // normalChecked () {
    //   return this.resource.checked.filter(action => EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action))
    // },
    normalActions () {
      return this.resource.actions.filter(action => EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action.action))
    },
    extraActions () {
      return this.resource.actions.filter(action => !DEFAULT_ACTIONS_KEY.includes(action.action))
    },
    performAction () {
      return this.resource.actions.filter(action => action.action === 'perform')[0]
    },
    extraActionName () {
      return '所有'
    },
    performActionShowChecked () {
      if (!this.extraActions.length) {
        return this.resource.checked.includes('perform')
      }
      let allChecked = true
      this.extraActions.map(item => {
        if (!this.resource.checked.includes(item.action)) {
          allChecked = false
        }
      })
      return allChecked
    },
    // 是否展示执行操作为 选中一部分
    isPerformActionIndeterminate () {
      if (!this.extraActions.length) {
        return false
      }
      let extraCheckedCount = 0
      this.extraActions.map(action => {
        if (this.resource.checked.includes(action.action)) {
          extraCheckedCount += 1
        }
      })
      return extraCheckedCount > 0 && extraCheckedCount < this.extraActions.length
    },
  },
  watch: {
    permissions: {
      handler (val) {
        if (!R.isEmpty(val) && !R.isNil(val)) {
          const checked = [...this.resource.checked]
          this.resource.actions.forEach(action => {
            const permission = val[`${this.resource.resource}_${action.action}`]
            if (
              permission[permission.length - 2] === 'allow' &&
              permission[permission.length - 1] === 'allow' &&
              !action.disabled
            ) {
              // const checked = [...this.resource.checked]
              if (!checked.includes(action.action)) {
                checked.push(action.action)
                // this.handleCheckedActionsChange(checked)
              } else {
                // this.handleCheckedActionsChange([action.action])
              }
            }
          })
          this.initChecked(checked)
        }
      },
      immediate: true,
    },
    // itemPolicy: {
    //   handler (val) {
    //     if (!R.isEmpty(val) && !R.isNil(val)) {
    //       const checked = [...this.resource.checked]
    //       this.resource.actions.forEach(action => {
    //         if (val[action.action]['*'] === 'allow' && !action.disabled) {
    //           if (!checked.includes(action.action)) {
    //             checked.push(action.action)
    //             // this.handleCheckedActionsChange(checked)
    //           } else {
    //             // this.handleCheckedActionsChange([action.action])
    //           }
    //         }
    //       })
    //       this.handleCheckedActionsChange(checked)
    //     }
    //   },
    //   immediate: true,
    // },
    'resource.checked': {
      handler (val) {
        this.normalChecked = val.filter(action => EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action))
      },
      immediate: true,
    },
  },
  methods: {
    initChecked (checked) {
      this.normalChecked = checked.filter(action => EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action))
      const isIndeterminate = checked.length > 0 && checked.length < this.resource.actions.length
      const checkAll = checked.length === this.resource.actions.length
      this.$set(this.resource, 'checked', checked)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$emit('resourceCheckChange')
    },
    // 全选
    handleCheckAllChange (e) {
      const val = e.target.checked
      const unDisabledActions = this.resource.actions.filter(item => !item.disabled)
      const checked = val ? unDisabledActions.map(action => action.action) : []
      const isIndeterminate = checked.length > 0 && checked.length < this.resource.actions.length
      const checkAll = checked.length === this.resource.actions.length
      this.$set(this.resource, 'checked', checked)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$emit('resourceCheckChange')
    },
    // [增删改查详情]选择
    handleCheckedActionsChange (val) {
      this.normalChecked = val
      // 操作详情的选择
      let extraAndPerformChecked = this.resource.checked.filter(action => !EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action))
      // 联动 [执行操作]
      this.extraActions.map(action => {
        const actionTypes = action.action.split('_')
        if (actionTypes[1] && actionTypes[1] === '*' && EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(actionTypes[0])) {
          if (val.includes(actionTypes[0]) && !extraAndPerformChecked.includes(action.action)) {
            extraAndPerformChecked.push(action.action)
          } else if (!val.includes(actionTypes[0]) && extraAndPerformChecked.includes(action.action)) {
            extraAndPerformChecked = extraAndPerformChecked.filter(key => key !== action.action)
          }
        }
      })
      const checked = [...val, ...extraAndPerformChecked]
      const isIndeterminate = checked.length > 0 && checked.length < this.resource.actions.length
      const checkAll = checked.length === this.resource.actions.length
      this.$set(this.resource, 'checked', checked)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$emit('resourceCheckChange')
    },
    // 执行操作选择
    performActionCheckedChange (e) {
      const val = e.target.checked
      // [增删改查详情]的选择
      let normalChecked = this.resource.checked.filter(action => {
        return EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action)
      })
      // 操作详情的选择
      let extraChecked = this.extraActions.map(action => {
        // 清空或选中操作详情 联动 [增删改查详情]
        const actionTypes = action.action.split('_')
        if (actionTypes[1] && actionTypes[1] === '*' && EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(actionTypes[0])) {
          if (!val && normalChecked.includes(actionTypes[0])) {
            normalChecked = normalChecked.filter(key => key !== actionTypes[0])
          } else if (val && !normalChecked.includes(actionTypes[0])) {
            normalChecked.push(actionTypes[0])
          }
        }
        return action.action
      })
      if (!val) {
        extraChecked = []
      }
      const checked = [...normalChecked, ...extraChecked]
      if (extraChecked.length === this.extraActions.length) {
        checked.push('perform')
      }
      const isIndeterminate = checked.length > 0 && checked.length < this.resource.actions.length
      const checkAll = checked.length === this.resource.actions.length
      this.$set(this.resource, 'checked', checked)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$emit('resourceCheckChange')
    },
    // 执行操作详情选择
    extraActionsCheckedChange (extraChecked) {
      const normalChecked = this.resource.checked.filter(action => {
        return EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action)
      })
      const checked = [...normalChecked, ...extraChecked]
      if (extraChecked.length) {
        checked.push('perform')
      }
      const isIndeterminate = checked.length > 0 && checked.length < this.resource.actions.length
      const checkAll = checked.length === this.resource.actions.length
      this.$set(this.resource, 'checked', checked)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$emit('resourceCheckChange')
    },
    extraChangeNormal (action, val) {
      let normalChecked = this.resource.checked.filter(action => EXPECT_PERFORM_DEFAULT_ACTION_KEY.includes(action))
      if (val && !normalChecked.includes(action)) {
        normalChecked.push(action)
      } else if (!val && normalChecked.includes(action)) {
        normalChecked = normalChecked.filter(key => key !== action)
      }
      this.handleCheckedActionsChange(normalChecked)
    },
    showExtraActionConfig () {
      this.createDialog('PolicyExtraActionConfig', {
        resource: this.resource,
        actions: this.extraActions,
        checked: this.resource.checked,
        checkedChange: this.extraActionsCheckedChange,
        extraChangeNormal: this.extraChangeNormal,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.res-title {
  width: 160px;
}
.extra-checkboxs {
  visibility: none;
}
</style>
