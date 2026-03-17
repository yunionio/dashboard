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
import OpenIdList from './components/OpenIdList'
import EncryptKeyList from './components/EncryptKeyList'
import ContainerSecretList from '../container-secret/components/List'

export default {
  name: 'CredentialIndex',
  components: {
    AccessKeyList,
    OpenIdList,
    EncryptKeyList,
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
          key: 'EncryptKeyList',
          label: this.$t('scope.title.encrypt_key'),
        },
        {
          key: 'OpenIdList',
          label: 'OIDC/OAuth2',
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
