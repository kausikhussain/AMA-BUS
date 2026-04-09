export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const saved = localStorage.getItem("amaride.theme");
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (saved === "dark" || (!saved && prefersDark)) {
              document.documentElement.classList.add("dark");
            }
          } catch (error) {}
        `
      }}
    />
  );
}
