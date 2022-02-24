<script>

export default {

    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$t('prospect.add.text'),
        }
    },
    data() {
        return {
            title: this.$t('prospect.add.text'),
            object_types: [],
            prospect: {
                object_type_id: null,
            },
            emails: {
                customer: 1
            },
            items: [
                {
                    text: 'Dashboard',
                    to: '/',
                },
                {
                    text: this.$tc('prospect.prospect.text', 2),
                    to: '/prospects',
                },
                {
                    text: this.$t('prospect.add.text'),
                    active: true,
                },
            ],
            validationErrors: '',
        }
    },

        computed: {

        },

    mounted () {

        this.$axios
            .get('api/object_types')
            .then(response => {
                this.object_types = response.data.result;
            })
            .catch((error) => {

            });

    },

    methods: {

        addProspect() {

            this.prospect.uuid = this.$auth.user.company.uuid
            this.prospect.emails = this.emails
            this.prospect.status_id = 1

            this.$axios
                .post('api/prospects', this.prospect)
                .then(response => {
                    this.prospect = response.data.result
                    this.$bvModal.show('addProspect')
                })
                .catch((error) => {

                    if(error.response.status == 422) { // validation errors
                        this.validationErrors = error.response.data.errors;
                    } else {
                        alert('Er ging iets fout in ons systeem. Neem contact met ons op.')
                    }

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

          <form class="form-horizontal" role="form" @submit.prevent="addProspect()">

            <div class="card">

                <div class="card-header bg-light">
                  <h4 class="text-orange float-left">Klantgegevens</h4>
                  <div class="float-sm-right">
                    <input type="submit" :value="$t('global.save.text')" class="btn btn-success">
                  </div>
                </div>

                <div class="card-body">

                    <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('global.firstname.text')" label-for="firstname">
                                <b-form-input for="firstname" v-model="prospect.firstname" :placeholder="$t('global.firstname.text')"></b-form-input>
                            </b-form-group>

                            <b-form-group class="col-md-6" :label="$t('global.lastname.text')" label-for="lastname">
                                <b-form-input for="lastname" v-model="prospect.lastname" :placeholder="$t('global.lastname.text')"></b-form-input>
                            </b-form-group>

                        </div>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('global.street.text')" label-for="street">
                                <b-form-input for="street" v-model="prospect.street" :placeholder="$t('global.street.text')"></b-form-input>
                            </b-form-group>

                            <b-form-group class="col-md-6" :label="$t('global.number.text')" label-for="number">
                                <b-form-input for="number" v-model="prospect.number" :placeholder="$t('global.number.text')"></b-form-input>
                            </b-form-group>

                        </div>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('global.zipcode.text')" label-for="zipcode">
                                <b-form-input for="zipcode" v-model="prospect.zipcode" :placeholder="$t('global.zipcode.text')"></b-form-input>
                            </b-form-group>

                            <b-form-group class="col-md-6" :label="$t('global.city.text')" label-for="city">
                                <b-form-input for="city" v-model="prospect.city" :placeholder="$t('global.city.text')"></b-form-input>
                            </b-form-group>

                        </div>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('global.phone.text')" label-for="phone">
                                <b-form-input for="phone" v-model="prospect.phone" :placeholder="$t('global.phone.text')"></b-form-input>
                            </b-form-group>

                            <b-form-group class="col-md-6" :label="$t('global.email.text')" label-for="email">
                                <b-form-input for="email" v-model="prospect.email" :placeholder="$t('global.email.text')"></b-form-input>
                            </b-form-group>

                        </div>

                  </div>

              </div>

              <div class="card">

                <div class="card-header bg-light">
                  <h4 class="text-orange float-left">Objectgegevens</h4>
                  <div class="float-sm-right">
                    <input type="submit" :value="$t('global.save.text')" class="btn btn-success">
                  </div>
                </div>

              <div class="card-body">

                        <div class="form-row">

                            <b-form-group class="col-md-6" label="Object type" label-for="object_type">
                                <b-form-select
                                    v-model="prospect.object_type_id"
                                    :options="object_types"
                                     value-field="id"
                                     text-field="name"
                                >
                                  <template #first>
                                    <b-form-select-option :value="null" disabled>{{ $t('global.make_a_choice.text') }}</b-form-select-option>
                                  </template>
                                </b-form-select>
                            </b-form-group>

                            <b-form-group class="col-md-6" :label="$t('object.license_plate.text')" label-for="license_plate">
                                <b-form-input for="license_plate" v-model="prospect.license_plate" :placeholder="$t('object.license_plate.text')"></b-form-input>
                            </b-form-group>

                        </div>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('object.brand.text')" label-for="brand">
                                <b-form-input for="brand" v-model="prospect.brand" :placeholder="$t('object.brand.text')"></b-form-input>
                            </b-form-group>

                            <b-form-group class="col-md-6" label="Type" label-for="type">
                                <b-form-input for="type" v-model="prospect.type" placeholder="Type"></b-form-input>
                            </b-form-group>

                        </div>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('object.width.text')" label-for="width">
                                <b-form-input for="width" v-model="prospect.width" :placeholder="$t('object.width.text')"></b-form-input>
                            </b-form-group>

                            <b-form-group class="col-md-6" :label="$t('object.length.text')" label-for="length">
                                <b-form-input for="length" v-model="prospect.length" :placeholder="$t('object.length.text')"></b-form-input>
                            </b-form-group>

                        </div>

                        <div class="form-row">

                            <b-form-group class="col-md-6" :label="$t('prospect.expected_date.text')" label-for="delivery_at">
                                <VueCtkDateTimePicker :button-now-translation="$t('global.now.text')" style="margin-left: 0;" v-model="prospect.delivery_at" format="DD-MM-YYYY" formatted="DD-MM-YYYY" output-format="YYYY-MM-DD" :only-date="true" :no-label="true" color="#3CAFDA" :label="$t('prospect.expected_date.text')" />
                            </b-form-group>

                        </div>

                        <div class="form-group row">
                            <div class="col-md-8">

                                <b-form-checkbox
                                  id="send_email"
                                  v-model="emails.customer"
                                  value="1"
                                >
                                    Verstuur bevestiging naar klant
                                </b-form-checkbox>

                            </div>
                        </div>

                  <b-modal id="addProspect" :title="$t('global.success.text')">
                    <p>{{ $t('global.add_success.text') }}</p>
                    <template #modal-footer>

                        <b-button variant="light" @click="$router.push({name: 'prospects'})">
                        {{ $t('global.overview.text') }}
                      </b-button>

                      <b-button variant="success" @click="$router.push({name: 'prospects-id', params: { id: prospect.uuid }})">
                        {{ $t('global.details.text') }}
                      </b-button>

                    </template>
                  </b-modal>

                </div>
            </div>

          </form>

        </div>
    </div>

</div>
</template>
