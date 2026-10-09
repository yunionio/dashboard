import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.vc_view_yaml'),
        permission: 'k8s_vcpodgroups_get',
        action: async obj => {
          const manager = new this.$Manager('vcpodgroups', 'v1')
          const { data } = await manager.getSpecific({ id: obj.id, spec: 'rawdata' })
          this.createDialog('K8SEditYamlDialog', {
            data: [obj],
            manager,
            refresh: this.refresh,
            configText: data,
            readonly: true,
          })
        },
      },
    ]
  },
}
