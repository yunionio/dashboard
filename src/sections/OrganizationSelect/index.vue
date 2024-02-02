<template>
  <a-select
    v-model="selected"
    :placeholder="$t('common.tips.select', [$t('bill.organization_level')])"
    v-bind="otherProps"
    @change="selecteChange">
    <a-select-option v-for="(item, index) in orgNodeOpts" :key="index" :value="item.id" :text="item.full_label" :children_tags="item.children_tags">
      <span class="oc-selected-display-none" :style="{paddingLeft: `${(item.level - 1) * 15}px`}" :data="item.full_label" />
      <span class="oc-dropdown-display-none" v-if="item.parent_label">{{ item.parent_label }}-</span>{{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'OrganizationSelect',
  props: {
    multiple: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Array || String,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      selected: this.value,
      orgNodeOpts: [],
    }
  },
  computed: {
    otherProps () {
      const ret = {
        filterable: true,
        optionFilterProp: 'children',
        showSearch: true,
        filterOption: this.filterOption,
      }
      if (this.multiple) {
        ret.mode = 'multiple'
      }
      return ret
    },
  },
  watch: {
    params: {
      handler: function () {
        this.fetchData()
      },
      deep: true,
    },
  },
  created () {
    this.$rM = new this.$Manager('organizations', 'v1')
    this.$oM = new this.$Manager('organization_nodes', 'v1')
    this.fetchData()
  },
  methods: {
    filterOption (input, option) {
      const text = _.get(option, 'data.attrs.text', '')
      const childrenTags = _.get(option, 'data.attrs.children_tags', [])
      if (text) {
        const checkList = [text.toLowerCase().includes(input.toLowerCase())]
        // 上级节点也展示
        checkList.push(childrenTags.some(c => c.toLowerCase().includes(input.toLowerCase())))
        return checkList.some(bool => bool)
      }
    },
    async fetchData () {
      try {
        const orgs = await this.$rM.list({
          params: {
            scope: this.$store.getters.scope,
            enabled: true,
          },
        })
        const { data: orgList = [] } = orgs.data
        if (!orgList.length) {
          this.orgNodeOpts = []
          return
        }
        const res = await this.$oM.list({
          params: {
            org_id: orgList[0].id,
            ...this.params,
          },
        })
        const { data = [] } = res.data
        data.sort((a, b) => {
          if (a.level === b.level) {
            return a.weight - b.weight
          }
          return a.level - b.level
        })
        const ret = []
        data.map(item => {
          if (item.level === 1) {
            ret.push(item)
          } else {
            const idx = ret.findIndex(i => item.level - 1 === i.level && item.full_label.includes(i.full_label))
            if (idx > -1) {
              ret.splice(idx + 1, 0, item)
            }
          }
          const tags = item.tags || []
          // 父级路径
          if (tags.length) {
            const target = tags.filter((item, index) => index !== tags.length - 1)
            item.parent_label = target.map(item => item.value).join('-')
          } else {
            item.parent_label = ''
          }
          // 加入所有子节点的内容，方便过滤
          const targets = data.filter(t => {
            if (t.full_label && item.full_label && t.full_label.length > item.full_label.length && t.full_label.slice(0, item.full_label.length) === item.full_label) {
              return true
            }
            return false
          }).map(item => item.name)
          item.children_tags = targets
        })
        this.orgNodeOpts = ret
      } catch (err) {}
    },
    selecteChange (val) {
      this.$emit('change', val)
    },
  },
}
</script>
