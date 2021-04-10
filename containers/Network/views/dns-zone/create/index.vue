<template>
  <div>
    <page-header :title="$t('common_661')" />
    <a-steps class="steps" :current="currentTab">
      <a-step :title="$t('network.text_745')" />
      <a-step :title="$t('network.text_746')" />
    </a-steps>
    <div class="content">
      <step1 ref="step1Ref" v-if="currentTab === 0" />
      <step2 ref="step2Ref" :currentDnsZone="currentDnsZone" v-if="currentTab === 1" />
    </div>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading" @click="nextStep">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="skipStep">{{ currentTab === 0 ? this.$t('dialog.cancel') : this.$t('common.skip')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import Step1 from './components/Step1'
import Step2 from './components/Step2'

export default {
  name: 'DnsZoneCreate',
  components: {
    Step1,
    Step2,
  },
  data () {
    return {
      loading: false,
      currentTab: 0,
      currentDnsZone: null,
    }
  },
  computed: {
    isPublicZone () {
      return this.currentDnsZone && this.currentDnsZone.zone_type === 'PublicZone'
    },
    isPrivateZone () {
      return this.currentDnsZone && this.currentDnsZone.zone_type === 'PrivateZone'
    },
  },
  methods: {
    async validateStep1Form () {
      this.loading = true
      try {
        const { $refs: { step1Ref } } = this
        const values = await step1Ref.form.fc.validateFields()
        const { name, project_domain, zoneType } = values
        const data = {
          name,
          project_domain_id: project_domain,
          zone_type: zoneType,
        }
        const dnsZone = await step1Ref.doCreate(data)
        this.currentDnsZone = dnsZone.data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async validateStep2Form () {
      this.loading = true
      try {
        const { $refs: { step2Ref } } = this
        const { $refs: { vpcRef } } = step2Ref
        const values = await vpcRef.form.fc.validateFields()
        if (this.isPrivateZone) {
          const { vpc } = values
          await vpcRef.doSubmit({ vpc })
        } else if (this.isPublicZone) {
          const newValues = {
            cloudaccount_id: values.account,
          }
          await vpcRef.doSubmit(newValues)
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async nextStep () {
      this.loading = true
      if (this.currentTab === 0) {
        await this.validateStep1Form()
      } else if (this.currentTab === 1) {
        await this.validateStep2Form()
      }
      if (this.currentTab < 1) {
        this.currentTab += 1
      } else {
        this.$router.push('/dns-zone')
      }
      this.loading = false
    },
    skipStep () {
      this.$router.push('/dns-zone')
    },
  },
}
</script>

<style lang="less" scoped>
  .steps {
    max-width: 750px;
    margin: 32px 0;
  }
</style>
