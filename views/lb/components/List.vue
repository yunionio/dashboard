<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { validateEnabled, validateDisable } from '../utils'
import { surpportLb } from '@Network/views/lb/constants'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getBrandFilter, getTenantFilter, getDomainFilter, getAccountFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions, disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import { changeToArr } from '@/utils/utils'

export default {
  name: 'LbList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: {
      type: String,
    },
  },
  data () {
    const allBrandsFilter = getBrandFilter()
    const filterOptions = {
      name: getNameFilter(),
      brand: {
        ...allBrandsFilter,
        items: allBrandsFilter.items.filter(val => surpportLb.includes(val.key.toLowerCase())),
      },
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
      cloudaccount: getAccountFilter(),
      region: {
        label: this.$t('dashboard.text_101'),
      },
      zone: {
        label: this.$t('compute.text_270'),
      },
    }
    const { path } = this.$route
    if (path.includes('/cluster')) {
      delete filterOptions.brand
      delete filterOptions.cloudaccount
    }
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'loadbalancers',
        getParams: this.getParam,
        filterOptions,
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
        hiddenColumns: ['metadata', 'account', 'cluster'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_248'), key: 'address' },
          { label: 'VPC', key: 'vpc', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_192'), key: 'charge_type' },
          { label: this.$t('network.text_249'), key: 'loadbalancer_spec' },
          { label: this.$t('dictionary.domain'), key: 'project_domain', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('network.text_43'), key: 'tenant' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_196'), key: 'account', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('common_715'), key: 'user_tags' },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'capability']),
    groupActions () {
      let createBtn = {
        label: this.$t('network.text_26'),
        permission: 'lb_loadbalancers_create',
        action: () => {
          this.$router.push({
            path: '/lb/create',
            query: {
              type: this.cloudEnv,
            },
          })
        },
        meta: () => {
          return {
            buttonType: 'primary',
          }
        },
      }
      if (this.getParams.cluster) {
        createBtn = {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancers_create',
          action: () => {
            this.$router.push({
              path: '/lb/create',
              query: {
                type: 'Onecloud',
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.hasService(this.userInfo, 'lbagent'),
            }
          },
        }
      }
      const actions = [
        createBtn,
        {
          label: this.$t('network.text_200'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, undefined, {
                actions: [
                  (obj) => {
                    const ids = this.list.selectedItems.map(item => item.id)
                    this.onManager('batchPerformAction', {
                      steadyStatus: Object.values(expectStatus.lb).flat(),
                      id: ids,
                      managerArgs: {
                        action: 'status',
                        data: {
                          status: 'enabled',
                        },
                      },
                    })
                  },
                  (obj) => {
                    const ids = this.list.selectedItems.map(item => item.id)
                    this.onManager('batchPerformAction', {
                      steadyStatus: Object.values(expectStatus.lb).flat(),
                      id: ids,
                      managerArgs: {
                        action: 'status',
                        data: {
                          status: 'disabled',
                        },
                      },
                    })
                  },
                ],
                metas: [
                  () => {
                    return validateEnabled(this.list.selectedItems)
                  },
                  () => {
                    return validateDisable(this.list.selectedItems)
                  },
                ],
              }),
              {
                label: this.$t('network.text_253'),
                action: () => {
                  this.createDialog('LbUpdateCluster', {
                    title: this.$t('network.text_253'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const zonsIds = {}
                  const isOneCloud = this.list.selectedItems.every(item => {
                    zonsIds[item.zone_id] = true
                    return item.brand === 'OneCloud'
                  })
                  if (!isOneCloud) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_254'),
                    }
                  }
                  if (Object.keys(zonsIds).length > 1) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_255'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('table.action.set_tag'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'loadbalancer',
                    },
                  })
                },
              },
              disableDeleteAction(this, {
                name: this.$t('dictionary.loadbalancer'),
              }),
              {
                label: this.$t('network.text_131'),
                permission: 'lb_loadbalancers_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('network.text_131'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems)
            return ret
          },
        },
      ]
      return actions
    },
  },
  watch: {
    cloudEnv (val) {
      switch (val) {
        case 'onpremise':
          this.envParams = { is_on_premise: true }
          break
        case 'private':
          this.envParams = { private_cloud: true }
          break
        case 'public':
          this.envParams = { public_cloud: true }
          break
        default:
          this.envParams = {}
      }
      const params = this.list.getParams
      delete params.is_on_premise
      delete params.private_cloud
      delete params.public_cloud
      this.list.getParams = { ...params, ...this.envParams }
      this.list.fetchData()
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    hasService ($userInfo, service) {
      if ($userInfo && $userInfo.services && $userInfo.services.length) {
        const results = $userInfo.services.filter(item => {
          return item.type === service && item.status === true
        })
        return results && results.length > 0
      }
      return false
    },
    hasHypervisors (hypervisor) {
      const hypervisors = changeToArr(hypervisor)
      for (let i = 0, len = hypervisors.length; i < len; i++) {
        if ((this.capability.hypervisors || []).indexOf(hypervisors[i]) !== -1) {
          return true
        }
      }
      return false
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LbSidePage', {
        id: row.id,
        resource: 'loadbalancers',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
