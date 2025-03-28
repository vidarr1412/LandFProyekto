import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom"; 
import Sidebar from "./sidebar";
import axios from "axios";
import { FaBox, FaCheck, FaFileAlt, FaUser } from "react-icons/fa";
import { FaFacebook, FaEnvelope, FaGithub } from "react-icons/fa";

import Header from "./header";
import '../style/home.css'; 

const API_URL = process.env.REACT_APP_API_URL;

function Home() {
  // State to store dashboard data
  
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    listedFoundItems: 0,
    totalClaims: 0,
    totalLostReports: 0,
    totalRetrievalRequests: 0,
  });
  const [complaintsData, setComplaintsData] = useState([]);
  const [foundItemsData, setFoundItemsData] = useState([]); // State for found items data
  const [servicesVisible, setServicesVisible] = useState(false);
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Check cache first
        const cachedData = localStorage.getItem("dashboardData");
        if (cachedData) {
          setDashboardData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
  
        // Fetch fresh data if cache is empty
        const [itemsResponse, complaintsResponse, retrievalResponse] = await Promise.all([
          axios.get(`${API_URL}/items`),
          axios.get(`${API_URL}/complaints`),
          axios.get(`${API_URL}/retrieval-requests`)
        ]);
  
        const foundItems = itemsResponse.data;
        const lostReports = complaintsResponse.data;
        const retrievalRequests = retrievalResponse.data;
  
        const newData = {
          listedFoundItems: foundItems.length,
          totalClaims: foundItems.filter((item) => item.STATUS === "claimed").length,
          totalLostReports: lostReports.length,
          totalRetrievalRequests: retrievalRequests.length,
        };
  
        setDashboardData(newData);
        setComplaintsData(lostReports);
        setFoundItemsData(foundItems);
  
        // Cache the data
        localStorage.setItem("dashboardData", JSON.stringify(newData));
  
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
  
    fetchDashboardData();
  }, []);
  
  useEffect(() => {
    const serviceSection = document.querySelector(".services-section");
    const serviceCards = document.querySelectorAll(".service-card");
    const devCards = document.querySelectorAll(".developer-card");
        const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            serviceCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("slide-in");
              }, index * 200); // Delay each card animation
            });
          } else {
            // Reset animation when scrolled away
            serviceCards.forEach((card) => {
              card.classList.remove("slide-in");
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (serviceSection) observer.observe(serviceSection);

    return () => {
      observer.disconnect(); // Clean up when component unmounts
    };
  }, []);
  useEffect(() => {
    let isScrolling = false;
    const sections = document.querySelectorAll(".section");

    const scrollToSection = (index) => {
        if (index < 1 || index >= sections.length) return;
        isScrolling = true;

        sections[index].scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        setTimeout(() => {
            isScrolling = false;
        }, 800); // Increased timeout for smooth transitions
    };

    const handleScroll = (event) => {
        if (isScrolling) return;

        const scrollPosition = window.scrollY + window.innerHeight / 4;
        let currentSection = 1;

        for (let i = 1; i < sections.length; i++) {
            if (sections[i].offsetTop > scrollPosition) {
                break;
            }
            currentSection = i;
        }

        if (event.deltaY > 0) {
            scrollToSection(currentSection + 1);
        } else {
            scrollToSection(currentSection - 1);
        }
    };

    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
}, []);

useEffect(() => {
  const sections = document.querySelectorAll(".services-section, .developer-team-section, .stat-section");
  const cardsMap = {
    "services-section": document.querySelectorAll(".service-card"),
    "developer-team-section": document.querySelectorAll(".developer-card"),
    "stat-section": document.querySelectorAll(".stat-item"),
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const targetCards = cardsMap[entry.target.classList[0]] || [];

        if (entry.isIntersecting) {
          targetCards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add("slide-in");
            }, index * 200);
          });
        } else {
          targetCards.forEach((card) => card.classList.remove("slide-in"));
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));

  // **Trigger animation on page load**
  Object.values(cardsMap).forEach((cards) => {
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("slide-in");
      }, index * 200);
    });
  });

  return () => observer.disconnect(); // Cleanup
}, []);


  return (
    <>{loading && (
      <div className="loading-overlay">
        <img src="/loadinggif.gif" alt="Loading..." className="loading-gif" />
      </div>
    )}
    <div className="home-container">
      <Sidebar />
      <Header />

      <div className="main-content">
        {/* Content Section */}
        <div className="cont section">
          <h1>Find It, <br /> Retrieve It!</h1>
          <p>
            Step into a world where the art of Interior Design is meticulously crafted to bring together timeless elegance and cutting-edge modern innovation. Allowing you to transform your living spaces into the epitome of luxury and sophistication.
          </p>
          <NavLink to="/userComplaints">
            <button className="get-qr-button">File Report Now</button>
          </NavLink>
          <div className='divider'></div>
        </div>

        {/* Statistics Section */}
        <div className="statistics section">
          <div className="stat-item">
            <h2>{dashboardData.listedFoundItems}</h2>
            <p>Listed Found Items</p>
          </div>
          <div className="stat-item">
            <h2>{dashboardData.totalClaims}</h2>
            <p>Total Claims</p>
          </div>  
          <div className="stat-item">
            <h2>{dashboardData.totalLostReports}</h2>
            <p>Total Lost Reports</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section section">
        <h2 className="services1">Our Services</h2>
        <div className="services-grid">
        <div className={`service-card ${servicesVisible ? "slide-in" : ""}`}>
            <h3>Mission</h3>
            <p>To safeguard the lives of all persons and properties in the campus by providing sound security measures and policies which are instinctive under all circumstances.</p>
            <div className='bottom'>
              <img src="pin.png" alt="miss" className="pin" />
              <p>MSU-IIT SECURITY AND INVESTIGATION DIVISION</p>
            </div>
          </div>
          <div className={`service-card ${servicesVisible ? "slide-in" : ""}`}>
            <h3>Mandate</h3>
            <p>A responsive division actively promoting a culture of peace and order, safeguarding Institute physical assets and infrastructures, and ensuring protective services to the constituents of the Institute and its immediate environs.</p>
            <div className='bottom'>
              <img src="pin.png" alt="miss" className="pin" />
              <p>MSU-IIT SECURITY AND INVESTIGATION DIVISION</p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="developer-team-section">
        <h2>Meet Our Developer Team</h2>
        <div className="developer-grid">
          <div className="developer-card">
            <img src="po.jpg" alt="Paul Gary L. Oca" className="developer-img" />
            <h3>Paul Gary L. Oca</h3>
            <h4>BS Information Technology</h4>
            
            <p>Back-End Developer</p>
            <div className="social-icons">
              <a href="mailto:paul@example.com">
                <FaEnvelope size={25} />
              </a>
              <a href="https://facebook.com/paul">
                <FaFacebook size={25} />
              </a>
              <a href="https://github.com/paul">
                <FaGithub size={25} />
              </a>
            </div>
          </div>

          <div className="developer-card">
            <img src="mo.jpg" alt="Paul Gary L. Oca" className="developer-img" />
            <h3>Christian Albert B. Muaña</h3>
            <h4>BS Information Technology</h4>
                        <p>Front-End Developer</p>
            <div className="social-icons">
              <a href="mailto:paul@example.com">
                <FaEnvelope size={25} />
              </a>
              <a href="https://facebook.com/paul">
                <FaFacebook size={25} />
              </a>
              <a href="https://github.com/paul">
                <FaGithub size={25} />
              </a>
            </div>
          </div>

          <div className="developer-card">
            <img src="de.jpg" alt="Paul Gary L. Oca" className="developer-img" />
            <h3>Jean Dhea Mae Ampong</h3>
            <h4>BS Information Technology</h4>

            <p>Front-End Developer</p>
            <div className="social-icons">
              <a href="mailto:paul@example.com">
                <FaEnvelope size={25} />
              </a>
              <a href="https://facebook.com/paul">
                <FaFacebook size={25} />
              </a>
              <a href="https://github.com/paul">
                <FaGithub size={25} />
              </a>
            </div>
          </div>
        </div>
      </div> */}
    </div>

    </>
      );

}

export default Home;
