// NASA APOD API configuration
const API_KEY = 'HRn7ovIhNe3U4TUdMuYkc3u7medRYuRDmziBowMu';
const API_BASE_URL = 'https://api.nasa.gov/planetary/apod';

// Find our date picker inputs and button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('imageModal');
const closeModal = document.querySelector('.close');

// Random space facts for the "Did You Know?" section
const spaceFacts = [
  "One day on Venus is longer than its year! Venus rotates so slowly that a day (243 Earth days) is longer than a year (225 Earth days).",
  "Jupiter's Great Red Spot is a storm that has been raging for over 300 years and is larger than Earth!",
  "Saturn's moon Titan has lakes and rivers, but they're made of liquid methane and ethane instead of water.",
  "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - it won't happen for about 4.5 billion years!",
  "There are more possible games of chess than there are atoms in the observable universe.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "The footprints left by Apollo astronauts on the Moon will last for millions of years because there's no wind or water to erode them.",
  "One year on Neptune equals 165 Earth years, so it has only completed one orbit around the Sun since its discovery in 1846!",
  "The International Space Station travels at about 17,500 mph and orbits Earth approximately every 90 minutes."
];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Display a random space fact when the page loads
function displayRandomFact() {
  const factText = document.getElementById('factText');
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  factText.textContent = randomFact;
}

// Show loading state in the gallery
function showLoading() {
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-icon">🚀</div>
      <p>Loading space photos...</p>
    </div>
  `;
}

// Fetch images from NASA APOD API
async function fetchSpaceImages(startDate, endDate) {
  try {
    showLoading();
    
    // Build the API URL with our parameters
    const url = `${API_BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Make the API request
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Display the images in our gallery
    displayImages(data);
    
  } catch (error) {
    console.error('Error fetching space images:', error);
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">❌</div>
        <p>Sorry, we couldn't load the space images. Please try again later.</p>
      </div>
    `;
  }
}

// Display images in the gallery
function displayImages(images) {
  // Clear the gallery
  gallery.innerHTML = '';
  
  // If no images were returned, show a message
  if (!images || images.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🌌</div>
        <p>No images found for the selected date range. Try a different date range.</p>
      </div>
    `;
    return;
  }
  
  // Create a card for each image
  images.forEach(image => {
    const card = createImageCard(image);
    gallery.appendChild(card);
  });
}

// Create an individual image card
function createImageCard(imageData) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  
  // Handle both images and videos
  const mediaElement = imageData.media_type === 'video' 
    ? `<img src="https://img.youtube.com/vi/${getYouTubeId(imageData.url)}/maxresdefault.jpg" alt="${imageData.title}" />` 
    : `<img src="${imageData.url}" alt="${imageData.title}" />`;
  
  card.innerHTML = `
    ${mediaElement}
    <div class="gallery-item-content">
      <div class="gallery-item-title">${imageData.title}</div>
      <div class="gallery-item-date">${formatDate(imageData.date)}</div>
    </div>
  `;
  
  // Add click event to open modal
  card.addEventListener('click', () => {
    openModal(imageData);
  });
  
  return card;
}

// Extract YouTube video ID from URL
function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Open modal with image details
function openModal(imageData) {
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalImage = document.getElementById('modalImage');
  const modalVideo = document.getElementById('modalVideo');
  const modalExplanation = document.getElementById('modalExplanation');
  
  // Set the content
  modalTitle.textContent = imageData.title;
  modalDate.textContent = formatDate(imageData.date);
  modalExplanation.textContent = imageData.explanation;
  
  // Show appropriate media type
  if (imageData.media_type === 'video') {
    modalImage.style.display = 'none';
    modalVideo.style.display = 'block';
    modalVideo.src = imageData.url;
  } else {
    modalVideo.style.display = 'none';
    modalImage.style.display = 'block';
    modalImage.src = imageData.url;
    modalImage.alt = imageData.title;
  }
  
  // Show the modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal function
function closeModalFunction() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
  
  // Clear video source to stop playback
  const modalVideo = document.getElementById('modalVideo');
  modalVideo.src = '';
}

// Event listeners
fetchButton.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Validate that both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  // Validate that start date is before end date
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be before end date.');
    return;
  }
  
  // Fetch the images
  fetchSpaceImages(startDate, endDate);
});

// Modal close event listeners
closeModal.addEventListener('click', closeModalFunction);

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModalFunction();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeModalFunction();
  }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  displayRandomFact();
  
  // Load images for the default date range on page load
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  if (startDate && endDate) {
    fetchSpaceImages(startDate, endDate);
  }
});
