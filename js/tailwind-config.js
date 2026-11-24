// Tailwind Play CDN config — must load immediately after the cdn.tailwindcss.com script.
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
        },
      },
    };
