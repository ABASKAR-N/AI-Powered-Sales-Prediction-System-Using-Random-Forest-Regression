
/* ==========================================
   SALES AI - COMPLETE FRONTEND APPLICATION
   FastAPI + Random Forest Sales Prediction
========================================== */

// 1. BACKEND CONFIGURATION

const API_URL = "http://127.0.0.1:8001";

// Dashboard data
let predictionHistory = [];

// Chart reference
let salesChart = null;


// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

// Get HTML element safely
function getElement(id) {
    return document.getElementById(id);
}

// Format Indian currency
function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(value);
}

// Format numbers
function formatNumber(value) {
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2
    }).format(value);
}


// ==========================================
// 3. BACKEND CONNECTION CHECK
// ==========================================

async function checkBackend() {

    const statusText = getElement("backendStatus");
    const sidebarStatus = getElement("sidebarStatus");

    try {

        if (statusText) {
            statusText.textContent = "Connecting...";
        }

        if (sidebarStatus) {
            sidebarStatus.textContent = "Connecting...";
        }

        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
            throw new Error("Backend server is unavailable");
        }

        const data = await response.json();

        if (data.status !== "healthy") {
            throw new Error("Random Forest model is not loaded");
        }

        if (statusText) {
            statusText.textContent = "API Connected";
        }

        if (sidebarStatus) {
            sidebarStatus.textContent = "Online";
        }

        console.log("Backend connected successfully");

        return true;

    } catch (error) {

        if (statusText) {
            statusText.textContent = "API Offline";
        }

        if (sidebarStatus) {
            sidebarStatus.textContent = "Backend unavailable";
        }

        console.error("Backend connection error:", error);

        return false;
    }
}


// ==========================================
// 4. INITIALIZE SALES CHART
// ==========================================

function initializeChart() {

    const canvas = getElement("salesChart");

    if (!canvas) {
        console.error("salesChart element not found in HTML");
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded");
        return;
    }

    // Prevent duplicate chart initialization
    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(canvas, {

        type: "line",

        data: {
            labels: [],

            datasets: [{
                label: "Predicted Sales",

                data: [],

                borderColor: "#6857e8",
                backgroundColor: "rgba(104, 87, 232, 0.10)",

                borderWidth: 3,

                fill: true,
                tension: 0.4,

                pointRadius: 5,
                pointHoverRadius: 7,

                pointBackgroundColor: "#6857e8"
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: true,
                    position: "top"
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return "Sales: " +
                                formatCurrency(context.parsed.y);
                        }
                    }
                }
            },

            scales: {

                y: {

                    beginAtZero: false,

                    ticks: {

                        callback: function(value) {

                            return "₹" +
                                new Intl.NumberFormat("en-IN", {
                                    notation: "compact"
                                }).format(value);
                        }
                    },

                    grid: {
                        color: "#eeeeF5"
                    }
                },

                x: {

                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    console.log("Sales chart initialized");
}


// ==========================================
// 5. UPDATE SUMMARY CARDS
// ==========================================

function updateSummary() {

    const count = predictionHistory.length;

    const totalPredictions = getElement("totalPredictions");
    const latestSales = getElement("latestSales");
    const averageSales = getElement("averageSales");

    // Update total predictions
    if (totalPredictions) {
        totalPredictions.textContent = count;
    }

    // No prediction data
    if (count === 0) {

        if (latestSales) {
            latestSales.textContent = "—";
        }

        if (averageSales) {
            averageSales.textContent = "—";
        }

        return;
    }

    // Latest prediction
    const latest =
        predictionHistory[count - 1].sales;

    // Calculate total sales predictions
    const total = predictionHistory.reduce(
        (sum, item) => sum + item.sales,
        0
    );

    // Calculate average prediction
    const average = total / count;

    if (latestSales) {
        latestSales.textContent = formatCurrency(latest);
    }

    if (averageSales) {
        averageSales.textContent = formatCurrency(average);
    }
}


// ==========================================
// 6. UPDATE SALES CHART
// ==========================================

function updateChart() {

    if (!salesChart) {
        return;
    }

    // Update chart labels
    salesChart.data.labels = predictionHistory.map(
        (item, index) => "Prediction " + (index + 1)
    );

    // Update chart values
    salesChart.data.datasets[0].data =
        predictionHistory.map(item => item.sales);

    // Refresh chart
    salesChart.update();
}


// ==========================================
// 7. UPDATE PREDICTION HISTORY TABLE
// ==========================================

function updateHistory() {

    const tbody = getElement("historyBody");

    if (!tbody) {
        console.error("historyBody element not found");
        return;
    }

    // Clear existing table rows
    tbody.innerHTML = "";

    // Show empty message
    if (predictionHistory.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No predictions yet.
                    Make your first prediction.
                </td>
            </tr>
        `;

        return;
    }

    // Display prediction history
    predictionHistory.forEach((item, index) => {

        const row = document.createElement("tr");

        const values = [
            index + 1,
            formatCurrency(item.budget),
            formatNumber(item.store),
            item.discount + "%",
            formatCurrency(item.sales)
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}


// ==========================================
// 8. DISPLAY PREDICTION RESULT
// ==========================================

function displayResult(
    budget,
    store,
    discount,
    sales
) {

    const emptyResult = getElement("emptyResult");
    const predictionResult = getElement("predictionResult");

    // Hide empty result message
    if (emptyResult) {
        emptyResult.classList.add("hidden");
    }

    // Show prediction result
    if (predictionResult) {
        predictionResult.classList.remove("hidden");
    }

    // Display predicted sales
    const resultValue = getElement("resultValue");

    if (resultValue) {
        resultValue.textContent = formatCurrency(sales);
    }

    // Display input values
    const resultBudget = getElement("resultBudget");

    if (resultBudget) {
        resultBudget.textContent = formatCurrency(budget);
    }

    const resultStore = getElement("resultStore");

    if (resultStore) {
        resultStore.textContent = formatNumber(store);
    }

    const resultDiscount = getElement("resultDiscount");

    if (resultDiscount) {
        resultDiscount.textContent = discount + "%";
    }
}


// ==========================================
// 9. DISPLAY ERROR MESSAGE
// ==========================================

function showError(message) {

    const errorMessage = getElement("errorMessage");

    if (errorMessage) {
        errorMessage.textContent = message;
    }

    console.error(message);
}


// ==========================================
// 10. CONNECT FRONTEND TO FASTAPI
// ==========================================

function initializePredictionForm() {

    const predictionForm = getElement("predictionForm");

    if (!predictionForm) {
        console.error("predictionForm element not found");
        return;
    }

    predictionForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            // Get input values
            const budget = Number(
                getElement("budget").value
            );

            const store = Number(
                getElement("storeSize").value
            );

            const discount = Number(
                getElement("discount").value
            );

            const errorMessage = getElement("errorMessage");

            const predictBtn = getElement("predictBtn");

            // Clear previous errors
            if (errorMessage) {
                errorMessage.textContent = "";
            }

            // ==================================
            // VALIDATE INPUTS
            // ==================================

            if (
                !Number.isFinite(budget) ||
                !Number.isFinite(store) ||
                !Number.isFinite(discount) ||
                budget < 0 ||
                store < 0 ||
                discount < 0 ||
                discount > 100
            ) {

                showError(
                    "Please enter valid values. " +
                    "Budget and store size must be non-negative. " +
                    "Discount must be between 0 and 100."
                );

                return;
            }

            // ==================================
            // SHOW LOADING STATUS
            // ==================================

            if (predictBtn) {
                predictBtn.disabled = true;
                predictBtn.textContent = "Predicting...";
            }

            try {

                console.log("Sending data to FastAPI...");

                // ==================================
                // SEND INPUT DATA TO BACKEND
                // ==================================

                const response = await fetch(
                    `${API_URL}/predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },

                        body: JSON.stringify({

                            Advertising_Budget: budget,

                            Store_Size: store,

                            Discount_Percentage: discount

                        })
                    }
                );

                // ==================================
                // READ BACKEND RESPONSE
                // ==================================

                const result = await response.json();

                console.log("Backend response:", result);

                // Handle backend errors
                if (!response.ok) {

                    const detail = typeof result.detail === "string"
                        ? result.detail
                        : JSON.stringify(result.detail || result);

                    throw new Error(
                        detail || "Prediction failed"
                    );
                }

                // ==================================
                // GET PREDICTED SALES
                // ==================================

                const sales = Number(
                    result.Predicted_Total_Sales ??
                    result.estimated_sales
                );

                if (!Number.isFinite(sales)) {

                    throw new Error(
                        "Backend did not return valid predicted sales."
                    );
                }

                // ==================================
                // SAVE PREDICTION TO HISTORY
                // ==================================

                predictionHistory.push({

                    budget: budget,

                    store: store,

                    discount: discount,

                    sales: sales

                });

                // ==================================
                // UPDATE DASHBOARD
                // ==================================

                displayResult(
                    budget,
                    store,
                    discount,
                    sales
                );

                updateSummary();

                updateChart();

                updateHistory();

                console.log(
                    "Prediction completed:",
                    formatCurrency(sales)
                );

            } catch (error) {

                console.error("Prediction error:", error);

                if (
                    error.message.includes("Failed to fetch")
                ) {

                    showError(
                        "Cannot connect to FastAPI. " +
                        "Make sure the backend is running " +
                        "and CORS is enabled."
                    );

                } else {

                    showError(error.message);
                }

            } finally {

                // ==================================
                // RESTORE PREDICT BUTTON
                // ==================================

                if (predictBtn) {

                    predictBtn.disabled = false;

                    predictBtn.innerHTML =
                        "<span>✦</span> Predict Sales";
                }
            }
        }
    );
}


// ==========================================
// 11. RESET FORM
// ==========================================

function initializeResetButton() {

    const predictionForm = getElement("predictionForm");

    if (!predictionForm) {
        return;
    }

    predictionForm.addEventListener(
        "reset",
        function() {

            const errorMessage = getElement("errorMessage");

            if (errorMessage) {
                errorMessage.textContent = "";
            }
        }
    );
}


// ==========================================
// 12. CLEAR PREDICTION HISTORY
// ==========================================

function initializeClearHistory() {

    const clearHistoryBtn = getElement("clearHistory");

    if (!clearHistoryBtn) {
        return;
    }

    clearHistoryBtn.addEventListener(
        "click",
        function() {

            // Clear history
            predictionHistory = [];

            // Update dashboard
            updateSummary();

            updateChart();

            updateHistory();

            // Hide previous result
            const emptyResult = getElement("emptyResult");

            const predictionResult = getElement("predictionResult");

            if (emptyResult) {
                emptyResult.classList.remove("hidden");
            }

            if (predictionResult) {
                predictionResult.classList.add("hidden");
            }

            console.log("Prediction history cleared");
        }
    );
}


// ==========================================
// 13. START DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async function() {

    console.log("Sales AI Dashboard starting...");

    // Initialize chart
    initializeChart();

    // Initialize prediction form
    initializePredictionForm();

    // Initialize reset functionality
    initializeResetButton();

    // Initialize clear history
    initializeClearHistory();

    // Initialize summary and history
    updateSummary();

    updateHistory();

    // Check backend connection
    await checkBackend();

    console.log("Sales AI Dashboard initialized");

});