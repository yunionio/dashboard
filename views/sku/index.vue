<template>
  <div>
    <page-header :title="$t('compute.text_109')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <sku-list :id="listId" :getParams="getParams" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import SkuList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'SKUIndex',
  components: {
    SkuList,
  },
  data () {
    return {
      listId: 'SkuList',
      getParams: {
        details: true,
        'filter.0': 'disk_type.notin(volume)',
      },
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
