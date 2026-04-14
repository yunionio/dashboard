<template>
  <div>
    <page-header
      :title="$t('dictionary.app_package')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle"
      :tabs="cloudEnvOptions"
      :current-tab.sync="cloudEnv" />
    <page-body>
      <image-list
        v-if="cloudEnv === 'onpremise'"
        id="ImageList"
        imageType="appPackage"
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
        :diskFormats="diskFormats"
        statusResKey="image"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import CacheImageList from '@Compute/views/cached-image/components/List'
import ImageList from '@Compute/views/image/components/List'

export default {
  name: 'AppPackageIndex',
  components: {
    ImageList,
    CacheImageList,
  },
  mixins: [ResStatisticsV2Mixin],
  props: {
    diskFormats: {
      type: Array,
    },
  },
  data () {
    return {
      listId: 'AppPackageList',
      apiVersion: 'v1',
      statusNormalList: ['active'],
      cloudEnv: 'onpremise',
    }
  },
  computed: {
    cloudEnvOptions () {
      return [
        { label: this.$t('dictionary.onpremise_env'), key: 'onpremise' },
        { label: this.$t('dictionary.private_env'), key: 'private' },
        { label: this.$t('dictionary.public_env'), key: 'public' },
      ]
    },
  },
}
</script>
