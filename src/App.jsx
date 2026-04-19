import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Mousewheel } from "swiper/modules";
import { client } from "./libs/client";
import "swiper/css";
import "swiper/css/effect-coverflow";

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isGenreHovered, setIsGenreHovered] = useState(false);
  const [allArtworks, setAllArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedArt, setSelectedArt] = useState(null);

  useEffect(() => {
    client.get({ endpoint: "artworks" }).then((res) => {
      const formattedData = res.contents.map((content) => ({
        id: content.id,
        src: `${content.image.url}?w=1200&q=80&fm=webp`,
        title: content.title,
        year: content.year,
        genres: content.genre || [],
        description: content.description || "",
      }));
      setAllArtworks(formattedData);
      setFilteredArtworks(formattedData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (loading) return <div className="bg-[#030303] min-h-screen" />;
  if (allArtworks.length === 0) return null;

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    if (genre === "All") {
      setFilteredArtworks(allArtworks);
    } else {
      setFilteredArtworks(
        allArtworks.filter((art) => art.genres.includes(genre)),
      );
    }
    setActiveIndex(0);
  };

  const genreCounts = allArtworks.reduce(
    (acc, art) => {
      art.genres.forEach((g) => {
        acc[g] = (acc[g] || 0) + 1;
      });
      return acc;
    },
    { All: allArtworks.length },
  );

  const genres = ["All", ...new Set(allArtworks.flatMap((art) => art.genres))];

  return (
    <div className="relative min-h-screen w-full bg-[#030303] overflow-hidden flex flex-col justify-center items-center ">
      <div
        className="fixed inset-0 z-[90] transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          backgroundColor: isGenreHovered
            ? "rgba(0, 0, 0, 0.5)"
            : "transparent",
          backdropFilter: isGenreHovered ? "blur(15px)" : "blur(0px)",
          opacity: isGenreHovered ? 1 : 0,
        }}
      />

      <div
        className="absolute w-full p-4 top-0 z-[100] h-[25dvh] sm:h-[30dvh] flex items-center justify-center transition-all duration-500 ease-in-out"
        onMouseLeave={() => setIsGenreHovered(false)}
        style={{
          backgroundColor: isGenreHovered
            ? "rgba(31, 32, 34, 0.3)"
            : "transparent",
          backdropFilter: isGenreHovered ? "blur(15px)" : "blur(0px)",
          pointerEvents: isGenreHovered ? "auto" : "none",
        }}
      >
        <h2
          className="absolute top-6 right-6 sm:top-8 sm:right-8 p-4 text-white text-lg sm:text-xl tracking-tight font-normal transition-all duration-500 cursor-pointer pointer-events-auto"
          onMouseEnter={() => setIsGenreHovered(true)}
          style={{
            textShadow: isGenreHovered
              ? "0 0 20px rgba(255,255,255,0.5)"
              : "none",

            opacity: isGenreHovered ? 0 : 0.7,
          }}
        >
          Genre
        </h2>
        <ul
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-[40px] p-4 transition-all duration-1000 ease-in-out max-w-[90vw]"
          style={{
            opacity: isGenreHovered ? 1 : 0,
            visibility: isGenreHovered ? "visible" : "hidden",
            transform: isGenreHovered ? "translateY(0)" : "translateY(-10px)",
          }}
        >
          {genres.map((genre, index) => (
            <li
              key={genre}
              onClick={() => {
                handleGenreChange(genre);
                setIsGenreHovered(false);
              }}
              style={{
                transitionDelay: isGenreHovered ? `${index * 50}ms` : "0ms",
                transform: isGenreHovered
                  ? "translateY(0)"
                  : "translateY(20px)",
                opacity: isGenreHovered
                  ? selectedGenre === genre
                    ? 1
                    : 0.6
                  : 0,
              }}
              className={`relative font-['Montserrat'] tracking-[0.2em] uppercase text-white text-lg sm:text-2xl  font-light p-2 sm:p-4 cursor-pointer pointer-events-auto transition-all duration-300 group
      ${selectedGenre === genre ? "scale-110" : "hover:opacity-100 hover:scale-110"}`}
            >
              {genre}
              <span className="absolute top-[2px] sm:top-2 right-0 sm:right-0 text-[10px] sm:text-xs font-light opacity-40 group-hover:opacity-100 transition-opacity">
                {genreCounts[genre]?.toString().padStart(2, "0")}
              </span>
              {selectedGenre === genre && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {filteredArtworks.map((art, i) => (
        <div
          key={art.id}
          className="absolute inset-0 z-0 scale-110 transition-opacity duration-700"
          style={{
            background: `url(${art.src}) center/cover no-repeat`,
            willChange: "opacity",
            filter: "blur(4px) brightness(0.2)",
            opacity: i === activeIndex ? 1 : 0,
          }}
        />
      ))}

      <div
        className="absolute inset-0 z-10 opacity-50 transition-colors duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, black 10%, transparent 85%)`,
        }}
      />

      <div className="relative z-20 h-full w-full flex flex-col justify-center items-center">
        <Swiper
          effect={"coverflow"}
          modules={[EffectCoverflow, Mousewheel]}
          grabCursor={true}
          mousewheel={isMobile ? false : { forceToAxis: true, sensitivity: 1 }}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 35,
            stretch: 20,
            depth: 200,
            modifier: 1.2,
            slideShadows: false,
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full"
        >
          {filteredArtworks.map((art, index) => (
            <SwiperSlide
              key={art.id}
              onClick={() => setSelectedArt(art)}
              className="!w-[70vw] !h-[70vw] sm:!w-[500px] sm:!h-[500px] lg:!w-[600px] lg:!h-[600px] flex items-center justify-center cursor-pointer "
            >
              <div
                className="relative w-full h-full p-[8px] sm:p-[14px] rounded-sm overflow-hidden transition-all duration-700 ease-out"
                style={{
                  transform: index === activeIndex ? "scale(1)" : "scale(0.85)",
                }}
              >
                <div
                  className="relative w-full h-full rounded-[1px] overflow-hidden"
                  style={{
                    boxShadow:
                      index === activeIndex
                        ? "0 20px 40px rgba(0,0,0,0.7)"
                        : "0 0 10px rgba(0,0,0,0.4)",
                  }}
                >
                  <img
                    src={art.src}
                    alt={art.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{
                      filter:
                        index === activeIndex
                          ? "brightness(1) contrast(1)"
                          : "brightness(0.5) blur(1px)",
                    }}
                  />
                  <div
                    className="absolute inset-0 z-10 transition-opacity duration-700 ease-out"
                    style={{
                      background: `radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.45) 0%, transparent 80%)`,
                      mixBlendMode: "screen",
                      opacity: index === activeIndex ? 1 : 0,
                    }}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="w-[85%] sm:w-full  max-w-[600px] mx-auto mt-6 sm:mt-10  p-2 select-none">
            <span className="flex items-center justify-center text-white tracking-wide text-base sm:text-xl uppercase font-light">
              {filteredArtworks[activeIndex]?.title}
            </span>
          <p className="text-white tracking-wide text-center sm:text-xl uppercase font-light  mt-2">
            -{filteredArtworks[activeIndex]?.year.split("-")[0]}-
          </p>
        </div>
      </div>
      <div
        className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center p-4 sm:p-8 md:p-12 transition-all duration-700 ease-in-out overflow-y-auto"
        style={{
          backdropFilter: selectedArt ? "blur(30px)" : "blur(0px)",
          backgroundColor: selectedArt ? "rgba(3, 3, 3, 0.75)" : "transparent",
          opacity: selectedArt ? 1 : 0,
          visibility: selectedArt ? "visible" : "hidden",
          pointerEvents: selectedArt ? "auto" : "none",
        }}
        onClick={() => setSelectedArt(null)}
      >
        {selectedArt && (
          <div
            className="relative max-w-7xl w-full flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 lg:gap-24 transition-all duration-1000 ease-out mt-12 md:mt-0"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: selectedArt ? "translateY(0)" : "translateY(30px)",
              opacity: selectedArt ? 1 : 0,
            }}
          >
            <div className="w-full md:w-[45%] lg:w-[50%] aspect-square shadow-2xl shadow-white/5 rounded-sm overflow-hidden border border-white/5 flex-shrink-0">
              <img
                src={selectedArt.src}
                className="w-full h-full object-cover"
                alt={selectedArt.title}
              />
            </div>
            <div className="w-full md:w-[55%] lg:w-[50%] text-white text-left">
              <p className="text-[#E0D1CA] tracking-[0.2em] text-xs sm:text-sm mb-2 font-light">
                {selectedArt.year.split("-")[0]}
              </p>
              <h3 className="text-3xl sm:text-5xl lg:text-6xl text-center font-extrabold tracking-wide mb-4 sm:mb-8 uppercase leading-tight">
                {selectedArt.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-6 sm:mb-10">
                {selectedArt.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 sm:px-4 sm:py-1.5 border border-white/10 rounded-full text-[10px] sm:text-xs opacity-50 font-light tracking-wide"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <div
                className="text-base sm:text-lg lg:text-xl leading-relaxed opacity-70 font-light break-words max-w-prose prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedArt.description }}
              />
              <button
                onClick={() => setSelectedArt(null)}
                className="mt-10 sm:mt-16 text-xs sm:text-sm tracking-widest uppercase border-b border-white/20 pb-2 hover:border-white/60 hover:tracking-[0.3em] transition-all duration-500 opacity-60 hover:opacity-100"
              >
                Close Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
