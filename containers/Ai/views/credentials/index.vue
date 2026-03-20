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

export default {
  name: 'CredentialIndex',
  components: {
    AccessKeyList,
    ContainerSecretList,
  },
  data () {
    return {
      currentComponent: 'AccessKeyList',
      tabs: [
        {
          key: 'AccessKeyList',
          label: this.$t('scope.text_4'),
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
