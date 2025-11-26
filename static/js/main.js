/**
 * Smart Budget Tracker - Main JavaScript
 * Handles interactive features and API calls
 */

// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Fetch data from API
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Fetch error:", error)
    showNotification("An error occurred", "error")
    return null
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === "error" ? "#FF6B6B" : "#00D084"};
        color: white;
        border-radius: 0.5rem;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Date utilities
const dateUtils = {
  today: () => new Date().toISOString().split("T")[0],

  monthStart: () => {
    const date = new Date()
    date.setDate(1)
    return date.toISOString().split("T")[0]
  },

  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },

  addDays: (days) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split("T")[0]
  },
}

// Chart configuration
const chartColors = {
  primary: "#6C63FF",
  success: "#00D084",
  danger: "#FF6B6B",
  warning: "#FFA500",
  info: "#45B7D1",
  palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"],
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Smart Budget Tracker loaded")
})

// Export for use in templates
window.formatCurrency = formatCurrency
window.fetchAPI = fetchAPI
window.showNotification = showNotification
window.dateUtils = dateUtils
window.chartColors = chartColors
