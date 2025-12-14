<script setup lang="ts">
interface Props {
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'md',
    disabled: false
});

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses: Record<string, string> = {
    default: 'bg-gold-500 text-dark-900 hover:bg-gold-400',
    primary: 'bg-gold-500 text-dark-900 hover:bg-gold-400',
    secondary: 'bg-dark-800 text-white border border-white/10 hover:bg-dark-700',
    outline: 'border border-white/20 text-white hover:bg-white/10',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/10',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
};

const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
};
</script>

<template>
    <button
        :class="[baseClasses, variantClasses[props.variant], sizeClasses[props.size]]"
        :disabled="props.disabled"
    >
        <slot />
    </button>
</template>
