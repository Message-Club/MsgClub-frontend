import {
  defineConfig,
  loadEnv,
} from "vite";
import react from "@vitejs/plugin-react";

const parseCsv = (
  value?: string
) => {
  return (value || "")
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
};

export default defineConfig(
  ({ mode }) => {
    const env = loadEnv(
      mode,
      process.cwd(),
      ""
    );
    const allowedHosts =
      parseCsv(
        env
          .VITE_ALLOWED_HOSTS
      );

    return {
      plugins: [react()],
      server: {
        allowedHosts,
      },
    };
  }
);
