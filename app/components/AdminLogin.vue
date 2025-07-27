<script setup lang="ts">
import { z } from 'zod';

const supabase = useSupabaseClient();
const toast = useToast();

const loading = ref(false);

const schema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

const state = ref({
  email: '',
  password: '',
});

const handleLogin = async () => {
  try {
    loading.value = true;

    // Use Supabase's built-in signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email: state.value.email,
      password: state.value.password,
    });

    if (error) {
      toast.add({
        title: 'Login failed',
        description: error.message,
        color: 'error',
      });
      return;
    }

    toast.add({
      title: 'Login successful',
      description: 'Welcome back!',
      color: 'success',
    });

    console.log('data', data);
    // Redirect to admin dashboard
    await navigateTo('/admin');
  } catch (error: any) {
    console.log('error', error);
    toast.add({
      title: 'Login failed',
      description: error.message || 'Invalid credentials',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <UForm :state="state" @submit.prevent="handleLogin" :schema="schema">
    <p class="description mb-4">Sign in with your admin credentials.</p>

    <UFormField label="Email" name="email">
      <UInput type="email" placeholder="admin@example.com" v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput type="password" placeholder="Your password" v-model="state.password" />
    </UFormField>

    <UButton type="submit" size="lg" :disabled="loading" block>
      {{ loading ? 'Signing in...' : 'Sign In' }}
    </UButton>
  </UForm>
</template>
