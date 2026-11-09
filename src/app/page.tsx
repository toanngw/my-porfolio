import { existsSync } from "node:fs";
import { join } from "node:path";
import { Studio } from "@/components/studio/studio";
export default function Home() {
  const modelUrl = existsSync(join(process.cwd(), "public/model/character-workspace.glb"))
    ? "/model/character-workspace.glb"
    : null;
  return <Studio modelUrl={modelUrl} />;
}
