import { ReactNode } from "react";

interface BodyCardProps {
  children: ReactNode;
  title?: string;
  headerContent?: ReactNode;
}

const BodyCard = ({ children, title, headerContent }: BodyCardProps) => {
  return (
    <div className="w-[90%] max-w-6xl p-6 bg-gray-900 rounded-xl shadow-slate-500 shadow-lg mb-10">
      {(title || headerContent) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {headerContent}
        </div>
      )}
      {children}
    </div>
  );
};

export default BodyCard;
