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
        id="ImageList"
        imageType="appPackage"
        :cloud-env="cloudEnv"
        :filterParams="filterParams"
        :diskFormats="diskFormats"
        statusResKey="image"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ImageList from '@Compute/views/image/components/List'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
export default {
  name: 'AppPackageIndex',
  components: {
    ImageList,
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
      ]
    },
  },
}
</script>
