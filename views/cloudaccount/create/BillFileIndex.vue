<template>
  <div>
    <page-header title="更新账单文件" />
    <div style="padding: 7px" />
    <bill-form ref="BILL_FORM" />
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">确 定</a-button>
        <test-button class="mr-3" :post="testPost" />
        <a-button @click="cancel">取 消</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import BillForm from './form/BillForm'
import TestButton from '@/sections/TestButton'
export default {
  name: 'CloudaccountBillFileIndex',
  components: {
    BillForm,
    TestButton,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    cancel () {
      this.$router.push('/cloudaccount')
    },
    testPost () {
      return this.$refs['BILL_FORM'].testPost()
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs['BILL_FORM'].doSubmit()
        this.cancel()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
