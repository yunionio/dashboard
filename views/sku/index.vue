<template>
  <div>
    <page-header title="套餐" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <sku-list :id="listId" :cloud-env="cloudEnv" />
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
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
    }
  },
}
</script>
