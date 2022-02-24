<script>
import { mapState } from "vuex";
import { ModelListSelect, ListSelect } from "vue-search-select";

export default {
  components: {
    ModelListSelect,
    ListSelect
  },
  head() {
    return {
      title:
        "MijnStalling CRM | " +
        this.$tc("customer.customer.text", 2) +
        " | " +
        this.title,
    };
  },
  data() {
    return {
      items: [
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: this.$tc("customer.customer.text", 2),
          to: { name: "customers" },
        },
        {
          text: this.$tc("customer.customer.text", 1),
          active: true,
        },
      ],
      customer: "",
      isEditing: null,
      appointment_type: ["", "Out", "In"],
      appointment_class: ["", "text-danger", "", "text-success"],
      loadingSubs: false,
      cancellingSub: {},
      loadingInvoices: false,
      invoiceStatus: "paid",
      selectedInvoice: null,
      cancelModal: false,
      // Subscription options
      subCancelAt: "immediate",
      subCancelCustomDate: null,
      selectedSubscription: null,
      // Refund options
      refund: 'no_refund',
      refundItems: [
        {
          label: 'No refund',
          value: 'no_refund'
        },
        {
          label: 'Last payment',
          value: 'last_payment'
        },
        {
          label: 'Prorated amount',
          value: 'prorated_amount'
        }
      ],
      sendRefundReceipt: false,
      recipient: '',
      cancelSubmitting: false
    };
  },
  computed: {
    title() {
      return this.customer.full_name;
    },
    cancelSubscriptionFormInvalid() {
      if (this.cancelSubmitting) return true;
      if (this.subCancelAt === 'custom') return !this.subCancelCustomDate;
      else if(this.subCancelAt === 'immediate') {
        if (this.refund === 'no_refund') return false;
        else {
          if (this.sendRefundReceipt) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.recipient);
          }
          return false;
        }
      }
    },
    refundable() {
      if (this.subCancelAt !== 'immediate') return false;
      let invoice_id = this.selectedSubscription?.subscription.latest_invoice;
      if(invoice_id){
        let invoice = this.$store.state.invoices.list
          .filter((elem) => elem.id === invoice_id)[0];
        return !!(invoice && invoice.paid);
      }else return false;
    },
    sendableRefundReceipt() {
      return this.refund !== 'no_refund';
    },
    ...mapState({
      subscriptions: (state) => {
        return state.subscriptions.list;
      },
      invoices: (state) => {
        return state.invoices.list;
      },
      isCompanyStripeConfigured: (state) => {
        return state.companies.isStripeConfigured;
      },
    }),
  },
  async fetch({ store, params }) {
    // await store.dispatch("customers/isStripeCustomer", params.id);
    // await store.dispatch("companies/isStripeConfigured");
  },
  async asyncData({ params, $axios }) {
    const response = await $axios.get(`api/customers/${params.id}`);
    return { customer: response.data.result };
  },
  mounted() {
    console.log("subscriptions", this.subscriptions);
    console.log("customer", this.customer);
    this.$axios
      .get("api/company/is-stripe-configured")
      .then((response) => {
        this.$store.commit(
          "companies/setIsStripeConfigured",
          response.data.result
        );
        this.getSubscriptions();
        this.getInvoices();
      })
      .catch(() => {
        //context.commit('SET_FAVORITES', null)
      });
    // this.loadingSubs = true;
  },
  methods: {
    getCustomer() {
      this.$axios
        .get("api/customers/" + this.$route.params.id)
        .then((response) => {
          this.customer = response.data.result;
        })
        .catch(() => {});
    },
    makeStripeCustomer() {
      this.$axios
        .post(
          "api/customers/" + this.$route.params.id + "/create-stripe-customer"
        )
        .then((response) => {
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);

          this.$bvToast.toast(err.response.data.err, {
            title: "Error",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });
        });
    },
    deleteCustomer(customer) {
      this.$bvModal
        .msgBoxConfirm(this.$t("global.are_you_sure.text"), {
          cancelTitle: this.$t("global.cancel.text"),
        })
        .then((value) => {
          if (value) {
            this.$store.dispatch("customers/deleteCustomer", customer);
            this.$router.push({ name: "customers" });
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    calculateAmount(sub) {
      let items = [];
      // if (sub.object == "subscription_schedule") {
      //   items = sub.phases[0].items;
      // } else {
      //   }
      items = sub.items.data;

      let amount = 0;

      items.map((item) => {
        let price = {};
        if (sub.object == "subscription_schedule") {
          price = item;
        } else {
          price = item.price;
        }
        amount += (price.unit_amount / 100) * item.quantity;
      });

      let firstPrice = {};
      if (sub.object == "subscription_schedule") {
        firstPrice = items[0];
      } else {
        firstPrice = items[0].price;
      }

      return `${amount.toFixed(2)} ${firstPrice.currency.toUpperCase()} / ${
        firstPrice.recurring.interval
      }`;
    },
    getProducts(sub) {
      let products = sub.products[0].name;

      for (let i = 1; i < sub.products.length; i++) {
        const prod = sub.products[i];
        products += " and " + prod.name;
      }
      return products;
    },
    // Invoice Action
    getInvoices() {
      this.loadingInvoices = true;
      this.$store
        .dispatch("invoices/get", { customer: this.$route.params.id })
        .then((res) => {
          this.$store.commit("invoices/set", res.data.result);
          this.loadingInvoices = false;
        })
        .catch((err) => {
          console.error(err);
          this.loadingInvoices = false;
        });
    },
    openModalInvoiceStatus(invoice, index) {
      this.$bvModal.show("invoice-change-status");
      this.selectedInvoice = { invoice, index };
    },
    changeInvoiceStatus() {
      const { invoice, index } = this.selectedInvoice;
      this.loadingInvoices = true;
      this.$store
        .dispatch("invoices/delete", {
          invoiceId: invoice.id,
          status: this.invoiceStatus,
        })
        .then(async (res) => {
          const invoices = [...this.invoices];
          invoices[index] = res.data.result;

          this.$store.commit("invoices/set", invoices);
          this.loadingInvoices = false;
        })
        .catch((err) => {
          console.error(err);
          this.loadingInvoices = false;
        });
    },
    sendInvoice(invoice, index) {
      this.$store
        .dispatch("invoices/send", invoice.id)
        .then(async (res) => {
          console.log(res);
          this.$bvToast.toast($t("invoice.invoice_send.text"), {
            title: $t("global.success.text"),
            variant: "success",
            autoHideDelay: 5000,
            appendToast: false,
          });
        })
        .catch((err) => {
          this.$bvToast.toast($t("invoice.invoice_send_error.text"), {
            title: $t("global.error.text"),
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });
        });
    },
    // Subscription Action
    getSubscriptions() {
      this.loadingSubs = true;
      this.$store
        .dispatch("subscriptions/get", this.$route.params.id)
        .then((res) => {
          console.log("subscriptions/get res", res);
          this.$store.commit("subscriptions/set", res.data.result);
          this.loadingSubs = false;
        })
        .catch((err) => {
          console.error(err);
          this.loadingSubs = false;
        });
    },
    editSubscription(sub) {},
    openModalCancelSubscription(subscription, index) {
      this.$bvModal.show("cancel-subscription");
      this.recipient = this.customer.email;
      this.selectedSubscription = { subscription, index };
    },
    onCancelPointChange(value) {
      if (value !== 'immediate') {
        this.refund = 'no_refund';
        this.sendRefundReceipt = false;
      }
    },
    onCancelModalHidden() {
      this.subCancelAt = "immediate";
      this.subCancelCustomDate = null;
      this.selectedSubscription = null;
      this.refund = 'no_refund';
      this.sendRefundReceipt = false;
      this.recipient = '';
    },
    async cancelSubscription(event) {
      event.preventDefault();
      const sub = this.selectedSubscription.subscription;

      this.cancellingSub[sub.id] = true;
      this.cancelSubmitting = true;

      this.$store
        .dispatch("subscriptions/cancel", {
          id: sub.id,
          cancel_type: this.subCancelAt,
          cancel_at: this.subCancelCustomDate ? this.$moment(this.subCancelCustomDate).unix() : '',
          refund_policy: this.refund,
          refund_recipient: this.recipient,
          send_refund_receipt: this.sendRefundReceipt,
          type: sub.object
        })
        .then(async (res) => {
          this.cancellingSub[sub.id] = false;
          this.cancelSubmitting = false;
          this.cancelModal = false;
          this.getSubscriptions();
          // const subs = [...this.subscriptions];
          // subs.splice(index, 1);
          // this.$store.commit("subscriptions/set", subs);
        })
        .catch((err) => {
          console.error(err);
          this.cancellingSub[sub.id] = false;
          this.cancelSubmitting = false;
          this.$bvToast.toast(err.response.data.err, {
            title: "Error",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });
        });
    },
    subCancelable(subscription) {
      if (subscription.status === 'canceled') return false;
      else if (subscription.cancel_at) return false;
      else return !subscription.cancel_at_period_end;
    }
  },
  middleware: "router-auth",
};
</script>

<style>
.border-none {
  border: none !important;
}
</style>

<template>
  <div>
    <PageHeader :items="items" />

    <b-modal
      id="invoice-change-status"
      :title="$t('invoice.change_status.text')"
      @ok="changeInvoiceStatus"
    >
      <div>
        <b-form-group
          :label="$t('invoice.mark_as.text')"
          v-slot="{ ariaDescribedby }"
        >
          <b-form-radio
            v-model="invoiceStatus"
            :aria-describedby="ariaDescribedby"
            name="invoice-status"
            value="paid"
            >{{ $t("invoice.status.paid.text") }}
          </b-form-radio>
          <b-form-radio
            v-model="invoiceStatus"
            :aria-describedby="ariaDescribedby"
            name="invoice-status"
            value="void"
            >{{ $t("invoice.status.void.text") }}
          </b-form-radio>
          <b-form-radio
            v-model="invoiceStatus"
            :aria-describedby="ariaDescribedby"
            name="invoice-status"
            value="uncollectible"
            >{{ $t("invoice.status.uncollectible.text") }}
          </b-form-radio>
        </b-form-group>
      </div>
    </b-modal>

    <b-modal
      v-model="cancelModal"
      id="cancel-subscription"
      :title="$t('subscription.cancel.title')"
      @ok="cancelSubscription"
      :ok-disabled="cancelSubscriptionFormInvalid"
      @hidden="onCancelModalHidden"
    >
      <div
        class="row"
        v-if="this.selectedSubscription"
      >
        <div class="col-md-2">
            {{$t('subscription.cancel.cancel_label')}}
          </div>
        <div class="col-md-7">
          <b-form-radio
            v-model="subCancelAt"
            name="cancel_at"
            value="immediate"
          >{{ $t("global.immediately.text") }}
          </b-form-radio>
          <b-form-radio
            v-model="subCancelAt"
            name="cancel_at"
            value="end"
            :disabled="selectedSubscription.subscription.object !== 'subscription'"
            v-on:change="onCancelPointChange"
          >{{ $t("subscription.end_of_period.text") }}
          </b-form-radio>
          <b-form-radio
            v-model="subCancelAt"
            name="cancel_at"
            value="custom"
            :disabled="selectedSubscription.subscription.object !== 'subscription'"
            v-on:change="onCancelPointChange"
          >{{ $t("subscription.select_a_date.text") }}
          </b-form-radio>
          <b-form-datepicker
            id="subscription.start_custom_date-datepicker"
            v-model="subCancelCustomDate"
            class="mt-1"
            :placeholder="$t('subscription.select_a_date.text')"
            v-if="subCancelAt === 'custom'"
          ></b-form-datepicker>
        </div>
      </div>
      <Divider color="#f1f1f1" height="1" space="10"></Divider>
      <div
        class="form-group row"
      >
        <div class="col-md-2">
          Refund
        </div>
        <div class="col-md-5">
          <model-list-select
            :list="refundItems"
            v-model="refund"
            option-value="value"
            option-text="label"
            :isDisabled="!refundable"
          >
          </model-list-select>
          <Divider color="#f1f1f1" height="0" space="10"></Divider>
          <div v-if="sendableRefundReceipt">
            <b-form-checkbox
              v-model="sendRefundReceipt"
              name="send_refund_receipt"
            >{{ $t("subscription.cancel.send_refund_receipt") }}
            </b-form-checkbox>
          </div>
          <Divider color="#f1f1f1" height="0" space="10"></Divider>
          <div v-if="sendRefundReceipt">
            <b-form-input
              v-model="recipient"
              :value="selectedSubscription"
              :placeholder="$t('subscription.cancel.recipient_email')">
            </b-form-input>
          </div>
        </div>
      </div>
    </b-modal>

    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header bg-light">
            <h4 class="float-left text-orange">Klantgegevens</h4>
            <div class="float-sm-right">
              <nuxt-link
                :to="{ name: 'customers-id-edit' }"
                class="btn btn-warning"
                ><i class="mdi mdi-circle-edit-outline mr-2"></i>
                {{ $t("customer.edit.text") }}</nuxt-link
              >
              <span class="btn btn-danger" @click="deleteCustomer(customer)"
                ><i class="mdi mdi-delete-circle-outline mr-2"></i>
                {{ $t("global.delete.text") }}</span
              >
            </div>
            <div class="clear"></div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0">
                <tbody>
                  <tr>
                    <td class="font-weight-bold">
                      {{ $t("global.name.text") }}
                    </td>
                    <td>
                      {{ this.customer.firstname }} {{ this.customer.lastname }}
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">
                      {{ $t("global.email.text") }}
                    </td>
                    <td>
                      {{ this.customer.email }}
                      <a
                        class="badge badge-outline-primary badge-secondary"
                        :href="'mailto:' + this.customer.email"
                        >Stuur email</a
                      >
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">
                      {{ $t("global.phone.text") }}
                    </td>
                    <td>{{ this.customer.phone }}</td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">
                      {{ $t("global.address.text") }}
                    </td>
                    <td>
                      {{ this.customer.street }} {{ this.customer.number }}
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-bold">
                      {{ $t("global.zipcode.text") }} /
                      {{ $t("global.city.text") }}
                    </td>
                    <td>
                      {{ this.customer.zipcode }} {{ this.customer.city }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>
    <!--- end row -->

    <!-- Object card -->
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header bg-light">
            <h4 class="float-left text-orange">
              {{ $tc("object.object.text", 2) }}
            </h4>
            <div class="float-sm-right">
              <nuxt-link
                :to="{
                  name: 'objects-create',
                  query: { customer: customer.uuid },
                }"
                class="btn btn-success"
                ><i class="mdi mdi-plus-circle mr-2"></i>
                {{ $t("object.add.text") }}</nuxt-link
              >
            </div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead class="thead-light">
                  <tr>
                    <th>{{ $t("object.object_id.text") }}</th>
                    <th>{{ $t("object.license_plate.text") }}</th>
                    <th>{{ $t("object.spot.text") }}</th>
                    <th>{{ $t("object.brand.text") }}</th>
                    <th>{{ $t("object.width.text") }}</th>
                    <th>{{ $t("object.length.text") }}</th>
                  </tr>
                </thead>
                <tbody v-if="customer.objects && customer.objects.length">
                  <tr
                    v-for="object in this.customer.objects"
                    :key="object.uuid"
                  >
                    <td>
                      <nuxt-link
                        :to="{
                          name: 'objects-id',
                          params: { id: object.uuid },
                        }"
                        >{{ object.object_id }}</nuxt-link
                      >
                    </td>
                    <td>{{ object.license_plate }}</td>
                    <td>{{ object.spot }}</td>
                    <td>{{ object.brand }}</td>
                    <td>{{ object.width }}</td>
                    <td>{{ object.length }}</td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="6">No objects yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- end table-responsive-->
          </div>
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>

    <!-- Financial overview -->
    <div class="row" v-if="isCompanyStripeConfigured">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header bg-light">
            <h4 class="float-left text-orange">
              {{ $t("finance.finance_overview.text") }}
            </h4>
          </div>
          <div class="card-body" v-if="customer.stripe_id">
            <div>
              <div>
                <h4 class="float-left mb-2 text-orange">
                  {{ $tc("invoice.invoice.text", 2) }}
                </h4>
                <div class="float-sm-right mb-2">
                  <nuxt-link
                    :to="{
                      name: 'finance-invoices-create',
                      query: { customer: customer.uuid },
                    }"
                    class="btn btn-success"
                  >
                    <i class="mdi mdi-plus-circle mr-2"></i>
                    {{ $t("invoice.add.text") }}
                  </nuxt-link>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="thead-light">
                  <tr>
                    <th>{{ $t("global.amount.text") }}</th>
                    <th>{{ $t("invoice.nr.text") }}</th>
                    <th>{{ $t("global.created_at.text") }}</th>
                    <th>Status</th>
                    <th style="text-align: right">
                      {{ $t("global.actions.text") }}
                    </th>
                  </tr>
                  </thead>
                  <tbody v-if="!loadingInvoices">
                  <template v-if="invoices && invoices.length">
                    <tr
                      v-for="(invoice, index) in this.invoices"
                      :key="invoice.number"
                    >
                      <td>
                        <b>
                          {{ invoice.total / 100 }}
                          {{ invoice.currency.toUpperCase() }}
                        </b>
                      </td>
                      <td>{{ invoice.number }}</td>
                      <td>
                        {{
                          $moment
                            .unix(invoice.created)
                            .format("DD-MM-YYYY HH:mm")
                        }}
                      </td>
                      <td>
                        <b-badge
                          variant="danger"
                          v-if="
                              invoice.status == 'open' &&
                              invoice.due_date &&
                              invoice.due_date < $moment(new Date()).unix()
                            "
                        >{{ $t("invoice.statuses.overdue.text") }}</b-badge
                        >
                        <b-badge
                          variant="info"
                          v-else-if="invoice.status == 'open'"
                        >Open</b-badge
                        >
                        <b-badge
                          variant="success"
                          v-else-if="invoice.status == 'paid'"
                        >{{ $t("invoice.statuses.paid.text") }}</b-badge
                        >
                        <b-badge
                          v-else-if="invoice.status == 'uncollectible'"
                        >{{
                            $t("invoice.statuses.uncollectible.text")
                          }}</b-badge
                        >
                        <b-badge v-else-if="invoice.status == 'void'">{{
                            $t("invoice.statuses.void.text")
                          }}</b-badge>
                        <b-badge
                          variant="info"
                          v-else-if="invoice.status == 'draft' && invoice.auto_advance"
                        >
                          {{ $t('invoice.statuses.scheduled.text') }}</b-badge>
                        <b-badge
                          variant="light"
                          v-else-if="invoice.status == 'draft'"
                        >
                          {{ $t('invoice.statuses.draft.text') }}</b-badge>
                        <b-badge v-else>{{ invoice.status }}</b-badge>
                      </td>
                      <td style="text-align: right">
                        <div class="row" style="width: 170px; float: right">
                          <div
                            class="col-md-4 m-0 p-0"
                            style="text-align: center"
                          >
                            <!-- <b-button
                              size="sm"
                              variant="info"
                              v-if="
                                invoice.status == 'open' ||
                                invoice.status == 'draft'
                              "
                              title="Send email with invoice"
                              @click="sendInvoice(invoice, index)"
                            >
                              <b-icon icon="box-arrow-right"></b-icon>
                            </b-button> -->
                          </div>
                          <div
                            class="col-md-4 m-0 p-0"
                            style="text-align: center"
                          >
                            <a target="_blank" :href="invoice.invoice_pdf">
                              <b-button
                                size="sm"
                                variant="primary"
                                title="View invoice"
                              >
                                <b-icon icon="file-earmark-medical"></b-icon>
                              </b-button>
                            </a>
                          </div>
                          <div
                            class="col-md-4 m-0 p-0"
                            style="text-align: center"
                          >
                            <b-dropdown
                              id="dropdown-1"
                              text="..."
                              size="sm"
                              right
                              variant="outline-info"
                            >
                              <!-- payment link -->
                              <b-dropdown-item
                                :href="invoice.hosted_invoice_url"
                                target="_blank"
                              >
                                {{ $t("invoice.payment_link.text") }}
                              </b-dropdown-item>
                              <b-dropdown-divider></b-dropdown-divider>
                              <!-- payment link -->

                              <!-- change invoice status -->
                              <template v-if="invoice.status == 'open'">
                                <b-dropdown-item
                                  @click="
                                      openModalInvoiceStatus(invoice, index)
                                    "
                                >
                                  {{ $t("invoice.change_status.text") }}
                                </b-dropdown-item>
                                <b-dropdown-divider></b-dropdown-divider>
                              </template>
                              <!-- change invoice status -->

                              <!-- send invoice -->
                              <b-dropdown-item
                                v-if="
                                    invoice.status == 'open' ||
                                    invoice.status == 'draft' ||
                                    invoice.status == 'paid'
                                  "
                                @click="sendInvoice(invoice, index)"
                              >
                                {{ $t("global.send.text") }}
                                <span v-if="invoice.status == 'paid'">
                                    {{
                                    $t("invoice.receipt.text").toLowerCase()
                                  }}
                                  </span>
                                <span v-else>{{
                                    $tc("invoice.invoice.text", 1).toLowerCase()
                                  }}</span>
                                (via email)
                              </b-dropdown-item>
                              <!-- send invoice -->
                            </b-dropdown>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="6">{{ $t("invoice.no_invoices.text") }}</td>
                  </tr>
                  </tbody>
                  <tbody v-else>
                  <tr>
                    <td colspan="6" style="text-align: center">
                      <div
                        style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-top: 6px;
                          "
                      >
                        <b-spinner
                          variant="info"
                          label="Spinning"
                        ></b-spinner>
                        <span style="margin-left: 5px">{{
                            $t("global.loading.text")
                          }}</span>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <!-- end table-responsive-->
            </div>
            <div>
              <div class="mt-4">
                <h4 class="float-left mb-2 text-orange">
                  {{ $tc("subscription.subscription.text", 2) }}
                </h4>
                <div class="float-sm-right mb-2">
                  <nuxt-link
                    :to="{
                      name: 'finance-subscriptions-create',
                      query: { customer: customer.uuid },
                    }"
                    class="btn btn-success"
                  ><i class="mdi mdi-plus-circle mr-2"></i
                  >{{ $t("subscription.add.text") }}</nuxt-link
                  >
                </div>
              </div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>{{ $t("global.amount.text") }}</th>
                    <th>{{ $tc("global.products.text", 2) }}</th>
                    <th>{{ $t("global.created_at.text") }}</th>
                    <th>Status</th>
                    <th style="text-align: right">
                      {{ $t("global.actions.text") }}
                    </th>
                  </tr>
                  </thead>
                  <tbody v-if="!loadingSubs">
                  <template v-if="subscriptions && subscriptions.length">
                    <tr v-for="(sub, index) in subscriptions" :key="sub.id">
                      <td>{{ sub.id }}</td>
                      <td>
                        <b>{{ calculateAmount(sub) }}</b>
                      </td>
                      <td>{{ getProducts(sub) }}</td>
                      <td>
                        {{
                          $moment.unix(sub.created).format("DD-MM-YYYY HH:mm")
                        }}
                      </td>
                      <td>
                        <b-badge
                          variant="success"
                          v-if="sub.status === 'active'"
                        >
                          <span v-if="sub.cancel_at_period_end">
                            {{
                            $t("subscription.statuses.cancel_scheduled.text")
                            }}
                          </span>
                          <span v-else-if="sub.cancel_at">
                            {{
                            $t("subscription.statuses.cancel_scheduled.text")
                            }}
                          </span>
                          <span v-else>
                            {{
                            $t("subscription.statuses.active.text")
                            }}
                          </span>
                        </b-badge
                        >
                        <b-badge
                          variant="warning"
                          v-else-if="sub.status == 'past_due'"
                        >{{ sub.status }}</b-badge
                        >
                        <b-badge
                          variant="info"
                          v-else-if="sub.status == 'trialing'"
                        >{{ sub.status }}</b-badge
                        >
                        <b-badge
                          v-else-if="sub.status == 'canceled'"
                        >{{
                            $t("subscription.statuses.canceled.text")
                          }}</b-badge
                        >
                        <b-badge
                          variant="info"
                          v-else-if="sub.status == 'not_started'"
                        >{{
                            $t("subscription.statuses.not_started.text")
                          }}</b-badge
                        >
                        <b-badge v-else>{{ sub.status }}</b-badge>
                      </td>
                      <td style="text-align: right">
                        <NuxtLink
                          :to="'/finance/subscriptions/edit?id=' + sub.id"
                          v-if="sub.status != 'canceled'"
                        >
                          <b-button size="sm" variant="info" class="mr-1">
                            {{ $t("global.edit.text") }}
                          </b-button>
                        </NuxtLink>
                        <b-button
                          size="sm"
                          variant="danger"
                          v-if="subCancelable(sub)"
                          @click="openModalCancelSubscription(sub, index)"
                        >
                          <b-spinner
                            small
                            v-if="cancellingSub[sub.id] == true"
                          ></b-spinner>
                          {{ $t("global.cancel.text") }}
                        </b-button>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="6">
                      {{ $t("subscription.no_subscriptions.text") }}
                    </td>
                  </tr>
                  </tbody>
                  <tbody v-else>
                  <tr>
                    <td colspan="6" style="text-align: center">
                      <div
                        style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-top: 6px;
                          "
                      >
                        <b-spinner
                          variant="info"
                          label="Spinning"
                        ></b-spinner>
                        <span style="margin-left: 5px">{{
                            $t("global.loading.text")
                          }}</span>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <!-- end table-responsive-->
            </div>
          </div>
          <div class="card-body" v-else>
            <button class="btn btn-success" @click="makeStripeCustomer()">
              <i class="mdi mdi-circle-edit-outline mr-2"></i>
              {{ $t("finance.create_in_stripe.text") }}
            </button>
          </div>
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>

    <!-- appointment history -->
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header bg-light">
            <h4 class="float-left text-orange">
              {{ $t("appointment.history.text") }}
            </h4>
          </div>

          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead class="bg-light">
                  <tr>
                    <th>{{ $t("object.object_id.text") }}</th>
                    <th>{{ $t("global.date.text") }}</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody
                  class="border-none"
                  v-for="(object, indexO) of customer.objects"
                  :key="indexO"
                >
                <tr v-if="!object.appointments.length">
                  <td colspan="4">Nog geen afspraken.</td>
                </tr>
                  <tr
                    v-for="(appointment, indexA) of object.appointments"
                    :key="indexA"
                  >
                    <td>
                      <nuxt-link
                        :to="{
                          name: 'objects-id',
                          params: { id: object.uuid },
                        }"
                      >
                        {{ object.object_id }}
                      </nuxt-link>
                    </td>
                    <td>
                      <nuxt-link
                        :to="{
                          name: 'appointments-id',
                          params: { id: appointment.uuid },
                        }"
                        >{{ appointment.appointment_at }}</nuxt-link
                      >
                    </td>
                    <td>{{ appointment.type.name }}</td>
                    <td>
                      <span :class="appointment.status.class">
                        {{ appointment.status.name }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- appointment history -->
    <!-- notes -->
    <Notes :model_id="customer.id" model_type="App\Models\Customer"></Notes>
    <!-- notes -->
  </div>
</template>
