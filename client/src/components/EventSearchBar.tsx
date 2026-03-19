
import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { locationService } from "@/services/location.service";

const EventSearchBar = ({ initialCity = "" }) => {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(initialCity);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const cityInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (city.length >= 2) {
      const fetchCities = async () => {
        try {
          const response = await locationService.getLocations(city);
          const data = await response.json();
          setCitySuggestions(data);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };

      fetchCities();
    } else {
      setCitySuggestions([]);
    }
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${query}&city=${city}`);
  };

  const handleInputFocus = () => {
    setShowCitySuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowCitySuggestions(false);
    }, 200);
  };

  return (
    <div className="relative flex justify-start w-full" style={{ maxWidth: 400, minWidth: 0 }}>
      <form
        className="flex items-center bg-white/90 border border-blue-100 shadow-none backdrop-blur-lg rounded-2xl overflow-visible transition-all relative min-w-0"
        style={{
          minWidth: 0,
          height: "44px",
          boxShadow: "0 2px 9px 0 rgba(120,170,215,0.04)",
          borderRadius: "1.15rem",
          paddingRight: 0,
          width: "100%",
          maxWidth: 390,
        }}
        onSubmit={handleSearch}
      >
        {/* Champ recherche */}
        <div className="flex items-center bg-transparent pl-3 pr-1 min-w-0 h-full flex-shrink" style={{ gap: 0, width: "215px" }}>
          <Search className="text-blue-400 mr-1" size={21} />
          <input
            className="outline-none border-0 bg-transparent flex-1 text-blue-400 placeholder:text-blue-100/90 py-1 min-w-0 text-base leading-tight transition-all"
            type="text"
            placeholder="Trouver un événement"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              minWidth: 0,
              width: "170px",
              maxWidth: "170px",
              paddingLeft: 0,
              paddingRight: 0,
              fontWeight: 400,
              fontSize: "0.97rem"
            }}
          />
        </div>

        {/* Séparateur */}
        <div className="h-6 w-px bg-blue-100/60 mx-1" aria-hidden="true" />

        {/* Champ ville */}
        <div className="flex items-center bg-transparent pl-2 pr-2 min-w-[74px] max-w-[120px] relative z-50" style={{ marginRight: 0 }}>
          <MapPin className="text-blue-300 mr-1 ml-[2px]" size={19} />
          <input
            ref={cityInputRef}
            type="text"
            value={city}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={(e) => setCity(e.target.value)}
            className="outline-none border-0 bg-transparent font-bold text-blue-600 w-full placeholder:text-blue-200/80 text-sm"
            placeholder="Ville"
            autoComplete="off"
            style={{ minWidth: 0, maxWidth: 85 }}
          />
          {/* Suggestions dropdown */}
          {showCitySuggestions && (
            <div
              className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl z-[9999]"
              style={{
                boxShadow: "0 8px 38px 0 rgba(130,190,255,0.11), 0 1px 6px 0 rgba(120,190,220,0.11)",
                transition: "opacity 220ms cubic-bezier(.42,1.12,.52,0.99), transform 200ms cubic-bezier(.47,1.52,.51,1.07)",
                borderRadius: "1.15rem",
                filter: "none",
                overflow: "hidden"
              }}
            >
              {citySuggestions.length > 0 ? (
                citySuggestions
                  .slice(0, 4)
                  .map((cityName) => (
                    <div
                      key={cityName}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCity(cityName);
                        setShowCitySuggestions(false);
                      }}
                    >
                      {cityName}
                    </div>
                  ))
              ) : (
                <span className="block px-4 py-2 text-sm text-blue-300">Aucune ville</span>
              )}
            </div>
          )}
        </div>

        {/* Bouton recherche */}
        <button
          type="submit"
          className="rounded-r-2xl bg-blue-500 hover:bg-blue-600 transition-colors px-4 h-full flex items-center justify-center"
          style={{
            minWidth: 44,
            height: "100%",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            marginRight: -1,
          }}
          aria-label="Rechercher"
        >
          <Search className="text-white" size={21} />
        </button>
      </form>
    </div>
  );
};

export default EventSearchBar;

