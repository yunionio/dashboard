import { mapGetters } from 'vuex'
import NameRepeated from '@/sections/NameRepeated'

export default {
  props: {
    type: String,
    cloudEnv: String,
  },
  components: {
    NameRepeated,
  },
  data () {
    return {
      formItemLayout: {
        wrapperCol: {
          md: { span: 17 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 7 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo', 'capability']),
  },
  methods: {
    handleCancel () {
      this.$router.push({ name: 'FileSystem' })
    },
  },
}
