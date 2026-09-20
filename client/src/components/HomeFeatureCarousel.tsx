import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  MapPin,
  Users,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import "../pages/styles/HomeFeatureCarousel.css";

type FeatureSlide = {
  id: string;
  label: string;
  fullImage?: string;
  mainImage: string;
  leftImage?: string;
  sideImage?: string;
  handwrittenLeft?: string;
  handwrittenRight?: string;
};

const slides: FeatureSlide[] = [
  {
    id: "group",
    label: "Voyage en groupe",
    fullImage: "/images/carrousel/groupe-main.png",
    mainImage: "",
    leftImage: "",
    sideImage: "",
    handwrittenLeft: "",
    handwrittenRight: "",
  },
  {
    id: "destinations",
    label: "Destinations",
    fullImage: "/images/carrousel/destinations-main.png",
    mainImage: "",
    leftImage: "",
    sideImage: "",
    handwrittenLeft: "",
    handwrittenRight: "",
  },
  {
    id: "budget",
    label: "Budget",
    fullImage: "/images/carrousel/budget-main.png",
    mainImage: "",
    leftImage: "",
    sideImage: "",
    handwrittenLeft: "",
    handwrittenRight: "",
  },
  {
    id: "reimbursements",
    label: "Remboursements",
    mainImage: "/images/carrousel/remboursements-main.png",
    sideImage: "/images/carrousel/remboursements-side.png",
    handwrittenLeft: "Moins de calculs, plus de voyage ♡",
    handwrittenRight: "Des comptes clairs pour plus de voyages",
  },
  {
    id: "notifications",
    label: "Notifications",
    fullImage: "/images/carrousel/notifications-main.png",
    mainImage: "",
    sideImage: "",
    handwrittenLeft: "",
    handwrittenRight: "",
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
    case "reimbursements":
      return <CircleDollarSign size={21} />;
    case "notifications":
      return <Bell size={21} />;
    default:
      return null;
  }
}

function HomeFeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

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
          NAVIGATION DU CARROUSEL
      ====================================================== */}

      <div
        className="showcase-tabs"
        role="tablist"
        aria-label="Fonctionnalités TripTogether"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
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
          CONTENU DU SLIDE
      ====================================================== */}

      <div
        key={activeSlide.id}
        className={`showcase-collage showcase-collage-enter showcase-slide-${activeSlide.id}`}
      >
        <div className="showcase-background-shape" />

        {activeSlide.fullImage ? (
          <div className="showcase-full-image">
            <img
              src={activeSlide.fullImage}
              alt={`Aperçu de la fonctionnalité ${activeSlide.label} de TripTogether`}
            />
          </div>
        ) : (
          <>
            {activeSlide.leftImage && (
              <div className="showcase-polaroid">
                <img src={activeSlide.leftImage} alt="" aria-hidden="true" />

                {activeSlide.handwrittenLeft && (
                  <p>{activeSlide.handwrittenLeft}</p>
                )}
              </div>
            )}

            {activeSlide.mainImage && (
              <div className="showcase-main-screen">
                <img
                  src={activeSlide.mainImage}
                  alt={`Aperçu de la fonctionnalité ${activeSlide.label} de TripTogether`}
                />
              </div>
            )}

            {activeSlide.sideImage && (
              <div className="showcase-side-card">
                <img src={activeSlide.sideImage} alt="" aria-hidden="true" />
              </div>
            )}

            {activeSlide.handwrittenRight && (
              <div className="showcase-handwritten-right">
                <span>{activeSlide.handwrittenRight}</span>
                <span className="showcase-doodle-arrow">↙</span>
              </div>
            )}
          </>
        )}
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
