<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body" class="project-dialog-table">
      <components
          :is="component"
          :id="id"
          :show-group-actions="false"
          :getParams="getParams"
          :show-searchbox="false" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <!-- <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button> -->
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProjectResourcesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    component () {
      return this.params.component
    },
    id () {
      return this.params.id
    },
    getParams () {
      return this.params.params
    },
    title () {
      return this.params.title
    },
  },
}
</script>

<style lang="less" scoped>
.project-dialog-table {
  ::v-deep {
    .page-list-grid > .vxe-table > .vxe-table--main-wrapper > .vxe-table--body-wrapper {
      overflow: auto !important;
    }
  }
}
</style>
