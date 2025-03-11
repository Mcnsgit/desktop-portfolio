import React from 'react';
interface LabelProps {
  children: React.ReactNode;
  animateRerendering?: boolean;
  color?: 'default' | 'red' | 'green' | 'yellow' | 'blue' | 'indigo' | 'purple' | 'pink';
}
const Boundary: React.FC<LabelProps> = ({ children, color = 'default' }) => {
    const colorClasses: { [key: string]: boolean } = {
        'bg-red-500': color === 'red',
        'bg-green-500': color === 'green',
        'bg-yellow-500': color === 'yellow',
        'bg-blue-500': color === 'blue',
        'bg-indigo-500': color === 'indigo',        
        'bg-purple-500': color === 'purple',
        'bg-pink-500': color === 'pink',
        'bg-gray-500': color === 'default',
    };
    const className = `rounded-full px-1.5 shadow-[0_0_1px_3px_black] ${Object.keys(colorClasses).filter(key => colorClasses[key]).join(' ')}`;
    return (
        <div className={className}>
            <p className="text-xs font-mono text-white">{children}</p>
        </div>
    );
};

export { Boundary };