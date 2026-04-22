import ForgetPasswordForm from "./components/ForgetPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfbf7] px-4">
      {/* Container bọc ngoài để căn giữa */}
      <div className="w-full max-w-md">
        <ForgetPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;