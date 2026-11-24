<template>
  <div>
    <a-table
      v-if="rows.length"
      size="small"
      row-key="key"
      :columns="columns"
      :data-source="rows"
      :pagination="false"
      :scroll="{ x: 900 }">
      <template v-slot:ready="text">
        <a-tag :color="text ? 'green' : 'orange'">
          {{ text ? $t('common.true') : $t('common.false') }}
        </a-tag>
      </template>
      <template v-slot:status="text">
        <status v-if="text" :status="text" status-module="llm" />
        <span v-else>-</span>
      </template>
      <template v-slot:host="text, row">
        <side-page-trigger
          v-if="row.host_id"
          permission="hosts_get"
          name="HostSidePage"
          :id="row.host_id"
          :vm="vm">
          {{ text || row.host_id }}
        </side-page-trigger>
        <span v-else>{{ text || '-' }}</span>
      </template>
    </a-table>
    <a-empty v-else :description="$t('aice.llm_deployment.dist_topology.empty')" />
  </div>
</template>

<script>
export default {
  name: 'LlmDeploymentDistTopology',
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
    vm: {
      type: Object,
      default: null,
    },
  },
  computed: {
    rows () {
      const out = []
      ;(this.groups || []).forEach(group => {
        ;(group.members || []).forEach(member => {
          out.push({
            key: `${group.group}-${member.rank}-${member.id || member.name}`,
            group: group.group,
            ready: !!group.ready,
            leader: group.leader,
            rank: member.rank,
            role: member.role,
            name: member.name,
            status: member.status,
            llm_ip: member.llm_ip,
            gpus: member.gpus,
            host: member.host,
            host_id: member.host_id,
          })
        })
      })
      return out
    },
    columns () {
      return [
        { title: this.$t('aice.llm_deployment.dist_topology.group'), dataIndex: 'group', width: 80 },
        { title: this.$t('aice.llm_deployment.dist_topology.ready'), dataIndex: 'ready', width: 80, scopedSlots: { customRender: 'ready' } },
        { title: this.$t('aice.llm_deployment.dist_topology.leader'), dataIndex: 'leader', width: 160, ellipsis: true },
        { title: this.$t('aice.llm_deployment.dist_role'), dataIndex: 'role', width: 100 },
        { title: this.$t('aice.llm_deployment.dist_topology.rank'), dataIndex: 'rank', width: 70 },
        { title: this.$t('common.name'), dataIndex: 'name', minWidth: 160, ellipsis: true },
        { title: this.$t('common.status'), dataIndex: 'status', width: 120, scopedSlots: { customRender: 'status' } },
        { title: 'IP', dataIndex: 'llm_ip', width: 140 },
        { title: this.$t('aice.llm_deployment.dist_topology.gpus'), dataIndex: 'gpus', width: 80 },
        { title: this.$t('dictionary.host'), dataIndex: 'host', width: 160, scopedSlots: { customRender: 'host' } },
      ]
    },
  },
}
</script>
