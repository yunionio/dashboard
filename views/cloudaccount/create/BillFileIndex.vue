<template>
  <div>
    <page-header :title="$t('cloudenv.text_168')" />
    <div style="padding: 7px" />
    <a-spin :spinning="!isRender">
      <content-info :params="params" v-if="isRender" />
    </a-spin>
    <page-body>
      <bill-form ref="BILL_FORM" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">{{$t('cloudenv.text_169')}}</a-button>
        <test-button class="mr-3" :post="testPost" />
        <a-button @click="cancel">{{$t('cloudenv.text_170')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import BillForm from './form/BillForm'
import ContentInfo from './form/components/ContentInfo'
import TestButton from '@/sections/TestButton'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'CloudaccountBillFileIndex',
  components: {
    BillForm,
    TestButton,
    ContentInfo,
  },
  data () {
    return {
      params: {
        data: [],
      },
      loading: false,
    }
  },
  computed: {
    isRender () {
      return this.params.data.length > 0
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    cancel () {
      this.$router.push('/cloudaccount')
    },
    testPost () {
      return this.$refs.BILL_FORM.testPost()
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.BILL_FORM.doSubmit()
        this.cancel()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    fetchData () {
      const manager = new this.$Manager('cloudaccounts')
      let ids = [this.$route.query.id]
      if (Array.isArray(this.$route.query.id)) {
        ids = this.$route.query.id
      }
      manager.batchGet({ id: ids, params: { $t: getRequestT() } })
        .then((res) => {
          this.params.data = res.data.data
        })
    },
  },
}
</script>
