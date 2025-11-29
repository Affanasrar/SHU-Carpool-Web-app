document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    const mainContent = document.getElementById("main-content");
    
    setTimeout(() => {
        splash.classList.add("opacity-0");
    }, 3000);
    setTimeout(() => {
        splash.classList.add("hidden");
        mainContent.classList.add("flex");
        mainContent.classList.remove("hidden");
    }, 3500);
});

// Register Service Worker for PWA functionality
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
        .then((registration) => {
            console.log("Service Worker registered successfully:", registration);
        })
        .catch((error) => {
            console.log("Service Worker registration failed:", error);
        });
}
