export default defineNuxtRouteMiddleware(async (to, _from) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo('/login');
  }
});
