// Card component without Tilt (for fallback)
const BasicCard: React.FC<{
    children: React.ReactNode;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }> = ({ children, isHovered, onMouseEnter, onMouseLeave }) => {
    return (
      <div
        className="w-full h-full rounded-[20px] shadow-card bg-tertiary overflow-hidden relative"
        style={{
          boxShadow: isHovered 
            ? '0 20px 40px -20px rgba(0, 0, 0, 0.7)' 
            : '0 10px 30px -15px rgba(0, 0, 0, 0.5)',
          transform: isHovered ? 'translateY(-5px)' : 'none',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    );
  };

export default BasicCard;