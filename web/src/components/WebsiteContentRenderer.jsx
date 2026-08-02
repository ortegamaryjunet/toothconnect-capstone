import LogoSection from "./LogoSection";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import ClinicContactSection from "./ClinicContactSection";
import FaqSection from "./FaqSection";
import AnnouncementSection from "./AnnouncementSection";

export default function WebsiteContentRenderer(props) {
  switch (props.websiteContentSection) {
    case "logo":
      return <LogoSection {...props} />;

    case "hero":
      return <HeroSection {...props}
      textDesignFields={props.textDesignFields} />;

    case "about":
      return <AboutSection {...props} />;

    case "services":
      return <ServicesSection {...props} />;

    case "clinicContact":
        return <ClinicContactSection {...props} />;

    case "faqs":
      return <FaqSection {...props} />;

    case "announcements":
      return <AnnouncementSection {...props} />;

    default:
      return null;
  }
}