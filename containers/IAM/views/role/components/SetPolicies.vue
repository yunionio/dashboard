<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-form-item :label="$t('dictionary.policy')">
      <list-select
        v-decorator="decorators.policies"
        :listProps="policiesSelectProps"
        :formatter="row => `${row.name} / ${row.description || ''}`"
        :multiple="true"
        :dialog-params="{ mask: false, width: 900, title: $t('common.tips.select', [$t('dictionary.policy')]) }" />
    </a-form-item>
    <a-collapse accordion :border="false">
      <a-collapse-panel key="1" :header="$t('common.adv_config')">
        <a-form-item :label="$t('system.text_328')">
          <template v-slot:extra>
            <div>{{$t('system.text_329')}}</div>
            <div>{{$t('system.text_331')}}</div>
          </template>
          <a-input v-decorator="decorators.ips" />
        </a-form-item>
        <a-form-item :label="$t('res.project')">
          <template v-slot:extra>
            <div>{{$t('system.text_585')}}</div>
          </template>
          <base-select
            v-decorator="decorators.project"
            resource="projects"
            version="v1"
            remote
            :params="projectParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ mode: 'default' }" />
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
  </a-form>
</template>

<script>
import { getNameFilter } from '@/utils/common/tableFilter'
import { REGEXP } from '@/utils/validate'
import ListSelect from '@/sections/ListSelect'

export default {
  name: 'SetPoliciesForm',
  components: {
    ListSelect,
  },
  props: {
    data: {
      type: Array,
    },
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        policies: [
          'policies',
          {
            rules: [
              {
                required: true,
                message: this.$t('common.tips.select', [this.$t('dictionary.policy')]),
              },
            ],
          },
        ],
        ips: [
          'ips',
          {
            rules: [
              {
                validator (rule, value, callback) {
                  if (value && value.length > 0) {
                    const ips = value.split(',')
                    ips.forEach(ip => {
                      if (!REGEXP.cidr.regexp.test(ip)) {
                        return callback(new Error(this.$t('system.text_339', [ip])))
                      }
                    })
                  }
                  callback()
                },
              },
            ],
          },
        ],
        project: [
          'project',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    scopeParams () {
      const scopeParams = {}
      if (!this.data) return scopeParams
      if (this.$store.getters.isAdminMode) {
        scopeParams.project_domain = this.data[0].domain_id
      } else {
        scopeParams.scope = this.$store.getters.scope
      }
      return scopeParams
    },
    projectParams () {
      return { ...this.scopeParams }
    },
    policiesSelectProps () {
      return {
        list: this.$list.createList(this, {
          resource: 'policies',
          apiVersion: 'v1',
          genParamsCb: (params) => {
            const genParams = { ...params, ...this.scopeParams }
            delete genParams.scope
            return genParams
          },
          filterOptions: {
            name: getNameFilter(),
          },
        }),
        columns: [
          {
            field: 'name',
            title: this.$t('table.title.name'),
            showOverflow: 'title',
          },
          {
            field: 'description',
            title: this.$t('table.title.introduction'),
            showOverflow: 'title',
          },
        ],
      }
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('roles', 'v1')
  },
  methods: {
    async set (rid, action = 'repace') {
      try {
        const values = await this.form.fc.validateFields()
        const policies = []
        let ips
        if (values.ips) {
          ips = values.ips.split(',')
        }
        if (values.policies && values.policies.length) {
          for (let i = 0, len = values.policies.length; i < len; i++) {
            const item = {
              policy_id: values.policies[i],
            }
            if (ips) {
              item.ips = ips
            }
            if (values.project) {
              item.project_id = values.project
            }
            policies.push(item)
          }
        }
        const response = await this.manager.performAction({
          id: rid,
          action: 'set-policies',
          data: {
            policies,
            action,
          },
        })
        return response
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
