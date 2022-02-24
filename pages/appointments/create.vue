<script>

    import { ModelListSelect } from 'vue-search-select'
    import { mapGetters } from 'vuex'


export default {
    components: {
      ModelListSelect
    },
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$tc('appointment.appointment.text', 2),
        }
    },
    data() {
        return {
            title: this.$t('appointment.add.text'),
            appointment: {
                email: '',
                appointment_at: this.$moment().format('DD-MM-YYYY HH:MM'),
                type: null,
            },
            emails: {
                customer: 1
            },
            searchObject: '',
            object: {},
            items: [{
                    text: 'Dashboard',
                    to: '/',
                },
                {
                    text: this.$tc('appointment.appointment.text', 2),
                    to: {name: 'appointments'},
                },
                {
                    text: this.$t('appointment.add.text'),
                    active: true,
                },
            ],
            validationErrors: '',
            types: [
              { value: null, text: this.$t('global.make_a_choice.text'), disabled: true },
              { value: 2, text: this.$t('appointment.in.text') },
              { value: 1, text: this.$t('appointment.out.text') }
            ]
        }
    },

    computed: {

        ...mapGetters('objects', {
          objects: 'objects'
        })
    },

    created() {
        this.$store.dispatch('objects/getObjects')
    },

    methods: {

        addAppointment() {

            this.validationErrors = ''

            this.appointment.emails = this.emails

            this.$axios
                .post('api/appointments', this.appointment)
                .then(response => {
                    this.appointment = response.data.result
                    this.$bvModal.show('addAppointment')
                })
                .catch((error) => {
                    this.validationErrors = error.response.data.errors;
                });

        },
        
        license_plateAndTemp_name( item ) {
            return `${item.license_plate} | ${item.temp_name}`
        },

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
                <h4 class="text-orange">{{ $t('appointment.add.text') }}</h4>
              </div>

                <div class="card-body">

                    <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                    <form class="form-horizontal" role="form" @submit.prevent="addAppointment()">

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('object.object_id.text')" label-for="searchObject">
                            <model-list-select
                                :list="objects"
                                 v-model="appointment.customer_object_id"
                                 option-value="id"
                                 option-text="object_id"
                                 :placeholder="$t('global.search.text')"
                          >
                          </model-list-select>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.advancedSearch.text')" label-for="searchObject">
                            <model-list-select
                                :list="objects"
                                v-model="appointment.customer_object_id"
                                 option-value="id"
                                 :custom-text="license_plateAndTemp_name"
                                 :placeholder="$t('global.search.text')"
                             >
                          </model-list-select>
                        </b-form-group>


                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('global.date.text')" label-for="appointment_at">
                            <VueCtkDateTimePicker :button-now-translation="$t('global.now.text')" v-model="appointment.appointment_at" format="DD-MM-YYYY HH:mm" :no-label="true" color="#3CAFDA" :minute-interval="15" :label="$t('global.enter.text')" />
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" label="Type" label-for="name">
                            <b-form-select v-model="appointment.type" :options="types"></b-form-select>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$tc('global.note.text')" label-for="note">
                            <b-form-textarea
                              id="textarea"
                              v-model="appointment.note"
                              :placeholder="this.$tc('global.note.text')"
                              rows="3"
                              max-rows="6"
                            ></b-form-textarea>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" label-for="email">
                            <b-form-checkbox
                              id="send_email"
                              v-model="emails.customer"
                              value="1"
                            >
                                Verstuur bevestiging naar klant
                            </b-form-checkbox>
                        </b-form-group>

                        <div class="form-group row">
                            <label class="col-md-2 col-form-label"></label>
                            <div class="col-md-8">
                                <input type="submit" :value="$t('global.save.text')" class="btn btn-success">
                            </div>
                        </div>

                    </form>

                  <b-modal id="addAppointment" title="Success">
                    <p>{{ $t('global.add_success.text') }}</p>
                    <template #modal-footer>

                        <b-button variant="light" @click="$router.push({name: 'appointments'})">
                        {{ $t('global.overview.text') }}
                      </b-button>

                      <b-button variant="success" @click="$router.push({name: 'appointments-id', params: { id: appointment.uuid }})">
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
