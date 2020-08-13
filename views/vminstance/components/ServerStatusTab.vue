<template>
  <div class="mb-3 d-flex" v-if="isShow">
    <div>{{ $t('common_567') }}：</div>
    <div>
      <a-tag
        v-for="(item, index) in statusErrorOpts"
        :key="index"
        :color="item.color"
        class="oc-pointer"
        @click="chooseStatusHandle(item)">
        {{ item.text}}({{ item.num }})
      </a-tag>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { uniqueOccurrences, uuid } from '@/utils/utils'
export default {
  name: 'ServerStatusTab',
  data () {
    return {
      statusMap: {},
      statusErrorOpts: [],
      statusArr: [],
    }
  },
  computed: {
    ...mapGetters(['scope']),
    isShow () {
      const opts = this.statusErrorOpts.filter((item) => { return /failed$/.test(item.val) })
      const sum = opts.reduce(function (acc, cur) {
        return acc + cur.num
      }, 0)
      return sum > 0
    },
  },
  created () {
    this.loadServersData()
    this.$bus.$on('ServerFilterChange', (val) => {
      const statusArr = val.status || []
      this.statusErrorOpts = this.statusErrorOpts.map((item) => {
        return {
          ...item,
          checked: statusArr.includes(item.val),
          color: statusArr.includes(item.val) ? 'red' : '',
        }
      })
    })
  },
  methods: {
    loadServersData () {
      const m = new this.$Manager('servers')
      const params = {
        scope: this.scope,
        limit: 0,
        $t: uuid(),
      }
      m.list({ params }).then((res) => {
        const { data } = res.data
        const statusArr = data.map((item) => { return item.status })
        const statusMap = uniqueOccurrences(statusArr)
        this.statusErrorOpts = []
        this.statusArr = []
        for (const k in statusMap) {
          this.statusArr.push(k)
          if (statusMap.hasOwnProperty(k) && /failed$/.test(k)) {
            const num = statusMap[k]
            this.statusErrorOpts.push({
              color: 'red',
              text: this.$t(`status.server.${k}`),
              num: num,
              val: k,
              checked: true,
            })
          }
        }
        const statusErrorOpts = this.statusErrorOpts.map((item) => {
          return {
            ...item,
            num: statusMap[item.val] || 0,
          }
        })
        this.statusErrorOpts = statusErrorOpts
        const statusCheckArr = [...statusErrorOpts].filter((item) => { return item.checked && item.num > 0 }).map((item) => { return item.val })
        this.$emit('getStatusCheckArr', statusCheckArr, this.statusArr)
      }).catch((err) => {
        console.log(err)
        throw err
      })
    },
    chooseStatusHandle (item) {
      if (!item.checked) {
        item.checked = true
        item.color = 'red'
      } else {
        item.checked = false
        item.color = ''
      }
      const statusCheckArr = [...this.statusErrorOpts].filter((item) => { return item.checked && item.num > 0 }).map((item) => { return item.val })
      this.$emit('getStatusCheckArr', statusCheckArr, this.statusArr)
    },
  },
}
</script>
