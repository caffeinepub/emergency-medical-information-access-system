import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MedicalHistory, MedicalProfile, UserProfile } from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

// ─── User Profile ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Patient Profile ─────────────────────────────────────────────────────────

export function useGetMyMedicalProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<MedicalProfile | null>({
    queryKey: ["myMedicalProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyMedicalProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdatePatientProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: MedicalProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updatePatientProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMedicalProfile"] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.assignCallerUserRole(user, role);
    },
  });
}

// ─── Public Emergency Profile ────────────────────────────────────────────────

export function useGetPublicMedicalProfile(patientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<{
    age: bigint;
    name: string;
    emergencyContact: string;
    bloodGroup: string;
    allergies: Array<string>;
  } | null>({
    queryKey: ["publicMedicalProfile", patientId?.toText()],
    queryFn: async () => {
      if (!actor || !patientId)
        throw new Error("Actor or patientId not available");
      return actor.getPublicMedicalProfile(patientId);
    },
    enabled: !!actor && !actorFetching && !!patientId,
  });
}

// ─── Doctor Queries ──────────────────────────────────────────────────────────

export function useSearchProfilesByName(name: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Array<[Principal, MedicalProfile]>>({
    queryKey: ["searchProfiles", name],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchProfilesByName(name);
    },
    enabled: !!actor && !actorFetching && name.trim().length > 0,
  });
}

export function useGetFullMedicalProfile(patientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<MedicalProfile | null>({
    queryKey: ["fullMedicalProfile", patientId?.toText()],
    queryFn: async () => {
      if (!actor || !patientId)
        throw new Error("Actor or patientId not available");
      return actor.getFullMedicalProfile(patientId);
    },
    enabled: !!actor && !actorFetching && !!patientId,
  });
}

export function useGetMedicalHistory(patientId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Array<MedicalHistory>>({
    queryKey: ["medicalHistory", patientId?.toText()],
    queryFn: async () => {
      if (!actor || !patientId)
        throw new Error("Actor or patientId not available");
      return actor.getMedicalHistory(patientId);
    },
    enabled: !!actor && !actorFetching && !!patientId,
  });
}

export function useUpdateMedicalProfileForDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      newProfile,
      changes,
    }: {
      patientId: Principal;
      newProfile: MedicalProfile;
      changes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateMedicalProfileForDoctor(patientId, newProfile, changes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fullMedicalProfile", variables.patientId.toText()],
      });
      queryClient.invalidateQueries({
        queryKey: ["medicalHistory", variables.patientId.toText()],
      });
    },
  });
}

export function useAddMedicalNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      note,
    }: {
      patientId: Principal;
      note: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addMedicalNote(patientId, note);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["medicalHistory", variables.patientId.toText()],
      });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export { UserRole };
