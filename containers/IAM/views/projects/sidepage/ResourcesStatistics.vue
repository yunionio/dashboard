<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :on-manager="onManager"
    :extra-info="extraInfo"
    :hiddenKeys="['id', 'name', 'status', 'project_domain', 'tenant', 'created_at', 'updated_at']"
    :showDesc="false" />
</template>

<script>
import { RESOURCES_MAP } from '../../policy/constants'
import { transformLabel } from '../../policy/utils'

const RESOURCES_BASE = {
  servers: {},
  disks: {},
  images: {},
  snapshots: {},
  snapshotpolicies: {},
  secgroups: {},
  networks: {},
  eips: {},
  route_tables: {},
  dnsrecords: {},
  externalprojects: {},
}
const RESOURCES_LOAD = {
  loadbalancers: {},
  loadbalancerlisteners: {},
  loadbalancerlistenerrules: {},
  hosts: {},
  loadbalancerbackendgroups: {},
  loadbalanceracls: {},
  loadbalancercertificates: {},
}

export default {
  name: 'ProjectResourcesStatistics',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {}
  },
  computed: {
    extResources () {
      return this.data.ext_resource ? this.data.ext_resource : {}
    },
    baseInfo () {
      const arr = []
      Object.keys(RESOURCES_BASE).map((key) => {
        arr.push({
          field: key,
          title: transformLabel(RESOURCES_MAP[key]) || key,
          formatter: () => {
            return this.extResources[key] ? this.$t('system.text_459', [this.extResources[key]]) : this.$t('system.text_460')
          },
        })
      })
      return arr
    },
    extraInfo () {
      if (!this.extResources) {
        return null
      }
      const otherRes = {
        title: this.$t('system.text_461'),
        items: (() => {
          const itmes = []
          Object.keys(this.extResources).forEach((key) => {
            if (!RESOURCES_BASE[key] && !RESOURCES_LOAD[key]) {
              itmes.push({
                field: key,
                title: transformLabel(RESOURCES_MAP[key]) || key,
                formatter: () => {
                  return this.extResources[key] ? this.$t('system.text_459', [this.extResources[key]]) : this.$t('system.text_460')
                },
              })
            }
          })
          return itmes
        })(),
      }
      const resItems = [
        {
          title: this.$t('system.text_462'),
          items: Object.keys(RESOURCES_LOAD).map((key) => {
            return {
              field: key,
              title: transformLabel(RESOURCES_MAP[key]) || key,
              formatter: () => {
                return this.extResources[key] ? this.$t('system.text_459', [this.extResources[key]]) : this.$t('system.text_460')
              },
            }
          }),
        },
      ]
      if (otherRes.children && otherRes.children.length > 0) {
        resItems.push(otherRes)
      }
      return resItems
    },
  },
}
</script>
