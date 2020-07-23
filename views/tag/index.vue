<template>
  <div>
    <page-header title="标签" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <tag-list :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import TagList from './components/List'

export default {
  name: 'TagIndex',
  components: {
    TagList,
  },
  data () {
    return {
      cloudEnv: 'local_compute',
      cloudEnvOptions: [
        { key: 'local_compute', label: '本地计算资源' },
        { key: 'local_image', label: '本地镜像资源' },
        { key: 'cloud', label: '云上资源' },
      ],
    }
  },
}
</script>
