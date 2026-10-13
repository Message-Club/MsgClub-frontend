import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
};

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type AuthInputProps = InputHTMLAttributes<HTMLInputElement>;

type AuthButtonProps = {
  children: ReactNode;
  disabled?: boolean;
};

type AuthFooterLinkProps = {
  text: string;
  linkText: string;
  to: string;
};

type AuthAlertProps = {
  children: ReactNode;
  tone: "success" | "error";
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-[#15151a]">
      <div className="min-h-screen w-full overflow-hidden bg-[#fbfbfc] shadow-[0_24px_70px_rgba(20,31,70,0.16)] sm:rounded-[6px] sm:border sm:border-[#d7e0f2]">
        <div className="flex h-11 items-center border-b border-[#dce3f0] bg-white px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-normal text-[#111116]">💬 Chatroom</h1>
          </div>
          <div className="mx-auto h-6 w-[42%] min-w-[120px] max-w-md rounded-md bg-[#f0f0f1]" />
          <div className="w-[60px]" />
        </div>

        <section className="flex min-h-[calc(100vh-45px)] items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
          {children}
        </section>
      </div>
    </main>
  );
}

export function AuthCard({ title, subtitle, children, onSubmit }: AuthCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[420px] rounded-[22px] border border-[#dfdfdf] bg-white px-6 py-9 text-left shadow-[0_12px_30px_rgba(20,20,20,0.03)] sm:px-9 sm:py-11"
    >
      <div className="mb-9">
        <div className="text-[28px] font-semibold leading-none tracking-normal text-[#111116]">
          {title}
        </div>
        <div className="mt-2 text-[21px] font-normal leading-none tracking-normal text-[#1f1f24]">
          {subtitle}
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </form>
  );
}

export function AuthInput({ className = "", ...props }: AuthInputProps) {
  return (
    <input
      className={`h-[54px] w-full rounded-lg border border-[#e3e3e6] bg-white px-5 text-sm text-[#2c2c33] outline-none transition placeholder:text-[#b7b7bd] focus:border-[#0916e8] focus:shadow-[0_0_0_4px_rgba(9,22,232,0.08)] ${className}`}
      {...props}
    />
  );
}

export function AuthButton({ children, disabled }: AuthButtonProps) {
  return (
    <button
      className="mt-4 h-[54px] w-full rounded-lg bg-[#0614ea] text-sm font-medium text-white shadow-[0_18px_34px_rgba(6,20,234,0.18)] transition hover:bg-[#0611c9] focus:outline-none focus:ring-4 focus:ring-[rgba(6,20,234,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function AuthTextLink({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Link className="text-sm font-medium text-[#5f5f66] transition hover:text-[#0614ea]" to={to}>
      {children}
    </Link>
  );
}

export function AuthFooterLink({ text, linkText, to }: AuthFooterLinkProps) {
  return (
    <p className="pt-4 text-center text-sm font-medium text-[#74747a]">
      {text}{" "}
      <Link className="font-semibold text-[#3e3e45] transition hover:text-[#0614ea]" to={to}>
        {linkText}
      </Link>
    </p>
  );
}

export function AuthAlert({ children, tone }: AuthAlertProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <p className={`rounded-lg border px-4 py-3 text-sm leading-5 ${toneClass}`}>
      {children}
    </p>
  );
}
