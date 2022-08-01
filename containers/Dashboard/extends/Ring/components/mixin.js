import { chartColors } from '@/constants'

export default {
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    formItemLayout: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    type: String,
  },
  data () {
    return {
      ringColors: [
        {
          key: 'blue',
          percent60: chartColors[0],
          percent80: chartColors[0],
          percent100: chartColors[0],
          label: this.$t('dashboard.color.scheme.blue'),
        },
        {
          key: 'default',
          percent60: chartColors[3],
          percent80: chartColors[1],
          percent100: chartColors[2],
          label: this.$t('dashboard.color.scheme.default'),
        },
        {
          key: 'reverse',
          percent60: chartColors[2],
          percent80: chartColors[1],
          percent100: chartColors[3],
          label: this.$t('dashboard.color.scheme.reverse'),
        },
      ],
    }
  },
  methods: {
    setDefaultName (usage) {
      const usageKey = this.type === 'k8s' ? 'k8s_usage' : 'usage'
      if (!this.form.fc.isFieldTouched(this.decorators.name[0])) {
        this.form.fc.setFieldsValue({
          [this.decorators.name[0]]: this.$t(usageKey)[usage],
        })
      }
    },
  },
}
