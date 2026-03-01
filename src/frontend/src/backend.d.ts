import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MedicalProfile {
    age: bigint;
    name: string;
    medicalConditions: Array<string>;
    emergencyContact: string;
    bloodGroup: string;
    allergies: Array<string>;
    currentMedications: Array<string>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface MedicalHistory {
    updatedBy: string;
    timestamp: bigint;
    changes: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMedicalNote(patientId: Principal, note: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFullMedicalProfile(patientId: Principal): Promise<MedicalProfile | null>;
    getMedicalHistory(patientId: Principal): Promise<Array<MedicalHistory>>;
    getMyMedicalProfile(): Promise<MedicalProfile | null>;
    getPublicMedicalProfile(patientId: Principal): Promise<{
        age: bigint;
        name: string;
        emergencyContact: string;
        bloodGroup: string;
        allergies: Array<string>;
    } | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProfilesByName(name: string): Promise<Array<[Principal, MedicalProfile]>>;
    updateMedicalProfileForDoctor(patientId: Principal, newProfile: MedicalProfile, changes: string): Promise<void>;
    updatePatientProfile(profile: MedicalProfile): Promise<void>;
}
