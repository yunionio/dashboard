<template>
  <div>
    <base-drop-list :drop-msg="msg" @fetchData="fetchData" />
  </div>
</template>

<script>
import BaseDropList from '@/sections/DropList'
import { Manager } from '@/utils/manager'

export default {
  name: 'SecgroupDropList',
  componentName: 'SecgroupDropList',
  components: {
    BaseDropList,
  },
  props: {
    objId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      hadFetch: false,
      msg: [
        {
          type: 'inMsg',
          title: '入方向',
          list: [],
        },
        {
          type: 'outMsg',
          title: '出方向',
          list: [],
        },
      ],
    }
  },
  created () {
    this.secRulesM = new Manager('secgrouprules')
    this.$on('rule-refresh', ids => {
      if (ids.includes(this.objId)) this.fetchData(true)
    })
  },
  methods: {
    fetchData (isRefresh) {
      if (!isRefresh && this.hadFetch) return
      this.secRulesM.list({
        params: {
          secgroup: this.objId,
          scope: this.$store.getters.scope,
        },
      }).then(({ data: { data = [] } }) => {
        const inList = []
        const outList = []
        data.forEach(obj => {
          let text = ''
          if (obj.action) text += `${obj.action}`
          if (obj.cidr) text += `，${obj.cidr}`
          if (obj.protocol) text += `，${obj.protocol}`
          if (obj.ports) text += `，${obj.ports}`
          if (obj.direction === 'in') {
            inList.push({
              value: text,
            })
          } else if (obj.direction === 'out') {
            outList.push({
              value: text,
            })
          }
        })
        this.msg[0].list = inList
        this.msg[1].list = outList
        this.hadFetch = true
      })
    },
  },
}
</script>
