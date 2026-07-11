import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import {SearchForm} from "@/components/flight/SearchForm";
import {Hero} from "@/components/common/hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}
