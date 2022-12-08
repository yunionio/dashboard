<template>
  <div>
    <div class="d-flex align-items-center">
      <a-checkbox
      :checked="checkAll"
      @change="handleCheckAllChange"
      :indeterminate="isIndeterminate"
      :disabled="checkAllDisabled">{{$t('system.text_321', [$t('dictionary.policy')])}}</a-checkbox>
      <a-input class="ml-2" v-model="searchString" :placeholder="$t('iam.policy_search_placeholder')" style="max-width:200px" allow-clear />
    </div>
    <a-divider orientation="left">
      资源权限
    </a-divider>
    <a-tabs v-model="currentPolicyResTab" tab-position="left">
      <a-tab-pane v-for="item of policyResList" :key="item.key" :tab="item.label">
        <h6 class="policy-tab-title">
          {{ item.label }}
          <a-checkbox
            class="ml-4"
            :indeterminate="policyModuleCheckMap[item.key].indeterminate"
            :checked="policyModuleCheckMap[item.key].checkAll"
            @change="e => onCheckAllModuleChange(e, item.key)">
            {{ $t('common.checkAll') }}
          </a-checkbox>
        </h6>
        <div v-for="item2 of item.childrens" :key="item2.key">
          <div class="policy-group-title">{{ item2.label }}</div>
          <div v-for="item3 of item2.childrens" :key="item3.key">
            <div class="policy-menu-title">
              <span class="label">{{ item3.label }}</span>
              <a-checkbox
                class="ml-4"
                :indeterminate="policyResCheckedList[item3.key].indeterminate"
                :checked="policyResCheckedList[item3.key].checkAll"
                @change="e => onCheckAllMenuOptionsChange(e, item3.key)">
                {{ $t('common.checkAll') }}
              </a-checkbox>
            </div>
            <a-checkbox-group v-model="policyResCheckedList[item3.key].options">
              <ul class="policy-opts">
                <li v-for="item4 in item3.options" :key="item4.key">
                    <a-checkbox :value="item4.key" @change="e => onCheckMenuOptionChange(e, item3.key)">{{ item4.label }}</a-checkbox>
                </li>
              </ul>
            </a-checkbox-group>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <a-divider orientation="left">
      其他权限
    </a-divider>
    <div class="mt-1">
      <template v-for="(item, idx) of options">
        <group
          v-if="showGroup(item)"
          v-show="hasSearchString(item)"
          :key="idx"
          :group="item"
          @groupCheckChange="groupCheckChange"
          :permissions="permissions"
          :scope="scope"
          :policy="policy"
          :searchString="searchString" />
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { SCOPES_MAP } from '@/constants'
import Group from './Group'
import { getPolicyResList, getPolicyResCheckedList } from '@/utils/policy/policy-res-list'
import { POLICY_WHITE_LIST } from '@/constants/policy'

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
      searchString: '',
      currentPolicyResTab: '',
      policyResList: [],
      policyResCheckedList: getPolicyResCheckedList(this.policy),
    }
  },
  computed: {
    policyOptionsMap () {
      const plainOptionsMap = {}

      this.policyResList.forEach(item => {
        item.childrens.forEach(item => {
          item.childrens.forEach(item => {
            plainOptionsMap[item.key] = item.options
          })
        })
      })
      return plainOptionsMap
    },
    policyModuleCheckMap () {
      const policyModuleCheckMap = {}

      this.policyResList.forEach(item => {
        const menus = []
        item.childrens.forEach(item2 => {
          menus.push(...item2.childrens)
        })
        policyModuleCheckMap[item.key] = {}
        const noCheckData = menus.every(obj => {
          const exist = POLICY_WHITE_LIST.some(item => this.policyResCheckedList[obj.key].options.includes(item))
          return this.policyResCheckedList[obj.key].options.length === (exist ? POLICY_WHITE_LIST.length : 0)
        })
        policyModuleCheckMap[item.key].checkAll = !noCheckData && menus.every(obj => {
          return this.policyResCheckedList[obj.key].checkAll
        })
        policyModuleCheckMap[item.key].indeterminate = !noCheckData && menus.some(obj => {
          return !this.policyResCheckedList[obj.key].checkAll
        })
      })

      return policyModuleCheckMap
    },
    policyModuleResMap () {
      const policyModuleResMap = {}

      this.policyResList.forEach(item => {
        const policyResList = []
        item.childrens.forEach(item2 => {
          item2.childrens.forEach(item3 => {
            policyResList.push(item3.key)
          })
        })
        policyModuleResMap[item.key] = policyResList
      })

      return policyModuleResMap
    },
  },
  watch: {
    data: {
      handler (val) {
        this.options = val
      },
      immediate: true,
    },
  },
  created () {
    this.policyResList = getPolicyResList()
    this.currentPolicyResTab = this.policyResList[0].key
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
    hasSearchString (group) {
      if (!this.searchString) {
        return true
      }
      if (group.label && group.label.includes(this.searchString)) {
        return true
      }
      if (group.resources && group.resources.filter(item => item.label.includes(this.searchString)).length) {
        return true
      }
      return false
    },
    onCheckAllMenuOptionsChange (e, menuKey) {
      // 查找当前菜单选项的操作集合
      const plainOptions = this.policyOptionsMap[menuKey].map(item => item.key)

      Object.assign(this.policyResCheckedList[menuKey], {
        options: e.target.checked ? Array.from(new Set(plainOptions)) : [],
        indeterminate: false,
        checkAll: e.target.checked,
      })

      this.$nextTick(() => {
        this.$emit('checkMenuOptionsChange', this.policyResCheckedList)
      })
    },
    onCheckMenuOptionChange (e, menuKey) {
      // 查找当前菜单选项的操作集合
      let plainOptions = this.policyOptionsMap[menuKey].map(item => item.key)
      plainOptions = Array.from(new Set(plainOptions))

      this.$nextTick(() => {
        const len = this.policyResCheckedList[menuKey].options.length
        this.policyResCheckedList[menuKey].indeterminate = !!len && this.policyResCheckedList[menuKey].options.length < plainOptions.length
        this.policyResCheckedList[menuKey].checkAll = this.policyResCheckedList[menuKey].options.length === plainOptions.length
        this.$emit('checkMenuOptionsChange', this.policyResCheckedList)
      })
    },
    onCheckAllModuleChange (e, moduleKey) {
      const menuKeys = this.policyModuleResMap[moduleKey]

      menuKeys.forEach(menuKey => {
        this.onCheckAllMenuOptionsChange(e, menuKey)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.policy-tab-title {
  height: 40px;
  line-height: 40px;
  border: 1px solid #eee;
  padding-left: 14px;
}
.policy-group-title {
  font-size: 14px;
  font-weight: bold;
  padding: 10px 0 10px 0;
  border-bottom: 1px solid #eee;
}
.policy-menu-title {
  padding: 10px 0 10px 0;
  .label {
    border-left: 3px solid #999;
    padding-left: 6px;
  }
}
.policy-opts {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  li {
    width: 220px;
    padding: 10px 20px;
  }
}
</style>
