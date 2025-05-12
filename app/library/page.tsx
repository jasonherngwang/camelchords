import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LibraryPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-[16vh]">
      <h1 className="text-4xl font-bold mb-4">Welcome to CamelChords!</h1>
      <p className="text-lg mb-8">
        Generate and manage ukulele songs in ChordPro format
      </p>
      <Link href="/library/create-song">
        <Button type="button" className="cursor-pointer">
          Create song
        </Button>
      </Link>
    </div>
  );
}
