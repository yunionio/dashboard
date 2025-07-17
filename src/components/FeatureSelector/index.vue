<template>
  <license-features ref="licenseFeatures" v-model="items" :pre-item-check="PreItemCheck" :pre-item-filter="PreItemFilter">
    <template #default="{moduleGroups, itemEvents, groupEvents}">
      <div>
        <div v-for="mod in moduleGroups" :key="mod.key">
          <div class="module">
            <span class="title">{{ mod.label }}</span>
            <templage v-for="g in mod.groups" :key="g.key">
              <div :key="g.key" v-if="!g.licenseDisabled" class="group">
                <div class="title">{{ g.label }}</div>
                <div class=" d-flex flex-wrap">
                  <div v-if="g.items && g.items.length > 1"
                      v-on="groupEvents(g)"
                      :class="{ checked: g.checked }"
                      class="item d-flex p-2 mr-3 align-items-center">
                    <span class="flex-fill">{{ $t('scope.text_114') }}</span>
                  </div>
                  <a-tooltip v-for="item in g.items" :key="item.key" :title="item.disabled || item.licenseDisabled ? item.reason : ''">
                    <div v-if="!item.licenseDisabled" class="item d-flex p-2 mr-3 align-items-center" v-on="item.disabled ? undefined: itemEvents(item)"
                        :class="{ checked: item.checked, disabled: item.disabled }">
                      <img :src="item.icon" :style="item.logoStyle ? item.logoStyle : 'width: 24px'" />
                      <span class="flex-fill" v-if="!item.hiddenName">{{ item.label }}</span>
                    </div>
                  </a-tooltip>
                </div>
              </div>
            </templage>
          </div>
        </div>
      </div>
    </template>
  </license-features>
</template>

<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import c from '@/constants/feature'
import setting from '@/config/setting'
import { fillBillSupportFeatures } from '@/utils/auth'
import { isSAAS } from '@/utils/utils'

export const LicenseFeatures = {
  model: {
    prop: 'items',
    event: 'update',
  },
  props: {
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
    /* (item) => { return { disabled: true, reason: 'xxx' } } */
    PreItemCheck: {
      type: Function,
      required: false,
    },
    /* (item) => { return true/false } */
    PreItemFilter: {
      type: Function,
      required: false,
    },
  },
  data () {
    return {
      selectedItems: this._selectedItems(this.items),
    }
  },
  computed: {
    ...mapState({
      licenseCompute: state => state.app.license.compute,
    }),
    supportedFeatures () {
      const ret = this.licenseCompute?.features || []
      let list = [...ret]
      list = fillBillSupportFeatures(list, true)
      // 无费用模块 不处理
      return list
    },
    options () {
      return c.items.map(item => {
        if (item.key === 'cloudpods') {
          const { companyInfo = {} } = this.$store.state.app
          const { inner_logo, inner_logo_format, inner_copyright, inner_copyright_en } = companyInfo
          if (inner_logo && inner_logo_format) {
            item.icon = `data:${inner_logo_format};base64,${inner_logo}`
          }
          if (setting.language === 'en' && inner_copyright_en) {
            item.label = inner_copyright_en
          } else if (setting.language === 'zh-CN' && inner_copyright) {
            item.label = inner_copyright
          }
        }
        if (!isSAAS()) {
          item.disabled = !this.supportedFeatures.includes(item.key)
          item.licenseDisabled = !this.supportedFeatures.includes(item.key)
        }
        return item
      })
    },
    moduleGroups () {
      const options = this.options.filter(option => {
        return this.selectedItems.indexOf(option.value) >= 0
      })
      const mg = Array.from(c.moduleGroups)
      mg.map(m => {
        m.groups.map(g => {
          g.checked = this._groupChecked(g.items)
          g.selected = []
          g.items.map(item => {
            item.checked = this._itemChecked(item)
            if (item.checked) g.selected.push(item.value)
            Object.assign(item, this._itemDisabled(options, item))
          })
          g.licenseDisabled = this._groupLicenseDisabled(g.items)
        })
      })
      this.$emit('update', [...this.selectedItems])
      return mg
    },
  },
  methods: {
    changeSelectedItems (items) {
      this.selectedItems = this._selectedItems([...items])
    },
    _groupLicenseDisabled (currentItems) {
      return currentItems.every(item => item.licenseDisabled)
    },
    _selectedItems (currentItems) {
      let items = c.items.filter(option => {
        return currentItems.indexOf(option.value) >= 0
      })

      // items select pre hook. 过滤掉不支持的选项
      if (R.is(Function, this.PreItemFilter)) {
        items = items.filter(this.PreItemFilter)
      }

      // 过滤出可选的选项
      const options = items.filter(item => {
        return !this._itemDisabled(items, item).disabled
      })
      return options.map(item => {
        return item.value
      })
    },
    _updateSelectedItems (currentItems) {
      this.selectedItems = this._selectedItems(currentItems)
    },
    _itemDisabled (currentOptions, item) {
      // pre item check hook
      if (R.is(Function, this.PreItemCheck)) {
        const ret = this.PreItemCheck(item)
        if (R.propEq('disabled', true)(ret)) return ret
      }

      if (R.has('validators', item) && R.is(Array, item.validators)) {
        const vrs = item.validators.map(v => {
          return v(currentOptions)
        })
        const ret = R.find(R.propEq('disabled', true), vrs)
        return ret || { disabled: false, reason: '' }
      }
      return { disabled: item.disabled || false, reason: item.reason || '' }
    },
    _itemChecked (item) {
      return this.selectedItems.indexOf(item.value) >= 0
    },
    _groupChecked (groupItems) {
      return R.all(this._itemChecked, groupItems)
    },
    addItem (item) {
      this._updateSelectedItems([...this.selectedItems, item])
    },
    removeItem (item) {
      this._updateSelectedItems(this.selectedItems.filter(v => v !== item))
    },
    onClickItem (item) {
      if (this.items.indexOf(item.value) < 0) {
        this.addItem(item.value)
      } else {
        this.removeItem(item.value)
      }
    },
    addItems (items) {
      this._updateSelectedItems([...this.selectedItems, ...items])
    },
    removeItems (items) {
      this._updateSelectedItems(this.selectedItems.filter(v => items.indexOf(v) < 0))
    },
    onClickGroup (group) {
      const items = group.items.map(item => { return item.value })
      group.checked ? this.removeItems(items) : this.addItems(items)
    },
  },
  render () {
    return this.$scopedSlots.default({
      moduleGroups: this.moduleGroups,
      itemEvents: (item) => {
        return {
          click: () => {
            this.onClickItem(item)
          },
        }
      },
      groupEvents: (group) => {
        return {
          click: () => {
            this.onClickGroup(group)
          },
        }
      },
    })
  },
}

export default {
  name: 'FeatureSelector',
  components: { LicenseFeatures },
  props: {
    defaultItems: {
      type: Array,
      default: () => {
        return []
      },
    },
    /* (item) => { return { disabled: true, reason: 'xxx' } } */
    PreItemCheck: {
      type: Function,
      required: false,
    },
    /* (item) => { return true/false } */
    PreItemFilter: {
      type: Function,
      required: false,
    },
  },
  data () {
    return {
      items: [...this.defaultItems],
    }
  },
  watch: {
    items () {
      this.$emit('change', [...this.items])
    },
  },
  methods: {
    changeItems (val) {
      this.items = val
      this.$refs.licenseFeatures.changeSelectedItems(val)
    },
  },
}
</script>

<style scoped lang="less">
@import '~@/styles/less/theme';

.module {
  border-color: #e8e8e8;
  margin-bottom: 10px;
  margin-top: 10px;
  border-style: double;
  border-width: 1px;
  padding: 10px;

  .title {
    font-size: large;
    font-weight: 900;
  }

  .group {
    margin-left: 10px;

    .title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
      margin-top: 10px;
    }

    .item {
      min-width: 120px;
      max-width: 150px;
      cursor: pointer;
      display: block;
      font-size: 14px;
      margin-bottom: 10px;
      border: 1px solid #eee;
      text-align: center;
      border-radius: 3px;
      box-sizing: border-box;

      &.checked {
        border-color: @primary-color;

        span {
          color: @primary-color;
        }
      }

      &.disabled {
        color: rgba(0, 0, 0, .25);
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        text-shadow: none;
        box-shadow: none;
        cursor: not-allowed;

        &:hover {
          border-color: #d9d9d9;
        }
      }
    }
  }
}
</style>
