import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type for frontend integration
  public type UserProfile = {
    name : Text;
    role : Text; // "patient" or "doctor"
  };

  public type MedicalProfile = {
    name : Text;
    age : Nat;
    bloodGroup : Text;
    allergies : [Text];
    medicalConditions : [Text];
    currentMedications : [Text];
    emergencyContact : Text;
  };

  public type MedicalHistory = {
    timestamp : Int;
    updatedBy : Text; // "Patient" or "Doctor"
    changes : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let medicalProfiles = Map.empty<Principal, MedicalProfile>();
  let medicalHistories = Map.empty<Principal, [MedicalHistory]>();

  // User profile management functions required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Patient functions

  // Patients can retrieve their own medical profile
  public query ({ caller }) func getMyMedicalProfile() : async ?MedicalProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only patients can retrieve their profile");
    };
    medicalProfiles.get(caller);
  };

  // Patients can update their own profile
  public shared ({ caller }) func updatePatientProfile(profile : MedicalProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only patients can update their profile");
    };
    medicalProfiles.add(caller, profile);

    // Record history
    let newEntry : MedicalHistory = {
      timestamp = 0; // For simplicity, timestamp is set to 0. Replace with real timestamp if needed.
      updatedBy = "Patient";
      changes = "Profile updated";
    };
    let currentHistory = switch (medicalHistories.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
    medicalHistories.add(caller, currentHistory.concat([newEntry]));
  };

  // Public endpoint to fetch selected fields of a profile (NO AUTHENTICATION)
  public query func getPublicMedicalProfile(patientId : Principal) : async ?{
    name : Text;
    age : Nat;
    bloodGroup : Text;
    allergies : [Text];
    emergencyContact : Text;
  } {
    switch (medicalProfiles.get(patientId)) {
      case (null) { null };
      case (?profile) {
        ?{
          name = profile.name;
          age = profile.age;
          bloodGroup = profile.bloodGroup;
          allergies = profile.allergies;
          emergencyContact = profile.emergencyContact;
        };
      };
    };
  };

  // Doctor functions

  // Doctors can view full patient profiles
  public query ({ caller }) func getFullMedicalProfile(patientId : Principal) : async ?MedicalProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only doctors can view full medical profiles");
    };
    medicalProfiles.get(patientId);
  };

  // Doctors can update patient profiles and add history entries
  public shared ({ caller }) func updateMedicalProfileForDoctor(patientId : Principal, newProfile : MedicalProfile, changes : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only doctors can update medical profiles");
    };

    switch (medicalProfiles.get(patientId)) {
      case (null) {
        Runtime.trap("Patient not found");
      };
      case (?_existingProfile) {
        medicalProfiles.add(patientId, newProfile);

        // Record history
        let newEntry : MedicalHistory = {
          timestamp = 0; // Replace with real timestamp if needed
          updatedBy = "Doctor";
          changes;
        };
        let currentHistory = switch (medicalHistories.get(patientId)) {
          case (null) { [] };
          case (?history) { history };
        };
        medicalHistories.add(patientId, currentHistory.concat([newEntry]));
      };
    };
  };

  // Doctors can add notes to patient history
  public shared ({ caller }) func addMedicalNote(patientId : Principal, note : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only doctors can add medical notes");
    };

    let newEntry : MedicalHistory = {
      timestamp = 0; // Replace with real timestamp if needed
      updatedBy = "Doctor";
      changes = note;
    };
    let currentHistory = switch (medicalHistories.get(patientId)) {
      case (null) { [] };
      case (?history) { history };
    };
    medicalHistories.add(patientId, currentHistory.concat([newEntry]));
  };

  // Doctors can view medical history
  public query ({ caller }) func getMedicalHistory(patientId : Principal) : async [MedicalHistory] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only doctors can access medical history");
    };

    switch (medicalHistories.get(patientId)) {
      case (null) { [] };
      case (?history) {
        let historyLength = history.size();
        var copiedHistory : [MedicalHistory] = [];
        var i = 0;
        while (i < historyLength) {
          copiedHistory := copiedHistory.concat([history[i]]);
          i += 1;
        };
        copiedHistory;
      };
    };
  };

  // Doctors can search patients by name
  public query ({ caller }) func searchProfilesByName(name : Text) : async [(Principal, MedicalProfile)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only doctors can search profiles");
    };

    let filtered = medicalProfiles.entries().toArray().filter(
      func((_, profile)) { profile.name.contains(#text name) }
    );
    filtered;
  };
};
