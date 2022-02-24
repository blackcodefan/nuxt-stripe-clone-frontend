<script>
import { ModelListSelect, ListSelect } from "vue-search-select";
import { mapGetters, mapState } from "vuex";
import SyncProductPrices from "../../../components/finance/SyncProductPrices";

export default {
  components: {
    ModelListSelect,
    ListSelect,
    SyncProductPrices,
  },

  computed: {
    ...mapGetters("customers", {
      customers: "customers",
    }),
    ...mapState({
      prices: (state) => {
        return state.prices.list;
      },
    }),
  },

  head() {
    return {
      title: "MijnStalling CRM | " + this.$t("subscription.edit.text"),
    };
  },

  data() {
    return {
      title: this.$t("subscription.edit.text"),
      loadingEditsub: false,
      loadingSubInfo: false,
      stripeSubscription: {},
      subscription: {
        customer: "",
        end_date: "never",
        start_date: "per_direct",
        products: [{ quantity: 1 }],
        after_x_cycle: 1,
      },
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("subscription.subscription.text", 2),
          to: { name: "customers" },
        },
        {
          text: this.$t("subscription.edit.text"),
          active: true,
        },
      ],
      validationErrors: "",
    };
  },

  async fetch({ store, params }) {
    await store.dispatch("customers/getCustomers");
    await store.dispatch("prices/get");
  },

  mounted() {
    console.log("this.$route", this.$route);
    console.log("this.prices", this.prices);
    // this.subscription.customer = this.$route.query.customer;
    this.getSubscription();
  },

  methods: {
    getSubscription() {
      this.loadingSubInfo = true;
      this.$store
        .dispatch("subscriptions/show", this.$route.query.id)
        .then((response) => {
          console.log("response", response);
          const data = response.data.result;
          this.stripeSubscription = data;

          this.subscription.customer = data.customer_uuid;
          this.subscription.products = [];

          if (data.id.indexOf("sched") != -1) {
            let metadata = data.metadata;
            if (metadata) {
              this.subscription.start_date = metadata.start_date;
              this.subscription.end_date = metadata.end_date;
              this.subscription.after_x_cycle = metadata.after_x_cycle;
              this.subscription.start_custom_date = this.$moment
                .unix(metadata.start_custom_date)
                .toDate();
              this.subscription.end_custom_date = this.$moment
                .unix(metadata.end_custom_date)
                .toDate();
            }
          } else {
            this.subscription.start_date = "per_direct";
            this.subscription.end_date = "never";
          }

          for (let i = 0; i < data.items.data.length; i++) {
            const item = data.items.data[i];
            this.subscription.products.push({
              price: item.price.id,
              quantity: item.quantity,
            });
          }

          this.loadingSubInfo = false;
        })
        .catch((err) => {
          console.error(err);
          this.loadingSubInfo = false;
        });
    },
    priceAndProductNames(item) {
      return `${item.unit_amount / 100} ${item.currency.toUpperCase()} / ${
        item.interval
      } (${item.product.name})`;
    },
    onSelectPrice(selectedPrice) {
      console.log("selectedPrice", selectedPrice);
    },
    getTotal(product, index) {
      console.log("getTotal product, index", product, index);
      const price = this.prices.find((item) => item.stripe_id == product.price);

      if (price) {
        return `${
          (price.unit_amount / 100) * product.quantity
        } ${price.currency.toUpperCase()} / ${price.interval}`;
      } else {
        return "";
      }
    },
    editSubscription() {
      this.loadingEditsub = true;
      this.$store
        .dispatch("subscriptions/update", {
          id: this.$route.query.id,
          customer: this.stripeSubscription.id,
          ...this.subscription,
        })
        .then((response) => {
          console.log("response", response);
          this.loadingEditsub = false;
          // this.$router.push({
          //   name: "customers-id",
          //   params: { id: this.subscription.customer },
          // });
        })
        .catch((err) => {
          console.error(err);
          this.$bvToast.toast(err.response.data.err, {
            title: "Error",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });

          this.loadingEditsub = false;
        });
    },
    addProduct() {
      console.log("Add product");
      this.subscription.products.push({
        quantity: 1,
      });
    },
    removeProduct(index) {
      console.log("removeProduct");
      this.subscription.products.splice(index, 1);
    },
  },
  middleware: "router-auth",
};
</script>

<template>
  <div>
    <PageHeader :items="items" />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-light">
            <h4 class="text-orange">{{ $t("subscription.edit.text") }}</h4>
            <SyncProductPrices />
          </div>
          <div class="card-body">
            <validation-errors
              :errors="validationErrors"
              v-if="validationErrors"
            ></validation-errors>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 6px;
              "
              v-if="loadingSubInfo"
            >
              <b-spinner variant="info" label="Spinning"></b-spinner>
              <span style="margin-left: 5px">Loading ...</span>
            </div>

            <form
              v-else
              class="form-horizontal"
              role="form"
              @submit.prevent="editSubscription()"
            >
              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $tc("customer.customer.text", 1) }}</h4>
                </div>
                <div class="col-md-10">
                  <model-list-select
                    :list="customers"
                    v-model="subscription.customer"
                    option-value="uuid"
                    option-text="full_name"
                    :placeholder="$t('global.search.text')"
                    isDisabled
                  >
                  </model-list-select>
                </div>
              </div>

              <hr />

              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $tc("global.products.text", 2) }}</h4>
                </div>
                <div class="col-md-10">
                  <div class="row">
                    <div class="col-md-4">
                      <label for="input-live">{{
                        $tc("global.products.text", 1)
                      }}</label>
                    </div>
                    <div class="col-md-2">
                      <label for="input-live">{{
                        $t("global.quantity.text")
                      }}</label>
                    </div>
                    <div class="col-md-3">
                      <label for="input-live">{{
                        $t("global.amount.text")
                      }}</label>
                    </div>
                    <div class="col-md-3"></div>
                  </div>
                  <div
                    class="form-group row"
                    v-for="(product, index) in subscription.products"
                    :key="'sp-' + index"
                  >
                    <div class="col-md-4">
                      <model-list-select
                        :list="prices"
                        v-model="product.price"
                        option-value="stripe_id"
                        id="mySelectId"
                        name="mySelectName"
                        :custom-text="priceAndProductNames"
                        :placeholder="$t('global.select.text')"
                        @input="onSelectPrice"
                      >
                      </model-list-select>
                    </div>
                    <div class="col-md-2">
                      <b-form-input
                        id="input-live"
                        v-model="product.quantity"
                        :placeholder="$t('global.quantity.text')"
                        trim
                        type="number"
                      ></b-form-input>
                    </div>
                    <div class="col-md-3">
                      <b-form-input
                        readonly
                        id="input-live"
                        :value="getTotal(product)"
                        :placeholder="$t('global.total.text')"
                        trim
                      ></b-form-input>
                    </div>
                    <div class="col-md-3">
                      <b-button
                        v-if="subscription.products.length == index + 1"
                        variant="success"
                        @click="addProduct"
                      >
                        Extra
                      </b-button>
                      <b-button-close
                        v-else
                        variant="default"
                        @click="removeProduct(index)"
                      >
                      </b-button-close>
                    </div>
                  </div>
                </div>
              </div>

              <hr />
              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $t("subscription.start_date.text") }}</h4>
                </div>
                <div class="col-md-10 mt-1">
                  <div class="row">
                    <div class="col-md-4">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="subscription.start_date"
                          :aria-describedby="ariaDescribedby"
                          name="subscription_start_date"
                          value="per_direct"
                          :disabled="
                            stripeSubscription.id &&
                            stripeSubscription.id.indexOf('sched') != -1
                          "
                          >Per direct</b-form-radio
                        >
                      </b-form-group>
                    </div>
                    <div class="col-md-4">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="subscription.start_date"
                          :aria-describedby="ariaDescribedby"
                          name="subscription_start_date"
                          value="first_day_of_new_month"
                          :disabled="
                            stripeSubscription.id &&
                            stripeSubscription.id.indexOf('sched') != -1
                          "
                          >{{
                            $t("subscription.first_day_new_month.text")
                          }}</b-form-radio
                        >
                      </b-form-group>
                    </div>
                    <div class="col-md-4">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="subscription.start_date"
                          :aria-describedby="ariaDescribedby"
                          name="subscription_start_date"
                          value="custom_date"
                          :disabled="
                            stripeSubscription.id &&
                            stripeSubscription.id.indexOf('sched') != -1
                          "
                          >{{
                            $t("subscription.select_a_date.text")
                          }}</b-form-radio
                        >
                        <b-form-datepicker
                          id="subscription.start_custom_date-datepicker"
                          v-model="subscription.start_custom_date"
                          class="mt-1"
                          :placeholder="$t('subscription.select_a_date.text')"
                          :disabled="
                            stripeSubscription.id.indexOf('sched') != -1
                          "
                          v-if="subscription.start_date == 'custom_date'"
                        ></b-form-datepicker>
                      </b-form-group>
                    </div>
                  </div>
                </div>
              </div>

              <hr />
              <div class="row">
                <div class="col-md-2">
                  <h4>End date</h4>
                </div>
                <div class="col-md-10 mt-1">
                  <div class="row">
                    <div class="col-md-4">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="subscription.end_date"
                          :aria-describedby="ariaDescribedby"
                          name="subscription_end_date"
                          value="never"
                          >{{ $t("global.never.text") }}</b-form-radio
                        >
                      </b-form-group>
                    </div>
                    <div class="col-md-4">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="subscription.end_date"
                          :aria-describedby="ariaDescribedby"
                          name="subscription_end_date"
                          value="after_x_cycle"
                          class="mt-1"
                          >{{
                            $t("subscription.after_x_cycles.text")
                          }}</b-form-radio
                        >

                        <b-form-input
                          v-if="subscription.end_date == 'after_x_cycle'"
                          v-model="subscription.after_x_cycle"
                          type="number"
                          :placeholder="$t('global.enter.text')"
                        ></b-form-input>
                      </b-form-group>
                    </div>
                    <div class="col-md-4">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="subscription.end_date"
                          :aria-describedby="ariaDescribedby"
                          name="subscription_end_date"
                          value="custom_date"
                          >{{
                            $t("subscription.select_a_date.text")
                          }}</b-form-radio
                        >
                        <b-form-datepicker
                          id="subscription.end_custom_date-datepicker"
                          v-model="subscription.end_custom_date"
                          class="mt-1"
                          :placeholder="$t('subscription.select_a_date.text')"
                          v-if="subscription.end_date == 'custom_date'"
                        ></b-form-datepicker>
                      </b-form-group>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group row">
                <label class="col-md-2 col-form-label"></label>
                <div class="col-md-8">
                  <b-button
                    variant="success"
                    type="submit"
                    :disabled="loadingEditsub"
                    class="btn btn-success mt-5 w-25"
                  >
                    <b-spinner
                      small
                      type="grow"
                      v-if="loadingEditsub"
                    ></b-spinner>
                    {{ $t("global.save.text") }}
                  </b-button>
                </div>
              </div>
            </form>

            <b-modal id="successModal" :title="$t('global.success.text')">
              <p>{{ $t("global.add_success.text") }}</p>
              <template #modal-footer>
                <b-button
                  variant="light"
                  @click="$router.push({ name: 'customers' })"
                >
                  {{ $t("global.overview.text") }}
                </b-button>

                <b-button
                  variant="success"
                  @click="
                    $router.push({
                      name: 'customers-id',
                      params: { id: subscription.uuid },
                    })
                  "
                >
                  {{ $t("global.details.text") }}
                </b-button>
              </template>
            </b-modal>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-control[readonly] {
  background-color: white !important;
}
.close {
  float: left !important;
}
</style>
