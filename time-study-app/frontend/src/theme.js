import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
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
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
        },
        ghost: {
          color: "gray.600",
          _hover: {
            bg: "gray.100",
          },
        },
        destructive: {
          bg: "red.500",
          color: "white",
          _hover: {
            bg: "red.600",
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          borderRadius: "md",
          boxShadow: "base",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "gray.200",
        },
        header: {
          padding: "6",
          borderBottom: "1px solid",
          borderColor: "gray.100",
        },
        body: {
          padding: "6",
        },
        footer: {
          padding: "6",
          borderTop: "1px solid",
          borderColor: "gray.100",
        },
      },
    },
  },
});

export default theme;
