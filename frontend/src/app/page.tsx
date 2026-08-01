import LatestNotices from "@/components/modules/notices/LatestNotices";
import Hero from "../components/modules/home/Hero";
import Stats from "../components/modules/home/Stats";

export default function HomeSection() {
  return (
    <>
      <Hero />
      <Stats />
      <LatestNotices />
    </>
  );
}