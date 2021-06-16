<template>
  <div>
    <a-form-item :label="$t('cloudenv.text_503')">
      <a-radio-group v-decorator="decorators.applicationScope">
        <a-radio-button v-for="v in applicationScopeOptions" :key="v.key" :value="v.key">{{ v.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <!-- 应用账号 -->
    <a-form-item v-show="form.fd.applicationScope === 1" :label="$t('cloudenv.text_589')">
      <list-select
        v-decorator="decorators.accounts"
        :list-props="accountsProps"
        :multiple="true"
        :formatter="v => v.name" />
    </a-form-item>
    <!-- 应用订阅 -->
    <a-form-item v-show="form.fd.applicationScope === 2" :label="$t('cloudenv.project_mapping_use_cloudprovider')">
      <list-select
        v-decorator="decorators.cloudproviders"
        :list-props="cloudprovidersProps"
        :multiple="true"
        :formatter="v => v.name" />
    </a-form-item>
  </div>
</template>

<script>
import AccountPropsMixin from '../mixins/accountProps'
import CloudprovidersPropsMixin from '../mixins/cloudprovidersProps'
import ListSelect from '@/sections/ListSelect'

export default {
  name: 'ApplicationScope',
  components: {
    ListSelect,
  },
  mixins: [AccountPropsMixin, CloudprovidersPropsMixin],
  props: {
    decorators: {
      type: Object,
    },
    form: {
      type: Object,
    },
  },
  data () {
    return {
      applicationScopeOptions: [{
        key: 1,
        label: this.$t('cloudenv.project_mapping_account'),
      }, {
        key: 2,
        label: this.$t('cloudenv.project_mapping_cloudprovider'),
      }],
    }
  },
}
</script>
