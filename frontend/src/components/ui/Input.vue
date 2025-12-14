<script setup lang="ts">
interface Props {
    type?: string;
    placeholder?: string;
    modelValue?: string;
    required?: boolean;
    className?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    modelValue: '',
    required: false,
    className: ''
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};
</script>

<template>
    <input
        :type="props.type"
        :placeholder="props.placeholder"
        :value="props.modelValue"
        :required="props.required"
        :class="[
            'w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-500 transition-colors',
            props.className
        ]"
        @input="handleInput"
    />
</template>
