<template>
  <div class="llm-sku-import-status">
    <template v-if="status === 'importing_model'">
      <status :status="status" status-module="llmSku" class="llm-sku-import-status__sku" />
      <instant-model-import-status
        :key="progressRenderKey"
        class="llm-sku-import-status__progress"
        :status="instantStatus"
        :progress="progress"
        :show-status="true"
        status-after-bar />
    </template>
    <status v-else :status="status" status-module="llmSku" />
  </div>
</template>

<script>
import InstantModelImportStatus from '@Ai/sections/InstantModelImportStatus.vue'
import { fetchInstantModelForSku, POLL_INTERVAL_MS } from '@Ai/utils/instantModelImportPoll'

export default {
  name: 'LlmSkuImportStatus',
  components: {
    InstantModelImportStatus,
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      instantModelId: '',
      instantStatus: 'init',
      progress: 0,
      progressRenderKey: 0,
      pollTimer: null,
      polling: false,
    }
  },
  computed: {
    status () {
      return this.row?.status || ''
    },
  },
  watch: {
    status: {
      immediate: true,
      handler (val) {
        if (val === 'importing_model') {
          this.startPoll()
        } else {
          this.stopPoll()
          this.resetInstantModelCache()
        }
      },
    },
    'row.id' () {
      if (this.status === 'importing_model') {
        this.instantModelId = ''
        this.startPoll()
      }
    },
    row: {
      deep: true,
      handler () {
        if (this.status !== 'importing_model') return
        if (!this.polling) {
          this.startPoll()
        }
      },
    },
  },
  beforeDestroy () {
    this.stopPoll()
  },
  methods: {
    getInstantModelManager () {
      if (!this._instantModelManager) {
        this._instantModelManager = new this.$Manager('llm_instant_models')
      }
      return this._instantModelManager
    },
    resetInstantModelCache () {
      this.instantModelId = ''
      this.instantStatus = 'init'
      this.progress = 0
      this.progressRenderKey = 0
    },
    applyInstantModelSnapshot (im) {
      if (!im) return
      const nextStatus = im.status || 'init'
      const nextProgress = im.progress ?? 0
      if (im.id && im.id !== this.instantModelId) {
        this.instantModelId = im.id
      }
      if (nextStatus !== this.instantStatus || nextProgress !== this.progress) {
        this.instantStatus = nextStatus
        this.progress = nextProgress
        this.progressRenderKey += 1
      }
    },
    async fetchInstantModelProgress () {
      try {
        const im = await fetchInstantModelForSku(
          this.getInstantModelManager(),
          this.row,
          this.$store.getters.scope,
        )
        this.applyInstantModelSnapshot(im)
      } catch (e) {
        // ignore transient/cancelled errors during poll
      }
    },
    scheduleNextPoll () {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
      }
      this.pollTimer = setTimeout(() => {
        this.pollTimer = null
        this.runPollLoop()
      }, POLL_INTERVAL_MS)
    },
    async runPollLoop () {
      if (this.status !== 'importing_model') {
        this.stopPoll()
        return
      }
      this.polling = true
      await this.fetchInstantModelProgress()
      if (this.status === 'importing_model') {
        this.scheduleNextPoll()
      } else {
        this.polling = false
      }
    },
    startPoll () {
      this.stopPoll()
      this.polling = true
      this.runPollLoop()
    },
    stopPoll () {
      this.polling = false
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },
  },
}
</script>

<style scoped lang="less">
.llm-sku-import-status {
  min-width: 0;
  max-width: 100%;

  &__sku {
    margin-bottom: 2px;
  }

  &__progress {
    max-width: 100%;

    ::v-deep .instant-model-import-status {
      max-width: 100%;
    }

    ::v-deep .instant-model-import-status__bar {
      width: 100%;
      max-width: 140px;
      margin-left: 0;
      margin-top: 2px;
    }

    ::v-deep .instant-model-import-status__status-after {
      margin-top: 2px;
    }
  }
}
</style>
