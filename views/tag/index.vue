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
      cloudEnv: 'with_user_meta',
      cloudEnvOptions: [
        { key: 'with_user_meta', label: '本地' },
        { key: 'with_cloud_meta', label: '云上' },
      ],
    }
  },
}
</script>
