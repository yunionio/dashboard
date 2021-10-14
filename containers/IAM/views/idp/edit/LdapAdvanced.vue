<template>
  <div>
    <a-form-item :label="$t('common_503', [$t('dictionary.domain')])" :extra="$t('system.text_229', [$t('dictionary.domain')])">
      <base-select
        v-if="isAdmin"
        @update:resList="resTargetDomain"
        :disabled="!!fc.getFieldValue('project_domain')"
        v-decorator="decorators.target_domain"
        resource="domains"
        filterable
        version="v1"
        :select-props="{
          placeholder: $t('common_656')
        }" />
        <span v-else>
          {{projectDomain}}
        </span>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IDPEditLdapAdvanced',
  props: {
    fd: {
      type: Object,
      required: true,
    },
    fc: {
      type: Object,
      required: true,
    },
    templateData: {
      type: Object,
      required: true,
    },
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
    isCommon: {
      type: Boolean,
      required: true,
    },
  },
  data () {
    return {
      isAdmin: this.$store.getters.isAdminMode,
      projectDomain: this.$store.getters.userInfo.projectDomain,
      decorators: {
        target_domain: [
          'target_domain',
        ],
      },
    }
  },
  watch: {
    'fd.target_domain' (val) {
      this.fc.resetFields(['default_project_id', 'project_attribute'])
    },
  },
  methods: {
    resTargetDomain (list) {
      const project_domain = this.fc.getFieldValue('project_domain')
      this.fc.setFieldsValue({
        target_domain: project_domain,
      })
    },
  },
}
</script>
