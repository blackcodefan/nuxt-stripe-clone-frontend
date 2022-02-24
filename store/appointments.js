import moment from "moment";

export const state = () => ({
    appointments: [],
    currentSelectedDate: ''
})

export const getters = {

    appointments (state) {
        return state.appointments
    },

    attention(state) {
        return state.appointments.filter(appointment => appointment.status.id === 2) // 2 = aandacht nodig
    },

    pickup(state) { // naar BUITEN -- ID 1

        let appointments = state.appointments
            //.filter(appointment => ( appointment.status.id === 1 || appointment.status.id === 2 ) )
            .filter(appointment => ( appointment.type.id === 1 ) )
            .filter(appointment => ( moment(appointment.appointment_at).format("YYYY-MM-DD") === state.currentSelectedDate.format("YYYY-MM-DD") ) )

        // return _.orderBy(appointments, 'object.spot', 'asc')
        appointments.sort( ( a, b) => {

            const a1 = a.object.spot.split(' ');
            const b1 = b.object.spot.split(' ');
            const length = a1.length > b1.length ? b1.length : a1.length;
            for(let i=0;i< length ;i++){

                if(!isNaN(a1[i]) && !isNaN(b1[i])){
                    if(parseInt(a1[i]) > parseInt(b1[i])) return 1;
                    else if(parseInt(a1[i]) < parseInt(b1[i])) return -1;
                }
                else if(a1[i] > b1[i]) return 1;
                else if(a1[i] < b1[i]) return -1;

            }
            return 0
        });
        return appointments;

    },

    inside(state) { // naar BINNEN -- ID 2

        let appointments = state.appointments
            //.filter(appointment => ( appointment.status.id === 1 || appointment.status.id === 2) )
            .filter(appointment => ( appointment.type.id === 2 ) )
            .filter(appointment => ( moment(appointment.appointment_at).format("YYYY-MM-DD") === state.currentSelectedDate.format("YYYY-MM-DD") ) )

        // return _.orderBy(appointments, 'object.spot', 'asc')
        appointments.sort( ( a, b) => {

            const a1 = a.object.spot.split(' ');
            const b1 = b.object.spot.split(' ');
            const length = a1.length > b1.length ? b1.length : a1.length;
            for(let i=0;i< length ;i++){

                if(!isNaN(a1[i]) && !isNaN(b1[i])){
                    if(parseInt(a1[i]) > parseInt(b1[i])) return 1;
                    else if(parseInt(a1[i]) < parseInt(b1[i])) return -1;
                }
                else if(a1[i] > b1[i]) return 1;
                else if(a1[i] < b1[i]) return -1;

            }
            return 0
        });
        return appointments;

    },

    getById: (state) => (id) => {
        return state.appointments.find(appointment => appointment.id === id)
    }

}

export const actions = {

    getAppointments (context) {

        this.$axios.get('/api/appointments').then(response => {
            context.commit('SET_APPOINTMENTS', response.data.result)
        }).catch(error => {
            console.log(error.response)
        })

    },

  getOpenAppointments (context, payload) {

      console.log('payload')
      console.log(payload)
      //console.log(payload.date.format("YYYY-MM-DD"))

    this.$axios.get('/api/appointments?date=' + payload.date).then(response => {
      context.commit('SET_APPOINTMENTS', response.data.result)
    }).catch(error => {
      console.log(error.response)
    })

  },

    addAppointment(context, appointment) {

        this.$axios.post('api/appointments', appointment).then(response => {

            context.commit('ADD_APPOINTMENT', response.data.result)

        }).catch(error => {
            console.log(error.response)
        })

    },

    updateAppointment(context, appointment) {

        this.$axios.patch('api/appointments/' + appointment.uuid, appointment).then(response => {

            context.commit('UPDATE_APPOINTMENT', response.data.result)

        }).catch(error => {
            console.log(error.response)
        })

    },

    deleteAppointment(context, appointment) {

        this.$axios.delete('api/appointments/' + appointment.uuid).then(response => {

            context.commit('DELETE_APPOINTMENT', appointment)

        }).catch(error => {
            console.log(error.response)
        })

    }

}

export const mutations = {

    SET_APPOINTMENTS (state, value) {
        state.appointments = value
    },

    UPDATE_APPOINTMENT(state, updatedAppointment) {
        state.appointments = state.appointments.map((appointment) => {
                if(appointment.uuid === updatedAppointment.uuid) {
                    return updatedAppointment
                }
                return appointment
            }
        )
    },

    CURRENT_DATE_PICKUP(state, selectedDate) {
        state.currentSelectedDate = selectedDate;
    },

    ADD_APPOINTMENT(state, appointment) {
        state.appointments.push(appointment)
    },

    DELETE_APPOINTMENT(state, appointment) {

    }

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
