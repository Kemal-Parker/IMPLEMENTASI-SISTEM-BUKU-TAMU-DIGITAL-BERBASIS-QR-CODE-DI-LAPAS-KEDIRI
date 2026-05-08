import { createServer as createViteServer } from "vite";
async function test() {
  console.log("Creating dev server...");
  try {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    console.log("Vite server created successfully");
  } catch (e) {
    console.error("Vite server creation error:", e);
  }
}
test();
