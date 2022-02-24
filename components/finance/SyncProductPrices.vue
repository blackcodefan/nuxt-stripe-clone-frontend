<template>
  <div style="position: absolute; right: 16px; top: 16px">
    <b-button variant="info" @click="syncStripe" :disabled="syncnow">
      <b-spinner small type="grow" v-if="syncnow"></b-spinner>
      {{ $t('finance.sync_stripe.text') }}
    </b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      syncnow: false,
    };
  },
  methods: {
    async syncStripe() {
      console.log("syncStripe");
      this.syncnow = true;
      await this.$axios.get("api/sync-prices");
      await this.$axios.get("api/sync-products");
      await this.$store.dispatch("prices/get");
      this.syncnow = false;
    },
  },
};
</script>

<style>
</style>
