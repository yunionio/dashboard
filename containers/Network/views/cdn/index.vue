<template>
  <div>
    <page-header :title="this.$t('dictionary.cdn_domain')">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <domain-list
        :id="listId"
        :filterParams="filterParams"
        statusRes="cdnDomain" />
    </page-body>
  </div>
</template>

<script>
import DomainList from './components/List'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'DomainIndex',
  components: {
    DomainList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'DomainList',
      resStaticsResource: 'cdn_domains',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
    }, (resData) => {
      return this.getStatusOpts(resData)
    })
  },
  methods: {
    getStatusOpts (data) {
      const { offline = {}, online = {} } = data

      // 统计
      let total = 0
      let error = 0
      let other = 0

      for (const k in data) {
        total += data[k].total_count
        if (new RegExp('fail').test(k)) {
          this.errorFilterStatus.push(k)
          error += data[k].total_count
        } else {
          if (!['online', 'offline'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }

      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('status.cdnDomain.online'), type: 'online', num: online?.total_count || 0 },
        { title: this.$t('status.cdnDomain.offline'), type: 'offline', num: offline?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
