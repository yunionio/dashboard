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
import { featureMenuHiddenCheck } from '@/utils/auth'
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
    const tabs = [
      {
        key: 'AccessKeyList',
        label: this.$t('scope.text_4'),
        featureKey: 'credentials-aksk',
      },
      {
        key: 'ContainerImageSecretList',
        label: this.$t('common.container_image_secret'),
        featureKey: 'credentials-container-image',
      },
      {
        key: 'ContainerSecretList',
        label: this.$t('common.container_secret'),
        featureKey: 'credentials-container-secret',
      },
    ].filter(item => !featureMenuHiddenCheck({ path: item.featureKey }))
    const type = this.$route.query.type
    let currentComponent = 'AccessKeyList'
    if (type === 'container_image') {
      currentComponent = 'ContainerImageSecretList'
    } else if (type === 'container_secret') {
      currentComponent = 'ContainerSecretList'
    }
    if (!tabs.some(item => item.key === currentComponent)) {
      currentComponent = tabs.length > 0 ? tabs[0].key : currentComponent
    }
    return {
      currentComponent,
      tabs,
    }
  },
}
</script>
