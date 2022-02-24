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
    // ...mapGetters("customers", {
    //   customers: "customers",
    // }),
    ...mapState({
      prices: (state) => {
        return state.prices.list;
      },
      tax_rates: (state) => {
        return state.tax_rates.list;
      }
    }),
  },

  head() {
    return {
      title: "MijnStalling CRM | " + this.$t("invoice.add.text"),
    };
  },

  data() {
    return {
      title: this.$t("invoice.add.text"),
      loadingAddinvoice: false,
      customer: {},
      invoice: {
        customer: "",
        due_days: 30,
        products: [
          {
            quantity: 1,
            isOneTime: false,
            tax_rate: false
          }
        ],
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
          text: this.$tc('customer.customer.text', 1),
          to: {name: 'customers-id', params: {id: this.$route.query.customer}},
        },
        {
          text: this.$t("invoice.add.text"),
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
    this.getCustomer();
    this.invoice.customer = this.$route.query.customer;
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
    onIsOneTime(product, index) {
      if (product.isOneTime == true) {
        product.price = "";
      }
    },
    getTotal(product, index) {
      console.log("getTotal product, index", product, index);
      const price = this.prices.find((item) => item.stripe_id == product.price);
      if (price) {
        product.amount = (price.unit_amount * product.quantity).toFixed(2);
        product.currency = price.currency;
        product.description = price.product.name;
        return product.amount / 100;
      } else {
        return 0;
      }
    },
    addInvoice() {
      this.loadingAddinvoice = true;
      this.$store
        .dispatch("invoices/create", this.invoice)
        .then((response) => {
          console.log("response", response);
          this.loadingAddinvoice = false;
          this.$router.push({
            name: "customers-id",
            params: { id: this.$route.query.customer },
          });
        })
        .catch((err) => {
          console.error(err);
          err.response.data.err;
          this.$bvToast.toast(err.response.data.err, {
            title: "Error",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });

          this.loadingAddinvoice = false;
        });
    },
    addProduct() {
      console.log("Add product");
      this.invoice.products.push({
        quantity: 1,
        amount: 0,
        isOneTime: false,
      });
    },
    removeProduct(index) {
      console.log("removeProduct");
      this.invoice.products.splice(index, 1);
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
            <h4 class="text-orange">{{ $t("invoice.add.text") }}</h4>
            <SyncProductPrices />
          </div>
          <div class="card-body">
            <validation-errors
              :errors="validationErrors"
              v-if="validationErrors"
            ></validation-errors>

            <form
              class="form-horizontal"
              role="form"
              @submit.prevent="addInvoice()"
            >
              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $tc("customer.customer.text", 1) }}</h4>
                </div>
                <div class="col-md-10">
                  <p>{{ this.customer.full_name }}</p>
                </div>
              </div>

              <hr />

              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $tc("global.products.text", 2) }}</h4>
                </div>
                <div class="col-md-10">
                  <div class="row">
                    <div class="col-md-1">
                      <label for="input-live">{{
                        $t("global.one_time.text")
                      }}</label>
                    </div>

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
                    <div class="col-md-2">
                      <label for="input-live">{{
                        $t("global.amount.text")
                      }}</label>
                    </div>
                    <div class="col-md-2">
                      <label for="input-live">
                        {{ $t("global.tax.text") }}
                      </label>
                    </div>
                    <div class="col-md-1"></div>
                  </div>
                  <div
                    class="form-group row"
                    v-for="(product, index) in invoice.products"
                    :key="'sp-' + index"
                  >
                    <div class="col-md-1">
                      <b-form-checkbox
                        :id="'checkboxonetime' + index"
                        v-model="product.isOneTime"
                        :placeholder="$t('global.make_a_choice.text')"
                        style="text-align: center; margin-top: 7px"
                        trim
                        @change="onIsOneTime(product)"
                      ></b-form-checkbox>
                    </div>
                    <div class="col-md-4">
                      <b-form-input
                        id="input-live"
                        v-model="product.price"
                        :placeholder="$t('global.make_a_choice.text')"
                        trim
                        type="text"
                        v-if="product.isOneTime == true"
                      ></b-form-input>
                      <model-list-select
                        v-else
                        :list="prices"
                        v-model="product.price"
                        option-value="stripe_id"
                        id="mySelectId"
                        name="mySelectName"
                        :custom-text="priceAndProductNames"
                        :placeholder="$t('global.make_a_choice.text')"
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
                        @keypress="onlyNumber"
                        type="number"
                      ></b-form-input>
                    </div>
                    <div class="col-md-2">
                      <b-form-input
                        id="input-live"
                        v-model="product.amount"
                        :placeholder="$t('global.amount.text')"
                        trim
                        type="number"
                        v-if="product.isOneTime == true"
                      ></b-form-input>
                      <b-form-input
                        id="input-live"
                        :value="getTotal(product)"
                        :placeholder="$t('global.amount.text')"
                        trim
                        v-else
                      ></b-form-input>
                    </div>
                    <div class="col-md-2">
                      <b-form-select
                        v-model="product.tax_rate"
                        :options="tax_rates"
                        value-field="id"
                        text-field="description"
                      ></b-form-select>
                    </div>
                    <div class="col-md-1">
                      <b-button
                        v-if="invoice.products.length == index + 1"
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

              <!-- send invoice block -->
              <!--
              <hr />
              <div class="row">
                <div class="col-md-2">
                  <h4>{{ $t("invoice.send.text") }}</h4>
                </div>
                <div class="col-md-10 mt-1">
                  <div class="row">
                    <div class="col-md-12">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="invoice.start_date"
                          :aria-describedby="ariaDescribedby"
                          name="some-radios"
                          value="A"
                          >{{
                            $t("invoice.send_per_mail_including_link.text")
                          }}</b-form-radio
                        >
                      </b-form-group>
                    </div>
                    <div class="col-md-12">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="invoice.start_date"
                          :aria-describedby="ariaDescribedby"
                          name="some-radios"
                          value="A"
                          >{{
                            $t("invoice.send_per_mail_excluding_link.text")
                          }}</b-form-radio
                        >
                      </b-form-group>
                    </div>
                    <div class="col-md-12">
                      <b-form-group v-slot="{ ariaDescribedby }">
                        <b-form-radio
                          v-model="invoice.start_date"
                          :aria-describedby="ariaDescribedby"
                          name="some-radios"
                          value="A"
                          >{{ $t("invoice.send_manually.text") }}</b-form-radio
                        >
                      </b-form-group>
                    </div>
                  </div>
                </div>
              </div>
              -->
              <!-- send invoice block -->

              <!-- due date block - extra options -->
              <hr />
              <div class="row">
                <div class="col-md-2">
                  <h4>Betaaltermijn dagen</h4>
                </div>
                <div class="col-md-10 mt-1">
                  <div class="row">
                    <div class="col-md-2">
                      <b-form-input
                        id="input-live"
                        v-model="invoice.due_days"
                        placeholder="30"
                        trim
                        type="text"
                      ></b-form-input>
                    </div>
                  </div>
                </div>
              </div>
              <!-- due date block - extra options -->

              <div class="form-group row">
                <label class="col-md-2 col-form-label"></label>
                <div class="col-md-8">
                  <b-button
                    variant="success"
                    type="submit"
                    :disabled="loadingAddinvoice"
                    class="btn btn-success mt-5 w-25"
                  >
                    <b-spinner
                      small
                      type="grow"
                      v-if="loadingAddinvoice"
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
                      params: { id: invoice.uuid },
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
