<template>
  <page-list
    ref="EXTERNAL"
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions"
    :editConfig="{trigger: 'click', mode: 'row', showIcon: false}"
    :extra-export-params="extraExportParams" />
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getProjectDomainTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import { HYPERVISORS_MAP } from '@/constants'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'ExternalprojectList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
    cloudaccount: Object,
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'externalprojects',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.externalproject).flat(),
        filterOptions: {
          name: {
            label: this.$t('cloudenv.text_386'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          cloudprovider_id: {
            label: this.$t('cloudevent.title.manager'),
            dropdown: true,
            multiple: false,
            distinctField: {
              type: 'extra_field',
              key: 'manager',
            },
          },
          projects: {
            label: this.$t('table.title.local_project'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'extra_field',
              key: 'tenant',
            },
          },
        },
        projectOpts: [],
      }),
      multipleChangeEnable: false,
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_386'), key: 'name' },
          {
            key: 'manager',
            label: this.$t('cloudevent.title.manager'),
          },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.priority'), key: 'priority' },
          {
            label: this.$t('table.title.owner_domain'),
            key: 'project_domain',
          },
          {
            label: this.$t('table.title.local_project'),
            key: 'tenant',
          },
          { label: this.$t('cloudenv.text_103'), key: 'created_at' },
        ],
      },
      extraExportParams: {
        cloudaccount_id: this.cloudaccount?.id,
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'externalprojects_create',
          action: obj => {
            this.createDialog('ExternalProjectCreateDialog', {
              cloudaccount: this.cloudaccount,
              name: this.$t('cloudenv.text_386'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.isAllowCreate,
              tooltip: this.isAllowCreate ? '' : this.$t('cloudenv.brand_action_deny'),
            }
          },
        },
        {
          label: this.$t('cloudenv.text_388'),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ExternalProjectSwitchLocalDialog', {
              data: this.list.selectedItems,
              cloudaccount: this.cloudaccount,
              title: this.$t('cloudenv.text_388'),
              name: this.$t('dictionary.project'),
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length && this.isOwner(),
            }
          },
        },
        {
          label: this.$t('cloudenv.multiple_modify'),
          action: obj => {
            this.multipleChangeEnable = true
          },
          hidden: () => {
            return this.multipleChangeEnable
          },
          meta: () => {
            return {
              validate: this.isOwner(),
            }
          },
        },
        {
          label: this.$t('cloudenv.exit_multiple_modify'),
          action: obj => {
            this.multipleChangeEnable = false
          },
          hidden: () => {
            return !this.multipleChangeEnable
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('cloudenv.text_388'),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ExternalProjectSwitchLocalDialog', {
              data: [obj],
              cloudaccount: this.cloudaccount,
              title: this.$t('cloudenv.text_388'),
              name: this.$t('dictionary.project'),
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.isOwner(),
            }
          },
        },
        {
          label: this.$t('cloudenv.set_priority'),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ExternalProjectSetPriorityDialog', {
              data: [obj],
              cloudaccount: this.cloudaccount,
              title: this.$t('cloudenv.set_priority'),
              name: this.$t('cloudenv.text_386'),
              columns: this.columns,
              onManager: this.onManager,
            })
          },
        },
        {
          label: this.$t('cloudenv.view_record'),
          permission: 'log_list',
          action: obj => {
            this.createDialog('ExternalProjectLogDialog', {
              data: [obj],
            })
          },
        },
      ],
      projectOpts: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
    columns () {
      const projectColumn = {
        field: 'project',
        title: this.$t('table.title.local_project'),
      }
      if (this.multipleChangeEnable) {
        projectColumn.editRender = {
          name: '$select',
          options: this.projectOpts,
          events: { change: this.projectChange },
        }
        projectColumn.slots = {
          default: ({ row }) => {
            let project = row.project
            const filter = this.projectOpts.filter(item => item.value === project)
            if (filter[0]) project = filter[0].label
            return [<span><span>{project} </span> <i class="vxe-icon--edit-outline"></i></span>]
          },
        }
      }
      const ret = [
        getNameDescriptionTableColumn({
          title: this.$t('cloudenv.text_386'),
          onManager: this.onManager,
          hideField: true,
          showDesc: false,
          edit: this.isAllowCreate,
          formRules: [
            { required: true, message: this.$t('cloudenv.text_190') },
            { validator: this.$validate('externalProjectName') },
          ],
          slotCallback: row => {
            return row.name || '-'
          },
        }),
        {
          field: 'manager',
          title: this.$t('cloudevent.title.manager'),
          formatter: ({ row }) => {
            return row.manager || '-'
          },
        },
        getStatusTableColumn({
          statusModule: 'externalproject',
          sortable: false,
          helpTool: {
            isOpen: true,
            title: this.$t('cloudenv.helptool.unavailable.title.tooltip'),
            status: ['unavailable'],
          },
        }),
        getTagTableColumn({
          onManager: this.onManager,
          resource: 'externalprojects',
          columns: () => this.columns,
          tipName: this.$t('cloudenv.text_386'),
        }),
        getProjectDomainTableColumn(),
        projectColumn,
        {
          field: 'priority',
          title: this.$t('cloudenv.priority'),
          sortable: true,
        },
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('cloudenv.text_103'),
        }),
      ]
      return ret
    },
    isAllowCreate () {
      if (this.cloudaccount && [HYPERVISORS_MAP.azure.provider, HYPERVISORS_MAP.qcloud.provider, HYPERVISORS_MAP.aliyun.provider, HYPERVISORS_MAP.huawei.provider, HYPERVISORS_MAP.ksyun.provider].includes(this.cloudaccount.provider)) {
        return true
      }
      return false
    },
  },
  created () {
    this.list.fetchData()
    this.pm = new this.$Manager('projects', 'v1')
    this.fetchProjects()
  },
  methods: {
    isOwner () {
      return this.isAdminMode || (this.cloudaccount && this.cloudaccount.domain_id === this.userInfo.projectDomainId)
    },
    async fetchProjects () {
      if (!this.cloudaccount || !this.cloudaccount.domain_id) return
      const res = await this.pm.list({
        params: {
          scope: this.$store.getters.scope,
          domain_id: this.cloudaccount.domain_id,
          limit: 0,
        },
      })
      const { data: projects = [] } = res.data
      this.projectOpts = projects.map(item => {
        return {
          label: item.name,
          value: item.id,
        }
      })
    },
    async projectChange (data) {
      try {
        await this.onManager('performAction', {
          id: data.row.id,
          steadyStatus: Object.values(expectStatus.externalproject).flat(),
          managerArgs: {
            action: 'change-project',
            data: {
              project: data.row.project,
            },
          },
        })
        this.$message.success(this.$t('cloudenv.modify_success'))
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
