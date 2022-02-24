export const state = () => ({
    companies: [],
    isStripeConfigured: false,
})

export const getters = {

    companies(state) {
        return state.companies
    },
    isStripeConfigured(state) {
        return state.isStripeConfigured
    },

}

export const actions = {

    async isStripeConfigured(context) {
        this.$axios.get('api/company/is-stripe-configured').then(response => {
            context.commit('setIsStripeConfigured', response.data.result)
        }).catch(() => {
            //context.commit('SET_FAVORITES', null)
        })
    },

}

export const mutations = {
    setIsStripeConfigured(state, isStripeConfigured) {
        state.isStripeConfigured = isStripeConfigured
    },

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}