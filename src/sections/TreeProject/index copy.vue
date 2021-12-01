<template>
  <div class="tree-wrapper mr-2">
    <div class="tree-wrapper-content">
      <div class="tree-wrapper-header d-flex justify-content-end">
        <!-- <a-button @click="handleSelectNone">取消选中</a-button> -->
        <a-button @click="handleSetting">{{$t('dictionary.parameter')}}</a-button>
      </div>
      <data-empty v-if="!loading && !treeData.length" />
      <a-directory-tree
       v-if="treeData.length"
       :selectedKeys.sync="selectedKeys"
       :treeData="treeData"
       @select="handleTreeNodeSelect"
       style="padding:10px 0" />
    </div>
    <div v-if="loading" class="loading"><a-spin :spinning="loading" /></div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import * as R from 'ramda'
import { uuid } from '@/utils/utils'

export default {
  name: 'TreeProject',
  props: {
    treeToggleOpen: Boolean,
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
    ...mapState({
      projectTreeTags: state => state.projectTags.projectTreeTags,
      isLoaded: state => state.projectTags.isLoaded,
    }),
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
    this.tM = new this.$Manager(this.tagConfigParams.resources, 'v1')
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
        with_user_meta: true,
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
        treeNode.title = this.$t('common_737')
      } else if (treeNode.value === '___other___') {
        treeNode.title = this.$t('common_736', [treeNode.tag.replace('user:', '')])
      } else {
        treeNode.title = treeNode.value
      }
      treeNode.title = `${treeNode.title}(${treeNode.count})`
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
      const { dataRef } = event.node
      this.$emit('select', this.genProjectTagFilter(dataRef))
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
  padding: 10px;
}
</style>
