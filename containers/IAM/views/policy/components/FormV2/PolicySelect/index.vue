<template>
  <div>
    <a-tree
      checkable
      v-model="treeSelected"
      showLine
      :treeData="treeData"
      :selectedKeys.sync="selectedKeys"
      :defaultSelectedKeys="['all']" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { genPolicyGroups } from '../../../utils'
import { DEFAULT_ACTIONS_KEY } from '../../../constants'

export default {
  name: 'PolicySelect',
  data () {
    return {
      treeData: [],
      treeSelected: [],
      selectedKeys: [],
    }
  },
  computed: {
    // i18n的结果
    translatedActions () {
      return this.$t('policyDefaultActions')
    },
  },
  created () {
    this.treeData = this.genTreeData()
  },
  methods: {
    // 生成默认的操作选择项
    genActions (keyPrefix, extras) {
      const ret = DEFAULT_ACTIONS_KEY.map(item => {
        return {
          title: this.translatedActions[item] || item,
          key: `${keyPrefix}-${item}`,
        }
      })
      if (extras && extras.length) {
        R.forEach(item => {
          ret.push({
            title: item.label,
            key: `${keyPrefix}-${item.action}-${item.value}`,
          })
        }, extras)
      }
      return ret
    },
    genTreeData () {
      const data = genPolicyGroups()
      const ret = [
        {
          title: this.$t('system.text_340'),
          key: 'all',
        },
      ]
      // 子节点，如计算、镜像...
      const children = data.map(l2 => {
        const l2Ret = {
          title: l2.label,
          key: `all-${l2.service}`,
        }
        // 子节点，如主机、硬盘...
        const l2Children = l2.resources.map(l3 => {
          const l3Ret = {
            title: l3.label,
            key: `all-${l2.service}-${l3.resource}`,
          }
          // 子节点，如列表、修改、删除...
          const l3Children = this.genActions(`all-${l2.service}-${l3.resource}`, l3.extras)
          l3Ret.children = l3Children
          return l3Ret
        })
        l2Ret.children = l2Children
        return l2Ret
      })
      ret[0].children = children
      return ret
    },
  },
}
</script>
