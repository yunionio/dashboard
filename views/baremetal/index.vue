<template>
  <div>
    <page-header title="裸金属" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <baremetal-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import BaremetalList from './components/List'

export default {
  name: 'BaremetalIndex',
  components: {
    BaremetalList,
  },
  data () {
    return {
      listId: 'BaremetalList',
      cloudEnvOptions: [
        { key: '', label: '全部' },
      ],
      cloudEnv: '',
    }
  },
}
</script>
