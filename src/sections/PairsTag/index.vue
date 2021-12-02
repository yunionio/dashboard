<template>
  <div>
    <div class="tag-list">
      <template v-for="item of tags">
        <span
          class="tag mb-1 d-inline-block"
          :title="item.title"
          :key="`${item.key}${item.value}`"
          :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
          <div class="d-flex align-items-center">
            <span class="flex-fill text-truncate">{{ item.title }}</span>
            <!-- <a-icon class="ml-1 remove-tag flex-grow-0 flex-shrink-0" type="close" @click="removeTag(item)" /> -->
          </div>
        </span>
      </template>
    </div>
    <a-form-item :extra="extra" class="mt-2">
      <div class="d-flex">
        <div style="line-height: 40px;">
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
              <a-button :loading="loading">{{ $t('common_110') }}</a-button>
            </template>
            <template slot="content">
              <div class="tag-wrap" ref="tag-wrap">
                <tree-project isInPopover :tagConfigParams="{ tagFilterKey: 'tags',queryTreeId: 'tag-value-tree', resource: 'projects'}" @update:item="handleSelect" />
              </div>
            </template>
          </a-popover>
        </div>
      </div>
    </a-form-item>
  </div>
</template>

<script>
// import * as R from 'ramda'
import i18n from '@/locales'
import { getTagColor, getTagTitle } from '@/utils/common/tag'
import TreeProject from '@/sections/TreeProject'

export default {
  name: 'PairsTag',
  components: {
    TreeProject,
  },
  props: {
    extra: {
      type: String,
      default: i18n.t('common_259'),
    },
    value: {
      type: Array,
      default () {
        return []
      },
    },
  },
  data () {
    return {
      checked: this.value,
      visible: false,
    }
  },
  computed: {
    tags () {
      const ret = []
      // R.forEachObjIndexed((value, key) => {
      //   if (value.length > 0) {
      //     if (Array.isArray(value)) {
      //       for (let i = 0, len = value.length; i < len; i++) {
      //         ret.push(this.genTag(key, value[i]))
      //       }
      //     } else {
      //       ret.push(this.genTag(key, value))
      //     }
      //   } else {
      //     ret.push(this.genTag(key, null))
      //   }
      // }, this.checked)
      this.checked.map(item => {
        ret.push(this.genTag(item.key, item.value))
      })
      return ret
    },
  },
  methods: {
    genTag (key, value) {
      const rgb = getTagColor(key, value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        title: getTagTitle(key, value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
        key,
        value,
      }
    },
    handleVisibleChange (visible) {
      if (visible) {
        // this.fetchTags()
      }
    },
    handleSelect (node) {
      // const ret = {}
      const { tags = [] } = node
      // tags.map(item => {
      //   ret[item.key] = [item.value]
      // })
      this.$emit('change', tags)
      this.checked = tags
    },
  },
}
</script>

<style lang="less" scoped>
.tag-list {
  min-height: 65px;
  border: 2px dashed #ddd;
  padding: 8px;
}
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
.tag-wrap {
  padding: 10px;
  max-width: 300px;
  max-height: 500px;
  overflow: auto;
}
</style>
