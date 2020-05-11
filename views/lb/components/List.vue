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
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
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
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'loadbalancers',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '服务地址', key: 'address' },
          { label: 'VPC', key: 'vpc' },
          { label: '状态', key: 'status' },
          { label: '计费方式', key: 'charge_type' },
          { label: '类型', key: 'loadbalancer_spec' },
          { label: this.$t('dictionary.domain'), key: 'domain' },
          { label: '项目', key: 'project' },
          { label: '区域', key: 'region' },
          { label: '云账号', key: 'account' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancers_create',
          actions: () => [
            {
              label: 'OneCloud',
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
                  validate: this.hasService(this.userInfo, 'lbagent'),
                }
              },
            },
            {
              label: '阿里云',
              action: () => {
                this.$router.push({
                  path: '/lb/create',
                  query: {
                    type: 'Aliyun',
                  },
                })
              },
              meta: () => {
                return {
                  validate: this.hasHypervisors('aliyun'),
                }
              },
            },
            {
              label: '腾讯云',
              action: () => {
                this.$router.push({
                  path: '/lb/create',
                  query: {
                    type: 'Qcloud',
                  },
                })
              },
              meta: () => {
                return {
                  validate: this.hasHypervisors('qcloud'),
                }
              },
            },
            {
              label: '华为云',
              action: () => {
                this.$router.push({
                  path: '/lb/create',
                  query: {
                    type: 'Huawei',
                  },
                })
              },
              meta: () => {
                return {
                  validate: this.hasHypervisors('huawei'),
                }
              },
            },
            {
              label: 'AWS',
              action: () => {
                this.$router.push({
                  path: '/lb/create',
                  query: {
                    type: 'Aws',
                  },
                })
              },
              meta: () => {
                return {
                  validate: this.hasHypervisors('aws'),
                }
              },
            },
          ],
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'lb_loadbalancers_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: '删除',
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
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'capability']),
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
