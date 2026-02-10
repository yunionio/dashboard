<template>
  <a-popover
    destroyTooltipOnHide
    placement="bottomLeft"
    trigger="click"
    v-model="visible"
    overlayClassName="tag-overlay"
    @visibleChange="handleVisibleChange">
    <template v-if="$scopedSlots.trigger">
      <slot name="trigger" :loading="loading" />
    </template>
    <template v-else>
      <a-button class="ml-2" :loading="loading" @click="handleClick">{{ buttonText }}</a-button>
    </template>
    <template slot="content">
      <div class="tag-wrap" ref="tag-wrap">
        <ul class="tag-list tag-filter-fixed">
          <!-- 过滤标签键 -->
          <li class="tag-tip d-flex align-items-center">
            <div style="font-size: 12px;margin-right: 10px;">{{$t('common_112')}}:</div>
            <div class="val-search" style="flex: 1 1 auto;">
              <input class="w-100" :placeholder="$t('common_264')" :style="{fontSize: '12px'}" :value="tagSearch" @input="handleSearchTag" @compositionstart="composingTag = true" @compositionend="composingTag = false" />
            </div>
            <a-button
              v-if="showSelectAll"
              style="padding-right: 0"
              type="link"
              @click="handleToggleSelectAll">{{ selectAllButtonText }}</a-button>
          </li>
        </ul>
        <ul class="tag-list" v-if="filterWithoutUserMeta && !isUpdate">
          <li
            class="tag-item"
            :class="{ checked: checkedKeys.includes(withoutUserMetaKey) && value[withoutUserMetaKey][0] === true, no_drop: !allowNoValue && !allowSelectAllValue }"
            @mouseenter="handleKeyMouseenter(null)"
            @click="handleKeyClick(withoutUserMetaKey, true)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{$t('common_260')}}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul class="tag-list" v-if="filterWithUserMeta && !isUpdate">
          <li
            class="tag-item"
            :class="{ checked: checkedKeys.includes(withUserMetaKey) && value[withUserMetaKey][0] === true, no_drop: !allowNoValue }"
            @mouseenter="handleKeyMouseenter(null)"
            @click="handleKeyClick(withUserMetaKey, true)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{$t('common.with_user_meta')}}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul class="tag-list">
          <!-- <li class="tag-tip d-flex align-items-center">
            <div style="font-size: 12px; width: 70px;">{{$t('common_261')}}</div>
            <div class="val-search" style="width: 130px;"><input class="w-100" :placeholder="$t('common_264')" @input="handleSearchTag" @compositionstart="composingTag = true" @compositionend="composingTag = false" /></div>
          </li> -->
          <template v-if="showUserTags">
            <li
              class="tag-item"
              v-for="item of filtedUserTags"
              :key="item.key"
              :class="{checked: checkedKeys.includes(item.key), disabled: getTagDisabled(item.key), no_drop: !allowNoValue && !allowSelectAllValue}"
              @mouseenter="handleKeyMouseenter('userTags', item.key, $event)"
              @click="handleKeyClick(item.key)">
              <div class="title d-flex align-items-center">
                <div class="flex-fill mr-4 text-truncate">{{ getTagTitle(item.key) }}</div>
                <a-icon class="check-icon" type="check" />
              </div>
            </li>
          </template>
        </ul>
        <ul class="tag-list" v-if="showExtTags && extTags.length > 0 && !isUpdate">
          <li class="tag-tip">{{$t('common_262')}}</li>
          <li
            class="tag-item"
            v-for="item of filtedExtTags"
            :key="item.key"
            :class="{checked: checkedKeys.includes(item.key), disabled: getTagDisabled(item.key), no_drop: !allowNoValue && !allowSelectAllValue}"
            @mouseenter="handleKeyMouseenter('extTags', item.key, $event)"
            @click="handleKeyClick(item.key)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{ getTagTitle(item.key) }}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul :style="valueWrapStyle" v-if="search || showValue" class="tag-list values-wrap" ref="value-wrap">
          <!-- 过滤标签值 -->
          <li class="d-flex align-items-center tag-tip tag-value-filter-fixed">
            <div style="font-size: 12px;margin-right: 10px;">{{$t('common_263')}}</div>
            <div class="val-search" style="flex: 1 1 auto;">
              <input class="w-100" style="font-size: 12px;" :value="search" :placeholder="$t('common_264')" @input="handleSearch" @compositionstart="composing = true" @compositionend="composing = false" />
            </div>
          </li>
          <template v-if="currentValue.length <= 0">
            <li>{{$t('common_265')}}</li>
          </template>
          <template v-else v-for="item of currentValue">
            <li
              v-if="item"
              class="tag-item"
              :key="item"
              :class="{ checked: value[mouseenterKey] && value[mouseenterKey].length > 0 && value[mouseenterKey].includes(item)}"
              @click="handleKeyClick(mouseenterKey, item)">
              <div class="title d-flex align-items-center">
                <div class="flex-fill mr-4">{{ getTagValue(item) }}</div>
                <a-icon class="check-icon" type="check" />
              </div>
            </li>
          </template>
        </ul>
        <template v-if="showLoadMore || showNoMore">
          <div class="text-center mt-3 mb-2">
            <a-button v-if="showLoadMore" :loading="loading" type="link" @click="loadMore">{{ loading ? $t('common.loding') : $t('common.LoadMore') }}</a-button>
            <span v-else>{{ $t('common.load_no_more') }}</span>
          </div>
        </template>
      </div>
    </template>
  </a-popover>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
import Clickoutside from '@/directives/clickoutside'
import { getTagTitle, getTagValue } from '@/utils/common/tag'
import i18n from '@/locales'

const filterHandler = function (val = '', search) {
  if (val.includes(':')) {
    val = val.split(':')[1]
  }
  if (search.indexOf('!') === 0) {
    // 不包含n
    return !val.includes(search.substring(1))
  } else if (search.includes('*')) {
    if (search.indexOf('*') === search.length - 1) {
      // 以n开头
      return val.startsWith(search.substring(0, search.length - 1))
    } else if (search.indexOf('*') === 0) {
      if (search.lastIndexOf('*') === search.length - 1) {
        // 包含n
        return val.includes(search.substring(1, search.length - 1))
      }
      // 以n结尾
      return val.endsWith(search.substring(1))
    } else {
      const idx = search.indexOf('*')
      // 以n开头，以m结尾
      return val.startsWith(search.substring(0, idx)) && val.endsWith(search.substring(idx + 1))
    }
  } else {
    // 包含n
    return val.includes(search)
  }
}

export default {
  name: 'PreDefinedTagSelect',
  directives: {
    Clickoutside,
  },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    buttonText: {
      type: String,
      default: i18n.t('dictionary.pre_defined_tag'),
    },
    params: Object,
    ignoreKeys: {
      type: Array,
      default: () => ([]),
    },
    filterWithoutUserMeta: Boolean,
    filterWithUserMeta: Boolean,
    multiple: Boolean,
    resources: String,
    managerInstance: Object,
    // global代表获取全部标签，不进行resources过滤
    global: Boolean,
    defaultChecked: {
      type: Object,
    },
    showExtTags: Boolean,
    // 是否在每一个里增加未归类
    showNoValue: Boolean,
    // 是否允许只选key不选value
    allowNoValue: {
      type: Boolean,
      default: true,
    },
    // 是否展示全选按钮
    showSelectAll: Boolean,
    // 是否允许选择key时,选择所有value
    allowSelectAllValue: Boolean,
    // 更新模式,只允许固定key,和value
    isUpdate: Boolean,
    withoutTagKey: {
      type: String,
      default: 'without_user_meta',
    },
    withTagKey: {
      type: String,
      default: 'with_user_meta',
    },
    ignoreWithUserMetaParam: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      visible: false,
      loading: false,
      userTags: [],
      filtedUserTags: [],
      filtedExtTags: [],
      extTags: [],
      originalUserTags: [],
      originalExtTags: [],
      valueWrapTop: 0,
      valueWrapBottom: 0,
      valueWrapPlacement: 'top',
      mouseenterKey: null,
      mouseenterType: null,
      search: '',
      withoutUserMetaKey: this.withoutTagKey,
      withUserMetaKey: this.withTagKey,
      composing: false, // 中文输入法时的正在输入
      composingTag: false,
      tagSearch: '', // 标签键搜索值
      // 所有tag源数据
      tagData: [],
      originalTagData: [],
      originalPagerTotal: 0,
      pager: {
        total: 0,
        limit: this.params?.limit || 100,
      },
      valueWrapLeft: '-240px',
    }
  },
  computed: {
    ...mapGetters(['scope']),
    checkedKeys () {
      return Object.keys(this.value)
    },
    selectAllButtonText () {
      // 无选中：全选；有选中：取消全选
      if (this.checkedKeys.length > 0) {
        return this.$t('report.deselect_all') || '取消全选'
      }
      return this.$t('system.text_320')
    },
    getParams () {
      let ret = {
        limit: this.pager.limit,
        scope: this.scope,
      }
      if (this.params) {
        ret = Object.assign({}, ret, this.params)
      }
      return ret
    },
    currentTag () {
      let tags = []
      if (this.mouseenterType === 'userTags') {
        tags = this.userTags
      }
      if (this.mouseenterType === 'extTags') {
        tags = this.extTags
      }
      return tags
    },
    showUserTags () {
      return this.userTags.length > 0
    },
    currentValue () {
      if (!this.mouseenterType || !this.mouseenterKey) return []
      let ret = []
      const obj = R.find(R.propEq('key', this.mouseenterKey))(this.currentTag)
      if (this.defaultChecked && this.defaultChecked[this.mouseenterKey]) return ret
      if (!this.search) {
        ret = obj?.value || []
      } else {
        // ret = obj.value.filter(val => val.includes(this.search))
        ret = (obj?.value || []).filter(val => filterHandler(val, this.search))
      }
      return ret
    },
    showValue () {
      return this.currentValue && this.currentValue.some(val => val !== null)
    },
    valueWrapStyle () {
      const styles = {
        left: this.valueWrapLeft,
      }
      if (this.valueWrapPlacement === 'top') {
        styles.top = `${this.valueWrapTop}px`
        return styles
      }
      styles.bottom = `${this.valueWrapBottom}px`
      return styles
    },
    showLoadMore () {
      return this.pager.total > this.tagData.length
    },
    showNoMore () {
      return this.pager.total === this.tagData.length && this.pager.total > this.pager.limit
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('tags')
    this.debounceHandleSearchInput = debounce(this.handleSearchInput, 500)
    this.debounceHandleSearchTagInput = debounce(this.handleSearchTagInput, 500)
    this.searchTagRequestId = 0
  },
  methods: {
    getSelectableKeys () {
      const keys = []
      if (this.filterWithoutUserMeta) keys.push(this.withoutUserMetaKey)
      if (this.filterWithUserMeta) keys.push(this.withUserMetaKey)
      if (this.showUserTags && this.filtedUserTags && this.filtedUserTags.length) {
        keys.push(...this.filtedUserTags.map(i => i.key))
      }
      if (this.showExtTags && this.extTags && this.extTags.length && this.filtedExtTags && this.filtedExtTags.length) {
        keys.push(...this.filtedExtTags.map(i => i.key))
      }
      return R.uniq(keys)
    },
    handleToggleSelectAll () {
      // 有选中：取消全选（保留 defaultChecked 对应的不可取消项）
      if (this.checkedKeys.length > 0) {
        const keep = {}
        this.checkedKeys.forEach(k => {
          if (this.getTagDisabled(k)) keep[k] = this.value[k]
        })
        this.$emit('input', keep)
        this.$emit('change', keep)
        return
      }
      // 无选中：全选（按当前筛选/展示的标签键进行全选）
      const selectableKeys = this.getSelectableKeys()
      const next = { ...this.value }
      selectableKeys.forEach(key => {
        // 特殊键：无标签/有标签资源
        if (key === this.withoutUserMetaKey || key === this.withUserMetaKey) {
          next[key] = [true]
          return
        }
        if (this.allowSelectAllValue) {
          const allValues = this.getValuesForKey(key)
          if (allValues && allValues.length) {
            next[key] = [...allValues]
          } else if (this.allowNoValue) {
            next[key] = []
          }
          return
        }
        if (this.allowNoValue) next[key] = []
      })
      this.$emit('input', next)
      this.$emit('change', next)
    },
    handleClick (e) {
      const x = e.clientX
      if (x > screen.availWidth / 2) {
        this.valueWrapLeft = '-240px'
      } else {
        this.valueWrapLeft = '100%'
      }
    },
    handleVisibleChange (visible) {
      if (visible) {
        // 打开时重新加载数据
        this.tagData = []
        this.tagSearch = ''
        this.fetchTags()
      } else {
        // 关闭时清空过滤
        this.tagSearch = ''
      }
    },
    async fetchTags (isAppend = false) {
      this.loading = true
      try {
        const params = { ...this.getParams }
        // 如果有搜索值，在请求参数中包含 name.contains(...)
        if (this.tagSearch) {
          params.filter = [`name.contains(${this.tagSearch})`]
        }
        const response = await this.manager.list({ params })
        const { data = [], total } = response.data
        this.pager.total = total
        this.tagData = isAppend ? [...this.tagData, ...data] : [...data]
        // 保存原始数据用于搜索恢复
        if (!isAppend && !this.tagSearch) {
          this.originalTagData = [...this.tagData]
          this.originalPagerTotal = total
        }
        this.genTags(data, isAppend)
      } finally {
        this.loading = false
      }
    },
    genTags (data, isAppend) {
      let userRet = []
      let extRet = []
      if (isAppend) {
        userRet = this.userTags
        extRet = this.extTags
      }
      data.forEach(item => {
        userRet.push({
          key: `user:${item.name}`,
          value: item.values,
        })
      })
      const sortByKeyCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('key')))
      this.userTags = sortByKeyCaseInsensitive(userRet)
      this.extTags = sortByKeyCaseInsensitive(extRet)
      // 如果有搜索值，应用过滤
      if (this.tagSearch) {
        this.filtedUserTags = this.userTags.filter((tag) => { return filterHandler(tag.key, this.tagSearch) })
        this.filtedExtTags = this.extTags.filter((tag) => { return filterHandler(tag.key, this.tagSearch) })
      } else {
        this.filtedUserTags = this.userTags
        this.filtedExtTags = this.extTags
      }
      // 保存原始数据用于搜索恢复（只在没有搜索时保存）
      if (!isAppend && !this.tagSearch) {
        this.originalUserTags = [...this.userTags]
        this.originalExtTags = [...this.extTags]
      }
    },
    getTagTitle,
    getTagValue,
    handleSearchInput (val) {
      if (this.composing) return
      this.search = val
    },
    handleSearch (e) {
      const val = e.target.value
      this.$nextTick(() => {
        this.debounceHandleSearchInput(val)
      })
    },
    async handleSearchTagInput (val) {
      if (this.composingTag) return
      // 生成新的请求ID，用于防止竞态条件
      const currentRequestId = ++this.searchTagRequestId
      this.tagSearch = val
      if (val) {
        // 远程搜索
        this.loading = true
        try {
          const response = await this.manager.list({ params: { ...this.getParams, filter: [`name.contains(${val})`] } })
          // 检查请求是否仍然有效（防止竞态条件）
          if (currentRequestId !== this.searchTagRequestId) {
            return // 如果请求ID不匹配，说明有更新的请求，忽略这个结果
          }
          // 再次检查搜索值是否匹配
          if (this.tagSearch !== val) {
            return // 如果搜索值已改变，忽略这个结果
          }
          const { data = [], total } = response.data
          // 更新 pager
          this.pager.total = total
          // 重新生成 tags（不追加，替换）
          this.tagData = data
          this.genTags(data, false)
        } finally {
          // 只有当前请求是最新的时才取消loading
          if (currentRequestId === this.searchTagRequestId) {
            this.loading = false
          }
        }
      } else {
        // 恢复原始数据
        if (this.originalUserTags.length > 0 || this.originalExtTags.length > 0) {
          // 恢复原始 tagData 和 pager
          if (this.originalTagData.length > 0) {
            this.tagData = [...this.originalTagData]
            this.pager.total = this.originalPagerTotal
          }
          // 恢复原始 tags
          this.userTags = [...this.originalUserTags]
          this.filtedUserTags = [...this.originalUserTags]
          this.extTags = [...this.originalExtTags]
          this.filtedExtTags = [...this.originalExtTags]
        } else {
          // 如果没有原始数据，重新获取所有数据
          this.tagData = []
          this.fetchTags()
        }
      }
    },
    handleSearchTag (e) {
      const val = e.target.value
      this.$nextTick(() => {
        this.debounceHandleSearchTagInput(val)
      })
    },
    handleKeyMouseenter (type, key, evt) {
      this.search = ''
      this.mouseenterKey = key
      this.mouseenterType = type
      if (type === null) {
        return
      }
      this.$nextTick(() => {
        const { top: tagWrapTop, bottom: tagWrapBottom } = this.$refs['tag-wrap'].getBoundingClientRect()
        const valueWrapHeight = (this.$refs['value-wrap'] && this.$refs['value-wrap'].getBoundingClientRect().height) || 0
        const documentClientHeight = document.documentElement.clientHeight
        const { top: targetTop, bottom: targetBottom } = evt.target.getBoundingClientRect()
        // 计算剩余的高度是否足够显示值的内容
        if (valueWrapHeight > documentClientHeight - targetTop) {
          this.valueWrapPlacement = 'bottom'
          this.valueWrapBottom = tagWrapBottom - targetBottom
        } else {
          this.valueWrapPlacement = 'top'
          this.valueWrapTop = targetTop - tagWrapTop + 10
        }
      })
    },
    handleKeyClick (key, val) {
      if (this.defaultChecked && this.defaultChecked[key]) return
      const newValue = { ...this.value }
      // allowSelectAllValue 时点击标签键：选中或取消该键下所有 value
      if (this.allowSelectAllValue && val === undefined) {
        const allValues = this.getValuesForKey(key)
        if (!allValues.length) return
        const current = newValue[key]
        const currentArr = R.is(Array, current) ? current : (current ? [current] : [])
        const allSelected = allValues.length === currentArr.length && allValues.every(v => currentArr.includes(v))
        if (allSelected) {
          delete newValue[key]
        } else {
          newValue[key] = [...allValues]
        }
        this.$emit('input', newValue)
        this.$emit('change', newValue)
        return
      }
      if (this.multiple) {
        if (val) {
          if (newValue[key]) {
            const index = R.indexOf(val, newValue[key])
            if (index !== -1) {
              if (key === this.withoutUserMetaKey || key === this.withUserMetaKey) {
                // 当选择无标签资源时
                delete newValue[key]
              } else {
                newValue[key].splice(index, 1)
              }
            } else {
              newValue[key].push(val)
            }
          } else {
            newValue[key] = [val]
          }
        } else {
          if (this.allowNoValue) {
            if (this.checkedKeys.includes(key)) {
              delete newValue[key]
            } else {
              newValue[key] = []
            }
          }
        }
      } else {
        if (val) {
          if (newValue[key] === val || (R.is(Array, newValue[key]) && newValue[key].includes(val))) {
            delete newValue[key]
          } else {
            newValue[key] = [val]
          }
        } else {
          if (this.allowNoValue) {
            if (this.checkedKeys.includes(key)) {
              delete newValue[key]
            } else {
              newValue[key] = [val]
            }
          }
        }
      }
      this.$emit('input', newValue)
      this.$emit('change', newValue)
    },
    getValuesForKey (key) {
      const userObj = R.find(R.propEq('key', key))(this.userTags)
      if (userObj && userObj.value && userObj.value.length) return userObj.value
      const extObj = R.find(R.propEq('key', key))(this.extTags)
      if (extObj && extObj.value && extObj.value.length) return extObj.value
      return []
    },
    getTagDisabled (key) {
      if (this.defaultChecked && this.defaultChecked[key]) return true
      return false
    },
    loadMore () {
      this.fetchTags(true)
    },
  },
}
</script>

<style lang="less">
.tag-overlay .ant-popover-inner-content {
  padding: 0 !important;
}
</style>

<style lang="less" scoped>
.tag-wrap {
  min-width: 200px;
  max-width: 360px;
  max-height: 400px;
  overflow: hidden;
  overflow-y: auto;
  > ul {
    list-style: none;
    margin: 0;
    padding: 0;
    > li {
      padding: 7px 16px 7px 16px;
    }
  }
}
.tag-filter-fixed {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  .tag-tip {
    background-color: #F5F6FA;
  }
}
.tag-tip {
  background-color: #F5F6FA;
}
.tag-item {
  cursor: pointer;
  background-color: #fff;
  white-space: pre-line;
  word-break: break-all;
  border-bottom: 1px solid #eee;
  position: relative;
  .check-icon {
    display: none;
    font-size: 12px;
  }
  &.checked {
    .check-icon {
      display: block;
    }
  }
  &:hover {
    background-color: #F9F9FA;
  }
  &.disabled {
    cursor: not-allowed;
  }
}
.no_drop {
  cursor: default;
}
.values-wrap {
  max-height: 400px;
  overflow: hidden;
  overflow-y: auto;
  background-color: #fff;
  position: absolute;
  // left: -240px;
  top: 0;
  width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  .tag-value-filter-fixed {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #F5F6FA;
  }
}
.val-search {
  input {
    outline: none;
  }
}
</style>
