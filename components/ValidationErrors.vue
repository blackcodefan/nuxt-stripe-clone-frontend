<template>

    <div v-if="validationErrors" class="alert alert-danger">
        <ul>
            <li v-for="(value, key, index) in validationErrors">{{ value }}</li>
        </ul>
    </div>

</template>

<script>

export default {
    data () {
        return {

        }
    },
    props: [
        'errors'
    ],
    computed: {
        validationErrors() {
            let errors = Object.values(this.errors);
            errors = errors.flat();
            return errors;
        }
    }
}

</script>