<script setup lang="ts">
interface Props {
    className?: string;
}

const props = withDefaults(defineProps<Props>(), {
    className: ''
});
</script>

<template>
    <div :class="['bg-dark-800 border border-white/10 rounded-xl', props.className]">
        <slot />
    </div>
</template>
