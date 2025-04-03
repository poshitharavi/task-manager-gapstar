import { ReactNode, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface InputFieldProps {
  type: string;
  placeholder: string;
  icon: ReactNode;
  showPasswordToggle?: boolean;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  type,
  placeholder,
  icon,
  showPasswordToggle = false,
  value,
  required = false,
  onChange,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex items-center gap-2 bg-gray-800 p-2 rounded-xl relative">
      {icon}
      <input
        type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        className="bg-transparent border-0 w-full outline-none text-sm md:text-base"
        value={value}
        onChange={onChange}
        required={required}
      />
      {showPasswordToggle && (
        <div
          className="absolute right-5 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </div>
      )}
    </div>
  );
};

export default InputField;
