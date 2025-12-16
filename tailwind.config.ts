
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui'],
				serif: ['IBM Plex Serif', 'ui-serif', 'Georgia'],
				primary: ['Inter', 'ui-sans-serif', 'system-ui'],
			},
			fontSize: {
				'heading-1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
				'heading-2': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
				'heading-3': ['1.5rem', { lineHeight: '1.3' }],
				'heading-4': ['1.25rem', { lineHeight: '1.3' }],
				'body': ['1rem', { lineHeight: '1.5' }],
				'button': ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.05em' }],
				'table-header': ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.05em' }],
				'table-cell': ['0.875rem', { lineHeight: '1.4' }],
				'form-label': ['0.875rem', { lineHeight: '1.25' }],
			},
			backdropBlur: {
				'glass': '10px',
			},
			backgroundColor: {
				'glass': 'var(--glass-bg)',
				'glass-hover': 'rgba(255, 255, 255, 0.25)',
			},
			borderColor: {
				'glass': 'var(--glass-border)',
			},
			boxShadow: {
				'glass': 'var(--glass-shadow)',
				'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.15)',
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
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'bounce-subtle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-2px)'
					}
				},
				'glass-shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-up': 'slide-in-up 0.4s ease-out',
				'bounce-subtle': 'bounce-subtle 0.3s ease-in-out',
				'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: { addUtilities: any }) {
			const newUtilities = {
				'.glass': {
					background: 'var(--glass-bg)',
					backdropFilter: 'var(--glass-blur)',
					border: '1px solid var(--glass-border)',
					boxShadow: 'var(--glass-shadow)',
				},
				'.glass-card': {
					background: 'var(--glass-bg)',
					backdropFilter: 'var(--glass-blur)',
					border: '1px solid var(--glass-border)',
					boxShadow: 'var(--glass-shadow)',
					borderRadius: 'var(--radius)',
				},
				'.glass-modal': {
					background: 'var(--glass-bg)',
					backdropFilter: 'var(--glass-blur)',
					border: '1px solid var(--glass-border)',
					boxShadow: 'var(--glass-shadow)',
					borderRadius: 'calc(var(--radius) + 4px)',
				},
				'.glass-dropdown': {
					background: 'var(--glass-bg)',
					backdropFilter: 'var(--glass-blur)',
					border: '1px solid var(--glass-border)',
					boxShadow: 'var(--glass-shadow)',
					borderRadius: 'calc(var(--radius) - 2px)',
					zIndex: '50',
				},
				'.glass-sidebar': {
					background: 'var(--glass-bg)',
					backdropFilter: 'var(--glass-blur)',
					borderRight: '1px solid var(--glass-border)',
					boxShadow: 'var(--glass-shadow)',
				},
				'.hover-scale': {
					'@apply transition-all duration-200 hover:scale-105 hover:shadow-md': {}
				},
				'.hover-lift': {
					'@apply transition-all duration-200 hover:-translate-y-1 hover:shadow-lg': {}
				},
				'.hover-glass': {
					transition: 'all 0.2s ease-in-out',
					'&:hover': {
						background: 'rgba(255, 255, 255, 0.25)',
						transform: 'translateY(-1px)',
						boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
					}
				},
				'.stagger-animation': {
					'animation-delay': 'calc(var(--stagger) * 100ms)'
				}
			}
			addUtilities(newUtilities)
		}
	],
} satisfies Config;
