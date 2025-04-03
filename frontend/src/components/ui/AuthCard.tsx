import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  subtitleAction: string;
  children: ReactNode;
  buttonText: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const AuthCard = ({
  title,
  subtitle,
  subtitleAction,
  children,
  buttonText,
  onSubmit,
}: AuthCardProps) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
        <img src="/logo.png" alt="logo" className="w-12 md:w-14" />
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        <p className="text-xs md:text-sm text-gray-500 text-center">
          {subtitle}{" "}
          <span className="text-white cursor-pointer">{subtitleAction}</span>
        </p>

        <div className="w-full flex flex-col gap-3">
          <form className="w-full" onSubmit={onSubmit}>
            {children}
          </form>
          <button
            onClick={onSubmit}
            className="w-full p-2 bg-blue-500 rounded-xl mt-3 hover:bg-blue-600 text-sm md:text-base"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
