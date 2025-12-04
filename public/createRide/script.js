// ==========================================
// 1. SETUP & HELPER FUNCTIONS
// ==========================================
const seatsOfferRide = document.getElementById('seatsOfferRide');
const dateInputOfferRide = document.getElementById('dateInputOfferRide');
const timeInputOfferRide = document.getElementById('timeInputOfferRide');
const vehicleOfferRide = document.getElementById('vehicleOfferRide');
const fareOfferRide = document.getElementById('fareOfferRide');

// Helper: Input Validation (Numbers only, limits)
function validateInput(inputElement, limit, min) {
  inputElement.addEventListener("input", function (event) {
    let value = this.value;
    value = value.replace(/\D/g, "");
    if (value !== "") {
      const numValue = parseInt(value, 10);
      if (numValue > limit) {
        value = limit.toString();
      } else if (numValue < min) {
        value = min;
      }
    }
    this.value = value;
  });
}

// Helper: Show Error Message (Toast)
function showError(message) {
  const errorDiv = document.getElementById("readOnlyerror");
  // Check if errorDiv exists to prevent crash
  if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove("opacity-0", "pointer-events-none");
      errorDiv.classList.add("-translate-y-10", "opacity-100");

      setTimeout(() => {
        errorDiv.classList.remove("-translate-y-10", "opacity-100");
        errorDiv.classList.add("-translate-y-20", "opacity-0", "pointer-events-none");
        setTimeout(() => {
          errorDiv.classList.remove("-translate-y-20");
        }, 500);
      }, 2500);
  } else {
      console.warn("Error toast element 'readOnlyerror' not found in HTML.");
      alert(message); // Fallback
  }
}

// ==========================================
// 2. PAGE INITIALIZATION & NAVIGATION
// ==========================================

// Back Button Logic
const backBtn = document.getElementById('backPage');
if(backBtn) {
    backBtn.href = 'javascript:void(0);';
    backBtn.onclick = () => {
      if (window.history.length <= 1) {
        window.location.href = '/home';
      } else {
        window.history.back();
      }
    }
}

// Set Default Date & Time
function setDateTime() {
  let now = new Date();
  now.setMinutes(now.getMinutes() + 10);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if(dateInputOfferRide) {
      dateInputOfferRide.value = formattedDate;
      dateInputOfferRide.setAttribute('min', formattedDate);
  }
  if(timeInputOfferRide) {
      timeInputOfferRide.value = formattedTime;
  }
}

// ==========================================
// 3. VEHICLE LOGIC
// ==========================================

function handleVehicleSelection(select) {
  const selectedValue = select.value;

  if (selectedValue === "") {
    select.value = "";
    window.location.href = "vehicle/manageVehicles";
  } else {
    fareOfferRide.readOnly = false;
    seatsOfferRide.readOnly = false;
    fareOfferRide.value = "";
    seatsOfferRide.value = "";

    const selectedOption = select.options[select.selectedIndex];
    const vehicleType = selectedOption.getAttribute("data-vehicletype");

    if (vehicleType === "car") {
      validateInput(seatsOfferRide, 4, 1);
      validateInput(fareOfferRide, 500, 0); // Adjusted limit to 500 reasonable
    } else if (vehicleType === "bike") {
      validateInput(seatsOfferRide, 2, 1);
      validateInput(fareOfferRide, 300, 0);
    }
  }
}

// Load Vehicles on Page Load
document.addEventListener('DOMContentLoaded', function () {
  setDateTime();
  fetch('/vehicle/getVehicles')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if(vehicleOfferRide) {
          for (let i = 0; i < data.length; i++) {
            let option = document.createElement("option");
            option.value = data[i]._id;
            option.textContent = data[i].model + " - " + data[i].numberPlate;
            option.setAttribute("data-vehicletype", data[i].vehicleType);
            vehicleOfferRide.appendChild(option);
          }
          let option = document.createElement("option");
          option.value = "";
          option.className = "font-sm";
          option.textContent = "➕ Add New Vehicle";
          vehicleOfferRide.appendChild(option);
      }
    }).catch(error => {
      console.log(error);
    })
});

// ==========================================
// 4. FORM SUBMISSION
// ==========================================
const submitBtn = document.getElementById('OfferRideSubmitBtn');
if(submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      document.getElementById('OfferRideSubmitBtn').disabled = true;
      const form = document.getElementById('offerRidesOption');
      let vehicleOfferRide = form.querySelector('#vehicleOfferRide');

      if (form.checkValidity()) {
        e.preventDefault();

        let fromFindRideValue = form.querySelector('#fromOfferRide');
        let toFindRideValue = form.querySelector('#toOfferRide');
        let dateInputOfferRide = form.querySelector('#dateInputOfferRide');
        let timeInputOfferRide = form.querySelector('#timeInputOfferRide');
        let seatsOfferRide = form.querySelector('#seatsOfferRide');
        let fareOfferRide = form.querySelector('#fareOfferRide');

        const dateValue = dateInputOfferRide.value;
        const timeValue = timeInputOfferRide.value;
        const localDateTime = `${dateValue}T${timeValue}`;
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const utcDateTime = new Date(
          new Date(localDateTime).toLocaleString('en-US', { timeZone: userTimeZone })
        ).toISOString();

        fetch('/ride', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromFindRideValue.value,
            to: toFindRideValue.value,
            datetime: utcDateTime,
            fare: Number(fareOfferRide.value),
            seats: Number(seatsOfferRide.value),
            vehicleDetails: vehicleOfferRide.value
          })
        }).then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.message || 'Something went wrong');
            });
          }
          return response.json();
        })
          .then(data => {
            // Clear fields
            fromFindRideValue.value = "";
            toFindRideValue.value = "";
            dateInputOfferRide.value = "";
            timeInputOfferRide.value = "";
            fareOfferRide.value = "";
            seatsOfferRide.value = "";
            vehicleOfferRide.value = "";
            window.location.href = "/ride/created"
          })
          .catch((error) => {
            let errorspan = document.querySelector('div[role="alert"]');
            if(errorspan) {
                errorspan.classList.remove('hidden');
                document.querySelector('div[role="success"]').classList.add('hidden');
                errorspan.querySelector('span').innerHTML = error.message;
                errorspan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                alert(error.message);
            }
          }).finally(() => {
            document.getElementById('OfferRideSubmitBtn').disabled = false;
          });
      } else {
        form.reportValidity();
      }
    });
}

// ==========================================
// 5. LOCATION & AUTOCOMPLETE LOGIC (UPDATED)
// ==========================================

const SHU_LOCATION = "Salim Habib University (SHU), Korangi Creek, Karachi";

const places = [
  SHU_LOCATION,
  "Korangi Creek Industrial Park, Karachi",
  "Scheme 33, Karachi",
  "Quetta Town (Scheme 33), Karachi",
  "Capital Society (Scheme 33), Karachi",
  "Malik Society (Scheme 33), Karachi",
  "Fatima Ali Tower (Gulzari Hijri), Karachi",
  "Sohrab Goth, Karachi",
  "Al-Azhar Garden, Karachi",
  "Safoora Chowrangi, Karachi",
  "Bahria Town, Karachi",
  "DHA City, Karachi",
  "Gulistan-e-Jauhar, Karachi",
  "Gulistan-e-Jauhar (Block 8), Karachi",
  "Gulistan-e-Jauhar (Block 9), Karachi",
  "Gulistan-e-Jauhar (Block 10), Karachi",
  "Gulistan-e-Jauhar (Block 11), Karachi",
  "Gulistan-e-Jauhar (Block 13), Karachi",
  "Yasir Terrace (Jauhar), Karachi",
  "Kamran Chowrangi, Karachi",
  "Johar Chowrangi, Karachi",
  "Munawar Chowrangi, Karachi",
  "Perfume Chowk, Karachi",
  "Bhittaiabad, Karachi",
  "Gulshan-e-Iqbal, Karachi",
  "Gulshan-e-Iqbal (Block 13D), Karachi",
  "Hassan Square, Karachi",
  "Civic View Apartments (Hassan Square), Karachi",
  "NIPA Chowrangi, Karachi",
  "Maskan Chowrangi, Karachi",
  "Disco Bakery, Karachi",
  "University of Karachi (UoK), Karachi",
  "NED University, Karachi",
  "Malir, Karachi",
  "Malir Halt, Karachi",
  "Malir Cantt, Karachi",
  "Check Post 6 (Malir Cantt), Karachi",
  "Malir Moinabad, Karachi",
  "Shamsi Society, Karachi",
  "Model Colony, Karachi",
  "Jinnah International Airport, Karachi",
  "Star Gate, Karachi",
  "Gulshan-e-Hadeed, Karachi",
  "Quaidabad Flyover, Karachi",
  "Lalazar Lawn (Quaidabad), Karachi",
  "Korangi Crossing, Karachi",
  "Korangi No. 2, Karachi",
  "Korangi No. 5, Karachi",
  "Korangi No. 2½, Karachi",
  "Bilal Colony (Korangi), Karachi",
  "Lucknow Society (Korangi), Karachi",
  "Zaman Town (Korangi), Karachi",
  "Darul Uloom, Karachi",
  "Brooks Chowrangi, Karachi",
  "Chamra Chowrangi, Karachi",
  "Landhi No. 4, Karachi",
  "Landhi No. 6, Karachi",
  "Landhi 89, Karachi",
  "DHA Phase 1, Karachi",
  "DHA Phase 2, Karachi",
  "DHA Phase 4, Karachi",
  "DHA Phase 5, Karachi",
  "DHA Phase 6, Karachi",
  "DHA Phase 7, Karachi",
  "DHA Phase 8, Karachi",
  "Seher Commercial (DHA), Karachi",
  "Iqbal Lane (DHA Phase 8), Karachi",
  "Creek Vista Apartments, Karachi",
  "Clifton (Block 8), Karachi",
  "Clifton (Block 9), Karachi",
  "Teen Talwar, Karachi",
  "Do Talwar, Karachi",
  "Dolmen City Mall (Clifton), Karachi",
  "Summit Tower (Clifton), Karachi",
  "China Port, Karachi",
  "Boat Basin, Karachi",
  "North Nazimabad, Karachi",
  "North Nazimabad (Block C), Karachi",
  "North Nazimabad (Block R), Karachi",
  "Five Star Chowrangi, Karachi",
  "Hyderi Market, Karachi",
  "KDA Chowrangi, Karachi",
  "Sakhi Hassan Chowrangi, Karachi",
  "Naya Nazimabad, Karachi",
  "Buffer Zone, Karachi",
  "North Karachi, Karachi",
  "Power House Chowrangi, Karachi",
  "4K Chowrangi, Karachi",
  "Nazimabad No. 1, Karachi",
  "Nazimabad No. 3, Karachi",
  "Nazimabad No. 5, Karachi",
  "Khilafat Chowk (Nazimabad), Karachi",
  "Golimar, Karachi",
  "Liaquatabad No. 10, Karachi",
  "F.B. Area (Block 14), Karachi",
  "F.B. Area (Block 15), Karachi",
  "Aisha Manzil, Karachi",
  "Water Pump Chowrangi, Karachi",
  "Karimabad, Karachi",
  "Saddar, Karachi",
  "Numaish Chowrangi, Karachi",
  "Garden East, Karachi",
  "Garden West, Karachi",
  "Pakistan Chowk, Karachi",
  "I.I. Chundrigar Road, Karachi",
  "Burns Road, Karachi",
  "Tower, Karachi",
  "Empress Market, Karachi",
  "Atrium Mall, Karachi",
  "Shahrah-e-Faisal, Karachi",
  "Baloch Colony Bridge, Karachi",
  "Nursery, Karachi",
  "PECHS (Block 2), Karachi",
  "PECHS (Block 6), Karachi",
  "Tariq Road, Karachi",
  "Tipu Sultan Road, Karachi",
  "Shaheed-e-Millat Road, Karachi",
  "Awami Markaz, Karachi",
  "Finance & Trade Centre (FTC), Karachi",
  "Drigh Road Station, Karachi",
  "Mehmoodabad, Karachi",
  "Manzoor Colony, Karachi",
  "Hill Park, Karachi",
  "Lucky One Mall, Karachi"
];

function autocomplete(inputElement, listId, filterFn) {
  let currentFocus;

  inputElement.addEventListener("input", function () {
    const value = this.value;
    closeAllLists();
    if (!value) return false;

    currentFocus = -1;
    const autocompleteList = document.getElementById(listId);
    autocompleteList.innerHTML = "";
    autocompleteList.classList.remove("hidden");

    const filteredPlaces = filterFn ? filterFn(places) : places;
    
    let count = 0; 
    const maxResults = 10;

    for (let i = 0; i < filteredPlaces.length; i++) {
      if (count >= maxResults) break;
      const place = filteredPlaces[i];
      
      // Use includes for flexible search
      if (place.toLowerCase().includes(value.toLowerCase())) {
        const itemElement = document.createElement("div");
        
        const regex = new RegExp(`(${value})`, "gi");
        itemElement.innerHTML = place.replace(regex, "<strong>$1</strong>");
        
        itemElement.classList.add("cursor-pointer", "p-2", "hover:bg-blue-100", "border-b", "border-gray-100");
        
        itemElement.addEventListener("click", function () {
          inputElement.value = place;
          closeAllLists();
          inputElement.dispatchEvent(new Event("change"));
        });
        
        autocompleteList.appendChild(itemElement);
        count++;
      }
    }

    if (autocompleteList.children.length === 0) {
      autocompleteList.classList.add("hidden");
    }
  });

  inputElement.addEventListener("keydown", function (e) {
    const items = document.querySelectorAll(`#${listId} div`);
    if (e.keyCode === 40) { 
      currentFocus++;
      addActive(items);
    } else if (e.keyCode === 38) { 
      currentFocus--;
      addActive(items);
    } else if (e.keyCode === 13) { 
      e.preventDefault();
      if (currentFocus > -1) {
        if (items) items[currentFocus].click();
      }
    }
  });

  inputElement.addEventListener("blur", function () {
    const value = this.value;
    if (!places.some(place => place.toLowerCase() === value.toLowerCase())) {
      inputElement.value = ""; 
    }
  });

  function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("bg-blue-100");
  }

  function removeActive(items) {
    items.forEach(item => item.classList.remove("bg-blue-100"));
  }

  function closeAllLists() {
    const autocompleteList = document.getElementById(listId);
    if(autocompleteList) {
        autocompleteList.innerHTML = ""; 
        autocompleteList.classList.add("hidden"); 
    }
  }

  document.addEventListener("click", function () {
    closeAllLists();
  });
}

// Initialize Autocomplete
autocomplete(document.getElementById('fromOfferRide'), "fromOfferRide-list", () => places);
autocomplete(document.getElementById('toOfferRide'), "toOfferRide-list", () => places);

// "Hub and Spoke" Logic (One side must be SHU)
document.getElementById('fromOfferRide').addEventListener('change', function () {
  const value = this.value;
  if (value === SHU_LOCATION) {
    const filteredPlaces = places.filter(place => place !== SHU_LOCATION);
    autocomplete(document.getElementById('toOfferRide'), "toOfferRide-list", () => filteredPlaces);
    document.getElementById('toOfferRide').value = "";
    document.getElementById('toOfferRide').readOnly = false;
  } else if (places.includes(value)) {
    document.getElementById('toOfferRide').value = SHU_LOCATION;
    document.getElementById('toOfferRide').readOnly = true; 
  }
});

document.getElementById('toOfferRide').addEventListener('change', function () {
  const value = this.value;
  if (value === SHU_LOCATION) {
    const filteredPlaces = places.filter(place => place !== SHU_LOCATION);
    autocomplete(document.getElementById('fromOfferRide'), "fromOfferRide-list", () => filteredPlaces);
    document.getElementById('fromOfferRide').value = "";
    document.getElementById('fromOfferRide').readOnly = false; 
  } else if (places.includes(value)) {
    document.getElementById('fromOfferRide').value = SHU_LOCATION;
    document.getElementById('fromOfferRide').readOnly = true; 
  }
});

// ==========================================
// 6. UI ERROR HANDLING
// ==========================================

if(seatsOfferRide) {
    seatsOfferRide.addEventListener("click", () => {
      if (seatsOfferRide.readOnly) {
        showError("Please select the vehicle first");
      }
    });
}

if(fareOfferRide) {
    fareOfferRide.addEventListener("click", () => {
      if (fareOfferRide.readOnly) {
        showError("Please select the vehicle first");
      }
    });
}