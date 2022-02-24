<script>

import Multiselect from "vue-multiselect";
import { mapGetters } from 'vuex'

export default {
  components: {
    Multiselect,
  },
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$tc('prospect.prospect.text', 2),
        };
    },
    data() {
        return {
            title: this.$tc('prospect.prospect.text', 2),
            items: [{
                    text: 'Dashboard',
                    to: ''
                },
                {
                    text: this.$tc('prospect.prospect.text', 2),
                    active: true
                }
            ],

            columns: []

        };
    },

    computed: {

        ...mapGetters('prospects', {
          prospects: 'prospects'
        }),
        ...mapGetters("filter", {
          filters: "filters"
        }) 

    },

    mounted() {

        //this.object_types = [...new Set(this.prospects.map(prospect => prospect.object_type.name))]

        this.columns = [
          {
              field: 'full_name',
              label: this.$t('global.name.text'),
              filterOptions: {
                enabled: true,
                placeholder: this.$t('global.search.text'),
                filterValue: ''
              }
          },
          {
              field: 'object_type.name',
              label: 'Type',
                filterOptions: {
                  enabled: true,
                   placeholder: ' ',
                   filterValue: '',
                    filterDropdownItems: [
                     'Caravan',
                     'Vouwwagen',
                     'Boot',
                     'Bagagewagen',
                     'Caravan breed',
                     'Vouw caravan',
                     'Camper',
                     'Auto',
                     'Trailer',
                     'Aanhanger'
                    ]
                },
          },
          {
              field: 'length',
              label: this.$t('object.length.text'),
              filterOptions: {
                enabled: true,
                placeholder: this.$t('global.search.text'),
                filterValue: ''
              },
              width: '125px'
          },
          {
              field: 'width',
              label: this.$t('object.width.text'),
              filterOptions: {
                enabled: true,
                filterValue: '',
                placeholder: this.$t('global.search.text')
              },
              width: '125px'
          },
          {
              field: 'delivery_at',
              label: this.$t('prospect.expected_date.text'),
              type: 'date',
              dateInputFormat: 'dd-MM-yyyy',
              dateOutputFormat: 'dd-MM-yyyy',
              tdClass: 'text-left',
              thClass: 'text-left',
          },
          {
              field: 'created_at',
              label: this.$t('global.created_at.text'),
              type: 'date',
              dateInputFormat: 'dd-MM-yyyy',
              dateOutputFormat: 'dd-MM-yyyy',
              tdClass: 'text-left',
              thClass: 'text-left',
          },
          {
              field: 'status',
              label: 'Status',
              filterOptions: {
                enabled: true,
                 placeholder: ' ',
                 filterDropdownItems: ['Nog niet verwerkt', 'Verwerkt'],
                  filterFn: function(data, filterString) {
                    return data.name === filterString
                  }
              },

          }
      ]

    },

    methods: {

        filteredItems() {
          return this.prospects;
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

        this.$store.dispatch('prospects/getProspects')

    },

    middleware: 'router-auth'
};
</script>

<template>
<div>
    <PageHeader :items="items" />

    <div class="row">
        <div class="col-12">
            <div class="card">
              <div class="card-header bg-light">
                <h4 class="text-orange float-left">{{ $tc('prospect.prospect.text', 2) }}</h4>
                <div class="float-sm-right">
                  <nuxt-link :to="{name: 'prospects-create'}" class="btn btn-success"><i class="mdi mdi-plus-circle mr-2"></i> {{ this.$t('prospect.add.text') }} </nuxt-link>
                </div>
              </div>
                <div class="card-body">
                    <vue-good-table
                      :columns="getColumns()"
                      :rows="filteredItems()"
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
                        <span v-if="props.column.field == 'full_name'">
                            <nuxt-link :to="{name: 'prospects-id', params: {id: props.row.uuid }}">{{ props.row.full_name }}</nuxt-link>
                        </span>
                        <span v-else-if="props.column.field == 'status'">
                          <span :class="props.row.status.class">{{ props.row.status.name }}</span>
                        </span>
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
</style>
