import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Why turbopack.root is pinned to this folder.
 *
 * The prototype lives inside ngotag-studio, in its own folder with its own
 * package-lock.json, while Studio's pnpm-lock.yaml sits one level up. Next
 * picks the workspace root by looking for a lockfile, finds both, and
 * settles on Studio's — so it warns on every build and resolves modules
 * from a root this app does not own. Pinning the root to this folder keeps
 * the prototype self-contained, which is the whole reason it is a separate
 * app rather than part of Studio's src/.
 */
const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: here },
};

export default nextConfig;
