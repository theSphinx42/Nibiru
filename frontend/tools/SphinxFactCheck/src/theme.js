import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    brand: {
      50: "#f0e7ff",
      100: "#d1beff",
      200: "#b294ff",
      300: "#946aff",
      400: "#7540ff",
      500: "#5616e6", // primary color
      600: "#4510b3",
      700: "#340b81",
      800: "#230650",
      900: "#12021f",
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
      },
    },
    Badge: {
      variants: {
        success: {
          bg: "green.100",
          color: "green.800",
        },
        warning: {
          bg: "orange.100",
          color: "orange.800",
        },
        error: {
          bg: "red.100",
          color: "red.800",
        },
        info: {
          bg: "blue.100",
          color: "blue.800",
        },
      },
    },
  },
}); 