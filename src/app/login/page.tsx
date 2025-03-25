import { LoginForm } from "@/components/login-form";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/images/LOGIN.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative h-full w-full flex items-center justify-end p-4 md:p-8 lg:p-64">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-8 flex-col items-center">
            <div className="p-4">
              <Image
                src="/images/habibi with brown.png"
                width={500}
                height={500}
                alt="HABI-BI LOGO"
                className="rounded-2xl"
              />
              <p className="text-muted-foreground pt-4 text-center">Welcome back! Please login to continue.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}