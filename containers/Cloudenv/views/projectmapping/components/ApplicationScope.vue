<template>
  <div>
    <a-form-model-item :label="$t('cloudenv.text_503')">
      <a-radio-group v-model="formData.application_scope">
        <a-radio-button v-for="v in applicationScopeOptions" :key="v.key" :value="v.key">{{ v.label }}</a-radio-button>
      </a-radio-group>
    </a-form-model-item>
    <!-- 应用账号 -->
    <a-form-model-item v-show="formData.application_scope === 1" :label="$t('cloudenv.text_589')">
      <list-select
        v-model="formData.accounts"
        :list-props="accountsProps"
        :multiple="true"
        :formatter="v => v.name" />
    </a-form-model-item>
    <!-- 应用订阅 -->
    <a-form-model-item v-show="formData.application_scope === 2" :label="$t('cloudenv.project_mapping_use_cloudprovider')">
      <list-select
        v-model="formData.cloudproviders"
        :list-props="cloudprovidersProps"
        :multiple="true"
        :formatter="v => v.name" />
    </a-form-model-item>
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
    formData: {
      type: Object,
    },
    params: {
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
  methods: {
    // applicationScopeChangeHandle () {
    //   this.form.fc.setFieldsValue({
    //     accounts: [],
    //     cloudproviders: [],
    //   })
    // },
  },
}
</script>
