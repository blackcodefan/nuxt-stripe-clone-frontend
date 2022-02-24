<script>

import { ModelListSelect } from 'vue-search-select'
import { mapGetters } from 'vuex'

export default {
    components: {
      ModelListSelect
    },
    head() {
        return {
            title: 'MijnStalling CRM | ' + this.$tc('appointment.edit.text', 2),
        }
    },
    data() {
        return {
            title: this.$t('appointment.edit.text'),
            customer: {},
            statuses: {},
            items: [{
                    text: 'Dashboard',
                    to: '/',
                },
                {
                    text: this.$tc('appointment.appointment.text', 2),
                    to: '/appointments',
                },
                {
                    text: this.$tc('appointment.appointment.text', 1),
                    to: {name: 'appointments-id', params: {id: this.$route.params.id}},
                },
                {
                    text: this.$tc('appointment.edit.text'),
                    active: true,
                },
            ],
            validationErrors: '',
            appointment: '',
            types: [
              { value: null, text: this.$t('global.make_a_choice.text'), disabled: true },
              { value: 1, text: this.$t('appointment.out.text') },
              { value: 2, text: this.$t('appointment.in.text') }
            ]
        }
    },

    computed: {

//        appointment() {
 //           return this.$store.getters['appointments/getById'](this.$route.params.id)
  //      },

        ...mapGetters('objects', {
          objects: 'objects'
        }),



    },

    mounted () {

        this.$axios.get('api/appointments/' + this.$route.params.id).then(response => {

            this.appointment = response.data.result;

            // set nested
            this.appointment.object_id = this.appointment.object.id
            this.appointment.status_id = this.appointment.status.id
            this.appointment.type = this.appointment.type.id

        }).catch(() => {

            })

        // get statuses
        this.$axios
            .get('api/statuses')
            .then(response => {
                this.statuses = response.data.result
            })
            .catch((error) => {
                alert(2)
            });

        // get the objects
        this.$store.dispatch('objects/getObjects')

    },

    methods: {

        editAppointment() {

           this.$axios
                .patch('api/appointments/' + this.appointment.uuid, this.appointment)
                .then(response => {
                    this.$bvModal.show('editAppointment')
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
                  <h4 class="text-orange float-left">{{ $t('appointment.edit.text') }}</h4>
                </div>

                <div class="card-body">

                    <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                    <form class="form-horizontal" role="form" @submit.prevent="editAppointment()">

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('object.object_id.text')" label-for="object_id" v-if="appointment.object">
                              <b-form-input plaintext disabled v-model="appointment.object.object_id"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="$t('object.license_plate.text')" label-for="object_id" v-if="appointment.object">
                              <b-form-input plaintext disabled v-model="appointment.object.license_plate"></b-form-input>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$t('global.date.text')" label-for="appointment_at">
                            <VueCtkDateTimePicker :button-now-translation="$t('global.now.text')" v-model="appointment.appointment_at" format="YYYY-MM-DD HH:mm" formatted="DD-MM-YYYY HH:mm" :no-label="true" color="#3CAFDA" :minute-interval="15" :label="$t('global.enter.text')" />
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" label="Type" label-for="name">
                            <b-form-select v-model="appointment.type" :options="types"></b-form-select>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" :label="this.$tc('global.note.text')" label-for="note">
                            <b-form-textarea
                              id="textarea"
                              v-model="appointment.note"
                              placeholder="Note"
                              rows="3"
                              max-rows="6"
                            ></b-form-textarea>
                        </b-form-group>

                        <b-form-group label-cols-sm="2" label-cols-lg="2" label="Status" label-for="status_id">
                            <b-form-select
                                v-model="appointment.status_id"
                                :options="statuses"
                                value-field="id"
                                text-field="name"
                            ></b-form-select>
                        </b-form-group>

                        <div class="form-group row">
                            <label class="col-md-2 col-form-label"></label>
                            <div class="col-md-8">
                                <input type="submit" :value="$tc('global.save.text')" class="btn btn-success">
                            </div>
                        </div>

                    </form>

                  <b-modal id="editAppointment" :title="this.$t('global.success.text')">
                    <p>{{ this.$t('global.update_success.text') }}</p>
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
