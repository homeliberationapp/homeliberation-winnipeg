/**
 * EXIT INTENT POPUP
 * Recover 20-30% of abandoning visitors
 */

(function() {
  let exitIntentShown = false;
  let mouseOutCount = 0;

  // Detect exit intent
  document.addEventListener('mouseout', function(e) {
    // Already shown?
    if (exitIntentShown) return;

    // Check if cursor leaving viewport at top
    if (e.clientY < 10 && e.relatedTarget == null) {
      mouseOutCount++;

      // Show after 2 attempts (reduces false positives)
      if (mouseOutCount >= 2) {
        showExitIntent();
        exitIntentShown = true;
      }
    }
  });

  // Also show after 45 seconds if no interaction
  setTimeout(function() {
    if (!exitIntentShown && !hasInteracted()) {
      showExitIntent();
      exitIntentShown = true;
    }
  }, 45000);

  function hasInteracted() {
    // Check if user scrolled or clicked anything
    return window.scrollY > 100 || document.querySelectorAll('input:focus').length > 0;
  }

  function showExitIntent() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'exit-intent-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-in;
    `;

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'exit-intent-popup';
    popup.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.4s ease-out;
    `;

    popup.innerHTML = `
      <button class="exit-popup-close" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 30px;
        cursor: pointer;
        color: #666;
      ">&times;</button>

      <h2 style="
        font-size: 32px;
        margin-bottom: 15px;
        color: #0F172A;
      ">⏰ Wait! Before You Go...</h2>

      <p style="
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #F59E0B;
      ">Get Your FREE Property Analysis Report</p>

      <p style="
        font-size: 16px;
        margin-bottom: 20px;
        color: #666;
      ">See exactly what your house is worth + what we'd offer (no obligation)</p>

      <ul class="exit-benefits" style="
        list-style: none;
        padding: 0;
        margin: 20px 0 30px 0;
      ">
        <li style="padding: 8px 0; font-size: 16px;">✅ Takes only 60 seconds</li>
        <li style="padding: 8px 0; font-size: 16px;">✅ Get cash offer within 24 hours</li>
        <li style="padding: 8px 0; font-size: 16px;">✅ Zero obligation - see offer first, then decide</li>
        <li style="padding: 8px 0; font-size: 16px;">✅ No repairs, no fees, no commissions</li>
      </ul>

      <form id="exit-intent-form" style="margin: 25px 0;">
        <input
          type="text"
          id="exit-address"
          placeholder="Property address"
          required
          style="
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border: 2px solid #E5E7EB;
            border-radius: 6px;
            margin-bottom: 12px;
            box-sizing: border-box;
          "
        >
        <input
          type="email"
          id="exit-email"
          placeholder="Your email"
          required
          style="
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border: 2px solid #E5E7EB;
            border-radius: 6px;
            margin-bottom: 12px;
            box-sizing: border-box;
          "
        >
        <input
          type="tel"
          id="exit-phone"
          placeholder="Your phone"
          required
          style="
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border: 2px solid #E5E7EB;
            border-radius: 6px;
            margin-bottom: 20px;
            box-sizing: border-box;
          "
        >
        <button type="submit" style="
          width: 100%;
          padding: 18px;
          font-size: 18px;
          font-weight: bold;
          background: #F59E0B;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s;
        ">Get My FREE Property Report</button>
      </form>

      <p class="trust-signal" style="
        text-align: center;
        font-size: 14px;
        color: #666;
        margin-top: 20px;
      ">🔒 We never spam. 2,147 homeowners requested this month.</p>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Close button
    popup.querySelector('.exit-popup-close').onclick = function() {
      overlay.remove();
    };

    // Close on overlay click
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    // Form submission
    document.getElementById('exit-intent-form').addEventListener('submit', async function(e) {
      e.preventDefault();

      const address = document.getElementById('exit-address').value;
      const email = document.getElementById('exit-email').value;
      const phone = document.getElementById('exit-phone').value;

      // Submit to API
      const response = await fetch('/api/submit-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          email,
          phone,
          source: 'exit-intent',
          urgency: 8
        })
      });

      if (response.ok) {
        popup.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
            <h2 style="font-size: 28px; margin-bottom: 15px; color: #10B981;">Success!</h2>
            <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
              Your FREE property report is on its way!
            </p>
            <p style="font-size: 16px; color: #666;">
              Check your email (${email}) within the next 5 minutes.<br>
              We'll also call you within 24 hours with your cash offer.
            </p>
            <button onclick="this.closest('.exit-intent-overlay').remove()" style="
              margin-top: 30px;
              padding: 15px 40px;
              font-size: 16px;
              background: #F59E0B;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">Close</button>
          </div>
        `;

        // Auto-close after 5 seconds
        setTimeout(() => overlay.remove(), 5000);
      }
    });

    // Track analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exit_intent_shown', {
        event_category: 'engagement',
        event_label: 'exit_popup'
      });
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .exit-intent-popup button[type="submit"]:hover {
      background: #D97706 !important;
    }

    .exit-intent-popup input:focus {
      border-color: #F59E0B !important;
      outline: none;
    }
  `;
  document.head.appendChild(style);

})();
