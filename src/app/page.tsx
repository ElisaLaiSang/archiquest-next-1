import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-sky-200">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-between font-mono text-sm lg:flex">
        <Link href="/undertheweather" className="mb-3">Play Under the Weather </Link>
        <input id="playerName" type="text" className="p-2 rounded-lg mb-3" placeholder="Name"></input>
        <input id="playerSpecialTalent" type="text" className="p-2 rounded-lg mb-3" placeholder="Special Talent"></input>
        <p className="z-10 max-w-5xl">Instructions: Your goal is to create the most convincing excuse that will get you a day off work. Rearrange the set of events given and see whether you will be successful.</p>
      </div>
    </main>
  );
}

