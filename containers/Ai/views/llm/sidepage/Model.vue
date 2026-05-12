<template>
  <div>
    <div v-if="isComfyui" class="mb-2">
      <a-tooltip :title="batchSaveBtnTooltip">
        <span class="d-inline-block">
          <a-button
            type="primary"
            :disabled="!selectedRecords.length"
            @click="handleBatchSaveAsInstantModel">
            {{ $t('aice.save_as_instant_model') }}
          </a-button>
        </span>
      </a-tooltip>
    </div>
    <vxe-grid
      ref="grid"
      resizable
      row-id="id"
      :data="list"
      :columns="columns"
      :checkbox-config="{ highlight: true }"
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxChange" />
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { sizestr } from '@/utils/utils'

export default {
  name: 'LlmModelList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => { },
    },
    resId: String,
    data: Object,
  },
  data () {
    const isComfyui = this.data?.llm_type === 'comfyui'
    return {
      isComfyui,
      list: [],
      selectedRecords: [],
    }
  },
  computed: {
    batchSaveBtnTooltip () {
      return this.selectedRecords.length ? '' : this.$t('aice.save_as_instant_model_disabled_tip')
    },
    columns () {
      const ret = [
        {
          type: 'checkbox',
          width: 44,
          align: 'center',
          showHeaderOverflow: false,
          resizable: false,
        },
        {
          field: 'name',
          title: this.$t('aice.model'),
        },
        {
          field: 'id',
          title: 'ID',
        },
        {
          field: 'tag',
          title: 'Tag',
        },
        {
          field: 'size',
          title: 'Size',
          formatter: ({ row }) => {
            return sizestr(row.size, 'B', 1024)
          },
        },
        {
          field: '_action',
          title: this.$t('table.title._action'),
          slots: {
            default: ({ row }) => {
              return [
                <a-button type="link" size="small" onClick={ () => {
                  this.createDialog('LlmModelSaveInstantModelDialog', {
                    data: [row],
                    resId: this.resId,
                    actionText: this.$t('aice.save_as_instant_model'),
                    success: () => {
                      //
                    },
                  })
                } }>{this.$t('aice.save_as_instant_model')}</a-button>,
              ]
            },
          },
        },
      ]
      if (this.isComfyui) {
        return ret.filter(item => item.field !== '_action')
      }
      return ret
    },
    exportDataOptions () {
      const cols = this.columns.filter(c => c.type !== 'checkbox' && c.field)
      return {
        downloadType: 'local',
        title: this.$t('aice.image'),
        items: [
          { label: 'ID', key: 'id' },
          ...cols,
        ],
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const response = await new this.$Manager(`llms/${this.resId}/probed-models`, 'v2').list({
        params: {
          scope: this.$store.getters.scope,
        },
      })
      const { data } = response
      const keys = Object.keys(data)
      this.list = keys.map(key => {
        return {
          id: data[key].model_id,
          ...data[key],
        }
      })
      this.selectedRecords = []
      this.$nextTick(() => {
        this.$refs.grid && this.$refs.grid.clearCheckboxRow && this.$refs.grid.clearCheckboxRow()
      })
    },
    handleCheckboxChange ({ records }) {
      this.selectedRecords = records
      this.$emit('selection-change', records)
    },
    handleBatchSaveAsInstantModel () {
      if (!this.selectedRecords.length) return
      this.createDialog('LlmModelSaveInstantModelDialog', {
        data: [...this.selectedRecords],
        resId: this.resId,
        actionText: this.$t('aice.save_as_instant_model'),
        isComfyui: this.isComfyui,
        success: () => {
          this.fetchData()
        },
      })
    },
  },
}
</script>

<style>
</style>
