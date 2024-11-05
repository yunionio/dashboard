<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('monitor.adjust_chart_order')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('monitor.dashboard.title')" :count="params.data.length" :action="$t('monitor.adjust_chart_order')" />
      <dialog-table :data="params.data" :columns="params.columns" />
      <draggable
        handle=".drag-icon"
        chosen-class="chosen"
        v-model="panels">
        <transition-group type="transition" name="flip-list">
          <template v-for="item in panels">
            <a-col :span="12" class="panel-item" :key="item.panel_id">
              <a-icon type="drag" class="drag-icon pr-3" @click.prevent="() => {}" />{{ item.panel_name }}
            </a-col>
          </template>
        </transition-group>
      </draggable>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import draggable from 'vuedraggable'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MonitorDashboardAdjustOrderDialog',
  components: {
    draggable,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this),
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      panels: [...this.params.dashboard.alert_panel_details || []],
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await new this.$Manager('alertdashboards', 'v1').performAction({
          id: this.params.data[0].id,
          action: 'set-panel-order',
          data: {
            order: this.panels.map((item, index) => {
              return {
                panel_id: item.panel_id,
                index: index + 1,
              }
            }),
          },
        })
        this.params.ok(this.panels)
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style scoped>
.panel-item {
  padding: 10px 5px;
}
</style>
