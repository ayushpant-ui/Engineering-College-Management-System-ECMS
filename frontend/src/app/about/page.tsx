import AboutHero from "../../components/modules/about/AboutHero";
import AboutCollege from "../../components/modules/about/AboutCollege";
import VisionMission from "../../components/modules/about/VisionMission";
import WhyChooseUs from "../../components/modules/about/WhyChooseUs";
import PrincipleMessage from "../../components/modules/about/PrincipleMessage";
import Statistics from "../../components/modules/about/Statistics";
import Departments from "../../components/modules/about/Departments";
import Facilities from "../../components/modules/about/Facilities";




export default function AboutSection() {
  return (
    <>
      <AboutHero />
      <AboutCollege />
      <VisionMission />
      <WhyChooseUs />
      <PrincipleMessage />
      <Statistics />
      <Departments />
      <Facilities />
    </>
  );
}