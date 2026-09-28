// Generated from YAML by scripts/build-design-system.mjs. Do not edit.
export const profiles = {
  "lyra": {
    "version": 1,
    "revision": "2026-09-27.1",
    "palette": {
      "neutral": {
        "100": "#ffffff",
        "300": "#d0d8d2",
        "500": "#7b8984",
        "700": "#0c0e10",
        "900": "#050606"
      },
      "primary": {
        "100": "#c5f4e1",
        "300": "#68d9ae",
        "500": "#00b377",
        "700": "#00865b",
        "900": "#005239"
      },
      "secondary": {
        "100": "#d5e9df",
        "300": "#90b4a4",
        "500": "#357b60",
        "700": "#155d46",
        "900": "#103d30"
      },
      "accent": {
        "100": "#f3facb",
        "300": "#e0ef94",
        "500": "#ccee44",
        "700": "#92ae28",
        "900": "#4b6016"
      }
    },
    "semantic": {
      "page": "neutral.900",
      "surface": "neutral.700",
      "surfaceRaised": "neutral.700",
      "surfaceInset": "neutral.900",
      "text": "neutral.100",
      "textMuted": "neutral.300",
      "border": "neutral.500",
      "focus": "accent.500",
      "primaryFill": "primary.500",
      "primaryText": "neutral.900",
      "secondaryFill": "neutral.100",
      "secondaryText": "neutral.900",
      "headerFill": "neutral.900",
      "headerText": "neutral.100"
    },
    "status": {
      "success": "#64db9f",
      "warning": "#e2be6a",
      "error": "#ff8d83",
      "info": "#8fc7ff"
    },
    "data": [
      "#00b377",
      "#ccee44",
      "#6aafce",
      "#c796e4",
      "#e19c67"
    ],
    "media": [
      "#4c5585",
      "#bc7389",
      "#cca879",
      "#325d62",
      "#99929e"
    ],
    "material": {
      "opacity": 0.72,
      "blur": 24,
      "saturation": 1.35,
      "borderOpacity": 0.14
    },
    "personal": [
      "material.opacity",
      "material.blur",
      "typography.scale"
    ],
    "id": "lyra",
    "label": "Lyra",
    "fonts": {
      "system": {
        "family": "system-ui",
        "fallback": "sans-serif",
        "assets": [],
        "axes": {
          "wght": [
            100,
            900
          ]
        },
        "weights": [
          400,
          600,
          700
        ]
      },
      "system_mono": {
        "family": "ui-monospace",
        "fallback": "monospace",
        "assets": [],
        "axes": {
          "wght": [
            100,
            900
          ]
        },
        "weights": [
          400,
          600,
          700
        ]
      }
    },
    "typography": {
      "scale": 1,
      "roles": {
        "sans_heading": {
          "font": "system",
          "size": 32,
          "weight": 700,
          "lineHeight": 1.15,
          "tracking": -0.03,
          "width": null
        },
        "sans_body": {
          "font": "system",
          "size": 16,
          "weight": 400,
          "lineHeight": 1.5,
          "tracking": 0,
          "width": null
        },
        "label": {
          "font": "system",
          "size": 12,
          "weight": 600,
          "lineHeight": 1.4,
          "tracking": 0.02,
          "width": null
        },
        "control": {
          "font": "system",
          "size": 14,
          "weight": 600,
          "lineHeight": 1.2,
          "tracking": 0,
          "width": null
        },
        "mono": {
          "font": "system_mono",
          "size": 12,
          "weight": 400,
          "lineHeight": 1.5,
          "tracking": 0,
          "width": null
        }
      }
    }
  },
  "photography": {
    "version": 1,
    "revision": "2026-09-27.1",
    "palette": {
      "neutral": {
        "100": "#ffffff",
        "300": "#d4d1cb",
        "500": "#9a9893",
        "700": "#1a1b1d",
        "900": "#0b0b0b"
      },
      "primary": {
        "100": "#c5f4e1",
        "300": "#68d9ae",
        "500": "#00b377",
        "700": "#00865b",
        "900": "#005239"
      },
      "secondary": {
        "100": "#ece4c7",
        "300": "#d9c785",
        "500": "#d2c27a",
        "700": "#b3902e",
        "900": "#7d621d"
      },
      "accent": {
        "100": "#d7f0e7",
        "300": "#7fc5aa",
        "500": "#329c78",
        "700": "#155d46",
        "900": "#0c3628"
      }
    },
    "semantic": {
      "page": "neutral.900",
      "surface": "neutral.700",
      "surfaceRaised": "neutral.700",
      "surfaceInset": "neutral.900",
      "text": "neutral.100",
      "textMuted": "neutral.300",
      "border": "neutral.500",
      "focus": "secondary.500",
      "primaryFill": "primary.500",
      "primaryText": "neutral.900",
      "secondaryFill": "neutral.100",
      "secondaryText": "neutral.900",
      "headerFill": "neutral.900",
      "headerText": "neutral.100"
    },
    "status": {
      "success": "#64db9f",
      "warning": "#e2be6a",
      "error": "#ff8d83",
      "info": "#8fc7ff"
    },
    "data": [
      "#00b377",
      "#ccee44",
      "#6aafce",
      "#c796e4",
      "#e19c67"
    ],
    "media": [
      "#4c5585",
      "#bc7389",
      "#cca879",
      "#325d62",
      "#99929e"
    ],
    "material": {
      "opacity": 0.72,
      "blur": 24,
      "saturation": 1.35,
      "borderOpacity": 0.14
    },
    "personal": [
      "material.opacity",
      "material.blur",
      "typography.scale"
    ],
    "id": "photography",
    "label": "Photography",
    "fonts": {
      "lustria": {
        "family": "Lustria",
        "fallback": "serif",
        "assets": [
          {
            "url": "./assets/fonts/lustria-latin-400-normal.woff2",
            "weight": "400",
            "style": "normal"
          }
        ],
        "axes": {},
        "weights": [
          400
        ]
      },
      "mulish": {
        "family": "Mulish",
        "fallback": "sans-serif",
        "assets": [
          {
            "url": "./assets/fonts/Mulish-VariableFont_wght.ttf",
            "weight": "200 1000",
            "style": "normal"
          }
        ],
        "axes": {
          "wght": [
            200,
            1000
          ]
        },
        "weights": [
          400,
          600,
          700
        ]
      },
      "cormorant": {
        "family": "Cormorant Infant",
        "fallback": "serif",
        "assets": [
          {
            "url": "./assets/fonts/cormorant_infant-latin-400-normal.woff2",
            "weight": "400",
            "style": "normal"
          },
          {
            "url": "./assets/fonts/cormorant_infant-latin-500-normal.woff2",
            "weight": "500",
            "style": "normal"
          },
          {
            "url": "./assets/fonts/cormorant_infant-latin-700-normal.woff2",
            "weight": "700",
            "style": "normal"
          }
        ],
        "axes": {},
        "weights": [
          400,
          500,
          700
        ]
      },
      "great_vibes": {
        "family": "Great Vibes",
        "fallback": "cursive",
        "assets": [
          {
            "url": "./assets/fonts/great-vibes-latin-400-normal.woff2",
            "weight": "400",
            "style": "normal"
          }
        ],
        "axes": {},
        "weights": [
          400
        ]
      },
      "jetbrains_mono": {
        "family": "JetBrains Mono",
        "fallback": "monospace",
        "assets": [
          {
            "url": "./assets/fonts/jetbrains-mono-latin-400-normal.woff2",
            "weight": "400",
            "style": "normal"
          }
        ],
        "axes": {},
        "weights": [
          400
        ]
      }
    },
    "typography": {
      "scale": 1,
      "roles": {
        "serif_heading": {
          "font": "lustria",
          "size": 40,
          "weight": 400,
          "lineHeight": 1.2,
          "tracking": -0.025,
          "width": null
        },
        "sans_heading": {
          "font": "mulish",
          "size": 28,
          "weight": 600,
          "lineHeight": 1.2,
          "tracking": -0.02,
          "width": null
        },
        "serif_body": {
          "font": "cormorant",
          "size": 23,
          "weight": 400,
          "lineHeight": 1.55,
          "tracking": 0,
          "width": null
        },
        "sans_body": {
          "font": "mulish",
          "size": 16,
          "weight": 400,
          "lineHeight": 1.6,
          "tracking": 0,
          "width": null
        },
        "label": {
          "font": "mulish",
          "size": 12,
          "weight": 600,
          "lineHeight": 1.4,
          "tracking": 0.06,
          "width": null
        },
        "control": {
          "font": "mulish",
          "size": 14,
          "weight": 600,
          "lineHeight": 1.3,
          "tracking": 0,
          "width": null
        },
        "script": {
          "font": "great_vibes",
          "size": 34,
          "weight": 400,
          "lineHeight": 1.4,
          "tracking": 0,
          "width": null
        },
        "mono": {
          "font": "jetbrains_mono",
          "size": 12,
          "weight": 400,
          "lineHeight": 1.6,
          "tracking": 0,
          "width": null
        }
      }
    }
  }
};
