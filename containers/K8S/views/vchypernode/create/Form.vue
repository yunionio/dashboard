<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_tier')">
        <a-input-number v-decorator="decorators.tier" :min="1" style="width: 200px" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_tier_name')">
        <a-input v-decorator="decorators.tierName" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_members')">
        <div>
          <a-card v-for="(member, index) in members" :key="index" class="mb-3" size="small">
            <a-button v-if="members.length > 1" slot="extra" type="link" @click="removeMember(index)">{{ $t('k8s.vc_remove') }}</a-button>
            <a-form-item :label="$t('k8s.vc_member_type')" v-bind="nestedLayout">
              <a-select v-model="member.type">
                <a-select-option value="Node">Node</a-select-option>
                <a-select-option value="HyperNode">HyperNode</a-select-option>
              </a-select>
            </a-form-item>
            <template v-if="member.type === 'Node'">
              <a-form-item :label="$t('k8s.vc_label_key')" v-bind="nestedLayout">
                <a-input v-model="member.labelKey" placeholder="tor" />
              </a-form-item>
              <a-form-item :label="$t('k8s.vc_label_value')" v-bind="nestedLayout">
                <a-input v-model="member.labelValue" placeholder="tor1" />
              </a-form-item>
            </template>
            <a-form-item v-else :label="$t('k8s.vc_exact_match')" v-bind="nestedLayout">
              <a-input v-model="member.exactMatch" placeholder="s0" />
            </a-form-item>
          </a-card>
          <a-button type="dashed" @click="addMember">{{ $t('k8s.vc_add_member') }}</a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'

function newMember () {
  return {
    type: 'Node',
    labelKey: 'tor',
    labelValue: '',
    exactMatch: '',
  }
}

export default {
  name: 'K8sVchypernodeForm',
  components: {
    ClusterSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      nestedLayout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      members: [newMember()],
      decorators: {
        name: [
          'name',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        tier: [
          'tier',
          {
            initialValue: 1,
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        tierName: [
          'tierName',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
      },
    }
  },
  methods: {
    addMember () {
      this.members.push(newMember())
    },
    removeMember (index) {
      this.members.splice(index, 1)
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    buildPayload (values) {
      const tier = Number(values.tier)
      const tierName = (values.tierName || '').trim()
      const name = (values.name || '').trim()
      if (!Number.isInteger(tier) || tier < 1) {
        this.$message.error(this.$t('k8s.vc_tier_invalid'))
        throw new Error('tier')
      }
      if (!tierName) {
        this.$message.error(this.$t('k8s.vc_tier_name_required'))
        throw new Error('tierName')
      }
      if (!this.members.length) {
        this.$message.error(this.$t('k8s.vc_members_required'))
        throw new Error('members')
      }
      const members = this.members.map(member => {
        if (member.type === 'HyperNode') {
          const exactMatch = (member.exactMatch || '').trim()
          if (!exactMatch) {
            this.$message.error(this.$t('k8s.vc_exact_match_required'))
            throw new Error('exactMatch')
          }
          return { type: 'HyperNode', exactMatch }
        }
        const labelKey = (member.labelKey || '').trim()
        const labelValue = (member.labelValue || '').trim()
        if (!labelKey || !labelValue) {
          this.$message.error(this.$t('k8s.vc_node_label_required'))
          throw new Error('label')
        }
        return { type: 'Node', labelKey, labelValue }
      })
      return {
        name,
        cluster: values.cluster,
        tier,
        tierName,
        members,
      }
    },
    async doCreate () {
      const values = await this.validateForm()
      const data = this.buildPayload(values)
      await new this.$Manager('vchypernodes', 'v1').create({ data })
      this.$message.success(this.$t('k8s.text_46'))
    },
  },
}
</script>
