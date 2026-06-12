<template>
  <div>
    <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_virtual_keys" />
    <a-divider orientation="left">{{ $t('aice.aiproxy.endpoint_hint') }}</a-divider>
    <a-alert type="info" show-icon>
      <template slot="message">{{ $t('aice.aiproxy.endpoint_example') }}</template>
      <template slot="description">
        <pre class="mb-0">{{ curlExample }}</pre>
        <copy :message="curlExample" />
      </template>
    </a-alert>
  </div>
</template>

<script>
import { getEnabledTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import { maskSecret } from '@Ai/utils/aiproxyUtils'

export default {
  name: 'AiVirtualKeyDetail',
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        {
          field: 'virtual_key',
          title: this.$t('aice.aiproxy.virtual_key_field'),
          slots: {
            default: ({ row }) => [
              <span>{maskSecret(row.virtual_key)}</span>,
              <copy class="ml-1" message={row.virtual_key} />,
            ],
          },
        },
        { field: 'owner_name', title: this.$t('aice.aiproxy.owner') },
        {
          field: 'limits.max_tokens_per_request',
          title: this.$t('aice.aiproxy.max_tokens_per_request'),
          formatter: ({ row }) => row.limits?.max_tokens_per_request || '-',
        },
        {
          field: 'limits.requests_per_minute',
          title: this.$t('aice.aiproxy.requests_per_minute'),
          formatter: ({ row }) => row.limits?.requests_per_minute || '-',
        },
        {
          field: 'limits.allowed_ai_provider_ids',
          title: this.$t('aice.aiproxy.allowed_ai_provider_ids'),
          formatter: ({ row }) => (row.limits?.allowed_ai_provider_ids || []).join(', ') || '-',
        },
        getProjectTableColumn(),
        getTimeTableColumn(),
      ],
    }
  },
  computed: {
    curlExample () {
      const key = this.data.virtual_key || '<virtual_key>'
      return [
        'curl -X POST \'<endpoint>/openai/v1/chat/completions\' \\',
        '  -H \'Authorization: Bearer ' + key + '\' \\',
        '  -H \'Content-Type: application/json\' \\',
        '  -d \'{"model":"qwen-turbo","messages":[{"role":"user","content":"hello"}]}\'',
      ].join('\n')
    },
  },
}
</script>
