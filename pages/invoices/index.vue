<script>
import Multiselect from "vue-multiselect";

import { mapGetters, mapState } from "vuex";

export default {
  components: {
    Multiselect,
  },
  head() {
    return {
      title: "MijnStalling CRM | " + this.$tc("invoice.invoice.text", 2),
    };
  },
  data() {
    return {
      loadingInvoices: false,
      currentPage: 1,
      title: this.$tc("invoice.invoice.text", 2),
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("invoice.invoice.text", 2),
          active: true,
        },
      ],
      columns: [],
      statusValues: [
        {
          label: "Open",
          value: "open",
        },
        {
          label: this.$t("invoice.statuses.overdue.text"),
          value: "overdue",
        },
        {
          label: this.$t("invoice.statuses.paid.text"),
          value: "paid",
        },
        {
          label: this.$t("invoice.statuses.void.text"),
          value: "void",
        },
        {
          label: this.$t("invoice.statuses.uncollectible.text"),
          value: "uncollectible",
        },
      ],
      selectedStatus: [
        {
          label: "overdue",
          value: "overdue",
        },
        {
          label: "open",
          value: "open",
        },
      ],
      invoices: [],
      hasInvoiceMore: true,
    };
  },

  computed: {
    ...mapGetters("filter", {
      filters: "filters",
    }),
    ...mapState({
      // invoices: (state) => {
      //   return state.invoices.list;
      // },
    }),
  },

  mounted() {
    this.columns = [
      {
        field: "amount",
        label: this.$t("global.amount.text"),
        sortable: false,
      },
      {
        field: "number",
        label: this.$t("invoice.nr.text"),
        sortable: false,
        filterOptions: {
          enabled: true,
          placeholder: this.$t("global.search.text"),
          filterValue: "",
        },
      },
      {
        field: "due_date",
        label: this.$t("invoice.due.text"),
      },
      {
        field: "customer_name",
        label: this.$tc("customer.customer.text", 1),
        filterOptions: {
          enabled: true,
          placeholder: this.$t("global.search.text"),
          filterValue: "",
        },
      },
      {
        field: "created",
        label: this.$t("global.created_at.text"),
      },
      {
        field: "status",
        label: "Status",
        filterOptions: {
          enabled: true,
          placeholder: " ",
          customFilter: true,
          // filterDropdownItems: [
          //   "Open",
          //   this.$t("invoice.statuses.paid.text"),
          //   this.$t("invoice.statuses.overdue.text"),
          //   this.$t("invoice.statuses.void.text"),
          //   this.$t("invoice.statuses.uncollectible.text"),
          // ],
          filterValue: "",
        },
      },
    ];

    this.getInvoices({ starting_after: 0, currentPage: 1 });
  },

  methods: {
    onPageChange(params) {
      console.log("params", params);
      if (
        this.hasInvoiceMore &&
        params.total <= params.currentPage &&
        this.invoices.length > 1
      ) {
        this.getInvoices({
          starting_after: this.invoices[this.invoices.length - 1].id,
          currentPage: params.currentPage,
        });
      }
    },
    onPerPageChange(params) {
      console.log("params", params);
      if (
        this.hasInvoiceMore &&
        params.total <= params.currentPage &&
        this.invoices.length > 1
      ) {
        this.getInvoices({
          starting_after: this.invoices[this.invoices.length - 1].id,
          currentPage: 1,
        });
      }
    },
    async onRowClick(params) {
      console.log("params", params);
      const url = `/api/customers/by-stripe-id/${params.row.customer}`;
      await this.$axios.get(url).then((res) => {
        console.log("customers/by-stripe-id", res.data);
        if (res.data.result) {
          this.$router.push(`/customers/${res.data.result.uuid}`);
        } else {
          this.$bvToast.toast($t("invoice.customer_not_found.text"), {
            title: "Error",
            variant: "danger",
            autoHideDelay: 5000,
            appendToast: false,
          });
        }
      });
    },
    getInvoices(params) {
      this.loadingInvoices = true;
      this.$store
        .dispatch("invoices/get", {
          customer: this.$route.params.id,
          starting_after: params.starting_after,
        })
        .then((res) => {
          // this.$store.commit("invoices/set", res.data.result.data);
          this.invoices = this.invoices.concat(res.data.result.data);
          this.hasInvoiceMore = res.data.result.has_more;
          this.loadingInvoices = false;
          this.currentPage = params.currentPage;
        })
        .catch((err) => {
          console.error(err);
          this.loadingInvoices = false;
        });
    },
    statusFilter(value, id) {
      this.selectedStatus = value;
    },

    filteredInvoices() {
      console.log("filteredInvoices", this.invoices);
      console.log("statusValues", this.statusValues);
      console.log("selectedStatus", this.selectedStatus);
      if (this.selectedStatus.length == 0) return this.invoices;

      return this.invoices.filter((invoc) =>
        this.selectedStatus.some((item) => {
          if (item.value == "open") {
            return (
              item.value == invoc.status &&
              !(
                invoc.due_date &&
                invoc.due_date < this.$moment(new Date()).unix()
              )
            );
          } else if (item.value == "overdue") {
            return (
              invoc.status == "open" &&
              invoc.due_date &&
              invoc.due_date < this.$moment(new Date()).unix()
            );
          } else {
            return item.value == invoc.status;
          }
        })
      );
    },
    getColumns() {
      const pageFilters = this.filters.find(
        (filter) => filter.path == this.$route.path
      );
      if (pageFilters)
        this.columns.map((column) => {
          if (column.filterOptions)
            column.filterOptions.filterValue =
              pageFilters.columnFilters[column.field];
          return column;
        });
      return this.columns;
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
            <h4 class="float-left text-orange">
              {{ $tc("invoice.invoice.text", 2) }}
            </h4>
          </div>

          <div class="card-body">
            <vue-good-table
              :isLoading="loadingInvoices"
              :columns="getColumns()"
              :rows="filteredInvoices()"
              styleClass="vgt-table"
              :sort-options="{
                enabled: true,
                initialSortBy: { field: 'created', type: 'desc' },
              }"
              :pagination-options="{
                enabled: true,
                mode: 'records',
                perPage: 10,
                position: 'bottom',
                perPageDropdown: [25, 50, 75, 100],
                dropdownAllowAll: false,
                setCurrentPage: currentPage,
                nextLabel: $t('global.next.text'),
                prevLabel: $t('global.previous.text'),
                rowsPerPageLabel: $t('global.per_page.text'),
              }"
              @on-row-click="onRowClick"
              @on-page-change="onPageChange"
              @on-per-page-change="onPerPageChange"
            >
              <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'amount'">
                  {{ props.row.total / 100 }}
                  {{ props.row.currency.toUpperCase() }}
                </span>
                <span v-else-if="props.column.field == 'created'">
                  {{
                    $moment.unix(props.row.created).format("DD-MM-YYYY HH:mm")
                  }}
                </span>
                <span v-else-if="props.column.field == 'due_date'">
                  <template v-if="props.row.due_date">
                    {{
                      $moment
                        .unix(props.row.due_date)
                        .format("DD-MM-YYYY HH:mm")
                    }}
                  </template>
                </span>
                <span v-else-if="props.column.field == 'status'">
                  <b-badge
                    variant="danger"
                    v-if="
                      props.row.status == 'open' &&
                      props.row.due_date &&
                      props.row.due_date < $moment(new Date()).unix()
                    "
                  >
                    {{ $t("invoice.statuses.overdue.text") }}
                  </b-badge>

                  <b-badge
                    variant="info"
                    v-else-if="props.row.status == 'open'"
                  >
                    Open
                  </b-badge>

                  <b-badge
                    variant="success"
                    v-else-if="props.row.status == 'paid'"
                    >{{ $t("invoice.statuses.paid.text") }}</b-badge
                  >
                  <b-badge
                    variant="info"
                    v-else-if="props.row.status == 'draft' && props.row.auto_advance"
                  >{{ $t('invoice.statuses.scheduled.text') }}</b-badge
                  >
                  <b-badge
                    variant="light"
                    v-else-if="props.row.status == 'draft'"
                    >{{ $t('invoice.statuses.draft.text') }}</b-badge
                  >
                  <b-badge v-else-if="props.row.status == 'uncollectible'">{{
                    $t("invoice.statuses.uncollectible.text")
                  }}</b-badge>
                  <b-badge v-else-if="props.row.status == 'void'">{{
                    $t("invoice.statuses.void.text")
                  }}</b-badge>
                  <b-badge v-else>{{ props.row.status }}</b-badge>
                </span>
                <span v-else>
                  {{ props.formattedRow[props.column.field] }}
                </span>
              </template>

              <template slot="column-filter" slot-scope="{ column }">
                <div
                  v-if="
                    column.filterOptions && column.filterOptions.customFilter
                  "
                >
                  <multiselect
                    v-model="selectedStatus"
                    :options="statusValues"
                    :multiple="true"
                    :close-on-select="true"
                    :clear-on-select="true"
                    :preserve-search="true"
                    :placeholder="$t('global.select.text')"
                    label="label"
                    track-by="value"
                    @input="statusFilter"
                    selectLabel="Selecteer"
                    selectedLabel="Geselecteerd"
                    deselectLabel="Verwijder"
                    open-direction="bottom"
                  >
                    <template slot="selection" slot-scope="{ values, isOpen }">
                      <span
                        class="multiselect__single"
                        v-if="values.length &amp;&amp; !isOpen"
                        >{{ values.length }} geselecteerd</span
                      >
                    </template>
                    <template slot="tag">{{ "" }}</template>
                  </multiselect>
                </div>
              </template>
            </vue-good-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>


<style>
.text-left {
  text-align: left;
}
.multiselect--active,
.multiselect__content-wrapper {
  z-index: 20;
}
</style>
