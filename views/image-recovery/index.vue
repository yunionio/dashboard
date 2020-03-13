<template>
  <div>
    <page-header title="镜像回收站" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <image-recovery-list :id="listId" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import ImageRecoveryList from './components/List'

export default {
  name: 'ImageRecoveryIndex',
  components: {
    ImageRecoveryList,
  },
  data () {
    return {
      listId: 'ImageRecoveryList',
      cloudEnvOptions: [{ key: 'images', label: '系统' }, { key: 'guestimages', label: '主机' }],
      cloudEnv: 'images',
    }
  },
}
</script>
