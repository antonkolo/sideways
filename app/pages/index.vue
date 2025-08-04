<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod';

const schema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  email: z.email('Please enter a valid email address'),
  agreedToNotifications: z.boolean().refine((val) => val === true, 'You must agree to receive notifications'),
});

const state = reactive<Partial<Schema>>({
  phoneNumber: '',
  email: '',
  agreedToNotifications: false,
});

type Schema = z.output<typeof schema>;

const toast = useToast();
const isBlurred = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const response = await $fetch('/api/guests', {
      method: 'POST',
      body: {
        phoneNumber: event.data.phoneNumber,
        email: event.data.email,
        agreedToNotifications: event.data.agreedToNotifications,
      },
    });

    if (!response?.success) {
      toast.add({
        title: 'Error',
        description: 'You are already subscribed to our events.',
        color: 'warning',
        icon: 'i-heroicons-exclamation-circle  ',
      });
      return;
    }

    // Show success message
    toast.add({
      title: 'Success!',
      description: 'Information saved successfully! You will receive updates about upcoming sideways events.',
      color: 'success',
    });

    // Reset form
    state.phoneNumber = '';
    state.email = '';
    state.agreedToNotifications = false;
  } catch (error: any) {
    console.error('Error saving information:', error);
    toast.add({
      title: 'Error',
      description: 'There was an error saving your information. Please try again.',
      color: 'error',
    });
  }
}
</script>

<template>
  <Header />
  <div class="mx-auto max-w-2xl">
    <div class="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center lg:p-4">
      <div class="mx-auto flex flex-col items-center justify-center max-w-md gap-2">
        <img
          src="~/assets/svg/sideways.svg"
          alt="Sideways Logo"
          :class="isBlurred ? 'blur-xs' : 'blur-none'"
          class="cursor-pointer transition-all duration-300"
          @click="isBlurred = !isBlurred"
        />
        <h1 class="text-md text-center mb-2">early infos & community specials</h1>
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="bg-white">
          <!-- Phone Number Field -->
          <UFormField label="Phone Number" name="phoneNumber" required>
            <UInput v-model="state.phoneNumber" type="tel" placeholder="+43 681 123 4567" icon="i-heroicons-phone" />
          </UFormField>

          <!-- Email Field (Optional) -->
          <UFormField label="Email (Optional)" name="email">
            <UInput v-model="state.email" type="email" placeholder="Your email" icon="i-heroicons-envelope" />
          </UFormField>

          <!-- Agreement Checkbox -->
          <UFormField name="agreedToNotifications">
            <UCheckbox
              v-model="state.agreedToNotifications"
              label="I agree to receive information about upcoming Sideways events"
              required
            />
          </UFormField>

          <!-- Submit Button -->
          <UButton type="submit" loading-icons="i-heroicons-check" size="lg" variant="solid" color="primary" block>
            Subscribe
          </UButton>
        </UForm>

        <p class="text-dimmed text-center md:text-left text-sm md:mt-2">
          * By signing up, you agree to receive SMS notifications about our events
        </p>
      </div>
    </div>
  </div>
</template>
