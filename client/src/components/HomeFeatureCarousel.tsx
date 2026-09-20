import {
  Bell,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "../pages/styles/HomeFeatureCarousel.css";

type FeatureSlide = {
  id: string;
  label: string;
  fullImage: string;
};

const slides: FeatureSlide[] = [
  {
    id: "group",
    label: "Voyage en groupe",
    fullImage: "/images/carrousel/groupe-main.png",
  },
  {
    id: "destinations",
    label: "Destinations",
    fullImage: "/images/carrousel/destinations-main.png",
  },
  {
    id: "budget",
    label: "Budget",
    fullImage: "/images/carrousel/budget-main.png",
  },
  {
    id: "notifications",
    label: "Notifications",
    fullImage: "/images/carrousel/notifications-main.png",
  },
];

function getSlideIcon(id: string) {
  switch (id) {
    case "group":
      return <Users size={21} />;

    case "destinations":
      return <MapPin size={21} />;

    case "budget":
      return <WalletCards size={21} />;

    case "notifications":
      return <Bell size={21} />;

    default:
      return null;
  }
}

function HomeFeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    for (const slide of slides) {
      const image = new Image();
      image.src = slide.fullImage;
    }
  }, []);

  useEffect(() => {
    tabRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  const activeSlide = slides[activeIndex];

  const goToPreviousSlide = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1,
    );
  };

  const goToNextSlide = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === slides.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <section className="home-showcase">
      <div className="home-showcase-heading">
        <h2>
          Tout ce dont <span>vous avez besoin</span>
        </h2>

        <p>TripTogether simplifie l'organisation de vos voyages en groupe.</p>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div
        className="showcase-tabs"
        role="tablist"
        aria-label="Fonctionnalités TripTogether"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            className={`showcase-tab ${
              activeIndex === index ? "showcase-tab-active" : ""
            }`}
            onClick={() => setActiveIndex(index)}
          >
            {getSlideIcon(slide.id)}
            <span>{slide.label}</span>
          </button>
        ))}
      </div>

      {/* =====================================================
          IMAGE DU SLIDE
      ====================================================== */}

      <div key={activeSlide.id} className="showcase-slide showcase-slide-enter">
        <div className="showcase-full-image">
          <img
            src={activeSlide.fullImage}
            alt={`Aperçu de la fonctionnalité ${activeSlide.label} de TripTogether`}
          />
        </div>
      </div>

      {/* =====================================================
          FLÈCHES + POINTS
      ====================================================== */}

      <div className="showcase-controls">
        <button
          type="button"
          className="showcase-arrow"
          onClick={goToPreviousSlide}
          aria-label="Fonctionnalité précédente"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          className="showcase-dots"
          aria-label={`Slide ${activeIndex + 1} sur ${slides.length}`}
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`showcase-dot ${
                activeIndex === index ? "showcase-dot-active" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Afficher ${slide.label}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="showcase-arrow"
          onClick={goToNextSlide}
          aria-label="Fonctionnalité suivante"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}

export default HomeFeatureCarousel;
