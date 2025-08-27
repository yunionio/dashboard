<template>
  <div>
    <page-header :title="$t('compute.text_97')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <image-list
        v-if="cloudEnv === 'onpremise'"
        id="ImageList"
        :cloud-env="cloudEnv"
        :filterParams="filterParams"
        :diskFormats="diskFormats"
        statusResKey="image"
        @resStatisticsChange="resStatisticsChange" />
      <cache-image-list
        v-else
        id="CacheImageList"
        :cloud-env="cloudEnv"
        :filterParams="filterParams"
        statusResKey="image"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import CacheImageList from '@Compute/views/cached-image/components/List'
import ImageList from './components/List'

export default {
  name: 'ImageIndex',
  components: {
    ImageList,
    CacheImageList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'ImageList',
      resStaticsResource: 'images',
      apiVersion: 'v1',
      cloudEnv: 'onpremise',
      cloudEnvOptions: [
        { label: this.$t('dictionary.onpremise_env'), key: 'onpremise' },
        { label: this.$t('dictionary.private_env'), key: 'private' },
        { label: this.$t('dictionary.public_env'), key: 'public' },
      ],
    }
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
