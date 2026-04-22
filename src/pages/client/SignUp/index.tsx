import SignupForm from "./components/SignupForm";

const SignupPage = () => {
  return (
    // Sử dụng màu nền THEME_PRIMARY (#f5f4ef) đã định nghĩa trong v4
    <div className="min-h-screen flex items-center justify-center bg-theme-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Form đăng ký nằm gọn trong card trắng */}
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;