<template>
  <div class="instant-model-import-status">
    <status
      v-if="showStatus && !statusAfterBar"
      :status="status"
      status-module="image"
      :process="progress" />
    <a-progress
      v-if="showProgressBar"
      class="instant-model-import-status__bar"
      :percent="curProcess"
      :show-info="true"
      size="small"
      status="active" />
    <status
      v-if="showStatus && statusAfterBar"
      class="instant-model-import-status__status-after"
      :status="status"
      status-module="image"
      :process="progress" />
  </div>
</template>

<script>
const IMPORT_PROGRESS_STATUSES = ['init', 'packaging', 'saving', 'queued', 'converting']

export default {
  name: 'InstantModelImportStatus',
  props: {
    status: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    showStatus: {
      type: Boolean,
      default: true,
    },
    statusAfterBar: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    curProcess () {
      return Math.ceil(+this.progress * 100) / 100
    },
    showProgressBar () {
      if (!IMPORT_PROGRESS_STATUSES.includes(this.status)) return false
      return this.curProcess < 100
    },
  },
}
</script>

<style scoped lang="less">
.instant-model-import-status {
  width: 100%;

  &__bar {
    width: 140px;
    margin-top: 4px;
    margin-left: 5px;
  }

  &__status-after {
    margin-top: 4px;
  }
}
</style>
