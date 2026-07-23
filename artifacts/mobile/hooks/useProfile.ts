import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';

export type ProfileUser = { id: string; name: string; email: string };

export type UserProfileFields = {
  cpf?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  zipCode?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

export type ProfileData = {
  user: ProfileUser;
  profile: UserProfileFields | null;
};

export type UpdateProfileInput = { name?: string } & UserProfileFields;

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch<ProfileData>('/api/profile'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiFetch<ProfileData>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
}
