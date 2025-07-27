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
const guests = ref<Guest[]>([]);
const isLoading = ref(false);
const isSendingSms = ref(false);
const smsMessage = ref('');
const costPerGuest = ref(0.09);

// Computed properties
const smsCount = computed(() => {
  if (!guests.value?.length || !smsMessage.value) return 0;
  // Estimate SMS count (assuming 160 chars per SMS)
  const charCount = smsMessage.value.length;
  const messagesPerGuest = Math.ceil(charCount / 160);
  return guests.value.length * messagesPerGuest;
});

const totalCost = computed(() => {
  return ((guests.value?.length || 0) * costPerGuest.value).toFixed(2);
});

const smsCostEstimate = computed(() => {
  // Assuming $0.0075 per SMS (Twilio pricing)
  return (smsCount.value * 0.0075).toFixed(2);
});

// Methods
const fetchGuests = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await client.from('guests').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    guests.value = data || [];
  } catch (error: any) {
    toast.add({
      title: 'Error fetching guests',
      description: error.message,
      color: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

const refreshGuests = () => {
  fetchGuests();
};

const sendSmsToAll = async () => {
  if (!smsMessage.value.trim() || !guests.value?.length) return;

  isSendingSms.value = true;
  try {
    const response = await $fetch('/api/admin/send-sms', {
      method: 'POST',
      body: {
        message: smsMessage.value,
        guestIds: guests.value.map((g) => g.id),
      },
    });

    toast.add({
      title: 'SMS Sent Successfully',
      description: `Message sent to ${guests.value.length} guests`,
      color: 'success',
    });

    smsMessage.value = '';
  } catch (error: any) {
    toast.add({
      title: 'Error sending SMS',
      description: error.message,
      color: 'error',
    });
  } finally {
    isSendingSms.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

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

// Fetch guests on mount
await fetchGuests();
</script>

<template>
  <div class="">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-gray-600 mt-2">Manage guests and send notifications</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ user?.email }}</span>
          <UButton @click="handleLogout" variant="ghost" color="error" size="sm">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="mr-2" />
            Logout
          </UButton>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <UIcon name="i-heroicons-users" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Guests</p>
            <p class="text-2xl font-bold text-gray-900">{{ guests?.length || 0 }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <UIcon name="i-heroicons-currency-dollar" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Cost</p>
            <p class="text-2xl font-bold text-gray-900">${{ totalCost }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <UIcon name="i-heroicons-chat-bubble-left-right" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">SMS Cost</p>
            <p class="text-2xl font-bold text-gray-900">${{ smsCostEstimate }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Guests Table -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Guest List</h3>
              <UButton @click="refreshGuests" :loading="isLoading" variant="ghost" size="sm" block>
                <UIcon name="i-heroicons-arrow-path" />
                Refresh
              </UButton>
            </div>
          </template>

          <div v-if="isLoading" class="flex justify-center py-8">
            <UIcon name="i-heroicons-arrow-path" />
          </div>
          <div v-else-if="guests.length === 0" class="text-center py-8 text-gray-500">
            <UIcon name="i-heroicons-users" />
            <p>No guests found</p>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="guest in guests"
              :key="guest.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ guest.name || 'Anonymous' }}</p>
                <p class="text-sm text-gray-600 font-mono">{{ guest.phone_number }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">{{ formatDate(guest.created_at) }}</p>
                <UBadge v-if="guest.agreed_to_notifications" color="success" variant="soft" size="xs">
                  Notifications
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- SMS Panel -->
      <div class="space-y-6">
        <!-- Send SMS to All -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Send SMS to All Guests</h3>
          </template>

          <form @submit.prevent="sendSmsToAll" class="space-y-4">
            <UTextarea v-model="smsMessage" placeholder="Enter your message here..." :rows="4" required />

            <div class="flex items-center justify-between text-sm text-gray-600">
              <span>{{ smsMessage.length }} characters</span>
              <span>{{ smsCount }} SMS messages</span>
            </div>

            <UButton type="submit" :loading="isSendingSms" :disabled="!smsMessage.trim() || !guests?.length">
              Send to {{ guests?.length || 0 }} Guests
            </UButton>
          </form>
        </UCard>

        <!-- Cost Settings -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Cost Settings</h3>
          </template>

          <div class="space-y-4">
            <UFormField label="Cost per Guest ($)">
              <UInput v-model="costPerGuest" type="number" min="0" step="0.01" placeholder="0.09" />
            </UFormField>

            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Guests:</span>
                  <span>{{ guests?.length || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Cost per guest:</span>
                  <span>${{ costPerGuest }}</span>
                </div>
                <div class="flex justify-between font-medium border-t pt-1">
                  <span>Total Cost:</span>
                  <span>${{ totalCost }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
