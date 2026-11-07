"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, KeyRound, Loader2, RefreshCw, Trash2, TriangleAlert } from "lucide-react";

import { getStoredSession, updateStoredSession } from "@/lib/auth-session";
import {
  departmentLabel,
  studentFetch,
  StudentApiError,
  type StudentProfile,
} from "@/lib/student-api";
import PhotoCropperModal from "./PhotoCropperModal";
import StudentAvatar from "./StudentAvatar";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 2 * 1024 * 1024; // the picture is resized before upload, so this only guards decoding

const card = "rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60";

const message = (err: unknown) =>
  err instanceof StudentApiError ? err.message : "Something went wrong. Please try again.";

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [photoVersion, setPhotoVersion] = useState(0);

  const [file, setFile] = useState<File | null>(null); // picture waiting in the crop dialog
  const [photoError, setPhotoError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }, []);

  // Show what we already know right away, then refresh from the server
  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login"); 
      return;
    }
    setProfile((prev) => prev ?? { ...session });

    let cancelled = false;
    setLoadError("");
    studentFetch<StudentProfile>("/students/me/profile")
      .then((data) => !cancelled && setProfile((prev) => ({ ...(prev as StudentProfile), ...data })))
      .catch((err) => !cancelled && setLoadError(message(err)));
    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!chosen) return;

    if (!ALLOWED_TYPES.includes(chosen.type)) {
      setPhotoError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (chosen.size > MAX_FILE_BYTES) {
      setPhotoError("That image is too large. Please choose one under 8 MB.");
      return;
    }
    setPhotoError("");
    setFile(chosen);
  }

  async function uploadPhoto(blob: Blob) {
    const form = new FormData();
    form.append("photo", blob, "profile.jpg"); // field name the backend should expect: "photo"
     try {
    const result = await studentFetch<{ photoUrl: string }>(
      "/students/me/profile",
      {
        method: "POST",
        body: form,
      },
    );

    setProfile((prev) =>
      prev ? { ...prev, photoUrl: result.photoUrl } : prev
    );

    updateStoredSession({ photoUrl: result.photoUrl });
    setPhotoVersion(Date.now());

    setFile(null);
    showToast("Profile photo updated.");
  } catch (err) {
    setPhotoError(message(err));
  }
}
  async function removePhoto() {
    setRemoving(true);
    setPhotoError("");
    try {
      await studentFetch("/students/me/profile", { method: "DELETE" });
      setProfile((prev) => (prev ? { ...prev, photoUrl: null } : prev));
      updateStoredSession({ photoUrl: null });
      setConfirmRemove(false);
      showToast("Profile photo removed.");
    } catch (err) {
      setPhotoError(message(err));
    } finally {
      setRemoving(false);
    }
  }

  if (!profile) {
    return <p className="p-8 text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>;
  }

  const extraDetails = [
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Address", value: profile.address },
    { label: "Date of birth", value: formatDate(profile.dateOfBirth) },
  ].filter((item): item is { label: string; value: string } => !!item.value);

  const details = [
    { label: "Full name", value: profile.fullName },
    { label: "Registration number", value: profile.registrationNumber },
    { label: "Department", value: departmentLabel(profile.department) },
    { label: "Semester", value: String(profile.semester) },
    ...extraDetails,
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your photo and academic details.</p>
      </div>

      {toast && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span className="flex-1">{loadError} Showing the details saved from your last login.</span>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 font-medium hover:bg-amber-100 dark:border-amber-500/40 dark:hover:bg-amber-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photo */}
        <section className={`${card} flex flex-col items-center text-center`}>
          <StudentAvatar
            name={profile.fullName}
            photoUrl={profile.photoUrl}
            version={photoVersion}
            className="h-36 w-36 text-4xl"
          />
          <h2 className="mt-4 font-serif text-lg font-bold">{profile.fullName}</h2>
          <p className="text-sm text-muted-foreground">{profile.registrationNumber}</p>

          <input ref={fileInput} type="file" accept={ALLOWED_TYPES.join(",")} onChange={onFileChosen} className="hidden" />

          <div className="mt-5 flex w-full flex-col gap-2">
            <button
              onClick={() => fileInput.current?.click()}
              disabled={removing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
              {profile.photoUrl ? "Change photo" : "Upload photo"}
            </button>

            {profile.photoUrl &&
              (confirmRemove ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm dark:border-red-500/30">
                  <span className="text-red-600 dark:text-red-400">Remove your photo?</span>
                  <button
                    onClick={removePhoto}
                    disabled={removing}
                    className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400"
                  >
                    {removing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Yes
                  </button>
                  <button onClick={() => setConfirmRemove(false)} disabled={removing} className="font-semibold">
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRemove(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:border-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove photo
                </button>
              ))}
          </div>

          {photoError && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {photoError}
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">JPG, PNG or WebP. A clear, front-facing photo works best.</p>
        </section>

        <div className="space-y-6 lg:col-span-2">
          {/* Details */}
          <section className={card}>
            <h2 className="font-serif text-lg font-bold">Academic details</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs text-muted-foreground">
              Something incorrect? Details are managed by the college office, so please contact them to request a
              change.
            </p>
          </section>

          {/* Account */}
          <section className={card}>
            <h2 className="font-serif text-lg font-bold">Account security</h2>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  {profile.mustChangePassword
                    ? "You're using a temporary password. Please change it."
                    : "Change it regularly and never share it."}
                </p>
              </div>
              <Link
                href="/student/change-password"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <KeyRound className="h-4 w-4" />
                Change password
              </Link>
            </div>
          </section>
        </div>
      </div>

      {file && <PhotoCropperModal file={file} onCancel={() => setFile(null)} onConfirm={uploadPhoto} />}
    </div>
  );
}
