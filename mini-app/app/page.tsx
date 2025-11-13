import { description, title } from "@/lib/metadata";
import { generateMetadata } from "@/lib/farcaster-embed";
import Game from "@/components/2048";

export { generateMetadata };

export default function Home() {
  return <Game />;
}
