<template>
  <div class="d-flex mt-3 mb-4">
    <div class="res-title flex-grow-0 flex-shrink-0">{{ resource.label }}</div>
    <div class="flex-fill">
      <a-checkbox
        class="mr-2"
        :checked="resource.checkAll"
        @change="handleCheckAllChange"
        :indeterminate="resource.isIndeterminate"
        :disabled="resource.disabled">{{$t('system.text_320')}}</a-checkbox>
      <a-checkbox-group
        v-model="resource.checked"
        @change="handleCheckedActionsChange"
        :options="resource.actions" />
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'PolicyRuleCheckboxItem',
  props: {
    resource: Object,
    permissions: Object,
  },
  watch: {
    permissions: {
      handler (val) {
        if (!R.isEmpty(val) && !R.isNil(val)) {
          this.resource.actions.forEach(action => {
            const permission = val[`${this.resource.resource}_${action.action}`]
            if (
              permission[permission.length - 2] === 'allow' &&
              permission[permission.length - 1] === 'allow' &&
              !action.disabled
            ) {
              const checked = [...this.resource.checked]
              if (!checked.includes(action.action)) {
                checked.push(action.action)
                this.handleCheckedActionsChange(checked)
              } else {
                this.handleCheckedActionsChange([action.action])
              }
            }
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleCheckAllChange (e) {
      const val = e.target.checked
      const unDisabledActions = this.resource.actions.filter(item => !item.disabled)
      const checked = val ? unDisabledActions.map(action => action.action) : []
      // let checked = []
      // if (val) {
      //   if (this.resource.isIndeterminate) {
      //     checked = []
      //   } else {
      //     checked = unDisabledActions.map(action => action.action)
      //   }
      // } else {
      //   if (!this.resource.isIndeterminate) {
      //     checked = []
      //   } else {
      //     checked = unDisabledActions.map(action => action.action)
      //   }
      // }
      const isIndeterminate = checked.length > 0 && checked.length < this.resource.actions.length
      const checkAll = checked.length === this.resource.actions.length
      this.$set(this.resource, 'checked', checked)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$emit('resourceCheckChange')
    },
    handleCheckedActionsChange (val) {
      const checkedCount = val.length
      const checkAll = checkedCount === this.resource.actions.length
      const isIndeterminate = checkedCount > 0 && checkedCount < this.resource.actions.length
      this.$set(this.resource, 'checked', val)
      this.$set(this.resource, 'checkAll', checkAll)
      this.$set(this.resource, 'isIndeterminate', isIndeterminate)
      this.$emit('resourceCheckChange')
    },
  },
}
</script>

<style lang="less" scoped>
.res-title {
  width: 160px;
}
</style>
