<template>
  <div class="mb-2 group-wrap" :class="{ active: showContent }">
    <div class="d-flex">
      <div class="d-flex group-title" @click.stop.prevent="toggleContent">
        <div>{{ group.label }}</div>
        <div class="arrow-icon">
          <a-icon type="down" class="ml-2" />
        </div>
      </div>
      <div>
        <div>
          <a-checkbox
            :checked="group.checkAll"
            @change="handleCheckAllChange"
            :indeterminate="group.isIndeterminate"
            :disabled="group.disabled">{{$t('system.text_320')}}</a-checkbox>
        </div>
      </div>
    </div>
    <a-card v-show="showContent">
      <template v-for="(item, idx) of group.resources">
        <item
          v-if="showResource(item)"
          :key="idx"
          :resource="item"
          @resourceCheckChange="resourceCheckChange"
          :permissions="permissions"
          :scope="scope"
          :itemPolicy="getItemPolicy(item)" />
      </template>
    </a-card>
  </div>
</template>

<script>
// import * as R from 'ramda'
import yaml from 'js-yaml'
import { SCOPES_MAP } from '@/constants'
import Item from './Item'

export default {
  name: 'PolicyRuleCheckboxGroup',
  components: {
    Item,
  },
  props: {
    group: Object,
    permissions: Object,
    scope: String,
    policy: Object,
  },
  data () {
    return {
      showContent: false,
    }
  },
  watch: {
    scope: {
      handler () {
        this.resourceCheckChange()
      },
      immediate: true,
    },
  },
  methods: {
    toggleContent () {
      this.showContent = !this.showContent
    },
    handleCheckAllChange (e) {
      const val = e.target.checked
      let groupCheckAll = true
      let groupIndeterminate = false
      const resources = this.group.resources.map(resource => {
        const unDisabledActions = resource.actions.filter(item => !item.disabled)
        const checked = val ? unDisabledActions.map(action => action.action) : []
        // let checked = []
        // if (val) {
        //   if (resource.isIndeterminate) {
        //     checked = []
        //   } else {
        //     checked = unDisabledActions.map(action => action.action)
        //   }
        // } else {
        //   if (!resource.isIndeterminate) {
        //     checked = []
        //   } else {
        //     checked = unDisabledActions.map(action => action.action)
        //   }
        // }
        const isIndeterminate = checked.length > 0 && checked.length < resource.actions.length
        const checkAll = checked.length === resource.actions.length
        let show = true
        if (this.scope === SCOPES_MAP.project.key) {
          if (resource.isDomainRes || resource.isSystemRes) show = false
        } else if (this.scope === SCOPES_MAP.domain.key) {
          if (resource.isSystemRes) show = false
        }
        if (show) {
          if (isIndeterminate) {
            groupIndeterminate = true
          }
          if (!checkAll) {
            groupCheckAll = false
          }
        }
        return {
          ...resource,
          isIndeterminate,
          checkAll,
          checked,
        }
      })
      this.$set(this.group, 'checkAll', groupCheckAll)
      this.$set(this.group, 'resources', resources)
      this.$set(this.group, 'isIndeterminate', groupIndeterminate)
      this.$emit('groupCheckChange')
    },
    resourceCheckChange () {
      let checkAll = true
      let checkedActionsTotal = 0
      let allActionsTotal = 0
      for (let i = 0, len = this.group.resources.length; i < len; i++) {
        const item = this.group.resources[i]
        let isContinue = true
        if (this.scope === SCOPES_MAP.project.key) {
          if (item.isDomainRes || item.isSystemRes) isContinue = false
        } else if (this.scope === SCOPES_MAP.domain.key) {
          if (item.isSystemRes) isContinue = false
        }
        if (!isContinue) continue
        const checkedCount = item.checked.length
        checkedActionsTotal += checkedCount
        allActionsTotal += item.actions.length
        if (checkedCount !== item.actions.length) {
          checkAll = false
        }
      }
      const isIndeterminate = checkedActionsTotal > 0 && checkedActionsTotal < allActionsTotal
      this.$set(this.group, 'checkAll', checkAll)
      this.$set(this.group, 'isIndeterminate', isIndeterminate)
      this.$emit('groupCheckChange')
    },
    showResource (resource) {
      let show = true
      if (this.scope === SCOPES_MAP.project.key) {
        if (resource.isDomainRes || resource.isSystemRes) show = false
      } else if (this.scope === SCOPES_MAP.domain.key) {
        if (resource.isSystemRes) show = false
      }
      return show
    },
    getItemPolicy (item) {
      if (item.resource === '*' && this.policy) {
        const { policy = {} } = yaml.safeLoad(this.policy)
        if (policy[item.service]) {
          return policy[item.service]['*'] || {}
        }
      }
      return {}
    },
  },
}
</script>

<style lang="less" scoped>
.group-title {
  width: 100px;
  cursor: pointer;
}
.active {
  .arrow-icon {
    > i {
      transform: rotate(180deg);
    }
  }
}
.group-wrap {
  .arrow-icon {
    > i {
      transition: transform .3s ease;
    }
  }
}
</style>
