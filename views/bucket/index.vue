<template>
  <div>
    <page-header :title="$t('storage.text_18')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'BucketStorage',
  components: {
    List,
  },
  data () {
    return {
      listId: 'BucketList',
      cloudEnvOptions: getCloudEnvOptions('object_storage_brands'),
      cloudEnv: '',
    }
  },
}
</script>
