<template>
  <div>
    <template v-for="(item, idx) of policies">
      <side-page-trigger
        :key="item"
        permission="policies_get"
        name="PolicySidePage"
        :id="item"
        :vm="vm">{{ item }}</side-page-trigger>
      {{ idx !== policies.length - 1 ? '、' : '' }}
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'RoleColumn',
  props: {
    roles: {
      type: Array,
      required: true,
    },
    vm: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      policies: [],
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('roles', 'v1')
    this.getRoles()
  },
  methods: {
    getRoles () {
      let policies = []
      this.roles.map(item => {
        this.manager.get({ id: item.id, query: { $t: getRequestT(), scope: this.$store.getters.scope } }).then(({ data }) => {
          const matchPolicies = data.match_policies
          if (matchPolicies && matchPolicies.length > 0) {
            policies = [...policies, ...matchPolicies]
          }
          policies = R.uniq(policies)
          this.policies = policies
        })
      })
    },
  },
}
</script>
