<script>

import { mapGetters } from 'vuex'

export default {
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$tc('object.object.text', 2),
        };
    },
    data() {
        return {
            title: this.$tc('object.object.text', 2),
            items: [{
                    text: "Dashboard",
                    to: "/"
                },
                {
                    text: this.$tc('object.object.text', 2),
                    active: true
                }
            ],

            totalRows: 1,
            currentPage: 1,
            perPage: 25,
            pageOptions: [10, 25, 50, 100],
            filter: null,
            filterOn: [],
            sortBy: 'object_id',
            sortDesc: false,
            fields: [
                {
                    key: 'object_id',
                    sortable: true,
                    label: this.$t('object.object_id.text')
                },
                {
                    key: 'license_plate',
                    sortable: true,
                    label: this.$t('object.license_plate.text')
                },
                {
                    key: 'spot',
                    sortable: true,
                    label: this.$t('object.spot.text')
                },
                {
                    key: 'customer.full_name',
                    sortable: true,
                    label: this.$t('global.name.text')
                },
                {
                    key: 'object_type.name',
                    sortable: true,
                    label: 'Object'
                },
                {
                    key: 'brand',
                    sortable: true,
                    label: this.$t('object.brand.text')
                },
                {
                    key: 'width',
                    sortable: true,
                    label: this.$t('object.width.text')
                },
                {
                    key: 'length',
                    sortable: true,
                    label: this.$t('object.length.text')
                },
            ]

        };
    },

    computed: {

        ...mapGetters('objects', {
          objects: 'objects'
        }),

        rows() {
            return this.objects.length
        },

    },

    mounted() {
        this.totalRows = this.objects.length

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
        this.$store.dispatch('objects/getObjects')
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
                                    <nuxt-link :to="{name: 'objects-create'}" class="btn btn-success mb-2"><i class="mdi mdi-plus-circle mr-2"></i> {{ this.$t('object.add.text') }}</nuxt-link>
                                </div>
                            </div>
                        </div>

                        <div class="row mb-md-2">

                            <!-- search -->
                            <div class="col-sm-12 col-md-6">
                                <div id="tickets-table_filter" class="dataTables_filter">
                                    <label class="d-inline-flex align-items-center">
                                        {{ $t('global.search.text') }}
                                        <b-form-input v-model="filter" type="search" :placeholder="$t('global.search.text')" class="form-control form-control-sm ml-2" autofocus></b-form-input>
                                    </label>
                                </div>
                            </div>
                            <!-- search -->

                            <!-- show num results -->
                            <div class="col-sm-12 col-md-6">
                                <div id="tickets-table_length" class="dataTables_length text-md-right">
                                    <label class="d-inline-flex align-items-center">
                                        {{ $t('global.show.text') }}&nbsp;
                                        <b-form-select v-model="perPage" size="sm" :options="pageOptions"></b-form-select>&nbsp;{{ $t('global.entries.text').toLowerCase() }}
                                    </label>
                                </div>
                            </div>
                            <!-- show num results -->

                        </div>
                        <!-- Table -->

                        <div class="table-responsive mb-0">
                            <b-table stacked="sm" thead-tr-class="bg-light" :items="objects" :fields="fields" responsive="sm" :per-page="perPage" :current-page="currentPage" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :filter="filter" :filter-included-fields="filterOn" @filtered="onFiltered">
                                <template v-slot:cell(object_id)="data">
                                    <nuxt-link :to="{name: 'objects-id', params: {id: data.item.uuid}}">{{ data.item.object_id }}</nuxt-link>
                                </template>

                                <template v-slot:cell(brand)="data">
                                    {{ data.item.brand }} {{ data.item.type }}
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
