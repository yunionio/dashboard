<template>
  <div>
    <page-header :title="$t('storage.text_18')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="bucket" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'
import List from './components/List'

export default {
  name: 'BucketStorage',
  components: {
    List,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'BucketList',
      cloudEnvOptions: getCloudEnvOptions('object_storage_brands'),
      cloudEnv: '',
      resStaticsResource: 'buckets',
    }
  },
  methods: {
    getStatusOpts (data) {
      const { ready = {} } = data
      // 统计
      let total = 0
      let error = 0
      let other = 0

      for (const k in data) {
        total += data[k].total_count
        if (new RegExp('failed').test(k)) {
          this.errorFilterStatus.push(k)
          error += data[k].total_count
        } else {
          if (!['ready'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }
      const statusOpts = [
        { title: this.$t('common.staticstics.status.total'), type: 'total', num: total },
        { title: this.$t('common.staticstics.status.available'), type: 'ready', class: 'success', num: ready?.total_count || 0 },
        { title: this.$t('common.staticstics.status.error'), type: 'error', num: error || 0 },
        { title: this.$t('common.staticstics.status.other'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
