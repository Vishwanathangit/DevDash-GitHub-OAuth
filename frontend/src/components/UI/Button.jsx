import { forwardRef } from "react";

const Button = forwardRef(({
  children,
  variant = "primary",
  className = "",
  as: Component = "button",
  ...props
}, ref) => {
  const baseClasses = "px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <Component
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </Component>
  );
});

Button.displayName = "Button";

export default Button;