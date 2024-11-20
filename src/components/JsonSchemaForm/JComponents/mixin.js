export default {
  props: {
    value: {},
  },
  data () {
    return {
      centos_Generation1_ignore_sku_filters: [
        /^Standard_DC.*v2$/,
        /^Standard_DC.*as_v5$/,
        /^Standard_D.*ps_v5$/,
        /^Standard_EC.*as_v5$/,
        /^Standard_E.*ps_v5$/,
        /^Standard_FX.*mds$/,
        /^Standard_M.*s_v2.*/,
        /^Standard_NC.*ads_A100_v4$/,
        /^Standard_ND.*asr_A100_v4$/,
        /^Standard_ND.*rs_v2$/,
        /^Standard_ND.*amsr_A100_v4$/,
      ],
      centos_Generation2_ignore_sku_filters: [
        /^Standard_A.*v2$/,
        /^Standard_D.*v2$/,
        /^Standard_D.*v3$/,
        /^Standard_E.*v3.*/,
        /^Standard_NC[6,12,24,24r]+$/,
        /^Standard_NV[6,12,24]+$/,
        /^Standard_NP[10,20,40]+s$/,
      ],
    }
  },
  inject: ['scopeParams', 'formFd', 'extendFd'],
  methods: {
    change (...ret) {
      this.$emit('change', ...ret)
    },
  },
}
