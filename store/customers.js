export const state = () => ({
    customers: [],
    isStripeCustomer: false,
})

export const getters = {

    customers(state) {
        return state.customers
    },

    clients(state) {
        return state.clients
    }

}

export const actions = {

    getCustomers(context) {
        this.$axios.get('api/customers').then(response => {
            context.commit('SET_CUSTOMERS', response.data.result)
        }).catch(() => {
            //context.commit('SET_FAVORITES', null)
        })
    },

    async isStripeCustomer(context, customerUuid) {
        this.$axios.get(`api/customers${customerUuid}/is-stripe-customer`).then(response => {
            context.commit('SET_ISSTRIPECUSTOMER', response.data.result)
        }).catch(() => {
            //context.commit('SET_FAVORITES', null)
        })
    },

    deleteCustomer(context, customer) {
        this.$axios.delete('api/customers/' + customer.uuid).then(response => {
            context.commit('DELETE_CUSTOMER', customer)
        }).catch(() => {
            //context.commit('SET_FAVORITES', null)
        })
    },

}

export const mutations = {

    SET_CLIENTS(state, value) {
        state.clients = value
    },

    SET_ISSTRIPECUSTOMER(state, value) {
        state.isStripeCustomer = value
    },

    SET_CUSTOMERS(state, value) {
        state.customers = value
    },

    ADD_CUSTOMER(state, text) {
        console.log(state)
    },

    DELETE_CUSTOMER(state, customer) {

    }

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}