<template>
  <div>
    <page-header :title="$t('common_631')" :tabs="tabs" :current-tab.sync="currentComponent" />
    <page-body>
      <keep-alive>
        <component :is="currentComponent" :id="currentComponent" />
      </keep-alive>
    </page-body>
  </div>
</template>

<script>
import AccessKeyList from './components/AccessKeyList'
import ContainerSecretList from '../container-secret/components/List'
import ContainerImageSecretList from '../container-image-secret/components/List'

export default {
  name: 'CredentialIndex',
  components: {
    AccessKeyList,
    ContainerSecretList,
    ContainerImageSecretList,
  },
  data () {
    const type = this.$route.query.type
    let currentComponent = 'AccessKeyList'
    if (type === 'container_image') {
      currentComponent = 'ContainerImageSecretList'
    } else if (type === 'container_secret') {
      currentComponent = 'ContainerSecretList'
    }
    return {
      currentComponent,
      tabs: [
        {
          key: 'AccessKeyList',
          label: this.$t('scope.text_4'),
        },
        {
          key: 'ContainerImageSecretList',
          label: this.$t('common.container_image_secret'),
        },
        {
          key: 'ContainerSecretList',
          label: this.$t('common.container_secret'),
        },
      ],
    }
  },
}
</script>
