/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-inter)'
  			],
  			tight: [
  				'var(--font-inter-tight)'
  			]
  		},
  		colors: {
  			'studio-bg': '#191919',
  			'studio-sidebar': '#1E1F20',
  			'studio-card': '#2A2A2E',
  			'studio-card-hover': '#3A3A3E',
  			'studio-icon-bg': '#404144',
  			'studio-border': '#2A2A2E',
  			'studio-blue': '#8AB4F8',
  			'studio-gray': {
  				'400': '#9AA0A6',
  				'500': '#5F6368'
  			},
  			'studio-text': {
  				primary: '#E8EAED',
  				secondary: '#9AA0A6',
  				tertiary: '#5F6368'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  				},
		fontSize: {
			'xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-tight)' }],
			'sm': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-tight)' }],
			'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
			'lg': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-normal)' }],
			'xl': ['var(--font-size-xl)', { lineHeight: 'var(--line-height-normal)' }],
			'2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-normal)' }],
			'headline-2': ['var(--headline-2-font-size)', { 
				lineHeight: 'var(--headline-2-line-height)',
				letterSpacing: 'var(--headline-2-letter-spacing)',
				fontWeight: 'var(--headline-2-font-weight)'
			}]
		},
		lineHeight: {
			'tight': 'var(--line-height-tight)',
			'normal': 'var(--line-height-normal)',
			'relaxed': 'var(--line-height-relaxed)'
		},
		letterSpacing: {
			'tight': 'var(--letter-spacing-tight)',
			'normal': 'var(--letter-spacing-normal)',
			'wide': 'var(--letter-spacing-wide)'
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			grid: {
  				'0%': {
  					transform: 'translateY(-50%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			grid: 'grid 150s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 