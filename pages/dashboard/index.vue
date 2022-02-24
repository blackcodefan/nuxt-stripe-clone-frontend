<script>

import { ModelListSelect } from 'vue-search-select'
import { mapGetters, mapMutations } from 'vuex'

export default {
    components: {
      ModelListSelect,
    },
    head() {
        return {
            title: 'MijnStalling CRM | Dashboard',
        };
    },
    middleware: 'router-auth',
    data() {
        return {
            title: "Dashboard",
            items: [
                {
                    text: "Dashboard",
                    active: true
                }
            ],
            selected: '',
            spot: '',
            date: this.$moment(new Date()),
            appointment: {
                appointment_at: this.$moment(new Date()),
                emails: {
                    customer: 0
                }
            },
            searchObject: '',
            validationErrors: '',
            fieldsPickup: ''
        };
    },
    computed: {

        computedFields() {

            if(this.$auth.user.company.id == 4) { // Little hack to show other fields for Zwaan

            return [
               {
                   key: 'object.customer.full_name',
                   label: this.$t('global.name.text'),
                   sortable: false
               },
               {
                   key: 'warning',
                   sortable: false,
                   label: '',
               },
               {
                   key: 'object.spot',
                   label: this.$t('object.spot.text'),
                   sortable: false
               },
               {
                   key: 'object.license_plate',
                   label: this.$t('object.license_plate.text'),
                   sortable: false,
                   class: 'd-none d-sm-table-cell'
               },
               {
                   key: 'object.brand',
                   label: this.$t('object.brand.text'),
                   sortable: false,
                   class: 'd-none d-sm-table-cell'
               },
               {
                   key: 'actions',
                   label: ''
               }
           ]

            } else {

            return [
               {
                   key: 'object.object_id',
                   label: this.$t('object.object_id.text'),
                   sortable: false
               },
               {
                   key: 'warning',
                   label: '',
                   sortable: false
               },
               {
                   key: 'object.license_plate',
                   label: this.$t('object.license_plate.text'),
                   sortable: false,
                   class: 'd-none d-sm-table-cell'
               },
                {
                    key: 'object.customer.full_name',
                    label: this.$t('global.name.text'),
                    class: 'd-none d-sm-table-cell'
                },
               {
                   key: 'object.spot',
                   label: this.$t('object.spot.text'),
                   sortable: false
               },

               {
                   key: 'object.brand',
                   label: this.$t('object.brand.text'),
                   sortable: false,
                   class: 'd-none d-sm-table-cell'
               },
               {
                   key: 'actions',
                   label: ''
               }
           ]

            }


        },

        ...mapGetters('appointments', [
            'attention',
            'pickup',
            'inside'
        ]),

        ...mapGetters('objects', [
            'objects'
        ])

    },
    mounted () {
console.log('mount')

        this.CURRENT_DATE_PICKUP(this.date);
        this.$store.dispatch('appointments/getOpenAppointments', {
          date: this.date.format('YYYY-MM-DD')
        })
        this.$store.dispatch('objects/getObjects')

    },

    methods: {

      ...mapMutations('appointments', ['CURRENT_DATE_PICKUP']),

      handlePickup(item, status) {

        // set new values
        item.status_id = status
        item.type = item.type.id

        this.$store.dispatch('appointments/updateAppointment', item)

      },
      license_plateAndTemp_name( item ) {
          return `${item.license_plate} | ${item.temp_name}`
      },
      inUpdate(appointment) {

        this.selected = appointment
        this.spot = appointment.object.spot
        this.$bvModal.show('modal-1')

      },

      handleOk() {

        // set new status id
        this.selected.status_id = 3
        this.selected.type = this.selected.type.id
        this.selected.object.spot = this.spot

        this.$store.dispatch('appointments/updateAppointment', this.selected)

      },

      addAppointment(modal) {

            modal.preventDefault()

            // set needed required fields
            this.appointment.type = 2
            this.appointment.status_id = 1

            this.$store.dispatch('appointments/addAppointment', this.appointment)
                .then(response => {
                  this.$bvModal.hide('appointment')
                })
                .catch((error) => {
                  alert('Er ging iets fout. Neem contact met ons op')
                })

      },

      prevDay() {
        this.date = this.$moment(this.date).subtract('days', 1);
        this.CURRENT_DATE_PICKUP(this.date);
        this.$store.dispatch('appointments/getOpenAppointments', {
          date: this.date.format('YYYY-MM-DD')
        })
      },
      nextDay() {
          this.date = this.$moment(this.date).add('days', 1);
          this.CURRENT_DATE_PICKUP(this.date);
        this.$store.dispatch('appointments/getOpenAppointments', {
          date: this.date.format('YYYY-MM-DD')
        })
        },

        setDate(value) {
        console.log('setDate')
        console.log(value)
            this.CURRENT_DATE_PICKUP(this.$moment(value));
            this.$store.dispatch('appointments/getOpenAppointments', {
              date: this.$moment(value).format('YYYY-MM-DD')
            })
        },

        rowClass(item) {

            if(item && item.status.id == 3) return 'table-success'
        }

    }

};
</script>

<template>
<div>
    <PageHeader :title="title" :items="items" />

    <div class="row">

        <!-- attention block -->
        <div class="col-md-12 d-none d-sm-block">

            <div class="card" v-if="attention.length">
                <div class="card-body">

                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead class="table-warning">
                                <tr>
                                    <th>{{ $t('global.name.text') }}</th>
                                    <th>{{ $t('object.license_plate.text') }}</th>
                                    <th>{{ $t('object.spot.text') }}</th>
                                    <th>{{ $t('global.date.text') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="appointment in attention">
                                    <td><nuxt-link :to="{name: 'appointments-id', params: {id: appointment.uuid}}">{{ appointment.object.customer.full_name }}</nuxt-link></td>
                                    <td>{{ appointment.object.license_plate }}</td>
                                    <td>{{ appointment.object.spot }}</td>
                                    <td>{{ appointment._appointment_at }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </div>
        <!-- attention block -->

        <!-- appointments -->
        <div class="col-md-12">

            <div class="card">

                <div class="card-body">

                    <div class="d-flex flex-row mb-3">
                        <button class="fc-prev-button btn btn-primary mr-1" type="button" aria-label="prev" @click="prevDay()"><span class="fa fa-chevron-left"></span></button>
                        <VueCtkDateTimePicker :button-now-translation="$t('global.now.text')" @input="setDate" v-model="date" format="DD-MM-YYYY" formatted="DD-MM-YYYY" output-format="YYYY-MM-DD" :only-date="true" :no-label="true" :noClearButton="true" color="#3CAFDA" />
                        <button class="fc-next-button btn btn-primary ml-1" type="button" aria-label="next" @click="nextDay"><span class="fa fa-chevron-right"></span></button>
                    </div>

                    <!-- pickup -->
                    <b-tabs
                        content-class
                        fill
                        active-nav-item-class="font-weight-bold bg-success text-white"
                    >
                        <b-tab :title="$t('appointment.out.text')" active>

                            <b-table
                              :items="pickup"
                              :fields="computedFields"
                              head-variant="light"
                              show-empty
                              :tbody-tr-class="rowClass"
                              :emptyText="$t('appointment.nothing.text')"
                            >
                            <template #cell(object.object_id)="row">
                                <nuxt-link :to="{name: 'objects-id', params: {id: row.item.object.uuid}}" class="d-none d-sm-block">{{ row.value }}</nuxt-link>
                                <span @click="row.toggleDetails" role="button" class="text-primary d-block d-sm-none">{{ row.value }}</span>
                              </template>

                            <template #cell(object.customer.full_name)="row">
                                <nuxt-link :to="{name: 'objects-id', params: {id: row.item.object.uuid}}" class="d-none d-sm-block">{{ row.value }}</nuxt-link>
                                <span @click="row.toggleDetails" role="button" class="text-primary d-block d-sm-none">{{ row.value }}</span>
                              </template>

                            <template #cell(warning)="row">
                                <i v-if="row.item.note" class="mdi mdi-alert-circle-outline text-warning font-weight-bold"></i>
                            </template>



                              <template #cell(actions)="row">
                                <b-button v-if="row.item.status.id !== 3" @click="handlePickup(row.item, 3)" size="sm" variant="success"><i class="mdi mdi-check-circle-outline"></i></b-button>
                                <b-button v-if="row.item.status.id === 3" @click="handlePickup(row.item, 1)" size="sm" variant="warning"><i class="mdi mdi-restore"></i></b-button>
                              </template>

                              <template #row-details="row">
                                <b-card>
                                  <div><span class="font-weight-bold">Klant:</span> {{ row.item.object.customer.full_name }}</div>
                                  <div><span class="font-weight-bold">Kenteken:</span> {{ row.item.object.license_plate }}</div>
                                  <div><span class="font-weight-bold">Model:</span> {{ row.item.object.brand }} {{ row.item.object.type }}</div>
                                  <div v-if="row.item.note"><span class="font-weight-bold">Opmerking:</span> {{ row.item.note }} </div>
                                    <nuxt-link :to="{name: 'appointments-id', params: {id: row.item.uuid}}" class="badge badge-outline-primary badge-secondary">Open afspraak</nuxt-link>

                                </b-card>
                              </template>

                            </b-table>

                        </b-tab>
                        <!-- pickup -->

                        <!-- return -->
                        <b-tab :title="$t('appointment.in.text')">

                            <b-table
                              :items="inside"
                              :fields="computedFields"
                              head-variant="light"
                              show-empty
                              :tbody-tr-class="rowClass"
                              :emptyText="$t('appointment.nothing.text')"
                            >
                            <template #cell(object.object_id)="row">
                                <nuxt-link :to="{name: 'objects-id', params: {id: row.item.object.uuid}}" class="d-none d-sm-block">{{ row.value }}</nuxt-link>
                                <span @click="row.toggleDetails" role="button" class="text-primary d-block d-sm-none">{{ row.value }}</span>
                              </template>

                              <template #cell(actions)="row">
                                <b-button v-if="row.item.status.id !== 3" @click="inUpdate(row.item)" size="sm" variant="success"><i class="mdi mdi-check-circle-outline"></i></b-button>
                                <b-button v-if="row.item.status.id === 3" @click="handlePickup(row.item, 1)" size="sm" variant="warning"><i class="mdi mdi-restore"></i></b-button>
                              </template>

                              <template #row-details="row">
                                <b-card>
                                  <div><span class="font-weight-bold">Klant:</span> {{ row.item.object.customer.full_name }}</div>
                                  <div><span class="font-weight-bold">Kenteken:</span> {{ row.item.object.license_plate }}</div>
                                  <div><span class="font-weight-bold">Model:</span> {{ row.item.object.brand }} {{ row.item.object.type }}</div>
                                </b-card>
                              </template>

                            </b-table>

                            <b-button variant="primary" v-b-modal.appointment>{{ $t('appointment.add.text') }}</b-button>

                            <!-- handle object inside modal box -->
                              <b-modal id="modal-1" @ok="handleOk" title="Update">

                                <b-form-group label-cols-sm="2" label-cols-lg="2" label="Spot" label-for="spot">
                                    <b-form-input id="spot" v-model="spot" placeholder="Spot"></b-form-input>
                                </b-form-group>

                              </b-modal>
                              <!-- handle object inside modal box -->

                            <!-- add new appointment modal box -->
                            <b-modal id="appointment" :cancelTitle="$t('global.cancel.text')" @ok="addAppointment" :title="$t('appointment.add.text')">

                                <validation-errors :errors="validationErrors" v-if="validationErrors"></validation-errors>

                                <b-form-group label-cols-sm="4" label-cols-lg="4" :label="$t('global.date.text')" label-for="appointment.appointment_at">
                                    <VueCtkDateTimePicker :button-now-translation="$t('global.now.text')" v-model="appointment.appointment_at" format="YYYY-MM-DD HH:mm" formatted="DD-MM-YYYY HH:mm" :no-label="true" color="#3CAFDA" :minute-interval="15" />
                                </b-form-group>

                                <b-form-group label-cols-sm="4" label-cols-lg="4" :label="this.$tc('object.object_id.text', 2)" label-for="searchObject">
                                    <!-- object value -->
                                    <model-list-select
                                        :list="objects"
                                        v-model="appointment.customer_object_id"
                                         option-value="id"
                                         option-text="object_id"
                                         :placeholder="$t('global.search.text')"
                                     >
                                     </model-list-select>
                                </b-form-group>

                                <b-form-group label-cols-sm="4" label-cols-lg="4" :label="$t('global.advancedSearch.text')" label-for="searchObject">
                                    <!-- object value -->
                                    <model-list-select
                                        :list="objects"
                                        v-model="appointment.customer_object_id"
                                         option-value="id"
                                         :custom-text="license_plateAndTemp_name"
                                         :placeholder="$t('global.search.text')"
                                     >
                                     </model-list-select>
                                </b-form-group>


                                <b-form-group label-cols-sm="4" label-cols-lg="4" label-for="appointment.email">
                                    <b-form-checkbox
                                      id="send_email"
                                      v-model="appointment.emails.customer"
                                      value="1"
                                    >
                                        Verstuur bevestiging naar klant
                                    </b-form-checkbox>
                                </b-form-group>



                            </b-modal>
                            <!-- add new appointment modal box -->

                        </b-tab>
                        <!-- return -->

                    </b-tabs>

                </div>
            </div>

        </div>
        <!-- appointments -->

    </div>

</div>
</template>
