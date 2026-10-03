document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const particleContainer = document.getElementById("particleContainer");
  if (particleContainer) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${4 + Math.random() * 4}s`;
      fragment.appendChild(particle);
    }
    particleContainer.appendChild(fragment);
  }

  const hidePreloader = () => {
    const preloader = document.getElementById("preloader");
    if (preloader && preloader.style.display !== "none") {
      preloader.style.opacity = "0";
      preloader.style.transform = "translateY(-100%)";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 800);
    }
  };

  window.addEventListener("load", () => {
    setTimeout(hidePreloader, 600);
  });
  setTimeout(hidePreloader, 3500);

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
  }

  const contactForm = document.getElementById("contactForm");
  const successModal = document.getElementById("successModal");
  const modalCloseBtns = document.querySelectorAll(".modal-close-action");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (successModal) successModal.style.display = "flex";
    });
  }

  const closeModal = () => {
    if (successModal) successModal.style.display = "none";
    if (contactForm) contactForm.reset();
  };

  modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));

  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    const hotelSelect = document.getElementById("hotelSelect");
    const checkInInput = document.getElementById("checkIn");
    const checkOutInput = document.getElementById("checkOut");
    const suiteType = document.getElementById("suiteType");
    const vipTransferSelect = document.getElementById("vipTransferSelect");
    const adultsCount = document.getElementById("adultsCount");
    const childrenCount = document.getElementById("childrenCount");

    const formatDate = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const setupDateRestrictions = () => {
      const today = new Date();
      const todayStr = formatDate(today);

      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      const maxDateStr = formatDate(maxDate);

      if (checkInInput) {
        checkInInput.setAttribute("min", todayStr);
        checkInInput.setAttribute("max", maxDateStr);
        if (!checkInInput.value) checkInInput.value = todayStr;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow);

      if (checkOutInput) {
        checkOutInput.setAttribute("min", tomorrowStr);
        checkOutInput.setAttribute("max", maxDateStr);
        if (!checkOutInput.value) checkOutInput.value = tomorrowStr;
      }
    };

    const calculateTotal = () => {
      if (!hotelSelect || !suiteType) return;

      const selectedOption = hotelSelect.options[hotelSelect.selectedIndex];
      const basePrice =
        selectedOption && selectedOption.dataset.price
          ? parseFloat(selectedOption.dataset.price)
          : 0;

      const multiplier = parseFloat(
        suiteType.options[suiteType.selectedIndex]?.dataset.multiplier || 1,
      );

      let nights = 1;
      if (checkInInput?.value && checkOutInput?.value) {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        const diffTime = checkOut.getTime() - checkIn.getTime();
        if (diffTime > 0) {
          nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      const adults = parseInt(adultsCount ? adultsCount.value : 2, 10);
      const children = parseInt(childrenCount ? childrenCount.value : 0, 10);
      const totalGuestsEquivalent = adults + children * 0.5;

      const nightlyRate =
        basePrice * (1 + (totalGuestsEquivalent - 1) * 0.2) * multiplier;
      const transferFee = parseFloat(
        vipTransferSelect ? vipTransferSelect.value : 0,
      );
      const rawTotal = basePrice > 0 ? nightlyRate * nights + transferFee : 0;

      const tax = rawTotal * 0.1;
      const grandTotal = rawTotal + tax;

      const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
      };

      updateText("summaryHotel", hotelSelect.value ? hotelSelect.value : "-");
      updateText("summaryNights", `${nights} Gece`);
      updateText(
        "summaryGuests",
        `${adults} Yetişkin${children > 0 ? `, ${children} Çocuk` : ""}`,
      );
      updateText(
        "summaryRate",
        nightlyRate > 0
          ? `${nightlyRate.toLocaleString("tr-TR")} ₺ / Gece`
          : "0 ₺",
      );
      updateText(
        "summaryTransfer",
        transferFee > 0 ? `${transferFee.toLocaleString("tr-TR")} ₺` : "Yok",
      );
      updateText("summaryTax", `${tax.toLocaleString("tr-TR")} ₺`);
      updateText("summaryTotal", `${grandTotal.toLocaleString("tr-TR")} ₺`);
    };

    setupDateRestrictions();

    const urlParams = new URLSearchParams(window.location.search);
    const selectedHotelParam = urlParams.get("hotel");
    if (selectedHotelParam && hotelSelect) {
      for (let option of hotelSelect.options) {
        if (
          option.value
            .toLowerCase()
            .includes(decodeURIComponent(selectedHotelParam).toLowerCase())
        ) {
          option.selected = true;
          break;
        }
      }
    }

    calculateTotal();

    [
      hotelSelect,
      suiteType,
      vipTransferSelect,
      adultsCount,
      childrenCount,
    ].forEach((el) => {
      if (el) el.addEventListener("change", calculateTotal);
    });

    if (checkInInput) {
      checkInInput.addEventListener("change", () => {
        if (checkInInput.value) {
          const checkInDateObj = new Date(checkInInput.value);
          const nextDayObj = new Date(checkInDateObj);
          nextDayObj.setDate(nextDayObj.getDate() + 1);
          const nextDayStr = formatDate(nextDayObj);

          if (checkOutInput) {
            checkOutInput.setAttribute("min", nextDayStr);
            if (checkOutInput.value <= checkInInput.value) {
              checkOutInput.value = nextDayStr;
            }
          }
        }
        calculateTotal();
      });
    }

    if (checkOutInput) checkOutInput.addEventListener("change", calculateTotal);

    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (successModal) successModal.style.display = "flex";
    });
  }

  const hotelsGrid = document.getElementById("hotelsGrid");

  if (hotelsGrid) {
    const DEFAULT_FALLBACK_IMG =
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
    const cities = [
      "İstanbul",
      "İzmir",
      "Antalya",
      "Muğla",
      "Erzurum",
      "Bursa",
      "Nevşehir",
      "Mardin",
      "Sakarya",
      "Trabzon",
      "Gaziantep",
    ];

    const hotelsDatabase = [
      {
        id: 1,
        name: "Muhammed K Çeşme Sahil Oteli",
        city: "İzmir",
        district: "Çeşme",
        price: "₺18,500",
        rating: 4.9,
        concept: "resort",
        tag: "ÖZEL KOY",
        img: "https://images.trvl-media.com/lodging/28000000/27320000/27313000/27312929/f5d36a5e.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
        amenities: [
          "fa-umbrella-beach",
          "fa-water-ladder",
          "fa-spa",
          "fa-utensils",
        ],
        description:
          "Çeşme'nin en berrak koyunda yer alan tesisimiz, özel kum plajı, kişiye özel kabanaları ve termal spa olanaklarıyla benzersiz bir Ege tatili sunuyor.",
        highlights: [
          "Özel Beyaz Kumsal",
          "Kişisel İskele Kabanası",
          "Termal Mineral Spa",
          "Deniz Manzaralı Restoran",
        ],
      },
      {
        id: 2,
        name: "Muhammed K Palandöken Dağ Evi",
        city: "Erzurum",
        district: "Palandöken",
        price: "₺14,200",
        rating: 4.8,
        concept: "ski",
        tag: "KIŞ OTELİ",
        img: "https://cdn3.enuygun.com/media/lib/uploads/image/dedeman-erzurum-palandoken-ski-lodge-erzurum-one-cikan-resim-76409971.jpg",
        amenities: [
          "fa-person-skiing",
          "fa-fire",
          "fa-hot-tub-person",
          "fa-mountain",
        ],
        description:
          "Palandöken zirvesine doğrudan erişim sağlayan ahşap lüks mimarimiz; şömineli geniş süitleri, karlı dağ manzaralı açık sıcak havuzları ile kış sporları tutkunlarına hitap ediyor.",
        highlights: [
          "Piste Doğrudan Çıkış",
          "Şömineli Süit Odalar",
          "Açık Sıcak Havuz",
          "Ekipman Kiralama & Lounge",
        ],
      },
      {
        id: 3,
        name: "Muhammed K Çırağan Boğaz Sarayı",
        city: "İstanbul",
        district: "Beşiktaş",
        price: "₺32,500",
        rating: 5.0,
        concept: "suite",
        tag: "TARİHİ YALI",
        img: "https://upload.wikimedia.org/wikipedia/commons/5/54/Istanbul_asv2020-02_img59_%C3%87%C4%B1ra%C4%9Fan_Palace.jpg",
        amenities: ["fa-anchor", "fa-helicopter", "fa-crown", "fa-utensils"],
        description:
          "İstanbul Boğazı'nın sıfır noktasındaki tarihi yalı mülkümüz, Osmanlı saray mimarisini modern lüks anlayışıyla buluşturuyor.",
        highlights: [
          "Boğaza Sıfır Konum",
          "Helikopter & Yat İskelesi",
          "Özel Butler Hizmeti",
          "Tarihi Saray Bahçesi",
        ],
      },
      {
        id: 4,
        name: "Muhammed K Belek Golf & Spa",
        city: "Antalya",
        district: "Belek",
        price: "₺22,000",
        rating: 4.9,
        concept: "resort",
        tag: "GOLF & RESORT",
        img: "https://www.gloria.com.tr/media/fiujysrq/mainpool.jpg",
        amenities: ["fa-golf-ball-tee", "fa-spa", "fa-water-ladder", "fa-tree"],
        description:
          "18 delikli şampiyona golf sahasının ortasında konumlanan tesis, geniş villa seçenekleri ve gurme restoranlarıyla hizmet veriyor.",
        highlights: [
          "Profesyonel Golf Sahası",
          "Özel Havuzlu Villalar",
          "Uzak Doğu Spa Alanı",
          "Çocuk Kulübü & Park",
        ],
      },
      {
        id: 5,
        name: "Muhammed K Bodrum Marina Konakları",
        city: "Muğla",
        district: "Bodrum",
        price: "₺28,000",
        rating: 4.9,
        concept: "resort",
        tag: "ULTRA LÜKS",
        img: "https://www.sirene.com.tr/media/uisggkgl/sirene-bodrum-hotel-sonsuzluk-havuzu-desktop.jpg",
        amenities: ["fa-ship", "fa-water-ladder", "fa-spa", "fa-utensils"],
        description:
          "Bodrum Kalesi manzarasına karşı konumlanan özel marinamız, sonsuzluk havuzlu süitlerde ayrıcalıklı deneyim vadediyor.",
        highlights: [
          "Kendi Özel Marinası",
          "Sonsuzluk Havuzları",
          "VIP Yat Kiralama",
          "Ünlü Şef Restoranları",
        ],
      },
      {
        id: 6,
        name: "Muhammed K Sapanca Göl Rezidansı",
        city: "Sakarya",
        district: "Sapanca",
        price: "₺16,800",
        rating: 4.8,
        concept: "business",
        tag: "GÖL MANZARASI",
        img: "https://www.kucukoteller.com.tr/storage/images/2020/03/12/1584007780692784.webp",
        amenities: ["fa-tree", "fa-spa", "fa-car", "fa-wifi"],
        description:
          "Sapanca Gölünün kıyısında, ormanın sessizliği içinde tasarlanmış cam mimarili bungalovlarımız doğayla iç içe bir dinlenme sunuyor.",
        highlights: [
          "Göl Kıyısı Konum",
          "Orman İçi Yürüyüş Yolu",
          "Aromaterapi Spa",
          "Cam Tavanlı Süitler",
        ],
      },
      {
        id: 7,
        name: "Muhammed K Alaçatı Taş Konak",
        city: "İzmir",
        district: "Alaçatı",
        price: "₺15,400",
        rating: 4.7,
        concept: "cave",
        tag: "BUTİK OTEL",
        img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800",
        amenities: ["fa-fan", "fa-utensils", "fa-seedling", "fa-wifi"],
        description:
          "Geleneksel Rum mimarisini yansıtan el yapımı taş konağımız, begonvillerle süslü iç avlusu ve organik Ege kahvaltısıyla butik lüksün simgesidir.",
        highlights: [
          "Tarihi Taş Mimari",
          "Begonvilli İç Avlu",
          "Organik Ege Kahvaltısı",
          "Merkeze Yürüme Mesafesi",
        ],
      },
      {
        id: 8,
        name: "Muhammed K Uludağ Kış Oteli",
        city: "Bursa",
        district: "Uludağ",
        price: "₺13,500",
        rating: 4.8,
        concept: "ski",
        tag: "KAR MANZARASI",
        img: "https://cdn2.setur.com.tr/image/hotel/large/bof-hotels-uludag-ski-luxury-resort-genel-68a91c3f-3fd7-484f-8e16-b411691f1e24.jpg",
        amenities: [
          "fa-person-skiing",
          "fa-fire",
          "fa-hot-tub-person",
          "fa-mountain",
        ],
        description:
          "Uludağ 2. Oteller bölgesinde yer alan mülkümüz, karlı çam ormanlarına bakan panoramik restoranı ve sıcak jakuzi süitleriyle mükemmel bir kış tatili sunmaktadır.",
        highlights: [
          "Çam Ormanı Manzarası",
          "Jakuzili Oda Seçenekleri",
          "Kayak Okulu & Eğitmenler",
          "Sıcak Çikolata Lounge",
        ],
      },
      {
        id: 9,
        name: "Muhammed K Trabzon Yayla Konakları",
        city: "Trabzon",
        district: "Akçaabat",
        price: "₺12,900",
        rating: 4.7,
        concept: "resort",
        tag: "DOĞAL YAŞAM",
        img: "https://mencunakonaklari.com/wp-content/uploads/2026/02/76-1.webp",
        amenities: ["fa-tree", "fa-cloud-sun", "fa-utensils", "fa-wifi"],
        description:
          "Karadeniz yaylalarının sisli ve yeşil tepelerinde yer alan ahşap konaklarımız, tam sessizlik ve taze yayla havası arayan misafirlerimizi ağırlıyor.",
        highlights: [
          "Bulut Denizine Nazır",
          "Geleneksel Ahşap Mimari",
          "Yöresel Serpme Kahvaltı",
          "Doğa Yürüyüş Rotaları",
        ],
      },
      {
        id: 10,
        name: "Muhammed K Gaziantep Şehir Oteli",
        city: "Gaziantep",
        district: "Şehitkamil",
        price: "₺11,200",
        rating: 4.6,
        concept: "business",
        tag: "GASTRONOMİ",
        img: "https://images.trvl-media.com/lodging/3000000/2710000/2705200/2705163/85d5ee36.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
        amenities: ["fa-utensils", "fa-spa", "fa-briefcase", "fa-wifi"],
        description:
          "Gaziantep merkezde bulunan otelimiz, iş seyahatleri için tasarlanmış yüksek teknolojik altyapısı ve tescilli şeflerimizce sunulan gastronomi lezzetleriyle öne çıkıyor.",
        highlights: [
          "Gurme Restoran",
          "Teknolojik Toplantı Salonları",
          "Türk Hamamı & Sauna",
          "Merkezi Konum",
        ],
      },
      {
        id: 11,
        name: "Muhammed K Kapadokya Mağara Saray",
        city: "Nevşehir",
        district: "Göreme",
        price: "₺24,500",
        rating: 4.9,
        concept: "cave",
        tag: "MAĞARA SÜİT",
        img: "https://www.bizevdeyokuz.com/wp-content/uploads/kapadokya-otelleri.jpg",
        amenities: [
          "fa-hot-tub-person",
          "fa-mountain",
          "fa-spa",
          "fa-utensils",
        ],
        description:
          "Binlerce yıllık peri bacalarının içine oyulmuş lüks mağara süitlerimiz, balon manzaralı terası ve iç oda jakuzileriyle mistik bir konaklama deneyimi sunuyor.",
        highlights: [
          "Sıcak Hava Balonu Manzarası",
          "Tarihi Kaya Oyma Oda",
          "Özel Terasta Kahvaltı",
          "Seyir Terası",
        ],
      },
      {
        id: 12,
        name: "Muhammed K Mardin Taş Sarayı",
        city: "Mardin",
        district: "Artuklu",
        price: "₺14,800",
        rating: 4.8,
        concept: "cave",
        tag: "TARİHİ KONAK",
        img: "https://cdn.oggusto.com/uploads/2023/08/mardin-en-iyi-restoranlar.webp",
        amenities: ["fa-monument", "fa-utensils", "fa-sun", "fa-wifi"],
        description:
          "Mezopotamya ovasına hakim tarihi Artuklu taş sarayımız, otantik taş oymacılığı, geniş eyvanları ve büyüleyici gün batımı manzarasıyla misafirlerini büyülüyor.",
        highlights: [
          "Mezopotamya Ova Manzarası",
          "Otantik Taş Eyvanlar",
          "Davet Alanı",
          "Tarihi Dokuya Yakınlık",
        ],
      },
    ];

    const getFavorites = () =>
      JSON.parse(localStorage.getItem("muhammedk_favorites")) || [];

    const saveFavorites = (favs) => {
      localStorage.setItem("muhammedk_favorites", JSON.stringify(favs));
      updateFavBadgeCount();
    };

    const updateFavBadgeCount = () => {
      const favBadge = document.getElementById("favCount");
      if (favBadge) favBadge.textContent = getFavorites().length;
    };

    let showOnlyFavorites = false;
    const itemsPerPage = 6;
    let currentPage = 1;
    let filteredHotels = [...hotelsDatabase];

    const citySelect = document.getElementById("citySelect");
    const conceptSelect = document.getElementById("conceptSelect");
    const ratingSelect = document.getElementById("ratingSelect");
    const searchInput = document.getElementById("searchInput");
    const favOnlyBtn = document.getElementById("favOnlyBtn");
    const pagination = document.getElementById("pagination");
    const resultCount = document.getElementById("resultCount");
    const filterBtn = document.getElementById("filterBtn");

    const hotelModal = document.getElementById("hotelModal");
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalLocation = document.getElementById("modalLocation");
    const modalDesc = document.getElementById("modalDesc");
    const modalHighlights = document.getElementById("modalHighlights");
    const modalPrice = document.getElementById("modalPrice");
    const modalBookLink = document.getElementById("modalBookLink");

    if (citySelect) {
      cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }

    const renderHotels = () => {
      hotelsGrid.innerHTML = "";
      const favorites = getFavorites();

      if (filteredHotels.length === 0) {
        hotelsGrid.innerHTML = `
          <div class="no-results">
            <i class="fa-solid fa-heart-crack"></i>
            <h3>Aradığınız Kriterlere Uygun Mülk Bulunamadı</h3>
            <p>${showOnlyFavorites ? "Henüz favorilerinize eklenmiş bir otel bulunmuyor." : "Lütfen arama ve filtre kriterlerinizi değiştiriniz."}</p>
          </div>
        `;
        if (pagination) pagination.innerHTML = "";
        if (resultCount)
          resultCount.innerHTML = `Bulunan Tesis: <strong>0</strong>`;
        return;
      }

      const isCitySelected = citySelect && citySelect.value !== "all";
      let displayHotels = [];

      if (isCitySelected || showOnlyFavorites) {
        displayHotels = filteredHotels;
        if (pagination) pagination.innerHTML = "";
      } else {
        const startIndex = (currentPage - 1) * itemsPerPage;
        displayHotels = filteredHotels.slice(
          startIndex,
          startIndex + itemsPerPage,
        );
        renderPagination();
      }

      if (resultCount) {
        resultCount.innerHTML = `Toplam <strong>${filteredHotels.length}</strong> tesis listeleniyor`;
      }

      const cardsHTML = displayHotels
        .map((hotel) => {
          const isFav = favorites.includes(hotel.id);
          const amenitiesHTML = hotel.amenities
            .map((icon) => `<i class="fa-solid ${icon}"></i>`)
            .join("");

          return `
          <div class="hotel-card">
            <div class="card-img">
              <img src="${hotel.img}" alt="${hotel.name}" loading="lazy" onerror="this.onerror=null; this.src='${DEFAULT_FALLBACK_IMG}';">
              <span class="badge-city">${hotel.city}</span>
              <span class="badge-tag">${hotel.tag}</span>
              <span class="rating-badge">${hotel.rating} / 5</span>
              <button class="fav-btn ${isFav ? "active" : ""}" data-id="${hotel.id}" title="Favorilere Ekle">
                <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
              </button>
            </div>
            <div class="card-body">
              <h3>${hotel.name}</h3>
              <div class="location"><i class="fa-solid fa-map-pin"></i> ${hotel.district}, ${hotel.city}</div>
              <div class="amenities">${amenitiesHTML}</div>
              <div class="card-footer">
                <div class="price-tag">
                  <span>Gecelik Başlangıç</span>
                  <strong>${hotel.price}</strong>
                </div>
                <div class="card-actions-wrapper">
                  <button class="details-btn" data-id="${hotel.id}">İncele</button>
                  <a href="rezervasyon.html?hotel=${encodeURIComponent(hotel.name)}" class="book-btn">Rezerve Et</a>
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

      hotelsGrid.innerHTML = cardsHTML;

      // Event Listener bağlama
      hotelsGrid.querySelectorAll(".fav-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const hotelId = parseInt(this.getAttribute("data-id"), 10);
          toggleFav(this, hotelId);
        });
      });

      hotelsGrid.querySelectorAll(".details-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const hotelId = parseInt(this.getAttribute("data-id"), 10);
          openHotelModal(hotelId);
        });
      });
    };

    const openHotelModal = (id) => {
      const hotel = hotelsDatabase.find((item) => item.id === id);
      if (!hotel || !hotelModal) return;

      if (modalImg) {
        modalImg.onerror = function () {
          this.onerror = null;
          this.src = DEFAULT_FALLBACK_IMG;
        };
        modalImg.src = hotel.img;
      }

      if (modalTitle) modalTitle.textContent = hotel.name;
      if (modalLocation)
        modalLocation.innerHTML = `<i class="fa-solid fa-map-pin"></i> ${hotel.district}, ${hotel.city}`;
      if (modalDesc) modalDesc.textContent = hotel.description;
      if (modalPrice) modalPrice.textContent = hotel.price;
      if (modalBookLink)
        modalBookLink.href = `rezervasyon.html?hotel=${encodeURIComponent(hotel.name)}`;

      if (modalHighlights) {
        modalHighlights.innerHTML = hotel.highlights
          .map(
            (item) =>
              `<div class="highlight-item"><i class="fa-solid fa-check" style="color:#bf953f"></i> ${item}</div>`,
          )
          .join("");
      }

      hotelModal.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const closeHotelModal = () => {
      if (hotelModal) {
        hotelModal.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeHotelModal);
    if (hotelModal) {
      hotelModal.addEventListener("click", (e) => {
        if (e.target === hotelModal) closeHotelModal();
      });
    }

    const toggleFav = (btn, hotelId) => {
      let favorites = getFavorites();
      const icon = btn.querySelector("i");

      if (favorites.includes(hotelId)) {
        favorites = favorites.filter((id) => id !== hotelId);
        btn.classList.remove("active");
        if (icon) icon.className = "fa-regular fa-heart";
      } else {
        favorites.push(hotelId);
        btn.classList.add("active");
        if (icon) icon.className = "fa-solid fa-heart";
      }
      saveFavorites(favorites);
      if (showOnlyFavorites) applyFilter();
    };

    const renderPagination = () => {
      if (!pagination) return;
      pagination.innerHTML = "";
      const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
      if (totalPages <= 1) return;

      const createPageBtn = (
        content,
        onClick,
        isDisabled = false,
        isActive = false,
      ) => {
        const btn = document.createElement("button");
        btn.className = `page-btn ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`;
        btn.innerHTML = content;
        if (!isDisabled) btn.onclick = onClick;
        return btn;
      };

      pagination.appendChild(
        createPageBtn(
          '<i class="fa-solid fa-chevron-left"></i>',
          () => {
            if (currentPage > 1) {
              currentPage--;
              renderHotels();
            }
          },
          currentPage === 1,
        ),
      );

      for (let i = 1; i <= totalPages; i++) {
        pagination.appendChild(
          createPageBtn(
            i,
            () => {
              currentPage = i;
              renderHotels();
            },
            false,
            i === currentPage,
          ),
        );
      }

      pagination.appendChild(
        createPageBtn(
          '<i class="fa-solid fa-chevron-right"></i>',
          () => {
            if (currentPage < totalPages) {
              currentPage++;
              renderHotels();
            }
          },
          currentPage === totalPages,
        ),
      );
    };

    const applyFilter = () => {
      const selectedCity = citySelect?.value || "all";
      const selectedConcept = conceptSelect?.value || "all";
      const selectedRating = ratingSelect?.value || "all";
      const query = searchInput?.value.toLowerCase().trim() || "";
      const favorites = getFavorites();

      filteredHotels = hotelsDatabase.filter((hotel) => {
        const matchesCity =
          selectedCity === "all" || hotel.city === selectedCity;
        const matchesConcept =
          selectedConcept === "all" || hotel.concept === selectedConcept;
        const matchesRating =
          selectedRating === "all" ||
          hotel.rating >= parseFloat(selectedRating);
        const matchesQuery =
          hotel.name.toLowerCase().includes(query) ||
          hotel.city.toLowerCase().includes(query) ||
          hotel.district.toLowerCase().includes(query);
        const matchesFav = !showOnlyFavorites || favorites.includes(hotel.id);

        return (
          matchesCity &&
          matchesConcept &&
          matchesRating &&
          matchesQuery &&
          matchesFav
        );
      });

      currentPage = 1;
      renderHotels();
    };

    if (favOnlyBtn) {
      favOnlyBtn.addEventListener("click", () => {
        showOnlyFavorites = !showOnlyFavorites;
        favOnlyBtn.classList.toggle("active", showOnlyFavorites);
        applyFilter();
      });
    }

    [citySelect, conceptSelect, ratingSelect].forEach((el) =>
      el?.addEventListener("change", applyFilter),
    );
    searchInput?.addEventListener("input", applyFilter);
    filterBtn?.addEventListener("click", applyFilter);

    updateFavBadgeCount();
    renderHotels();
  }
});
