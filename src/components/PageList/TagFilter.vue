<template>
  <div class="d-flex tag-filter-wrap ml-2 flex-fill">
    <tag-select
      multiple
      filter-without-user-meta
      :params="params"
      :value="tagFilter"
      :managerInstance="tagManagerInstance"
      :show-ext-tags="showExtTags"
      @change="handleTagFilterChange">
      <template v-slot:trigger>
        <a-button class="flex-shrink-0" style="margin-right: -1px;"><icon type="res-tag" />{{$t('common.text00012')}}</a-button>
      </template>
    </tag-select>
    <div class="tag-wrap" v-if="tags && tags.length > 0">
      <div class="tag-wrap-inner">
        <div class="tag-list">
          <template v-for="item of tags">
            <div
              class="tag-item"
              :key="`${item.key}${item.value}`"
              :title="item.title"
              :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
              {{ item.title }}<a-icon type="close" class="ml-1" @click="removeTag(item)" />
            </div>
          </template>
          <a-icon class="remove-all-btn ml-1" type="delete" @click="handleTagFilterChange({})" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import TagSelect from '@/sections/TagSelect'
import { getTagColor, getTagTitle } from '@/utils/common/tag'

export default {
  name: 'PageListTagFilter',
  components: {
    TagSelect,
  },
  props: {
    tagManagerInstance: Object,
    tagFilter: Object,
    resource: [String, Object],
    extTagParams: {
      type: Object,
      default () {
        return {}
      },
    },
    showExtTags: Boolean,
  },
  computed: {
    params () {
      const ret = {
        with_cloud_meta: true,
        ...this.extTagParams,
      }
      if (R.is(String, this.resource)) {
        ret.resources = this.resource.substr(0, this.resource.length - 1)
      } else {
        ret.resources = this.resource.resource.substr(0, this.resource.resource.length - 1)
      }
      return ret
    },
    tags () {
      const ret = []
      R.forEachObjIndexed((value, key) => {
        if (value && value.length > 0) {
          if (value.length > 1) {
            const vals = []
            for (let i = 0, len = value.length; i < len; i++) {
              vals.push(value[i])
            }
            ret.push(this.genTag(key, vals.join(' or ')))
          } else {
            ret.push(this.genTag(key, value[0]))
          }
        } else {
          ret.push(this.genTag(key))
        }
      }, this.tagFilter)
      return ret
    },
  },
  methods: {
    handleTagFilterChange (tagFilter) {
      this.$emit('tag-filter-change', tagFilter)
    },
    genTag (key, value) {
      const rgb = getTagColor(key, value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        key,
        value,
        title: key === 'without_user_meta' ? this.$t('common.text00013') : getTagTitle(key, value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
      }
    },
    removeTag (item) {
      const newValue = { ...this.tagFilter }
      delete newValue[item.key]
      this.handleTagFilterChange(newValue)
    },
  },
}
</script>

<style lang="less" scoped>
.tag-filter-wrap {
  min-width: 0;
}
.tag-wrap {
  display: inline-block;
  height: 32px;
  min-width: 0;
  position: relative;
  padding: 0 12px 0 0;
}
.tag-wrap-inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.tag-list {
  display: inline-block;
  width: 100%;
  background-color: #fff;
  position: static;
  z-index: 99;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: nowrap;
  border: 1px solid #d9d9d9;
  min-height: 100%;
  padding: 4px 10px 0 3px;
  &:hover {
    position: relative;
    white-space: normal;
  }
}
.tag-item {
  position: relative;
  display: inline-block;
  margin: 0 0 4px 4px;
  line-height: 20px;
  font-size: 12px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 15px 0 4px;
  border-style: solid;
  border-width: 1px;
  vertical-align: middle;
  .anticon {
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.remove-all-btn {
  cursor: pointer;
  font-size: 12px;
  position: relative;
  vertical-align: middle;
  line-height: 1;
}
</style>
