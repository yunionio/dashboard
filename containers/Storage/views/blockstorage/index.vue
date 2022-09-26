<template>
  <div>
    <page-header :title="$t('storage.text_37')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'BlockAtorage',
  components: {
    List,
  },
  data () {
    return {
      listId: 'BlockStorageList',
      cloudEnvOptions: [
        { key: 'host', label: this.$t('compute.text_111') },
        { key: 'baremetal', label: this.$t('compute.text_112') },
      ],
      cloudEnv: 'host',
    }
  },
}
</script>
