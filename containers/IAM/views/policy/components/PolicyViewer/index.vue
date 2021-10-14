<template>
  <div>
    <template v-if="!loaded">
      <a-spin />
    </template>
    <template v-else>
      <!-- service -->
      <template v-for="service of options">
        <group :key="service.key" :data="service" :get-tag-color="getTagColor" />
      </template>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { SERVICES_MAP, RESOURCES_MAP, DEFAULT_ACTIONS_KEY } from '../../constants'
import { genPolicyGroups } from '../../utils'
import Group from './Group'

export default {
  name: 'PolicyViewer',
  components: {
    Group,
  },
  props: {
    policy: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loaded: false,
      permission: {},
    }
  },
  computed: {
    options () {
      const options = {}
      R.forEachObjIndexed((value, key) => {
        const policy = value[value.length - 2]
        if (policy !== 'deny') {
          const service = value[0]
          const resource = value[1]
          const action = value[2]

          const serviceOption = SERVICES_MAP[service] || {}
          const resourceOption = RESOURCES_MAP[resource] || {}
          const perform = value[3]
          const performOpt = resourceOption.extras && resourceOption.extras.length && R.find(R.propEq('value', perform))(resourceOption.extras)

          const actionRet = {
            label: performOpt ? performOpt.label : this.$t(`policyDefaultActions.${action}`),
            key: performOpt ? performOpt.value : action,
          }
          // 初始化结构
          if (!options[service]) {
            options[service] = {
              label: serviceOption.i18n ? this.$t(serviceOption.i18n) : serviceOption.label || service,
              key: service,
              children: {
                [resource]: {
                  label: resourceOption.i18n ? this.$t(resourceOption.i18n) : resourceOption.label || resource,
                  key: resource,
                  actions: [actionRet],
                },
              },
            }
          } else {
            // 初始化resource
            if (!options[service].children[resource]) {
              options[service].children[resource] = {
                label: resourceOption.i18n ? this.$t(resourceOption.i18n) : resourceOption.label || resource,
                key: resource,
                actions: [actionRet],
              }
            } else {
              // 如已有相关action，不能重复添加
              const actionOpt = R.find(R.propEq('key', actionRet.key))(options[service].children[resource].actions)
              if (!actionOpt) {
                options[service].children[resource].actions.push(actionRet)
              }
            }
          }
        }
      }, this.permission)
      return options
    },
  },
  created () {
    this.POLICY_GROUPS = genPolicyGroups()
    this.getPermissions()
  },
  methods: {
    async getPermissions () {
      try {
        const bodyData = this.genPermissionsBodyData()
        const response = await this.$http.post(`/v1/auth/permissions?policy=${this.policy.id}`, bodyData)
        const permission = response.data || []
        this.permission = permission
      } catch (error) {
        throw error
      } finally {
        this.loaded = true
      }
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
    getTagColor (key, value) {
      let str = key
      if (value) str += value
      return this.colorHash.rgb(str)
    },
  },
}
</script>
