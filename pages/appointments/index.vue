<script>
import Multiselect from "vue-multiselect";

import { mapGetters } from "vuex";

export default {
  components: {
    Multiselect,
  },
  head() {
    return {
      title:
        "MijnStalling CRM | " + this.$tc("appointment.appointment.text", 2),
    };
  },
  data() {
    return {
      title: this.$tc("appointment.appointment.text", 2),
      items: [
        {
          text: "Dashboard",
          to: "/",
        },
        {
          text: this.$tc("appointment.appointment.text", 2),
          active: true,
        },
      ],
      selectedStatus: [
        {
          name: "Nog niet verwerkt",
          id: 1,
        },
        {
          name: "Aandacht nodig",
          id: 2,
        },
      ],
      columns: [],
      optionList: [
        {
          name: "Nog niet verwerkt",
          id: 1,
        },
        {
          name: "Aandacht nodig",
          id: 2,
        },
        {
          name: "Verwerkt",
          id: 3,
        },
      ],
      statusValues: [
        {
          name: "Nog niet verwerkt",
          id: 1,
        },
        {
          name: "Aandacht nodig",
          id: 2,
        },
      ],
    };
  },

  computed: {
    ...mapGetters("appointments", ["appointments"]),
    ...mapGetters("filter", {
          filters: "filters"
        })
  },

  mounted() {
    this.columns = [
      {
        field: "object.object_id",
        label: this.$t("object.object_id.text"),
        filterOptions: {
          enabled: true,
          placeholder: this.$t("global.search.text"),
          filterValue: ''
        },
        width: "125px",
        
      },
      {
        field: "warning",
        label: "",
        width: "25px",
        sortable: false
      },
      {
        field: "object.license_plate",
        label: this.$t("object.license_plate.text"),
        filterOptions: {
          enabled: true,
          placeholder: this.$t("global.search.text"),
          filterValue: ''
        },
        width: "150px",
        sortable: false,
        
      },
      {
        field: "object.customer.full_name",
        sortable: false,
        label: this.$t("global.name.text"),
        filterOptions: {
          enabled: true,
          placeholder: this.$t("global.search.text"),
          filterValue: ''
        },
        
      },
      {
        field: "object.spot",
        label: this.$t("object.spot.text"),
        filterOptions: {
          enabled: true,
          placeholder: this.$t("global.search.text"),
          filterValue: ''
        },
        width: "125px",
        
      },
      {
        field: "type.name",
        label: "Type",
        filterOptions: {
          enabled: true,
          placeholder: " ",
          filterDropdownItems: ["Naar buiten", "Naar binnen"],
          filterValue: ''
        },
        sortable: false,
        
      },
      {
        field: "_appointment_at",
        label: this.$t("global.date.text"),
        type: "date",
        dateInputFormat: "dd-MM-yyyy HH:mm",
        dateOutputFormat: "dd-MM-yyyy HH:mm",
        tdClass: "text-left",
        thClass: "text-left",
      },
      {
        field: "status",
        sortable: false,
        label: "Status",
        filterOptions: {
          enabled: true,
          customFilter: true,
          filterValue: ''
        },
        
      },
    ];
  },

  methods: {
    statusFilter(value, id) {
      this.statusValues = value;
    },

    filteredappointments() {
      if (this.statusValues.length == 0) return this.appointments;

      return this.appointments.filter((appo) =>
        this.statusValues.some((val) => val.id == appo.status.id)
      );
    },

    onColumnFilter(params) {                
      for (var key in params.columnFilters) {
        if (params.columnFilters[key] === null || params.columnFilters[key] === undefined || params.columnFilters[key] === "") {
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
      const pageFilters = this.filters.find( filter => filter.path == this.$route.path)
      if(pageFilters)
        this.columns.map( column => {
          if(column.filterOptions)
            column.filterOptions.filterValue = pageFilters.columnFilters[column.field]
          return column;
        })      
      return this.columns;
    }
  },

  created() {
    this.$store.dispatch("appointments/getAppointments");
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
            <h4 class="float-left text-orange">{{ $tc("appointment.appointment.text", 2) }}</h4>
            <div class="float-sm-right">
              <nuxt-link
                to="/appointments/create"
                class="btn btn-success"
              ><i class="mdi mdi-plus-circle mr-2"></i>
                {{ this.$t("appointment.add.text") }}
              </nuxt-link>
            </div>
          </div>

          <div class="card-body">
            <vue-good-table
              :columns="getColumns()"
              :rows="filteredappointments()"
              @on-column-filter="onColumnFilter"
              styleClass="vgt-table"
              :search-options="{
                enabled: true,
                placeholder: $t('global.search.text'),
              }"
              :sort-options="{
                enabled: true,
                initialSortBy: { field: '_appointment_at', type: 'asc' },
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
                <span v-if="props.column.field == 'object.object_id'">
                  <nuxt-link
                    :to="{
                      name: 'appointments-id',
                      params: { id: props.row.uuid },
                    }"
                    >{{ props.row.object.object_id }}</nuxt-link
                  >
                </span>
                <span v-else-if="props.column.field == 'status'">
                  <span :class="props.row.status.class">{{
                    props.row.status.name
                  }}</span>
                </span>
                <span v-else-if="props.column.field == 'warning'">
                  <i
                    v-if="props.row.note"
                    class="mdi mdi-alert-circle-outline text-warning font-weight-bold"
                  ></i>
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
                    :options="optionList"
                    :multiple="true"
                    :close-on-select="true"
                    :clear-on-select="true"
                    :preserve-search="true"
                    :placeholder="$t('global.select.text')"
                    label="name"
                    track-by="name"
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
