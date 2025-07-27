<script setup>
import { z } from 'zod';

const supabase = useSupabaseClient();

const loading = ref(false);

const schema = z.object({
  email: z.string().email(),
});

const state = ref({
  email: '',
});

const handleLogin = async () => {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signInWithOtp({ email: state.value.email });
    if (error) throw error;
    alert('Check your email for the login link!');
  } catch (error) {
    alert(error.error_description || error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <UForm :state="state" @submit.prevent="handleLogin" :schema="schema">
    <p class="description">Sign in via magic link with your email below.</p>
    <UFormField label="Email" name="email">
      <UInput type="email" placeholder="Your email" v-model="state.email" />
    </UFormField>

    <UButton type="submit" size="lg" :disabled="loading" block>
      {{ loading ? 'Loading' : 'Login' }}
    </UButton>
  </UForm>
</template>
