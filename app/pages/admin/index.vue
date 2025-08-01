<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const client = useSupabaseClient();
const toast = useToast();
const user = useSupabaseUser();

// Types
interface Guest {
  id: string;
  name: string | null;
  phone_number: string;
  agreed_to_notifications: boolean;
  created_at: string;
}

// Reactive data

const isSendingSms = ref(false);
const smsMessage = ref('');

// Methods
const {
  data: guests,
  error,
  status,
  refresh,
  clear,
} = await useAsyncData('guests', async () => {
  const { data, error } = await client.from('guests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
});

const handleLogout = async () => {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;

    toast.add({
      title: 'Logged out successfully',
      color: 'success',
    });

    await navigateTo('/login');
  } catch (error: any) {
    toast.add({
      title: 'Error logging out',
      description: error.message,
      color: 'error',
    });
  }
};

watch(error, (newError) => {
  if (newError) {
    useToast().add({
      title: 'Error fetching guests',
      description: newError.message,
      color: 'error',
    });
  }
});
</script>

<template>
  <!-- Header -->
  <div class="mx-auto max-w-5xl flex items-center justify-end p-4">
    <span class="text-sm text-gray-600">{{ user?.email }}</span>
    <UButton @click="handleLogout" variant="ghost" color="error" size="sm">
      <UIcon name="i-heroicons-arrow-right-on-rectangle" class="mr-2" />
      Logout
    </UButton>
  </div>

  <!-- Stats Cards -->
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-blue-10">
            <UIcon name="i-heroicons-users" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Guests</p>
            <p class="text-2xl font-bold text-gray-900">{{ guests?.length || 0 }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Guests Table -->
      <div class="lg:col-span-2">
        <UTable :data="guests" />
      </div>

      <!-- SMS Panel -->
      <div class="space-y-6">
        <!-- Send SMS to All -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Send SMS to All Guests</h3>
          </template>

          <form class="space-y-4">
            <UTextarea
              class="w-full"
              v-model="smsMessage"
              placeholder="Enter your message here..."
              :rows="4"
              required
            />

            <UButton
              color="primary"
              variant="solid"
              class="ml-auto lg:w-full flex justify-center"
              type="submit"
              :loading="isSendingSms"
            >
              Send to {{ guests?.length || 0 }} Guests
            </UButton>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>
