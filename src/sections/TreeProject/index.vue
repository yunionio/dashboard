<template>
  <div
    :class="[isInPopover ? '' : 'tree-wrapper mr-2', { resizing }]"
    :style="wrapperStyle">
    <div
      v-if="!isInPopover"
      class="org-resize-handle"
      @mousedown="startResize" />
    <div class="tree-wrapper-content">
      <div v-if="!isInPopover" class="tree-toolbar">
        <a-button class="tree-toolbar-btn" @click="handleRefresh">
          <icon type="refresh" />
        </a-button>
        <a-input-search
          class="tree-toolbar-search"
          v-model="searchValue"
          :placeholder="searchPlaceholder"
          allowClear />
        <a-button
          v-if="!isHideTreeConfig"
          class="tree-toolbar-btn"
          @click="handleSetting">
          <icon type="setting" />
        </a-button>
      </div>
      <div v-else class="search-box mb-2">
        <a-input-search
          class="search"
          v-model="searchValue"
          :placeholder="searchPlaceholder"
          allowClear />
      </div>
      <data-empty v-if="!loading && !treeData.length" />
      <div class="tree-body">
        <a-tree
          v-if="treeData.length"
          default-expand-all
          show-icon
          :selectedKeys.sync="selectedKeys"
          :treeData="filteredTreeData"
          @select="handleTreeNodeSelect"
          style="padding: 8px 0">
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
import {
  buildOrgTree,
  clampOrgSidebarWidth,
  deepFilterOrgTree,
  DEFAULT_ORG_SIDEBAR_WIDTH,
  getStoredOrgSidebarWidth,
  orgNodeToProjectTagFilter,
  setStoredOrgSidebarWidth,
} from '@/utils/organizationTree'

export default {
  name: 'TreeProject',
  props: {
    isInPopover: Boolean,
    treeToggleOpen: Boolean,
    tagConfigParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      loading: false,
      treeData: [],
      selectedKeys: [],
      searchValue: '',
      sidebarHeight: 0,
      sidebarWidth: DEFAULT_ORG_SIDEBAR_WIDTH,
      resizing: false,
    }
  },
  computed: {
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
                items.push(1)
              }
            } else {
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
    // 按元素距视口顶部动态计算剩余高度，避免硬编码偏移导致页面出现竖向滚动条
    wrapperStyle () {
      if (this.isInPopover) return { position: 'relative' }
      const style = {
        position: 'relative',
        width: `${this.sidebarWidth}px`,
        flex: `0 0 ${this.sidebarWidth}px`,
      }
      if (this.sidebarHeight) {
        style.height = `${this.sidebarHeight}px`
      }
      return style
    },
    isOrganizationMode () {
      // 侧栏默认组织架构；仅当显式传入其它 treeMode（如 tag）时走旧聚合树
      // 仍传入的 resource / queryTreeId 在组织模式下忽略
      const mode = this.tagConfigParams && this.tagConfigParams.treeMode
      if (mode && mode !== 'organization') return false
      return true
    },
    isHideTreeConfig () {
      return this.isOrganizationMode
    },
    searchPlaceholder () {
      if (this.isOrganizationMode && this.$te('iamee.organization_search')) {
        return this.$t('iamee.organization_search')
      }
      return this.$t('common.search')
    },
    filteredTreeData () {
      if (this.searchValue) {
        if (this.isOrganizationMode) {
          return deepFilterOrgTree(this.treeData, this.searchValue)
        }
        return this.deepFilter(this.treeData)
      }
      return this.treeData
    },
  },
  watch: {
    projectTreeTags: {
      handler: function () {
        if (this.isOrganizationMode) return
        this.initTree()
      },
      immediate: true,
    },
    treeToggleOpen (val) {
      if (val) {
        this.$nextTick(() => this.updateSidebarHeight())
      }
    },
    topAlertLen () {
      this.$nextTick(() => this.updateSidebarHeight())
    },
  },
  created () {
    this.oM = new this.$Manager('organizations', 'v1')
    this.onM = new this.$Manager('organization_nodes', 'v1')
    if (this.tagConfigParams && this.tagConfigParams.resource) {
      this.tM = new this.$Manager(this.tagConfigParams.resource, 'v1')
    }
    this.sidebarWidth = getStoredOrgSidebarWidth()
    this.initProjectTags()
  },
  mounted () {
    this.updateSidebarHeight()
    window.addEventListener('resize', this.updateSidebarHeight)
    this.$bus.$on('GlobalTopAlertUpdate', this.updateSidebarHeight)
  },
  beforeDestroy () {
    this.stopResize()
    window.removeEventListener('resize', this.updateSidebarHeight)
    this.$bus.$off('GlobalTopAlertUpdate', this.updateSidebarHeight)
  },
  methods: {
    ...mapActions({ getProjectTreeTags: 'projectTags/getProjectTreeTags' }),
    startResize (e) {
      if (this.isInPopover) return
      e.preventDefault()
      e.stopPropagation()
      this.resizing = true
      this._resizeStartX = e.clientX
      this._resizeStartWidth = this.sidebarWidth
      document.addEventListener('mousemove', this.onResize)
      document.addEventListener('mouseup', this.stopResize)
    },
    onResize (e) {
      if (!this.resizing) return
      const next = this._resizeStartWidth + (e.clientX - this._resizeStartX)
      this.sidebarWidth = clampOrgSidebarWidth(next)
    },
    stopResize () {
      if (!this.resizing) {
        document.removeEventListener('mousemove', this.onResize)
        document.removeEventListener('mouseup', this.stopResize)
        return
      }
      this.resizing = false
      setStoredOrgSidebarWidth(this.sidebarWidth)
      document.removeEventListener('mousemove', this.onResize)
      document.removeEventListener('mouseup', this.stopResize)
    },
    updateSidebarHeight () {
      if (this.isInPopover) return
      const el = this.$el
      if (!el || typeof el.getBoundingClientRect !== 'function') return
      // v-show=false 时无法测量
      if (getComputedStyle(el).display === 'none') return
      const top = el.getBoundingClientRect().top
      // 预留底部留白，避免撑出视口产生整页竖向滚动条
      const bottomGap = 16
      this.sidebarHeight = Math.max(Math.floor(window.innerHeight - top - bottomGap), 200)
    },
    handleRefresh () {
      if (this.isOrganizationMode) {
        this.initOrganizationTree()
      } else {
        this.initTree(this.tagConfigParams.useOrgLevel)
      }
    },
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
      if (this.isOrganizationMode) {
        await this.initOrganizationTree()
        return
      }
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
    applyOrgTreeTitles (node) {
      const treeNode = node
      if (treeNode.id === 'root' || treeNode.key === 'root') {
        treeNode.title = (
          <span class="tree-node-title">{treeNode.name || treeNode.tagValue}</span>
        )
      } else {
        treeNode.title = (
          <span class="tree-node-title"><span class="tag-title-budge">{(treeNode.tagKey || '').replace('org:', '')}:</span>{treeNode.tagValue}</span>
        )
      }
      treeNode.slots = { icon: 'organization' }
      if (treeNode.children && treeNode.children.length) {
        treeNode.children = treeNode.children.map(child => this.applyOrgTreeTitles(child))
      }
      return treeNode
    },
    async initOrganizationTree () {
      try {
        this.loading = true
        const orgRes = await this.oM.list({
          params: {
            scope: this.$store.getters.scope,
            enabled: true,
          },
        })
        const orgList = orgRes.data.data || []
        if (!orgList.length) {
          this.treeData = []
          this.$emit('select', orgNodeToProjectTagFilter({}, this.tagConfigParams.tagFilterKey || 'project_tags'))
          return
        }
        const organization = orgList[0]
        const nodeRes = await this.onM.list({
          params: {
            org_id: organization.id,
            scope: this.$store.getters.scope,
          },
        })
        const nodeList = nodeRes.data.data || []
        const { tree } = buildOrgTree({ organization, nodeList })
        const rooted = this.applyOrgTreeTitles(R.clone(tree))
        this.treeData = [rooted]
        this.selectedKeys = ['root']
        this.$emit('select', orgNodeToProjectTagFilter({}, this.tagConfigParams.tagFilterKey || 'project_tags'))
      } catch (err) {
        this.treeData = []
        throw err
      } finally {
        this.loading = false
      }
    },
    async initTree (useOrgLevel) {
      if (this.isOrganizationMode) {
        await this.initOrganizationTree()
        return
      }
      if (!this.tM) return
      const params = {
        limit: 0,
        scope: this.$store.getters.scope,
        ...(this.tagConfigParams.treeParams || {}),
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
      return orgNodeToProjectTagFilter(data, tagFilterKey)
    },
    handleTreeNodeSelect (keys, event) {
      if (keys.length) {
        const { dataRef } = event.node
        // 根节点不过滤
        if (dataRef && (dataRef.id === 'root' || dataRef.key === 'root')) {
          this.$emit('select', this.genProjectTagFilter({}))
          this.$emit('update:item', dataRef)
          return
        }
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
  background: #fff;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  &.resizing {
    user-select: none;
  }
}

.org-resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 2;
  background: transparent;
}

.tree-wrapper-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.tree-toolbar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #f1f1f1;
}

.tree-toolbar-btn {
  flex-shrink: 0;
}

.tree-toolbar-search {
  flex: 1;
  min-width: 0;
}

.tree-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 4px;
}

.search-box {
  width: 100%;
  height: 32px;
  position: relative;
  .search {
    position: absolute;
    left: 10px;
    top: 0;
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

.tag-title-budge {
  font-size: 12px;
  box-sizing: border-box;
  display: inline-block;
  color: #999;
  margin-right: 5px;
}

.tree-node-title:hover {
  color: var(--antd-wave-shadow-color);
  .tag-title-budge {
    color: var(--antd-wave-shadow-color);
  }
}
</style>
