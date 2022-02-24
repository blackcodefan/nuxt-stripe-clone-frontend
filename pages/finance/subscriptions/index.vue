<script>
import { mapGetters } from "vuex";

export default {
  head() {
    return {
      title: "MijnStalling CRM | " + this.$tc("customer.customer.text", 2),
    };
  },
  data() {
    return {
      title: this.$tc("customer.customer.text", 2),
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("customer.customer.text", 2),
          active: true,
        },
      ],
      columns: [
        {
          field: "full_name",
          sortable: false,
          label: this.$t("global.name.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "email",
          sortable: false,
          label: this.$t("global.email.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "phone",
          sortable: false,
          label: this.$t("global.phone.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "address",
          sortable: false,
          label: this.$t("global.address.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "zipcode",
          sortable: false,
          label: this.$t("global.zipcode.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
      ],
    };
  },

  computed: {
    ...mapGetters("customers", {
      customers: "customers",
    }),
    ...mapGetters("filter", {
      filters: "filters",
    }),
  },

  mounted() {},
  methods: {
    filteredItems() {
      return this.customers;
    },

    onColumnFilter(params) {
      for (var key in params.columnFilters) {
        if (
          params.columnFilters[key] === null ||
          params.columnFilters[key] === undefined ||
          params.columnFilters[key] === ""
        ) {
          delete params.columnFilters[key];
        }
      }
      // check if filter is changed
      const pageFilters = this.filters.find(
        (filter) => filter.path == this.$route.path
      );
      let isChangeFilter = true;
      if(pageFilters)
      {
        isChangeFilter =
          JSON.stringify(
            pageFilters.columnFilters
          ) !== JSON.stringify(params.columnFilters);        
      }
      if (this.$route.path && isChangeFilter) {
        console.log("object path", isChangeFilter);
        this.$store.commit("filter/SET_FILTER", {
          path: this.$route.path,
          columnFilters: JSON.parse(JSON.stringify(params.columnFilters)),
        });
      }
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

  created() {
    this.$store.dispatch("customers/getCustomers");
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
              {{ $tc("customer.customer.text", 2) }}
            </h4>
            <div class="float-sm-right">
              <nuxt-link to="/customers/create" class="btn btn-success"
                ><i class="mdi mdi-plus-circle mr-2"></i>
                {{ $t("global.add_new.text") }}
                {{ $tc("customer.customer.text", 1).toLowerCase() }}</nuxt-link
              >
            </div>
          </div>
          <div class="card-body">
            <vue-good-table
              :columns="getColumns()"
              :rows="filteredItems()"
              @on-column-filter="onColumnFilter"
              styleClass="vgt-table"
              :search-options="{
                enabled: true,
                placeholder: $t('global.search.text'),
              }"
              :pagination-options="{
                enabled: true,
                mode: 'records',
                perPage: 25,
                position: 'bottom',
                perPageDropdown: [25, 50, 75, 100],
                dropdownAllowAll: false,
                setCurrentPage: 1,
                nextLabel: $t('global.next.text'),
                prevLabel: $t('global.previous.text'),
                rowsPerPageLabel: $t('global.per_page.text'),
              }"
            >
              <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'full_name'">
                  <nuxt-link
                    :to="{
                      name: 'customers-id',
                      params: { id: props.row.uuid },
                    }"
                    >{{ props.row.full_name }}</nuxt-link
                  >
                </span>
                <span v-else-if="props.column.field == 'address'">
                  <span>{{ props.row.street }} {{ props.row.number }}</span>
                </span>
                <span v-else-if="props.column.field == 'zipcode'">
                  <span>{{ props.row.zipcode }} {{ props.row.city }}</span>
                </span>
              </template>
            </vue-good-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
