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
      <a-button :loading="loading">{{ buttonText }}</a-button>
    </template>
    <template slot="content">
      <div class="tag-wrap" ref="tag-wrap">
        <ul class="tag-list" v-if="filterWithoutUserMeta">
          <li
            class="tag-item"
            :class="{ checked: checkedKeys.includes(withoutUserMetaKey) && value[withoutUserMetaKey][0] === true, no_drop: !allowNoValue }"
            @click="handleKeyClick(withoutUserMetaKey, true)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{$t('common_260')}}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul class="tag-list" v-if="filterWithUserMeta">
          <li
            class="tag-item"
            :class="{ checked: checkedKeys.includes(withUserMetaKey) && value[withUserMetaKey][0] === true, no_drop: !allowNoValue }"
            @click="handleKeyClick(withUserMetaKey, true)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{$t('common.with_user_meta')}}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul class="tag-list" v-if="showUserTags">
          <li class="tag-tip d-flex align-items-center">
            <div style="font-size: 12px; width: 70px;">{{$t('common_261')}}</div>
            <div class="val-search" style="width: 130px;"><input class="w-100" :placeholder="$t('common_264')" @input="handleSearchTag" @compositionstart="composingTag = true" @compositionend="composingTag = false" /></div>
          </li>
          <li
            class="tag-item"
            v-for="item of filtedUserTags"
            :key="item.key"
            :class="{checked: checkedKeys.includes(item.key), disabled: getTagDisabled(item.key), no_drop: !allowNoValue}"
            @mouseenter="handleKeyMouseenter('userTags', item.key, $event)"
            @click="handleKeyClick(item.key)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{ getTagTitle(item.key) }}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul class="tag-list" v-if="showExtTags && extTags.length > 0">
          <li class="tag-tip">{{$t('common_262')}}</li>
          <li
            class="tag-item"
            v-for="item of filtedExtTags"
            :key="item.key"
            :class="{checked: checkedKeys.includes(item.key), disabled: getTagDisabled(item.key), no_drop: !allowNoValue}"
            @mouseenter="handleKeyMouseenter('extTags', item.key, $event)"
            @click="handleKeyClick(item.key)">
            <div class="title d-flex align-items-center">
              <div class="flex-fill mr-4 text-truncate">{{ getTagTitle(item.key) }}</div>
              <a-icon class="check-icon" type="check" />
            </div>
          </li>
        </ul>
        <ul :style="valueWrapStyle" v-if="search || showValue" class="tag-list values-wrap" ref="value-wrap">
          <li class="d-flex align-items-center tag-tip">
            <div class="flex-fill" style="font-size: 12px;">{{$t('common_263')}}</div>
            <div class="val-search"><input style="width: 145px;" :value="search" :placeholder="$t('common_264')" @input="handleSearch" @compositionstart="composing = true" @compositionend="composing = false" /></div>
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
  name: 'TagSelect',
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
      default: i18n.t('common_266'),
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
      // 所有tag源数据
      tagData: [],
      pager: {
        total: 0,
        limit: this.params?.limit || 2048,
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
    checkedKeys () {
      return Object.keys(this.value)
    },
    getParams () {
      let ret = {
        limit: this.pager.limit,
        offset: this.tagData.length,
        scope: this.scope,
        with_user_meta: true,
      }
      if (this.resources) ret.resources = this.resources
      if (this.params) {
        ret = Object.assign({}, ret, this.params)
      }
      if (this.global && !this.params.resources) delete ret.resources
      if (this.ignoreWithUserMetaParam) delete ret.with_user_meta
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
        ret = obj.value
      } else {
        // ret = obj.value.filter(val => val.includes(this.search))
        ret = obj.value.filter(val => filterHandler(val, this.search))
      }
      return ret
    },
    showValue () {
      return this.currentValue && this.currentValue.some(val => val !== null)
    },
    valueWrapStyle () {
      const styles = {}
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
    this.manager = this.managerInstance || new this.$Manager('metadatas')
    this.debounceHandleSearchInput = debounce(this.handleSearchInput, 500)
    this.debounceHandleSearchTagInput = debounce(this.handleSearchTagInput, 500)
  },
  methods: {
    handleVisibleChange (visible) {
      if (visible) {
        this.tagData = []
        this.fetchTags()
      }
    },
    async fetchTags (isAppend = false) {
      this.loading = true
      try {
        let promise
        if (this.managerInstance) {
          promise = this.manager.list({ params: this.getParams })
        } else {
          promise = this.manager.get({ id: 'tag-value-pairs', params: this.getParams })
        }
        const response = await promise
        const { data = [], total } = response.data
        this.pager.total = total
        this.tagData = isAppend ? [...this.tagData, ...data] : [...data]
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
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i]
        const isUserKey = item.key.startsWith('user:')
        const isExtKey = item.key.startsWith('ext:')
        if (this.ignoreKeys.length > 0 && this.ignoreKeys.includes(item.key)) continue
        let temp = []
        if (isUserKey) {
          temp = userRet
        }
        if (isExtKey) {
          temp = extRet
        }
        const index = R.findIndex(R.propEq('key', item.key))(temp)
        if (index !== -1) {
          if (temp[index].value && !temp[index].value.includes(item.value)) {
            temp[index].value.push(item.value)
          }
        } else {
          if (item.value) {
            temp.push({ key: item.key, value: [item.value] })
          } else {
            temp.push({ key: item.key, value: [] })
          }
        }
      }
      if (this.showNoValue) {
        userRet = userRet.map(item => {
          const value = item.value || []
          if (!value.includes('___no_value__')) {
            value.unshift('___no_value__')
          }
          return {
            ...item,
            value,
          }
        })
        extRet = extRet.map(item => {
          const value = item.value || []
          if (!value.includes('___no_value__')) {
            value.unshift('___no_value__')
          }
          return {
            ...item,
            value,
          }
        })
      }
      const sortByKeyCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('key')))
      this.userTags = sortByKeyCaseInsensitive(userRet)
      this.filtedUserTags = this.userTags
      this.extTags = sortByKeyCaseInsensitive(extRet)
      this.filtedExtTags = this.extTags
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
    handleSearchTagInput (val) {
      if (this.composing) return
      if (val) {
        // this.filtedUserTags = this.userTags.filter((tag) => { return tag.key.indexOf(val) >= 0 })
        this.filtedUserTags = this.userTags.filter((tag) => { return filterHandler(tag.key, val) })
        this.filtedExtTags = this.extTags.filter((tag) => { return filterHandler(tag.key, val) })
      } else {
        this.filtedUserTags = this.userTags
        this.filtedExtTags = this.extTags
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
  left: 159px;
  left: -240px;
  top: 0;
  width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.val-search {
  input {
    outline: none;
  }
}
</style>
