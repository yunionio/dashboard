<template>
  <div>
    <a-checkbox
      :checked="checkAll"
      @change="handleCheckAllChange"
      :indeterminate="isIndeterminate"
      :disabled="checkAllDisabled">{{$t('system.text_321', [$t('dictionary.policy')])}}</a-checkbox>
    <div class="mt-1">
      <template v-for="(item, idx) of options">
        <group
          v-if="showGroup(item)"
          :key="idx"
          :group="item"
          @groupCheckChange="groupCheckChange"
          :permissions="permissions"
          :scope="scope"
          :policy="policy" />
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { SCOPES_MAP } from '@/constants'
import Group from './Group'

export default {
  name: 'PolicyRuleCheckbox',
  components: {
    Group,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    permissions: Object,
    scope: String,
    checkAllDisabled: Boolean,
    policy: Object,
  },
  data () {
    return {
      checkAll: false,
      isIndeterminate: false,
      options: this.data,
    }
  },
  watch: {
    data: {
      handler (val) {
        this.options = val
      },
      immediate: true,
    },
  },
  methods: {
    handleCheckAllChange (e) {
      const val = e.target.checked
      let totalCheckAll = true
      let totalIndeterminate = false
      R.forEach(opt => {
        let optCheckAll = true
        let optIndeterminate = false
        R.forEach(res => {
          const unDisabledActions = res.actions.filter(item => !item.disabled)
          const checked = val ? unDisabledActions.map(action => action.action) : []
          // let checked = []
          // if (val) {
          //   if (res.isIndeterminate) {
          //     checked = []
          //   } else {
          //     checked = unDisabledActions.map(action => action.action)
          //   }
          // } else {
          //   if (!res.isIndeterminate) {
          //     checked = []
          //   } else {
          //     checked = unDisabledActions.map(action => action.action)
          //   }
          // }
          const isIndeterminate = checked.length > 0 && checked.length < res.actions.length
          const checkAll = checked.length === res.actions.length
          let show = true
          if (this.scope === SCOPES_MAP.project.key) {
            if (res.isDomainRes || res.isSystemRes) show = false
          } else if (this.scope === SCOPES_MAP.domain.key) {
            if (res.isSystemRes) show = false
          }
          if (show) {
            if (isIndeterminate) {
              optIndeterminate = true
            }
            if (!checkAll) {
              optCheckAll = false
            }
          }
          this.$set(res, 'checkAll', checkAll)
          this.$set(res, 'isIndeterminate', isIndeterminate)
          this.$set(res, 'checked', checked)
        }, opt.resources)
        if (optIndeterminate) {
          totalIndeterminate = true
        }
        if (!optCheckAll) {
          totalCheckAll = false
        }
        this.$set(opt, 'checkAll', optCheckAll)
        this.$set(opt, 'isIndeterminate', optIndeterminate)
      }, this.options)
      this.checkAll = totalCheckAll
      this.isIndeterminate = totalIndeterminate
    },
    groupCheckChange () {
      let checkAll = true
      let allGroupTotal = 0
      let indeterminateGroupTotal = 0
      let checkAllGroupTotal = 0
      for (let i = 0, len = this.options.length; i < len; i++) {
        const group = this.options[i]
        if (this.showGroup(group)) {
          allGroupTotal++
          if (!group.checkAll) {
            checkAll = false
          } else {
            checkAllGroupTotal++
          }
          if (group.isIndeterminate) {
            indeterminateGroupTotal++
          }
        }
      }
      this.isIndeterminate = (indeterminateGroupTotal > 0 && indeterminateGroupTotal < allGroupTotal) || (checkAllGroupTotal > 0 && checkAllGroupTotal < allGroupTotal)
      this.checkAll = checkAll
    },
    showGroup (group) {
      const isShow = group.resources.some(resource => {
        // let flag = false
        // if (this.scope !== SCOPES_MAP.system.key && resource.isSystemRes) {
        //   flag = true
        // }
        // if (this.scope !== SCOPES_MAP.domain.key && resource.isDomainRes) {
        //   flag = true
        // }
        // if (flag) return false
        // return true
        let show = true
        if (this.scope === SCOPES_MAP.project.key) {
          if (resource.isDomainRes || resource.isSystemRes) show = false
        } else if (this.scope === SCOPES_MAP.domain.key) {
          if (resource.isSystemRes) show = false
        }
        return show
      })
      return isShow
    },
  },
}
</script>
