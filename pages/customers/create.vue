<script>
/**
 * Starter component
 */
export default {
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$t('object.add.text'),
        }
    },
    data() {
        return {
            title: this.$t('customer.add.text'),
            customer: {},
            items: [{
                    text: 'Dashboard',
                    to: '/',
                },
                {
                    text: this.$tc('customer.customer.text', 2),
                    to: {name: 'customers'},
                },
                {
                    text: this.$t('customer.add.text'),
                    active: true,
                },
            ],
            validationErrors: ''
        }
    },

    mounted () {



    },

    methods: {

        addCustomer() {

            this.$axios
                .post('api/customers', this.customer)
                .then(response => {
                    this.customer = response.data.result
                    this.$bvModal.show('editCustomer')
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
                <h4 class="text-orange">{{ $t('customer.add.text') }}</h4>
              </div>
                <div class="card-body">

                    <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                    <form class="form-horizontal" role="form" @submit.prevent="addCustomer()">

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.firstname.text')" label-for="firstname">
                            <b-form-input for="firstname" v-model="customer.firstname" :placeholder="$t('global.firstname.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.lastname.text')" label-for="lastname">
                            <b-form-input for="lastname" v-model="customer.lastname" :placeholder="$t('global.lastname.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.email.text')" label-for="email">
                            <b-form-input id="email" v-model="customer.email" :placeholder="$t('global.email.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.phone.text')" label-for="phone">
                            <b-form-input id="phone" v-model="customer.phone" :placeholder="$t('global.phone.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.street.text')" label-for="street">
                            <b-form-input id="street" v-model="customer.street" :placeholder="$t('global.street.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.number.text')" label-for="number">
                            <b-form-input id="number" v-model="customer.number" :placeholder="$t('global.number.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.zipcode.text')" label-for="zipcode">
                            <b-form-input id="zipcode" v-model="customer.zipcode" :placeholder="$t('global.zipcode.text')"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.city.text')" label-for="city">
                            <b-form-input id="city" v-model="customer.city" :placeholder="$t('global.city.text')"></b-form-input>
                        </b-form-group>

                        <div class="form-group row">
                            <label class="col-md-2 col-form-label"></label>
                            <div class="col-md-8">
                                <input type="submit" :value="$t('global.save.text')" class="btn btn-success">
                            </div>
                        </div>

                    </form>

                  <b-modal id="editCustomer" :title="$t('global.success.text')">
                    <p>{{ $t('global.add_success.text') }}</p>
                    <template #modal-footer>

                        <b-button variant="light" @click="$router.push({name: 'customers'})">
                        {{ $t('global.overview.text') }}
                      </b-button>

                      <b-button variant="success" @click="$router.push({name: 'customers-id', params: { id: customer.uuid }})">
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
