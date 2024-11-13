import React from 'react';

interface LogoProps {
  width?: number | string;
  height?: number | string;
  primaryColor?: string;
  secondaryColor?: string;
  borderColor?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'transparent';
}

const Logo: React.FC<LogoProps> = ({
  width = 180,
  height = 180,
  primaryColor,
  secondaryColor,
  borderColor,
  className = '',
  variant = 'light'
}) => {
  // Default color schemes
  const themes = {
    light: {
      primary: '#000000',
      secondary: '#FF6138',
      border: '#000000'
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#FF6138',
      border: '#FFFFFF'
    },
    transparent: {
        primary: 'transparent',
        secondary: '#FF6138',
        border: 'transparent'
        },
  };

  // Use custom colors or fall back to theme colors
  const colors = {
    primary: primaryColor || themes[variant].primary,
    secondary: secondaryColor || themes[variant].secondary,
    border: borderColor || themes[variant].border
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 180"
      role="img"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {/* Primary shapes */}
        <path
          style={{
            display: 'inline',
            fill: colors.primary,
            fillOpacity: 1,
            stroke: 'none',
            strokeWidth: 2.18548
          }}
          d="M 8.1818157,8.1818147 V 139.09091 171.8182 H 40.90909 139.09092 V 139.09091 H 40.90909 V 8.1818147 Z"
        />
        <path
          style={{
            display: 'inline',
            fill: colors.primary,
            fillOpacity: 1,
            stroke: 'none',
            strokeWidth: 1.82851
          }}
          d="M 73.636363,8.1818147 V 9.1086609 39.982243 122.72728 H 106.36364 V 90.000002 h 32.72728 V 57.272728 H 106.36364 V 40.90909 h 64.52771 c 0.51323,0 0.92684,-0.4136 0.92684,-0.926847 V 9.1086609 c 0,-0.5132463 -0.41361,-0.9268462 -0.92684,-0.9268462 h -64.52771 z"
        />
        
        {/* Accent color shape */}
        <path
          style={{
            fill: colors.secondary,
            fillOpacity: 1,
            stroke: 'none',
            strokeWidth: 1.58474,
            strokeLinecap: 'square',
            strokeLinejoin: 'round',
            strokeOpacity: 1,
            paintOrder: 'markers fill stroke'
          }}
          d="M 44.999999,8.1818147 V 135.00001 h 18.691939 5.853516 43.246986 30.38938 v 36.81819 h 28.63637 V 44.999999 h -12.26315 -49.10049 v 8.181819 h 32.72727 V 94.090912 H 110.45455 V 126.81819 H 69.545454 V 8.1818147 Z"
        />
        
        {/* Border */}
        <rect
          style={{
            fill: 'none',
            fillOpacity: 1,
            stroke: colors.border,
            strokeWidth: 4.18604,
            strokeLinecap: 'square',
            strokeLinejoin: 'miter',
            strokeDasharray: 'none',
            strokeOpacity: 1,
            paintOrder: 'markers fill stroke'
          }}
          width="175.81396"
          height="175.81395"
          x="2.09302"
          y="2.09302"
        />
      </g>
    </svg>
  );
};

export default Logo;