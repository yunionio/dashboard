<template>
  <a-popover
    destroy-tooltip-on-hide
    overlay-class-name="tag-table-column-wrap">
    <template slot="title">
      <div class="d-flex align-items-center">
        <div class="flex-fill">已绑定标签</div>
        <a class="font-weight-normal" @click="handleEdit" v-if="!dialogInsided">编辑标签</a>
      </div>
    </template>
    <template slot="content">
      <div class="tag-table-column">
        <template v-if="tags.length <= 0">
          <loader no-data-text="暂未绑定标签" />
        </template>
        <template v-else>
          <template v-for="item of tags">
            <span
              class="tag mb-1 text-truncate d-inline-block"
              :title="item.title"
              :key="`${item.key}${item.value}`"
              :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
              {{ item.title }}
            </span>
          </template>
        </template>
      </div>
    </template>
    <icon type="res-tag" :class="iconClass" />
  </a-popover>
</template>

<script>
import * as R from 'ramda'
import { filterUserTag, getTagColor, getTagTitle } from '@/utils/common/tag'

export default {
  name: 'TagTableColumn',
  props: {
    row: {
      type: Object,
      required: true,
    },
    vm: {
      type: Object,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
    ignoreKeys: Array,
    needExt: Boolean,
    resource: String,
  },
  data () {
    return {
      dialogInsided: false,
    }
  },
  computed: {
    data () {
      const data = filterUserTag({
        metadata: this.metadata,
        ignoreKeys: this.ignoreKeys,
        needExt: this.needExt,
      })
      return data
    },
    tags () {
      const ret = this.data.arr.map(item => {
        const rgb = getTagColor(item.key, item.value, 'rgb')
        const strRgb = rgb.join(',')
        return {
          title: getTagTitle(item.key, item.value),
          color: `rgb(${strRgb})`,
          backgroundColor: `rgba(${strRgb},.1)`,
          ...item,
        }
      })
      return ret
    },
    iconClass () {
      return this.tags.length <= 0 ? 'text-color-help' : 'primary-color'
    },
    params () {
      const ret = { resources: this.resource }
      if (this.resource) return ret
      if (this.vm && this.vm.list && this.vm.list.resource) {
        if (R.is(String, this.vm.list.resource)) {
          ret.resources = this.vm.list.resource.substr(0, this.vm.list.resource.length - 1)
        } else {
          ret.resources = this.vm.list.resource.resource.substr(0, this.vm.list.resource.resource.length - 1)
        }
      }
      return ret
    },
  },
  created () {
    this.findDialogByParent(this)
  },
  methods: {
    handleEdit (e) {
      e.stopPropagation()
      this.vm.createDialog('SetTagDialog', {
        data: [this.row],
        columns: this.vm.columns,
        list: this.vm.list,
        params: this.params,
      })
    },
    findDialogByParent (vm) {
      if (vm.$options.name === 'BaseDialog') {
        this.dialogInsided = true
      } else {
        if (vm.$parent) {
          this.findDialogByParent(vm.$parent)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tag-table-column {
  max-width: 300px;
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
</style>
