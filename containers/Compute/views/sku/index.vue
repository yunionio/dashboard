<template>
  <div>
    <page-header :title="$t('compute.text_109')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <sku-list :id="listId" :getParams="getParams" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import _ from 'lodash'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import SkuList from './components/List'

export default {
  name: 'SKUIndex',
  components: {
    SkuList,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('compute_engine_brands').filter(val => ['onpremise', 'public', 'private'].includes(val.key))
    return {
      listId: 'SkuList',
      getParams: {
        details: true,
        'filter.0': 'disk_type.notin(volume)',
      },
      cloudEnvOptions,
      cloudEnv: _.get(cloudEnvOptions, '[0].key'),
    }
  },
}
</script>
