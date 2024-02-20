<template>
  <div :class="`${isInPopover?'':'tree-wrapper mr-2'}`" style="position: relative">
    <div class="tree-wrapper-content">
      <div v-if="!isInPopover" class="tree-wrapper-header d-flex justify-content-between">
        <a-button size="small" @click="initTree"><icon type="refresh" /></a-button>
        <a-button size="small" v-if="!isHideTreeConfig" @click="handleSetting"><icon type="setting" /></a-button>
      </div>
      <div class="search-box mt-2 mb-2">
        <a-input-search
          class="search"
          v-model="searchValue"
          :placeholder="$t('common.search')"
          allowClear
          @search="onSearch" />
      </div>
      <data-empty v-if="!loading && !treeData.length" />
      <div :style="contentStyle">
        <a-tree
          v-if="treeData.length"
          default-expand-all
          show-icon
          :selectedKeys.sync="selectedKeys"
          :treeData="filteredTreeData"
          @select="handleTreeNodeSelect"
          style="padding:10px 0">
          <a-icon slot="switcherIcon" type="caret-down" style="font-size: 16px;color:#999" />
          <icon slot="organization" class="tree-node-icon" style="font-size: 14px;color:#999" type="organization" />
        </a-tree>
      </div>
    </div>
    <div v-if="loading" class="loading"><a-spin :spinning="loading" /></div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import storage from '@/utils/storage'

export default {
  name: 'TreeProject',
  props: {
    isInPopover: Boolean,
    tagConfigParams: {
      type: Object,
    },
  },
  data () {
    return {
      loading: false,
      treeData: [],
      selectedKeys: [],
      searchValue: '',
    }
  },
  computed: {
    // ...mapGetters(['projectTags']),
    ...mapGetters(['common', 'isAdminMode']),
    topAlert () {
      return this.common.topAlert || {}
    },
    topAlertLen () {
      const items = []
      if (!R.isEmpty(this.topAlert) && !R.isNil(this.topAlert)) {
        const storageTopAlert = storage.get('topAlert') || {}
        R.forEachObjIndexed((value, key) => {
          const time = storageTopAlert[key]
          if (!time || this.$moment().valueOf() > time) {
            if (key === 'apiServer') {
              const url = value.messageOptions[1][2]
              if (url !== location.origin) {
                // const message = this.renderMessage(key, value)
                items.push(1)
              }
            } else {
              // const message = this.renderMessage(key, value)
              items.push(1)
            }
          }
        }, this.topAlert)
      }
      return items.length
    },
    ...mapState({
      projectTreeTags: state => state.projectTags.projectTreeTags,
      isLoaded: state => state.projectTags.isLoaded,
    }),
    contentStyle () {
      const ret = {
        maxWidth: '400px',
        overflow: 'auto',
      }
      const h = document.body.clientHeight
      ret.maxHeight = (h - 60 - 60 - 30 - 48 - 38 - 66 - this.topAlertLen * 41) + 'px'
      return ret
    },
    isHideTreeConfig () {
      return this.tagConfigParams.useOrgLevel
    },
    filteredTreeData () {
      if (this.searchValue) {
        const treeData = this.deepFilter(this.treeData)
        return treeData
      }
      return this.treeData
    },
  },
  watch: {
    projectTreeTags: {
      handler: function (val) {
        this.initTree()
      },
      immediate: true,
    },
    // 'tagConfigParams.treeParams': {
    //   handler: function (val = {}, oldVal = {}) {
    //     if (!R.equals(val, oldVal)) {
    //       this.initTree()
    //     }
    //   },
    //   deep: true,
    // },
  },
  created () {
    this.pM = new this.$Manager('parmeters', 'v1')
    this.tM = new this.$Manager(this.tagConfigParams.resource, 'v1')
    this.oM = new this.$Manager('organizations', 'v1')
    this.initProjectTags()
  },
  methods: {
    ...mapActions({ getProjectTreeTags: 'projectTags/getProjectTreeTags' }),
    deepFilter (list) {
      const cloneList = list.map(item => {
        const ret = { ...item }
        if (item.children) {
          ret.children = [...item.children]
        }
        return ret
      })
      return cloneList.filter(item => {
        if (item.children) {
          item.children = this.deepFilter(item.children)
        }
        return item.filterKeys && item.filterKeys.some(key => key.toLowerCase().includes(this.searchValue.toLowerCase()))
      })
    },
    async initProjectTags () {
      if (this.tagConfigParams.useOrgLevel) {
        this.initTree(true)
      } else {
        if (!this.isLoaded) {
          await this.getProjectTreeTags()
        } else {
          this.initTree()
        }
      }
    },
    async initTree (useOrgLevel) {
      const params = {
        limit: 0,
        scope: this.$store.getters.scope,
        ...(this.tagConfigParams.treeParams || {}),
        // with_user_meta: true,
      }
      if (useOrgLevel) {
        try {
          this.loading = true
          const res = await this.oM.list({
            params: { scope: this.$store.getters.scope },
          })
          const list = res.data.data || []
          if (list.length) {
            list[0].keys.split('/').map((key, index) => {
              params[`keys.${index}`] = `org:${key}`
            })
          }
          this.loading = false
        } catch (err) {
          this.loading = false
          throw err
        }
      } else {
        this.projectTreeTags.map((item, index) => {
          params[`keys.${index}`] = item.key
        })
      }
      try {
        this.loading = true
        const res = await this.tM.get({
          id: this.tagConfigParams.queryTreeId,
          params,
        })
        const { children = [], count } = res.data
        const newTree = this.getParsedTree(
          Object.assign(
            {},
            { key: 'root', value: 'root', count: count },
            { children: R.clone(children) },
          ),
        )
        this.addFilterKeysToTree(newTree)
        this.treeData = [newTree]
        this.$emit('select', this.genProjectTagFilter({}))
        this.loading = false
      } catch (err) {
        this.loading = false
      }
    },
    addFilterKeysToTree (tree) {
      const treeLabels = (tree.tags || []).map(item => item.value === '___no_value__' ? this.$t('common_736') : item.value)
      if (!tree.filterKeys) tree.filterKeys = []
      if (treeLabels.length && !tree.filterKeys.includes(treeLabels[treeLabels.length - 1])) {
        tree.filterKeys.push(treeLabels[treeLabels.length - 1])
      }
      if (tree.children && tree.children.length) {
        tree.children.map(child => {
          const nodeLabels = this.getTreeLabels(child)
          nodeLabels.map(val => {
            if (!tree.filterKeys.includes(val)) {
              tree.filterKeys.push(val)
            }
          })
          this.addFilterKeysToTree(child)
        })
      }
    },
    getTreeLabels (tree) {
      const ret = []
      if (tree.tags.length) {
        const value = tree.tags[tree.tags.length - 1].value
        ret.push(value === '___no_value__' ? this.$t('common_736') : value)
      }
      if (tree.children && tree.children.length) {
        tree.children.map(child => {
          const keys = this.getTreeLabels(child)
          keys.map(key => {
            if (!ret.includes(key)) {
              ret.push(key)
            }
          })
        })
      }
      return ret
    },
    formatCount (count) {
      return this.tagConfigParams.countFormatter ? this.tagConfigParams.countFormatter(count) : `(${count})`
    },
    getParsedTree (tree) {
      const treeNode = tree
      treeNode.tag = treeNode.key
      if (treeNode.value === 'root') {
        treeNode.title = (
          <span class="tree-node-title">{this.$t('common_737')}{this.formatCount(treeNode.count)}</span>
        )
      } else if (treeNode.value === '___no_value__') {
        treeNode.title = (
          <span class="tree-node-title"><span class="tag-title-budge">{treeNode.tag.replace('user:', '').replace('org:', '')}:</span>{`${this.$t('common_736')}${this.formatCount(treeNode.count)}`}</span>
        )
      } else {
        treeNode.title = (
          <span class="tree-node-title"><span class="tag-title-budge">{treeNode.tag.replace('user:', '').replace('org:', '')}:</span>{`${treeNode.value}${this.formatCount(treeNode.count)}`}</span>
        )
      }
      treeNode.key = uuid()
      if (treeNode.children && treeNode.children.length) {
        for (let i = 0; i < treeNode.children.length; i++) {
          treeNode.children[i] = this.getParsedTree(treeNode.children[i])
        }
      } else {
        treeNode.isLeaf = true
      }
      treeNode.slots = { icon: 'organization' }
      return treeNode
    },
    genProjectTagFilter (data) {
      const { tagFilterKey = 'project_tags' } = this.tagConfigParams
      const ret = { tagFilterKey }
      const { tags = [] } = data
      ret[tagFilterKey] = tags
      return ret
    },
    handleTreeNodeSelect (keys, event) {
      if (keys.length) {
        const { dataRef } = event.node
        this.$emit('select', this.genProjectTagFilter(dataRef))
        this.$emit('update:item', dataRef)
      } else {
        this.$emit('select', this.genProjectTagFilter({}))
        this.$emit('update:item', {})
      }
    },
    handleSelectNone () {
      this.selectedKeys = []
      this.$emit('select', this.genProjectTagFilter({}))
    },
    handleSetting () {
      this.$emit('treeProjectConfig')
    },
  },
}
</script>

<style lang="less" scoped>
.tree-wrapper {
  border: 1px solid #f1f1f1;
  position: relative;
}

.search-box {
    width: 100%;
    height: 32px;
    position: relative;
    .search {
      position: absolute;
      left: 10px;
      top:0;
      right: 10px;
      width: calc(100% - 20px);
    }
  }
.ant-tree-switcher {
  display: none !important;
}
.loading {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding-top: 30px;
  background: rgba(255, 255, 255, 0.5);
}
.tree-wrapper-header{
  border-bottom: 1px solid #f1f1f1;
  padding: 11.5px;
  min-width: 200px;
}
.tag-title-budge {
  font-size: 12px;
  box-sizing: border-box;
  display: inline-block;
  color: #999;
  margin-right: 5px;
}
.tree-node-title:hover{
  color: var(--antd-wave-shadow-color);
  .tag-title-budge {
    color: var(--antd-wave-shadow-color);
  }
}
</style>
