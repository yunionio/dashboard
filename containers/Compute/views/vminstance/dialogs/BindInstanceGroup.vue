<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{$t('compute.text_704', [$t('dictionary.instancegroup'), $t('dictionary.instancegroup')])}}</div>
          <div class="mt-2">{{$t('compute.text_707', [$t('dictionary.instancegroup') ])}}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="params.name || $t('dictionary.instancegroup')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <div class="d-flex align-items-center">
        <div class="mr-2">{{ $t('dictionary.instancegroup') }}:</div>
        <div class="flex-fill">
          <a-select
            v-if="instanceGroupsLoaded"
            class="w-100"
            mode="multiple"
            :placeholder="$t('compute.text_702', [$t('dictionary.instancegroup')])"
            :defaultValue="defaultSelected"
            :loading="instanceGroupsLoading"
            :filter-option="false"
            @search="debounceFetchInstanceGroups"
            @change="handleSelectChange">
            <a-select-option
              v-for="item of instanceGroups"
              :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </div>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmBindInstanceGroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_1181', [this.$t('dictionary.instancegroup')]),
      // 获取的主机列表
      instanceGroups: [],
      instanceGroupsLoading: false,
      // 主机列表是否已加载
      instanceGroupsLoaded: false,
      // 已选择的主机
      selectedInstanceGroups: [],
      // 已绑定的主机
      bindedInstanceGroups: [],
      // 默认选择
      defaultSelected: [],
    }
  },
  computed: mapGetters(['scope']),
  created () {
    this.instanceGroupsManager = new this.$Manager('instancegroups', 'v2')
    this.fetchBindedInstanceGroups()
    this.debounceFetchInstanceGroups = debounce(this.fetchInstanceGroups, 300)
  },
  methods: {
    async fetchBindedInstanceGroups () {
      try {
        const { data: { data = [] } } = await this.instanceGroupsManager.list({
          params: {
            scope: this.scope,
            server: this.params.data[0].id,
          },
        })
        this.bindedInstanceGroups = data
        this.defaultSelected = data.map(item => item.id)
        this.fetchInstanceGroups()
      } catch (error) {
        throw error
      }
    },
    async fetchInstanceGroups (query) {
      this.instanceGroupsLoading = true
      const params = {
        enabled: true,
        scope: this.scope,
        project: this.params.data[0].tenant_id,
      }
      if (query) params.filter = `name.contains("${query}")`
      try {
        const { data: { data = [] } } = await this.instanceGroupsManager.list({
          params,
        })
        this.instanceGroups = data
        this.instanceGroupsLoaded = true
      } finally {
        this.instanceGroupsLoading = false
      }
    },
    doUpdateBindInstanceGroups (action, ids) {
      const data = {}
      for (let i = 0, len = ids.length; i < len; i++) {
        data[`group.${i}`] = ids[i]
      }
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action,
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      const unbindIds = this.defaultSelected.filter(item => {
        return !this.selectedInstanceGroups.includes(item)
      }).filter(item => !!item)
      const bindIds = this.selectedInstanceGroups.filter(item => {
        return !this.defaultSelected.includes(item)
      }).filter(item => !!item)
      try {
        if (unbindIds && unbindIds.length) {
          await this.doUpdateBindInstanceGroups('unbind-groups', unbindIds)
        }
        if (bindIds && bindIds.length) {
          await this.doUpdateBindInstanceGroups('bind-groups', bindIds)
        }
        this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    handleSelectChange (val) {
      this.selectedInstanceGroups = val
    },
  },
}
</script>
