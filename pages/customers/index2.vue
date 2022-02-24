<script>

import { mapGetters } from 'vuex'

export default {
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$tc('customer.customer.text', 2),
        };
    },
    data() {
        return {
            title: this.$tc('customer.customer.text', 2),
            items: [{
                    text: "Dashboard",
                    to: "/"
                },
                {
                    text: this.$tc('customer.customer.text', 2),
                    active: true
                }
            ],

            totalRows: 1,
            currentPage: 1,
            perPage: 25,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: 'age',
            sortDesc: false,
            fields: [
                {
                    key: 'full_name',
                    sortable: true,
                    label: this.$t('global.name.text')
                },
                {
                    key: 'email',
                    sortable: true,
                    label: this.$t('global.email.text')
                },
                {
                    key: 'phone',
                    sortable: true,
                    label: this.$t('global.phone.text')
                },
                {
                    key: 'address',
                    sortable: true,
                    label: this.$t('global.address.text')
                },
                {
                    key: 'zipcode',
                    sortable: true,
                    label: this.$t('global.zipcode.text')
                },
            ]

        };
    },

    computed: {

        ...mapGetters('customers', {
          customers: 'customers'
        }),

        rows() {
            return this.customers.length
        },

    },

    mounted() {

        this.totalRows = this.customers.length
    },
    methods: {

        /**
         * Search the table data with search input
         */
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

    },

    created() {
        this.$store.dispatch('customers/getCustomers')
    },

    middleware: 'router-auth'
};
</script>

<template>
<div>
    <PageHeader :title="title" :items="items" />

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">

                    <div class="row mb-2">
                        <div class="col-sm-12">
                            <div class="float-sm-right">
                                <nuxt-link to="/customers/create" class="btn btn-success mb-2"><i class="mdi mdi-plus-circle mr-2"></i> {{ $t('global.add_new.text') }} {{ $tc('customer.customer.text', 1).toLowerCase() }}</nuxt-link>
                            </div>
                        </div><!-- end col-->
                    </div>
                    <!-- end row -->

                    <div class="row mb-md-2">

                        <!-- Search -->
                        <div class="col-sm-12 col-md-6">
                            <div id="tickets-table_filter" class="dataTables_filter ">
                                <label class="d-inline-flex align-items-center">
                                    {{ $t('global.search.text') }}
                                    <b-form-input v-model="filter" type="search" :placeholder="$t('global.search.text')" class="form-control form-control-sm ml-2" autofocus></b-form-input>
                                </label>
                            </div>
                        </div>
                        <!-- End search -->

                        <!-- num -->
                        <div class="col-sm-12 col-md-6">
                            <div id="tickets-table_length" class="dataTables_length text-md-right">
                                <label class="d-inline-flex align-items-center">
                                    {{ $t('global.show.text') }}&nbsp;
                                    <b-form-select v-model="perPage" size="sm" :options="pageOptions"></b-form-select>&nbsp;{{ $t('global.entries.text').toLowerCase() }}
                                </label>
                            </div>
                        </div>
                        <!-- num -->

                    </div>
                    <!-- Table -->

                    <div class="table-responsive mb-0">
                        <b-table thead-tr-class="bg-light" :items="customers" :fields="fields" responsive="sm" :per-page="perPage" :current-page="currentPage" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :filter="filter" :filter-included-fields="filterOn" @filtered="onFiltered">
                            <template v-slot:cell(full_name)="data">
                                <nuxt-link :to="{name: 'customers-id', params: {id: data.item.uuid}}">{{ data.item.full_name }}</nuxt-link>
                            </template>

                            <template v-slot:cell(address)="data">
                                {{ data.item.street }} {{ data.item.number }}
                            </template>

                            <template v-slot:cell(zipcode)="data">
                                {{ data.item.zipcode }} {{ data.item.city }}
                            </template>

                        </b-table>
                    </div>


                    <div class="row">
                        <div class="col">
                            <div class="float-left">
                                {{ this.$t('global.total_results.text') }}: {{ this.rows }}
                            </div>

                            <div class="float-right">
                                <!-- pagination -->
                                <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage"></b-pagination>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
</template>
