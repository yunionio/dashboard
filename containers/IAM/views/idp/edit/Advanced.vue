<template>
  <div>
    <template v-if="isCommon">
      <a-form-item :label="$t('common_516')" :extra="$t('common_504', [templateLabel])">
        <a-input v-decorator="decorators.user_id_attribute" />
      </a-form-item>
      <a-form-item :label="$t('system.field.username')" :extra="$t('common_505', [templateLabel])">
        <a-input v-decorator="decorators.user_name_attribute" />
      </a-form-item>
    </template>
    <a-form-item :label="$t('common_501')">
      <a-switch v-decorator="decorators.auto_create_user">{{$t('common_499')}}</a-switch>
      <template slot="extra">{{$t('common_513')}}<br />{{$t('common_514')}}</template>
    </a-form-item>
    <template v-if="fd.auto_create_user">
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
      <a-collapse accordion v-if="showCollapse">
        <a-collapse-panel key="1" :header="$t('system.text_214')">
          <a-form-item class="mb-0" :label="$t('system.text_205', [$t('dictionary.project')])">
            <a-row :gutter="8">
              <a-col :span="10">
                <a-form-item :wrapperCol="{ span: 24 }" :extra="$t('common_506', [templateLabel,$t('dictionary.user'),$t('dictionary.project')])">
                  <base-select
                    v-decorator="decorators.default_project_id"
                    resource="projects"
                    version="v1"
                    :params="projectParams"
                    remote
                    :item.sync="project"
                    :remote-fn="q => ({ filter: `name.contains(${q})` })"
                    :select-props="{ placeholder: $t('rules.project') }" />
                </a-form-item>
              </a-col>
              <a-col :span="14" v-if="isCommon">
                <template v-if="showProjectInput">
                  <a-form-item :wrapperCol="{ span: 24 }">
                    <div class="d-flex align-items-center">
                      <div class="flex-fill mr-1">
                        <a-input v-decorator="decorators.project_attribute" :placeholder="$t('common_507', [templateLabel,$t('dictionary.project'),templateLabel.toLocaleLowerCase()])" />
                      </div>
                      <a-tooltip placement="right">
                        <span slot="title">{{$t('common_517', [templateLabel])}}</span>
                        <icon type="question" />
                      </a-tooltip>
                      <a-button type="link" @click="showProjectInput = !showProjectInput">{{$t('common_518', [templateLabel, this.$t('dictionary.project')]) }}</a-button>
                    </div>
                    <div slot="extra">
                      <a-checkbox v-decorator="decorators.auto_create_project">{{$t('common_519')}}</a-checkbox>
                      <br />{{$t('common_520')}}</div>
                  </a-form-item>
                </template>
                <template v-else>
                  <a-button type="link" @click="showProjectInput = true">{{$t('common_521', [templateLabel, this.$t('dictionary.project')]) }}</a-button>
                </template>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item class="mb-0" :label="$t('system.text_205', [$t('dictionary.role')])">
            <a-row :gutter="8">
              <a-col :span="10">
                <a-form-item :wrapperCol="{ span: 24 }" :extra="$t('common_508', [templateLabel,$t('dictionary.user'),$t('dictionary.role'),$t('dictionary.project')])">
                  <base-select
                    v-decorator="decorators.default_role_id"
                    resource="roles"
                    version="v1"
                    :params="roleParams"
                    remote
                    :mapper="roleMapper"
                    :remote-fn="q => ({ filter: `name.contains(${q})` })"
                    :select-props="{ placeholder: $t('rules.role') }" />
                </a-form-item>
              </a-col>
              <a-col :span="14" v-if="isCommon">
                <template v-if="showRoleInput">
                  <a-form-item :wrapperCol="{ span: 24 }">
                    <div class="d-flex align-items-center">
                      <div class="flex-fill mr-1">
                        <a-input v-decorator="decorators.role_attribute" :placeholder="$t('common_509', [templateLabel,$t('dictionary.role'),templateLabel.toLocaleLowerCase()])" />
                      </div>
                      <a-tooltip placement="right">
                        <span slot="title">{{$t('common_522', [templateLabel])}}</span>
                        <icon type="question" />
                      </a-tooltip>
                      <a-button type="link" @click="showRoleInput = !showRoleInput">{{$t('common_518', [templateLabel, this.$t('dictionary.role')])}}</a-button>
                    </div>
                  </a-form-item>
                </template>
                <template v-else>
                  <a-button type="link" @click="showRoleInput = true">{{$t('common_521', [templateLabel, this.$t('dictionary.role')])}}</a-button>
                </template>
              </a-col>
            </a-row>
          </a-form-item>
          <template v-if="isCommon">
            <a-form-item :label="$t('scope.text_245')" :extra="$t('common_510', [templateLabel])">
              <a-input v-decorator="decorators.user_displayname_attribute" />
            </a-form-item>
            <a-form-item :label="$t('scope.text_553')" :extra="$t('common_511', [templateLabel])">
              <a-input v-decorator="decorators.user_email_attribute" />
            </a-form-item>
            <a-form-item :label="$t('scope.text_200')" :extra="$t('common_512', [templateLabel])">
              <a-input v-decorator="decorators.user_mobile_attribute" />
            </a-form-item>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </template>
  </div>
</template>

<script>
export default {
  name: 'IDPEditAdvanced',
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
      isDomain: this.$store.getters.isDomainMode,
      projectDomain: this.$store.getters.userInfo.projectDomain,
      projectDomainId: this.$store.getters.userInfo.projectDomainId,
      scope: this.$store.getters.scope,
      showProjectInput: false,
      showRoleInput: false,
      project: {},
      decorators: {
        auto_create_user: [
          'auto_create_user',
          {
            valuePropName: 'checked',
          },
        ],
        disable_user_on_import: [
          'disable_user_on_import',
          {
            initialValue: false,
          },
        ],
        target_domain: [
          'target_domain',
        ],
        default_project_id: [
          'default_project_id',
        ],
        role_attribute: [
          'role_attribute',
        ],
        project_attribute: [
          'project_attribute',
        ],
        default_role_id: [
          'default_role_id',
        ],
        auto_create_project: [
          'auto_create_project',
        ],
        user_displayname_attribute: [
          'user_displayname_attribute',
        ],
        user_email_attribute: [
          'user_email_attribute',
        ],
        user_mobile_attribute: [
          'user_mobile_attribute',
        ],
        user_id_attribute: [
          'user_id_attribute',
          {
            rules: [
              { required: true, message: this.$t('common_607') },
            ],
          },
        ],
        user_name_attribute: [
          'user_name_attribute',
          {
            rules: [
              { required: true, message: this.$t('common_608') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    projectParams () {
      return {
        limit: 0,
        scope: this.scope,
        project_domains: this.fd.target_domain,
      }
    },
    roleParams () {
      return {
        limit: 0,
        scope: this.scope,
        project_domains: ['default', this.fd.target_domain],
      }
    },
    showCollapse () {
      return this.fd.target_domain || this.isDomain
    },
    templateKey () {
      return this.templateData.key
    },
    templateLabel () {
      return this.templateData.label
    },
  },
  watch: {
    'fd.target_domain' (val) {
      this.fc.resetFields(['default_project_id', 'project_attribute'])
    },
    'fd.template': {
      async handler (val) {
        const attributeInitialValues = {
          cas: {
            user_id_attribute: 'cas:user',
            user_name_attribute: 'cas:user',
          },
          oidc: {
            user_id_attribute: 'name',
            user_name_attribute: 'name',
          },
          saml: {},
        }
        let initialValues = {
          user_id_attribute: undefined,
          user_name_attribute: undefined,
        }
        if (attributeInitialValues[val]) {
          initialValues = {
            ...initialValues,
            ...attributeInitialValues[val],
          }
        }
        await this.$nextTick()
        this.fc.setFieldsValue(initialValues)
      },
      immediate: true,
    },
  },
  methods: {
    roleMapper (list) {
      if (list && list.length > 0) {
        return list.filter(row => {
          if (row.domain_id === 'default') {
            return row.is_public
          }
          return true
        })
      }
      return []
    },
    resTargetDomain (list) {
      const project_domain = this.fc.getFieldValue('project_domain')
      console.log(project_domain)
      this.fc.setFieldsValue({
        target_domain: project_domain,
      })
    },
  },
}
</script>
