<template>
  <div>
    <page-header :title="$t('compute.text_105')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <secgroup-list :id="listId" :cloudEnv="cloudEnv" />
    </page-body>
  </div>
</template>
<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import SecgroupList from './components/List'

export default {
  name: 'SecgroupIndex',
  components: {
    SecgroupList,
  },
  data () {
    return {
      listId: 'SecgroupList',
      cloudEnvOptions: getCloudEnvOptions('security_group_brands'),
      cloudEnv: '',
    }
  },
}
</script>
