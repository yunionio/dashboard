<template>
  <div>
    <a-form-item :label="$t('network.text_360')">
      <a-switch v-decorator="decorators.acl_status" @change="change" />
    </a-form-item>
    <template v-if="form.fc.getFieldValue('acl_status')">
      <a-form-item :label="$t('network.text_361')">
        <a-select v-decorator="decorators.acl_type">
          <a-select-option v-for="item in aclTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('network.text_362')">
        <base-select
          v-decorator="decorators.acl"
          resource="loadbalanceracls"
          show-sync
          :params="aclParams"
          :select-props="{ placeholder: $t('network.text_363') }" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import i18n from '@/locales'

export default {
  name: 'LbAcl',
  props: {
    lbDetail: {
      type: Object,
      required: true,
    },
    decorators: {
      type: Object,
      required: true,
      validator: val => val.acl_status,
    },
    aclTypeOpts: {
      type: Array,
      default: () => [
        { key: 'white', label: i18n.t('network.text_364') },
        { key: 'black', label: i18n.t('network.text_365') },
      ],
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    listenerData: {
      type: Object,
    },
  },
  data () {
    return {
      acl_status: this.decorators.acl_status[1].initialValue,
    }
  },
  computed: {
    aclParams () {
      const params = {
        limit: 0,
      }
      if (this.$store.getters.isAdminMode) {
        const domain = _.get(this.listenerData, 'domain_id') || _.get(this.lbDetail, 'domain_id')
        params.project_domain = domain
      } else {
        params.scope = this.$store.getters.scope
      }
      return params
    },
  },
  methods: {
    change (val) {
      this.acl_status = val
    },
  },
}
</script>
