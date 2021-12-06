<template>
  <div :class="`${isInPopover?'':'tree-wrapper mr-2'}`" style="position: relative">
    <div class="tree-wrapper-content">
      <div v-if="!isInPopover" class="tree-wrapper-header d-flex justify-content-between">
        <a-button size="small" @click="initTree"><icon type="refresh" /></a-button>
        <a-button size="small" @click="handleSetting"><icon type="setting" /></a-button>
      </div>
      <data-empty v-if="!loading && !treeData.length" />
      <div :style="contentStyle">
        <a-tree
        v-if="treeData.length"
        default-expand-all
        show-line
        :selectedKeys.sync="selectedKeys"
        :treeData="treeData"
        @select="handleTreeNodeSelect"
        style="padding:10px 0">
          <a-icon slot="switcherIcon" type="down" />
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
  },
  watch: {
    projectTreeTags: {
      handler: function (val) {
        this.initTree()
      },
      immediate: true,
    },
  },
  created () {
    this.pM = new this.$Manager('parmeters', 'v1')
    this.tM = new this.$Manager(this.tagConfigParams.resource, 'v1')
    this.initProjectTags()
  },
  methods: {
    ...mapActions({ getProjectTreeTags: 'projectTags/getProjectTreeTags' }),
    async initProjectTags () {
      if (!this.isLoaded) {
        await this.getProjectTreeTags()
      } else {
        this.initTree()
      }
    },
    async initTree () {
      const params = {
        limit: 0,
        scope: this.$store.getters.scope,
        // with_user_meta: true,
      }
      this.projectTreeTags.map((item, index) => {
        params[`keys.${index}`] = item.key
      })
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
            { key: 'root', value: 'root', count },
            { children: R.clone(children) },
          ),
        )
        this.treeData = [newTree]
        this.$emit('select', this.genProjectTagFilter({}))
        this.loading = false
      } catch (err) {
        this.loading = false
      }
    },
    getParsedTree (tree) {
      const treeNode = tree
      treeNode.tag = treeNode.key
      if (treeNode.value === 'root') {
        treeNode.title = `${this.$t('common_737')}(${treeNode.count})`
      } else if (treeNode.value === '___other___') {
        treeNode.title = (
          <div><span class="tag-title-budge">{treeNode.tag.replace('user:', '')}:</span>{this.$t('common_736')}</div>
        )
      } else {
        treeNode.title = (
          <div><span class="tag-title-budge">{treeNode.tag.replace('user:', '')}:</span>{`${treeNode.value}(${treeNode.count})`}</div>
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
      return treeNode
    },
    genProjectTagFilter (data) {
      const { tagFilterKey = 'project_tags' } = this.tagConfigParams
      const ret = { tagFilterKey }
      const { tags = [], no_tags = [] } = data
      ret[tagFilterKey] = tags
      ret[`no_${tagFilterKey}`] = no_tags
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
  color: rgba(0,0,0,0.3);
  margin-right: 5px;
}
</style>
