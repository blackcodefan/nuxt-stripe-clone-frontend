<script>

  import { ModelListSelect } from 'vue-search-select'
    import { mapGetters } from 'vuex'


export default {
    components: {
      ModelListSelect
    },
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$t('object.add.text'),
        }
    },
    data() {
        return {
            title: this.$t('object.add.text'),
            object: {
                object_type_id: null
            },
            object_types: [],
            items: [
                {
                    text: 'Dashboard',
                    to: '/',
                },
                {
                    text: this.$tc('object.object.text', 2),
                    to: '/objects',
                },
                {
                    text: this.$t('object.add.text'),
                    active: true,
                },
            ],
            validationErrors: '',
            item: {
              value: '',
              text: ''
            }
        }
    },

        computed: {
            customers () {
                return this.$store.getters['customers/customers']
              }
        },

    mounted () {

        this.$store.dispatch('customers/getCustomers')

        this.$axios
            .get('api/object_types')
            .then(response => {
                this.object_types = response.data.result;
            })
            .catch((error) => {

            });

        // is there an customer parameter passed?
        if(this.$route.query.customer) {
            this.object.customer_id = this.$route.query.customer
        }


    },

    methods: {

        addObject() {

            this.validationErrors = ''

            this.$axios
                .post('api/objects', this.object)
                .then(response => {
                    this.object = response.data.result
                    this.$bvModal.show('addObject')
                })
                .catch((error) => {
                    this.validationErrors = error.response.data.errors;
                });

        }

    },
    middleware: 'router-auth'
}
</script>

<template>
<div>
    <PageHeader :items="items" />

    <div class="row">
        <div class="col-12">
            <div class="card">
              <div class="card-header bg-light">
                <h4 class="float-left text-orange">{{ $t('object.add.text') }}</h4>
                </div>
                <div class="card-body">

                    <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                    <form class="form-horizontal" role="form" @submit.prevent="addObject()">

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$tc('customer.customer.text', 1)" label-for="customer">
                            <!-- object value -->
                            <model-list-select
                                :list="customers"
                                 v-model="object.customer_id"
                                 option-value="uuid"
                                 option-text="email"
                                 :placeholder="$t('global.search.text')"
                             >
                             </model-list-select>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('object.license_plate.text')" label-for="license_plate">
                            <b-form-input for="license_plate" v-model="object.license_plate" :placeholder="this.$t('object.license_plate.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('object.spot.text')" label-for="spot">
                            <b-form-input id="spot" v-model="object.spot" :placeholder="this.$t('object.spot.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('object.object_id.text')" label-for="object_id">
                            <b-form-input id="object_id" v-model="object.object_id" :placeholder="this.$t('object.object_id.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" label="Object type" label-for="object_type">
                            <b-form-select
                                v-model="object.object_type_id"
                                :options="object_types"
                                 value-field="id"
                                 text-field="name"
                            >
                              <template #first>
                                <b-form-select-option :value="null" disabled>{{ $t('global.make_a_choice.text') }}</b-form-select-option>
                              </template>
                            </b-form-select>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('object.brand.text')" label-for="brand">
                            <b-form-input id="brand" v-model="object.brand" :placeholder="this.$t('object.brand.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" label="Type" label-for="type">
                            <b-form-input id="type" v-model="object.type" placeholder="Type""></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('object.width.text')" label-for="width">
                            <b-form-input id="width" v-model="object.width" :placeholder="this.$t('object.width.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('object.length.text')" label-for="length">
                            <b-form-input id="length" v-model="object.length" :placeholder="this.$t('object.length.text')"></b-form-input>
                        </b-form-group>

                        <div class="form-group row">
                            <label class="col-md-2 col-form-label"></label>
                            <div class="col-md-8">
                                <input type="submit" :value="this.$t('global.save.text')" class="btn btn-success">
                            </div>
                        </div>

                    </form>

                  <b-modal id="addObject" :title="$t('global.success.text')">
                    <p>{{ $t('global.add_success.text') }}</p>
                    <template #modal-footer>

                        <b-button variant="light" @click="$router.push({name: 'objects'})">
                        {{ $t('global.overview.text') }}
                      </b-button>

                      <b-button variant="success" @click="$router.push({name: 'objects-id', params: { id: object.uuid }})">
                        {{ $t('global.details.text') }}
                      </b-button>

                    </template>
                  </b-modal>

                </div>
            </div>
        </div>
    </div>

</div>
</template>
