<template>
  <div style="position: relative;">
    <!-- 1 -->
    <div class="mt-2">基础信息</div>
    <template v-for="(item, index) in unitInfoList">
      <div :key="'unit_info_' + item.key + index" class="detail-item mt-2">
        <div class="detail-item-title">{{item.title}}</div>
        <div class="detail-item-value">{{item.value}}</div>
      </div>
    </template>
    <!-- 2 -->
    <template v-for="(item, index) in projectInfoList">
      <div :key="'project_info_' + item.key + index" class="detail-item mt-2">
        <div class="detail-item-title">{{item.title}}</div>
        <div class="detail-item-value">{{item.value}}</div>
      </div>
    </template>
    <!-- 3 -->
    <template v-for="(item, index) in contractorInfoList">
      <div :key="'contractor_info_' + item.key + index" class="detail-item mt-2">
        <div class="detail-item-title">{{item.title}}</div>
        <div class="detail-item-value">{{item.value}}</div>
      </div>
    </template>
    <!-- 4 -->
    <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.ecs')}}</div>
    <vxe-grid
      ref="ecsTable"
      size="mini"
      border
      :columns="COLUMNS_MAP.ecs"
      :data="listData.ecs" />
    <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.rds')}}</div>
    <vxe-grid
      ref="rdsTable"
      size="mini"
      border
      :columns="COLUMNS_MAP.rds"
      :data="listData.rds" />
    <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.server')}}</div>
    <vxe-grid
      ref="serverTable"
      size="mini"
      border
      :columns="COLUMNS_MAP.server"
      :data="listData.server" />
    <!-- 5 -->
    <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.basic_security_services')}}</div>
    <vxe-grid
      ref="bssTable"
      size="mini"
      border
      :columns="COLUMNS_MAP.basicSecurityServices"
      :data="listData.basicSecurityServices" />
    <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.cloud_security_table')}}</div>
    <vxe-grid
      ref="cstTable"
      size="mini"
      border
      :columns="COLUMNS_MAP.cloudSecurityTable"
      :data="listData.cloudSecurityTable" />
  </div>
</template>

<script>
// import
import { WORKFLOW_ITEM_MAP, INIT_UNIT_INFO, INIT_PROJECT_INFO, INIT_CONTRACTOR_INFO, COLUMNS_MAP, ALL_SELECT_OPTIONS } from '@/views/workflow-apply-internal-resource/constants'
export default {
  name: 'ApplyInternalResourceInfo',
  props: {
    variables: Object,
  },
  data () {
    return {
      COLUMNS_MAP,
    }
  },
  computed: {
    resourceData () {
      const { paramter } = this.variables
      return JSON.parse(paramter)
    },
    unitInfoList () {
      const ret = []
      const keys = Object.keys(INIT_UNIT_INFO)
      const { unitInfo } = this.resourceData
      keys.map(key => {
        const item = { field: key }
        item.title = WORKFLOW_ITEM_MAP[key].label
        item.value = unitInfo[key] || '-'
        ret.push(item)
      })
      return ret
    },
    projectInfoList () {
      const ret = []
      const keys = Object.keys(INIT_PROJECT_INFO)
      const { projectInfo } = this.resourceData
      keys.map(key => {
        const item = { field: key }
        item.title = WORKFLOW_ITEM_MAP[key].label
        item.value = projectInfo[key] || '-'
        if (ALL_SELECT_OPTIONS.hasOwnProperty(key)) {
          const targetList = ALL_SELECT_OPTIONS[key].filter(l => l.id === item.value)
          if (targetList[0]) {
            item.value = targetList[0].name
          }
        }
        ret.push(item)
      })
      return ret
    },
    contractorInfoList () {
      const ret = []
      const keys = Object.keys(INIT_CONTRACTOR_INFO)
      const { contractorInfo } = this.resourceData
      keys.map(key => {
        const item = { field: key }
        item.title = WORKFLOW_ITEM_MAP[key].label
        item.value = contractorInfo[key] || '-'
        ret.push(item)
      })
      return ret
    },
    listData () {
      const { cloudResourceInfo = {}, cloudSecurityInfo = {} } = this.resourceData
      const { ecs = [], rds = [], server = [] } = cloudResourceInfo
      const { basicSecurityServices = [], cloudSecurityTable = [] } = cloudSecurityInfo
      return { ecs, rds, server, basicSecurityServices, cloudSecurityTable }
    },
  },
}
</script>
