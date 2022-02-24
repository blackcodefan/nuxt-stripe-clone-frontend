<script>
import { mapGetters } from "vuex";
import Multiselect from "vue-multiselect";

export default {
  components: {
    Multiselect,
  },

  head() {
    return {
      title: "MijnStalling CRM | " + this.$tc("object.object.text", 2),
    };
  },

  data() {
    return {
      title: this.$tc("object.object.text", 2),
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("object.object.text", 2),
          active: true,
        },
      ],
      selectedStatus: [],
      statusValues: [],
      statuses: [
        { value: null, text: this.$t("global.unknown.text") },
        { value: 2, text: this.$t("object.in.text") },
        { value: 1, text: this.$t("object.out.text") },
      ],
      columns: [
        {
          field: "object_id",
          label: this.$t("object.object_id.text"),
          sortable: true,
          sortFn: this.sortFn,
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "license_plate",
          sortable: false,
          label: this.$t("object.license_plate.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "spot",
          sortable: true,
          label: this.$t("object.spot.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "customer.full_name",
          sortable: false,
          label: this.$t("global.name.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "object_type.name",
          sortable: false,
          label: "Object",
          filterOptions: {
            enabled: true,
            placeholder: " ",
            filterDropdownItems: [""],
            filterValue: "",
          },
        },
        {
          field: "brand",
          sortable: false,
          label: this.$t("object.brand.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
        },
        {
          field: "width",
          sortable: true,
          label: this.$t("object.width.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
          width: "100px",
        },
        {
          field: "length",
          sortable: true,
          label: this.$t("object.length.text"),
          filterOptions: {
            enabled: true,
            placeholder: this.$t("global.search.text"),
            filterValue: "",
          },
          width: "100px",
        },
        {
          field: "status.name",
          sortable: false,
          label: "Status",
          filterOptions: {
            enabled: true,
            placeholder: " ",
            filterDropdownItems: ["Binnen", "Buiten", "Onbekend"],
            filterValue: "",
          },
        },
      ],
    };
  },

  computed: {
    ...mapGetters("objects", {
      objects: "objects",
    }),
    ...mapGetters("filter", {
      filters: "filters",
    }),
  },

  mounted() {

  },

  methods: {
    statusFilter(value, id) {
      console.log("statusFilter", value, id);
      this.statusValues = value;
    },

    filteredObjects() {
      if (this.statusValues.length == 0) return this.objects;
      return this.objects.filter((obj) =>
        this.statusValues.some((val) => val.value == obj.status)
      );
    },

    sortFn(x, y, col, rowX, rowY) {
      return parseInt(x) > parseInt(y) ? 1 : parseInt(x) < parseInt(y) ? -1 : 0;
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
      let objectFilterDropdownItems = [];
      for (let i = 0; i < this.objects.length; i++) {
        if (
          this.objects[i].object_type &&
          !objectFilterDropdownItems.includes(this.objects[i].object_type.name)
        ) {
          objectFilterDropdownItems.push(this.objects[i].object_type.name);
        }
      }
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
      this.columns.map((el) => {
        if (el.field == "object_type.name")
          el.filterOptions.filterDropdownItems = objectFilterDropdownItems;
        return el;
      });
      return this.columns;
    },
  },

  created() {
    this.$store.dispatch("objects/getObjects");
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
            <h4 class="float-left text-orange">Objecten</h4>
            <div class="float-sm-right">
              <nuxt-link
                :to="{ name: 'objects-create' }"
                class="btn btn-success"
              >
                <i class="mdi mdi-plus-circle mr-2"></i>
                {{ this.$t("object.add.text") }}
              </nuxt-link>
            </div>
          </div>
          <div class="card-body">
            <vue-good-table
              :columns="getColumns()"
              :rows="filteredObjects()"
              styleClass="vgt-table"
              @on-column-filter="onColumnFilter"
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
                <span v-if="props.column.field == 'object_id'">
                  <nuxt-link
                    :to="{ name: 'objects-id', params: { id: props.row.uuid } }"
                    >{{ props.row.object_id }}</nuxt-link
                  >
                </span>
              </template>
            </vue-good-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
