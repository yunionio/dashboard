<template>
  <div>
    <page-header :title="`${$t('dictionary.guestimage')}`">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <host-image-list
        :id="listId"
        :filterParams="filterParams"
        statusRes="image" />
    </page-body>
  </div>
</template>

<script>
import HostImageList from './components/List'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'HostImageIndex',
  components: {
    HostImageList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'HostImageList',
      resStaticsResource: 'guestimages',
      apiVersion: 'v1',
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
      const { active = {} } = data
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
          if (!['active'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }
      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('status.image.active'), type: 'active', num: active?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
