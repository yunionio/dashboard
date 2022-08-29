<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-row class="mt-2">
        <a-col span="4">{{$t('compute.text_1017')}}：</a-col>
        <a-col span="6"><list-body-cell-wrap copy field="vnc_type" :row="form" /></a-col>
      </a-row>
      <a-row class="mt-3">
        <a-col span="4">{{$t('compute.text_386')}}：</a-col>
        <a-col span="6"><list-body-cell-wrap copy field="ip" :row="form" /></a-col>
      </a-row>
      <a-row class="mt-3">
        <a-col span="4">{{$t('compute.text_349')}}：</a-col>
        <a-col span="6"><list-body-cell-wrap copy field="port" :row="form" /></a-col>
      </a-row>
      <a-row class="mt-3">
        <a-col span="4">{{$t('compute.text_340')}}：</a-col>
        <a-col span="6"><list-body-cell-wrap copy field="password" :row="form" /></a-col>
      </a-row>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmVncInfoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.show_vnc_info'),
      form: {
        vnc_type: 'spice',
        ip: '10.127.100.213',
        port: 8090,
        password: 'kqwoeinaf',
      },
    }
  },
  created () {
    this.fetchInfo()
  },
  methods: {
    async fetchInfo () {
      const id = this.params.data[0].id
      try {
        const { data = {} } = await this.params.onManager('getSpecific', {
          id,
          managerArgs: {
            spec: 'vnc',
          },
        })
        this.form.vnc_type = data.protocol || '-'
        this.form.ip = data.host || '-'
        this.form.port = data.port || '-'
        this.form.password = data.password || '-'
      } catch (err) { throw err }
    },
  },
}
</script>
