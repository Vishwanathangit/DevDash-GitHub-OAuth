import { forwardRef } from 'react';
import clsx from 'clsx';

const Card = forwardRef(({
  children,
  className = '',
  hoverEffect = true,
  padding = 'p-6',
  as: Component = 'div',
  ...props
}, ref) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden';
  const hoverClasses = hoverEffect ? 'hover:shadow-md transition-shadow duration-200' : '';

  return (
    <Component
      ref={ref}
      className={clsx(
        baseClasses,
        hoverClasses,
        padding,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;

export const CardHeader = ({ children, className = '', ...props }) => (
  <div 
    className={clsx(
      'px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 
    className={clsx(
      'text-lg font-semibold text-gray-800',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div 
    className={clsx(
      'p-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div 
    className={clsx(
      'px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl',
      className
    )}
    {...props}
  >
    {children}
  </div>
);