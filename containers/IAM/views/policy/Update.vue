<template>
  <div>
    <page-header :title="$t('system.text_188', [$t('dictionary.policy')])" />
    <page-body>
      <template v-if="loading">
        <div class="text-center">
          <a-icon type="loading" />
          <p>{{$t('system.text_318', [$t('dictionary.policy')])}}</p>
        </div>
      </template>
      <template v-else>
        <policy-form
          ref="policyForm"
          is-update
          :policy="policy"
          :permissions="permissions"
          :edit-type="editType"
          :policy-loading="policyLoading"
          @edit-type-change="handleEditTypeChange" />
      </template>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button v-if="!loading" class="mr-3" type="primary" @click="doUpdata" :loading="submiting">{{ $t('common.ok') }}</a-button>
        <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { DEFAULT_ACTIONS_KEY } from './constants'
import { genPolicyGroups } from './utils'
import PolicyForm from './components/Form'

export default {
  name: 'PolicyUpdate',
  components: {
    PolicyForm,
  },
  data () {
    return {
      loading: false,
      policy: {},
      permissions: {},
      submiting: false,
      POLICY_GROUPS: genPolicyGroups(),
      editType: 'yaml',
      policyLoading: false,
    }
  },
  watch: {
    editType () {
      this.$nextTick(() => {
        this.getPolicy().then(policyRes => {
          this.policy = policyRes.data
        })
      })
    },
  },
  created () {
    this.getAll()
  },
  methods: {
    getAll () {
      this.loading = true
      this.getPolicy().then((policyRes) => {
        this.policy = policyRes.data
        this.getPermissions().then(permissionsRes => {
          this.permissions = permissionsRes.data
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    async getPolicy () {
      const params = {}
      if (this.editType === 'yaml') {
        params.format = 'yaml'
      }
      this.policyLoading = true
      try {
        const response = await this.$http.get(`/v1/policies/${this.$route.query.id}`, {
          params,
        })
        this.policyLoading = false
        return response
      } catch (error) {
        throw error
      }
    },
    getPermissions () {
      const bodyData = this.genPermissionsBodyData()
      return this.$http.post(`/v1/auth/permissions?policy=${this.$route.query.id}`, bodyData)
    },
    genPermissionsBodyData () {
      const ret = {}
      const scope = this.policy.scope
      for (let i = 0, len = this.POLICY_GROUPS.length; i < len; i++) {
        const item = this.POLICY_GROUPS[i]
        for (let j = 0, jlen = item.resources.length; j < jlen; j++) {
          const resource = item.resources[j]
          for (let k = 0, klen = DEFAULT_ACTIONS_KEY.length; k < klen; k++) {
            const action = DEFAULT_ACTIONS_KEY[k]
            ret[`${resource.resource}_${action}`] = [scope, item.service, resource.resource, action]
          }
          if (resource.extras && resource.extras) {
            resource.extras.forEach(extras => {
              ret[`${resource.resource}_${extras.action}_${extras.value}`] = [scope, item.service, resource.resource, extras.action, extras.value]
            })
          }
        }
      }
      return ret
    },
    async doUpdata () {
      this.submiting = true
      try {
        const data = await this.$refs.policyForm.getData()
        data.tag_update_policy = 'replace'
        await this.$http.patch(`/v1/auth/policies/${this.policy.id}`, data)
        this.$router.push('/policy')
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    handleCancel () {
      this.$router.push('/policy')
    },
    handleEditTypeChange (type) {
      this.editType = type
    },
  },
}
</script>
