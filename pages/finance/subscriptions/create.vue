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
    ...mapState({
      prices: (state) => {
        return state.prices.list;
      },
      tax_rates: (state) => {
        return state.tax_rates.list;
      },
    }),
  },

  head() {
    return {
      title: "MijnStalling CRM | " + this.$t("subscription.add.text"),
    };
  },

  data() {
    return {
      title: this.$t("subscription.add.text"),
      loadingAddsub: false,
      customer: {},
      subscription: {
        customer: "",
        end_date: "never",
        start_date: "per_direct",
        products: [{ quantity: 1 }],
        after_x_cycle: 1,
        metadata: {},
        tax_rate: false,
      },
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("customer.customer.text", 2),
          to: { name: "customers" },
        },
        {
          text: this.$tc("customer.customer.text", 1),
          to: {
            name: "customers-id",
            params: { id: this.$route.query.customer },
          },
        },
        {
          text: this.$t("subscription.add.text"),
          active: true,
        },
      ],
      validationErrors: "",
    };
  },

  async fetch({ store, params }) {
    //await store.dispatch("customers/getCustomers");
    await store.dispatch("prices/get");
    await store.dispatch("tax_rates/get");

  },

  mounted() {
    //console.log("this.$route", this.$route);
    //console.log("this.prices", this.prices);
    this.subscription.customer = this.$route.query.customer;
    this.getCustomer();
  },

  methods: {
    onlyNumber(event) {
      let keyCode = event.keyCode;
      if (keyCode < 48 || keyCode > 57) {
        event.preventDefault();
      }
    },
    getCustomer() {
      this.$axios
        .get("api/customers/" + this.$route.query.customer)
        .then((response) => {
          this.customer = response.data.result;
          console.log("Customer");
          console.log(this.customer);
        })
        .catch(() => {});
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
          ((price.unit_amount / 100) * product.quantity).toFixed(2)
        } ${price.currency.toUpperCase()} / ${price.interval}`;
      } else {
        return "";
      }
    },
    addSubscription() {
      //console.log("this.subscription", this.subscription);
      let subData = { ...this.subscription };

      this.loadingAddsub = true;
      if (subData.start_date == "first_day_of_new_month") {
        subData.start_custom_date = this.$moment()
          .add(1, "months")
          .startOf("month")
          .unix();
      } else if (subData.start_date == "custom_date") {
        subData.start_custom_date = this.$moment(
          subData.start_custom_date
        ).unix();
      }

      if (subData.end_date == "custom_date") {
        subData.end_custom_date = this.$moment(subData.end_custom_date).unix();
      }

      this.$store
        .dispatch("subscriptions/create", subData)
        .then((response) => {
          //console.log("response", response);
          this.loadingAddsub = false;
          this.$router.push({
            name: "customers-id",
            params: { id: this.$route.query.customer },
          });
        })
        .catch((err) => {
          console.error(err);
          this.$bvToast.toast(err.response.data.err, {
            title: "Error",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });

          this.loadingAddsub = false;
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
            <h4 class="text-orange">{{ $t("subscription.add.text") }}</h4>
            <sync-product-prices />
          </div>
          <div class="card-body">
            <validation-errors
              :errors="validationErrors"
              v-if="validationErrors"
            ></validation-errors>

            <form
              class="form-horizontal"
              role="form"
              @submit.prevent="addSubscription()"
            >
              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $tc("customer.customer.text", 1) }}</h4>
                </div>
                <div class="col-md-10">
                  {{ this.customer.full_name }}
                </div>
              </div>

              <hr />

              <div class="row">
                <div class="col-md-2">
                  <h4>Selecteer object</h4>
                </div>
                <div class="col-md-10">
                  <table>
                    <tr
                      v-for="object in this.customer.objects"
                      :key="object.uuid"
                    >
                      <td>
                        <b-form-radio
                          v-model="subscription.metadata.object_uuid"
                          :value="object.uuid"
                        >
                          {{ object.object_type.name }}: {{ object.brand }}
                          {{ object.license_plate }} |
                          {{ $t("object.length.text") }}: {{ object.length }} |
                          {{ $t("object.width.text") }}: {{ object.width }}
                        </b-form-radio>
                      </td>
                    </tr>
                  </table>
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
                        @keypress="onlyNumber"
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
                  <h4>Extra instellingen</h4>
                </div>

                <div class="col-md-2">
                  {{ $t("global.tax.text") }}
                  <b-form-select
                    v-model="subscription.tax_rate"
                    :options="tax_rates"
                    value-field="id"
                    text-field="description"
                  ></b-form-select>
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
                          >{{
                            $t("subscription.select_a_date.text")
                          }}</b-form-radio
                        >
                        <b-form-datepicker
                          id="subscription.start_custom_date-datepicker"
                          v-model="subscription.start_custom_date"
                          class="mt-1"
                          :placeholder="$t('subscription.select_a_date.text')"
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
                  <h4>{{ $t("subscription.end_date.text") }}</h4>
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
                    :disabled="loadingAddsub"
                    class="btn btn-success mt-5 w-25"
                  >
                    <b-spinner
                      small
                      type="grow"
                      v-if="loadingAddsub"
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
