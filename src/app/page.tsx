import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-sky-400">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-between font-mono text-sm lg:flex">
        <Link href="/map" className="mb-3">Play Under the Weather </Link>
        <input id="playerName" type="text" className="p-2 rounded-lg mb-3" placeholder="Name"></input>
        <input id="playerSpecialTalent" type="text" className="p-2 rounded-lg mb-3" placeholder="Special Talent"></input>
      </div>
    </main>
  );
}

