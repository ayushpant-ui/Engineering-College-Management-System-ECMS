import ChangePasswordForm from "@/components/modules/student/ChangePasswordForm";

export const metadata = {
  title: "Change Password | School of Engineering",
};

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <ChangePasswordForm />
    </div>
  );
}