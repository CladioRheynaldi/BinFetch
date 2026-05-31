import Link from "next/link";
import Navbar from '@/components/Navbar';

export default function Exchange() {
  return (
    <>
        <Navbar />
        <main className="pt-24 px-8">
            <h1 className="text-4xl font-bold">
                Exchange
            </h1>
        </main>
    </>
  );
}