import React, { useState, useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import { skinsByTab } from "./lib/videoData";
import { Link } from "react-router-dom";
import { Suspense, lazy } from 'react';

// Lazy load the video component
const LazyVideo = lazy(() => import('./components/LazyVideo'));

const SkinSelector = () => {
  // Add this at the beginning of your component, after the imports
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        100% { background-position: -200% 50%; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-gradient {
        animation: gradient 3s linear infinite;
      }
      .shimmer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.08) 50%,
          transparent 100%
        );
        animation: shimmer 1.5s infinite;
      }
      .tab-button {
        border-radius: 9999px !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Add this with other state variables at the top
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [screenSize, setScreenSize] = useState("large");
  const [clickedItem, setClickedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [loadedVideos, setLoadedVideos] = useState({});
  const videoRefs = useRef({});
  // Remove audioRef

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 480) {
        setScreenSize("small");
      } else if (window.innerWidth < 768) {
        setScreenSize("medium");
      } else {
        setScreenSize("large");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const isMobile = screenSize !== "large";

  const tabs = ["ALL", "OG", "MILAURA", "GLORP", "HONORARI", "OTHER"];

  // Define different skins for each tab - all using videos

  // Get current skins based on active tab
  const getCurrentSkins = () => {
    if (activeTab === "ALL") {
      // Combine all skins from every tab except 'ALL' itself
      const allSkins = [
        ...skinsByTab.OG,
        ...skinsByTab.MILAURA,
        ...skinsByTab.GLORP,
        ...skinsByTab.HONORARI,
        ...skinsByTab.OTHER,
      ];
      // Remove duplicates based on id and sort alphabetically
      return [
        ...new Map(allSkins.map((skin) => [skin.id, skin])).values(),
      ].sort((a, b) => {
        // Extract prefix and number
        const [aPrefix, aNum] = a.id.match(/([A-Za-z_]+)(\d*)/).slice(1);
        const [bPrefix, bNum] = b.id.match(/([A-Za-z_]+)(\d*)/).slice(1);

        // Compare prefixes first
        if (aPrefix !== bPrefix) {
          return aPrefix.localeCompare(bPrefix);
        }
        // If prefixes are same, compare numbers
        return parseInt(aNum || 0) - parseInt(bNum || 0);
      });
    }
    return [...skinsByTab[activeTab]].sort((a, b) => {
      // Extract prefix and number
      const [aPrefix, aNum] = a.id.match(/([A-Za-z_]+)(\d*)/).slice(1);
      const [bPrefix, bNum] = b.id.match(/([A-Za-z_]+)(\d*)/).slice(1);

      // Compare prefixes first
      if (aPrefix !== bPrefix) {
        return aPrefix.localeCompare(bPrefix);
      }
      // If prefixes are same, compare numbers
      return parseInt(aNum || 0) - parseInt(bNum || 0);
    });
  };

  // Handle video playback on hover or click
  useEffect(() => {
    const currentSkins = getCurrentSkins();

    currentSkins.forEach((skin) => {
      const videoRef = videoRefs.current[skin.id];
      if (!videoRef) return;

      if (!isMobile && hoveredItem === skin.id) {
        // Play video when hovered
        videoRef.play().catch((e) => {
          if (e.name !== "AbortError") {
            console.error("Video playback failed:", e);
          }
        });
      } else if (isMobile && clickedItem === skin.id) {
        // Play video when clicked
        videoRef.play().catch((e) => {
          if (e.name !== "AbortError") {
            console.error("Video playback failed:", e);
          }
        });
      } else {
        // Only pause and reset if this video was previously playing
        if (!videoRef.paused) {
          videoRef.pause();
          videoRef.currentTime = 0;
        }
      }
    });
  }, [hoveredItem, clickedItem, activeTab, isMobile]);

  const handleItemInteraction = (skin) => {
    if (isMobile) {
      if (clickedItem === skin.id) {
        setSelectedSkin(skin);
        setClickedItem(null);
      } else {
        setClickedItem(skin.id);
        const videoRef = videoRefs.current[skin.id];
        if (videoRef) {
          videoRef.muted = false;
          videoRef.play().catch(e => console.error("Video playback failed:", e));
        }
      }
    } else {
      setSelectedSkin(skin);
    }
  };

  // Remove playAudio function

  const handleMouseEnter = (skin) => {
    if (!isMobile) {
      setHoveredItem(skin.id);
      const videoRef = videoRefs.current[skin.id];
      if (videoRef) {
        videoRef.muted = false;
        videoRef.play().catch(e => console.error("Video playback failed:", e));
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredItem(null);
    }
  };

  // Apply styles to ensure the page has a black background but allow scrolling
  useEffect(() => {
    document.body.style.backgroundColor = "#000";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.minHeight = "100vh";
    // Remove overflow: hidden to allow scrolling
    document.body.style.overflowX = "hidden"; // Only prevent horizontal scrolling
    document.body.style.overflowY = "auto"; // Allow vertical scrolling

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.minHeight = "";
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    };
  }, []);

  // Add these new state variables at the top with other states
  const [visibleItems, setVisibleItems] = useState(20); // Initial number of items to show
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  // Add this new useEffect for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          // Simulate loading delay
          setTimeout(() => {
            setVisibleItems((prev) => prev + 12); // Load 12 more items
            setLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Add this new useEffect to disable body scrolling when popup is open
  useEffect(() => {
    if (selectedSkin) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable scrolling on body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Restore scrolling when popup closes
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedSkin]);

  // Modify the grid layout section to include infinite scroll
  return (
    <>
      {/* Header */}
      <div className="w-full flex justify-between items-center px-0 pt-6 bg-black z-10">
        <div className="w-16 md:w-32">
          <img
            src="/images/percentage.gif"
            alt="Left Animation"
            className="w-16 h-16 md:w-48 md:h-48 fixed left-0 top-0"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center -space-y-5 sm:-space-y-5 sm:space-x-2 md:space-x-8">
          <Link to="/skins" className="no-underline">
            <p className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#e50046] font-['Pastor_of_Muppets'] pt-0 sm:pt-10">
              skins
            </p>
          </Link>
          <Link to="/" >
            <img
              src="/images/logo2.png"
              className="w-32 h-32 sm:w-full sm:h-80 sm:-my-24 md:w-72 md:h-80"
              alt="Logo"
            />
          </Link>
          <a 
            href="https://linktr.ee/miraricielador" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="no-underline mt-0 sm:mt-0 md:mt-6"
          >
            <p className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#e50046] font-['Pastor_of_Muppets'] pt-0 sm:pt-10">
              socials
            </p>
          </a>
        </div>

        <div className="w-16 md:w-32">
          <img
            src="/images/percentage.gif"
            alt="Right Animation"
            className="w-16 h-16 md:w-48 md:h-48 fixed right-0 top-0"
          />
        </div>
      </div>
      <div className="flex flex-col items-center min-h-screen w-full bg-black text-white overflow-y-auto pb-16 m-0">
        {/* Remove this line */}
        {/* <audio ref={audioRef} className="hidden" /> */}

        {/* Tabs layout - 3x2 grid on small screens, original layout on larger screens */}
        <div
          className={`${
            screenSize === "small" ? "sticky" : ""
          } top-16 bg-black z-10 w-full py-2`}
        >
          {screenSize === "small" ? (
            // Small screens: 3x2 grid (3 tabs per row, 2 rows)
            <div className="grid grid-cols-3 gap-2 px-2 my-4 max-w-md mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-3 text-xs !rounded-full overflow-hidden font-bold ${
                    activeTab === tab
                      ? "!bg-[#0012ff] text-[#00ffce] border-[#0012ff]"
                      : "!bg-black text-[#00ffce] !border-[#0012ff] !border-4 hover:border-opacity-100"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : (
            // Medium and large screens: keep the original layout
            <div className="flex flex-row flex-wrap justify-center gap-2 px-2 my-[50px]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-3 text-xs tab-button font-bold ${
                    activeTab === tab
                      ? "!bg-[#0012ff] text-[#00ffce] border-[#0012ff]"
                      : "!bg-black text-[#00ffce] !border-[#0012ff] !border-4"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
          <div
            className={`grid ${
              screenSize === "small"
                ? "grid-cols-2"
                : screenSize === "medium"
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
            } gap-5 p-2 mt-[60px] max-w-4xl mx-auto w-full place-items-center`}
          >
            {getCurrentSkins()
              .slice(0, visibleItems)
              .map((skin) => (
                <div
                  key={skin.id}
                  className="relative flex flex-1 size-full flex-col items-center border-4 border-[#0012ff] rounded-2xl cursor-pointer transition-transform hover:scale-105 w-full max-w-48 h-60"
                  onClick={() => handleItemInteraction(skin)}
                  onMouseEnter={() => handleMouseEnter(skin)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 bg-black rounded-t-xl overflow-hidden">
                      {!loadedVideos[skin.id] && <div className="shimmer" />}
                      <Suspense fallback={<div className="shimmer" />}>
                        <LazyVideo
                          ref={(el) => (videoRefs.current[skin.id] = el)}
                          src={skin.video}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onLoadedData={() =>
                            setLoadedVideos((prev) => ({
                              ...prev,
                              [skin.id]: true,
                            }))
                          }
                        />
                      </Suspense>
                    </div>
                  </div>

                  {/* Text label with silver gradient */}
                  <div className="h-[30px] w-full flex items-center justify-center bg-[#0012ff50] relative overflow-hidden pt-2 pb-2 ">
                    <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#ffffff20] to-transparent"></div>
                    <p className="text-xs md:text-sm text-[#00ffce] z-10 !font-bold">
                      {skin.id}
                    </p>
                  </div>

                  {clickedItem === skin.id && isMobile && (
                    <div className="absolute top-0 right-0 bg-pink-600 rounded-full w-3 h-3"></div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Grid Layout - Adaptive based on screen size */}

        {/* Loading indicator and observer target */}
        {getCurrentSkins().length > visibleItems && (
          <div ref={observerTarget} className="w-full flex justify-center py-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-[spin_1s_linear_infinite]"></div>
                <span className="text-cyan-400">Loading more...</span>
              </div>
            ) : (
              <div className="h-8" /> // Spacer for observer
            )}
          </div>
        )}

        {/* Safe area at the bottom to ensure all content is accessible */}
        <div className="h-16"></div>

        {/* Popup Implementation */}
        {selectedSkin && ReactDOM.createPortal(
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center"
            style={{
              position: 'fixed', 
              top: '0', 
              left: '0', 
              right: '0', 
              bottom: '0',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-black p-4 rounded-lg">
              <button
                onClick={() => setSelectedSkin(null)}
                className="text-gray-300 !bg-black hover:text-white text-lg sm:text-xl absolute -left-8 -top-8 sm:-left-20"
              >
                ✕
              </button>
              <h2 className="text-xl sm:text-2xl text-[#00ffce] font-bold truncate text-center mb-4">
                {selectedSkin.id}
              </h2>
            
              <div className="bg-gray-900 border-4 border-[#0012ff] rounded-lg w-full">
                <div className="aspect-square w-full">
                  <video
                    src={selectedSkin.video}
                    className="w-full h-full object-cover rounded-lg"
                    controls
                    autoPlay
                    loop
                    playsInline
                  />
                </div>
              </div>
              {selectedSkin.link && (
                <a
                  href={selectedSkin.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block !text-[#e5a700] hover:text-cyan-300 underline mt-4 break-all text-center w-full px-4"
                >
                  {selectedSkin.link}
                </a>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};

export default SkinSelector;