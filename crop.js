$(document).ready(function () {
  // Social media platform dimensions (width, height)
  const platformDimensions = {
    bluesky: { width: 1200, height: 675 },
    instagram: { width: 1080, height: 1080 },
    facebook: { width: 1200, height: 630 },
    threads: { width: 1080, height: 1350 },
    twitter: { width: 1200, height: 675 },
  };

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const imageName = urlParams.get("image");

  if (!imageName) {
    alert("No image specified. Please add ?image=filename to the URL.");
    return;
  }

  // Set image source
  const $sourceImage = $("#sourceImage");
  $sourceImage.attr("src", "/uploads/" + imageName);

  // Variables for image manipulation
  let scale = 1;
  let imageX = 0;
  let imageY = 0;
  let cropX = 0;
  let cropY = 0;
  let currentPlatform = "bluesky"; // Default platform

  // Platform-specific settings storage
  const platformSettings = {
    bluesky: { scale: 1, imageX: 0, imageY: 0 },
    instagram: { scale: 1, imageX: 0, imageY: 0 },
    facebook: { scale: 1, imageX: 0, imageY: 0 },
    threads: { scale: 1, imageX: 0, imageY: 0 },
    twitter: { scale: 1, imageX: 0, imageY: 0 },
  };
  const $cropContainer = $("#cropContainer");
  const $imageContainer = $("#imageContainer");
  const $cropFrame = $("#cropFrame");

  // Add event handler for the post button
  $("#post-button").on("click", function() {
    // Create an object to store the data for each platform
    const postData = {};
    const selectedPlatforms = [];
    
    // Check each platform checkbox
    $("input[type=checkbox][id$='-check']").each(function() {
      // Get the platform name from the checkbox ID
      const platform = this.id.replace("-check", "");
      
      // If the checkbox is checked, gather data for this platform
      if ($(this).prop("checked")) {
        // Get the image name from URL parameters
        const imageName = new URLSearchParams(window.location.search).get("image");
        
        // Get the ImageMagick command
        const command = $(`#${platform}-command`).text();
        
        // Get the post text
        const postText = $(`#${platform}-text`).val();
        
        // Get the alt text
        const altText = $(`#${platform}-alt-text`).val() || null;
        
        // Add this platform's data to the postData object
        postData[platform] = {
          image: imageName,
          command: command,
          post: postText,
          altText: altText
        };
        
        // Add to selected platforms list for the dialog
        selectedPlatforms.push({
          name: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize first letter
          postText: postText,
          altText: altText
        });
      }
    });
    
    // Log the JSON data to the console
    console.log("Post Data:", JSON.stringify(postData, null, 2));
    
    // Clear the platforms list
    $("#platformsList").empty();
    
    // Add each selected platform to the dialog
    if (selectedPlatforms.length === 0) {
      $("#platformsList").append(`<li class="list-group-item text-danger">No platforms selected</li>`);
    } else {
      selectedPlatforms.forEach(platform => {
        $("#platformsList").append(`
          <li class="list-group-item">
            <div class="fw-bold">${platform.name}</div>
            ${platform.postText === "" ? 
              `<div class="text-danger small"><i class="bi bi-exclamation-triangle-fill"></i> No text in post</div>` : ''}
            ${platform.altText === null ? 
              `<div class="text-warning small"><i class="bi bi-exclamation-triangle"></i> No ALT text</div>` : ''}
          </li>
        `);
      });
    }
    
    // Initialize and show the modal
    const postConfirmDialog = new bootstrap.Modal(document.getElementById('postConfirmDialog'));
    postConfirmDialog.show();
    
    // Handle the confirm button click
    $("#confirmPostBtn").off("click").on("click", function() {
      // Here you would implement the actual posting functionality
      alert("Posting to selected platforms...");
      postConfirmDialog.hide();
      
      // You could make AJAX calls here to your backend to handle the actual posting
    });
  });

  // Add character counter functionality for all ALT text textareas
  $('textarea[id$="-alt-text"]').each(function() {
    const platform = this.id.replace('-alt-text', '');
    $(`#${platform}-alt-char-count`).text(0);
  });
  
  // Handle input events for ALT text textareas
  $('textarea[id$="-alt-text"]').on('input', function() {
    const platform = this.id.replace('-alt-text', '');
    const charCount = $(this).val().length;
    const maxLength = $(this).attr('maxlength');
    
    // Update the character count
    $(`#${platform}-alt-char-count`).text(charCount);
    
    // Add visual feedback when approaching the limit
    if (charCount >= maxLength * 0.9) {
      $(`#${platform}-alt-char-count`).addClass('text-danger');
    } else {
      $(`#${platform}-alt-char-count`).removeClass('text-danger');
    }
  });

  // Initialize the crop frame with the default platform dimensions
  function initCropFrame() {
    const containerWidth = $cropContainer.width();
    const containerHeight = $cropContainer.height();

    // Calculate the scale factor to fit the crop frame within the container
    const platformRatio =
      platformDimensions[currentPlatform].width /
      platformDimensions[currentPlatform].height;
    let frameWidth, frameHeight;

    if (containerWidth / containerHeight > platformRatio) {
      // Container is wider than needed
      frameHeight = containerHeight * 0.8;
      frameWidth = frameHeight * platformRatio;
    } else {
      // Container is taller than needed
      frameWidth = containerWidth * 0.8;
      frameHeight = frameWidth / platformRatio;
    }

    // Set crop frame dimensions
    $cropFrame.css({
      width: frameWidth + "px",
      height: frameHeight + "px",
    });

    // Center the crop frame
    cropX = (containerWidth - frameWidth) / 2;
    cropY = (containerHeight - frameHeight) / 2;
    $cropFrame.css({
      left: cropX + "px",
      top: cropY + "px",
    });

    updateCropInfo();
  }

  // Update crop frame when platform changes
  function updateCropFrameForPlatform() {
    const containerWidth = $cropContainer.width();
    const containerHeight = $cropContainer.height();

    const platformRatio =
      platformDimensions[currentPlatform].width /
      platformDimensions[currentPlatform].height;
    let frameWidth, frameHeight;

    if (containerWidth / containerHeight > platformRatio) {
      frameHeight = containerHeight * 0.8;
      frameWidth = frameHeight * platformRatio;
    } else {
      frameWidth = containerWidth * 0.8;
      frameHeight = frameWidth / platformRatio;
    }

    // Set crop frame dimensions
    $cropFrame.css({
      width: frameWidth + "px",
      height: frameHeight + "px",
    });

    // Keep the crop frame centered
    cropX = (containerWidth - frameWidth) / 2;
    cropY = (containerHeight - frameHeight) / 2;
    $cropFrame.css({
      left: cropX + "px",
      top: cropY + "px",
    });

    updateCropInfo();
  }

  // Make the crop frame draggable
  $cropFrame.draggable({
    containment: $cropContainer,
    drag: function (event, ui) {
      cropX = ui.position.left;
      cropY = ui.position.top;
      updateCropInfo();
    },
  });

  // Make the image draggable
  $imageContainer.draggable({
    drag: function (event, ui) {
      imageX = ui.position.left;
      imageY = ui.position.top;
      updateCropInfo();
    },
  });

  // Initialize character counters
  $('textarea[id$="-text"]').each(function() {
    const platform = this.id.replace('-text', '');
    $(`#${platform}-char-count`).text(0);
  });

  // Update crop information and ImageMagick command
  function updateCropInfo() {
    // Calculate the actual crop coordinates relative to the original image
    const imageRect = $sourceImage[0].getBoundingClientRect();
    const cropRect = $cropFrame[0].getBoundingClientRect();
    const containerRect = $cropContainer[0].getBoundingClientRect();

    // Get the current settings for the platform
    const settings = platformSettings[currentPlatform];

    // Get the original image dimensions
    const originalImageWidth = $sourceImage[0].naturalWidth;
    const originalImageHeight = $sourceImage[0].naturalHeight;

    // Calculate the displayed image dimensions (accounting for scale)
    const displayedImageWidth = originalImageWidth * settings.scale;
    const displayedImageHeight = originalImageHeight * settings.scale;

    // Calculate the position of the image relative to the container
    const imageLeft = imageRect.left - containerRect.left;
    const imageTop = imageRect.top - containerRect.top;

    // Calculate the position of the crop frame relative to the container
    const cropLeft = cropRect.left - containerRect.left;
    const cropTop = cropRect.top - containerRect.top;

    // Calculate the crop position relative to the image
    const relativeX = cropLeft - imageLeft;
    const relativeY = cropTop - imageTop;

    // Calculate the crop position in the original image coordinates
    // We need to account for the scale factor
    const originalX = Math.max(0, Math.round(relativeX / settings.scale));
    const originalY = Math.max(0, Math.round(relativeY / settings.scale));

    // Calculate the crop width and height in the original image coordinates
    const originalWidth = Math.min(
      originalImageWidth - originalX,
      Math.round(cropRect.width / settings.scale)
    );
    const originalHeight = Math.min(
      originalImageHeight - originalY,
      Math.round(cropRect.height / settings.scale)
    );

    // Update position display
    $(`#${currentPlatform}-position`).text(`X: ${originalX}, Y: ${originalY}`);

    // Generate ImageMagick command
    const targetWidth = platformDimensions[currentPlatform].width;
    const targetHeight = platformDimensions[currentPlatform].height;

    // Format the command over multiple lines
    const command = `convert "${imageName}" \\
    -crop ${originalWidth}x${originalHeight}+${originalX}+${originalY} \\
    -resize ${targetWidth}x${targetHeight} \\
    "${currentPlatform}_${imageName}"`;

    $(`#${currentPlatform}-command`).text(command);
  }

  // Modify the tab change handler to properly update everything
  $(".nav-link").on("click", function () {
    // Save current platform settings before switching
    savePlatformSettings();

    // Switch to new platform
    currentPlatform = this.id.replace("-tab", "");

    // Update crop frame for the new platform
    updateCropFrameForPlatform();

    // Apply the stored settings for the new platform
    applyPlatformSettings();

    // Force a reflow to ensure all DOM updates are applied
    $sourceImage[0].offsetHeight;

    // Ensure the image covers the frame after switching
    ensureImageCoversFrame();

    // Update crop info with the new state
    updateCropInfo();
  });

  // Modify the applyPlatformSettings function to ensure proper updates
  function applyPlatformSettings() {
    const settings = platformSettings[currentPlatform];

    // Apply scale
    $sourceImage.css("transform", `scale(${settings.scale})`);
    // Apply position
    $imageContainer.css({
      left: settings.imageX + "px",
      top: settings.imageY + "px",
    });

    // Update zoom display in the current tab
    $(`#${currentPlatform}-zoom`).text(`${Math.round(settings.scale * 100)}%`);

    // Force a reflow to ensure all DOM updates are applied
    $sourceImage[0].offsetHeight;
  }
  // Handle zoom and move controls
  // Add this at the beginning of your document.ready function
  let isShiftKeyDown = false;
  let isCtrlKeyDown = false;

  // Add event listeners for the Shift and Control keys
  $(document).on('keydown', function(e) {
    if (e.key === 'Shift') {
      isShiftKeyDown = true;
    }
    if (e.key === 'Control' || e.key === 'Meta') { // Meta for Mac
      isCtrlKeyDown = true;
    }
  });

  $(document).on('keyup', function(e) {
    if (e.key === 'Shift') {
      isShiftKeyDown = false;
    }
    if (e.key === 'Control' || e.key === 'Meta') { // Meta for Mac
      isCtrlKeyDown = false;
    }
  });

  // Modify the zoom handlers
  $("#zoomIn").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    
    // First, ensure current scale is at least the minimum scale
    if (settings.scale > settings.maxScale) {
      settings.scale = settings.maxScale;
    }

    // Don't zoom in if we're already at maximum scale
    if (settings.scale >= settings.maxScale) {
      return;
    }

    // Get current dimensions and positions before zooming
    const cropRect = $cropFrame[0].getBoundingClientRect();
    const imageRect = $sourceImage[0].getBoundingClientRect();

    // Calculate the center of the crop frame
    const cropCenterX = cropRect.left + cropRect.width / 2;
    const cropCenterY = cropRect.top + cropRect.height / 2;

    // Calculate the relative position of the crop center within the image
    const relativeX = (cropCenterX - imageRect.left) / imageRect.width;
    const relativeY = (cropCenterY - imageRect.top) / imageRect.height;

    // Calculate the old distance from the image edge to the crop center
    const oldDistanceX = relativeX * imageRect.width;
    const oldDistanceY = relativeY * imageRect.height;

    // Apply the zoom with different increment based on key combinations
    const oldScale = settings.scale;
    if (isShiftKeyDown && isCtrlKeyDown) {
      settings.scale *= 1.001; // 1/1000th increment when both Shift and Ctrl are pressed
    } else if (isShiftKeyDown) {
      settings.scale *= 1.01;  // 1/100th increment when only Shift is pressed
    } else {
      settings.scale *= 1.1;   // 1/10th increment normally
    }

    // Ensure we don't exceed the maximum zoom
    settings.scale = Math.min(settings.scale, settings.maxScale);

    // Ensure we don't go below the minimum zoom (shouldn't happen when zooming in)
    settings.scale = Math.max(settings.scale, settings.minScale);

    // Calculate the new image dimensions after zoom
    const newWidth = imageRect.width * (settings.scale / oldScale);
    const newHeight = imageRect.height * (settings.scale / oldScale);

    // Calculate the new distance from the image edge to the crop center
    const newDistanceX = relativeX * newWidth;
    const newDistanceY = relativeY * newHeight;

    // Calculate the position adjustment needed
    const adjustX = oldDistanceX - newDistanceX;
    const adjustY = oldDistanceY - newDistanceY;

    // Update image position to maintain the crop center
    settings.imageX += adjustX;
    settings.imageY += adjustY;

    // Apply both the scale and position changes at once
    $sourceImage.css("transform", `scale(${settings.scale})`);
    $imageContainer.css({
      left: settings.imageX + "px",
      top: settings.imageY + "px",
    });

    // Update zoom display
    $(`#${currentPlatform}-zoom`).text(`${Math.round(settings.scale * 100)}%`);

    // Ensure the image covers the frame
    ensureImageCoversFrame();

    updateCropInfo();
  });

  $("#zoomOut").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    
    // First, ensure current scale is at least the minimum scale
    if (settings.scale < settings.minScale) {
      settings.scale = settings.minScale;
    }
    
    // Don't zoom out if we're already at minimum scale
    if (settings.scale <= settings.minScale) {
      return;
    }

    // Get current dimensions and positions before zooming
    const cropRect = $cropFrame[0].getBoundingClientRect();
    const imageRect = $sourceImage[0].getBoundingClientRect();

    // Calculate the center of the crop frame
    const cropCenterX = cropRect.left + cropRect.width / 2;
    const cropCenterY = cropRect.top + cropRect.height / 2;

    // Calculate the relative position of the crop center within the image
    const relativeX = (cropCenterX - imageRect.left) / imageRect.width;
    const relativeY = (cropCenterY - imageRect.top) / imageRect.height;

    // Calculate the old distance from the image edge to the crop center
    const oldDistanceX = relativeX * imageRect.width;
    const oldDistanceY = relativeY * imageRect.height;

    // Apply the zoom with different increment based on key combinations
    const oldScale = settings.scale;
    if (isShiftKeyDown && isCtrlKeyDown) {
      settings.scale *= 0.999; // 1/1000th decrement when both Shift and Ctrl are pressed
    } else if (isShiftKeyDown) {
      settings.scale *= 0.99;  // 1/100th decrement when only Shift is pressed
    } else {
      settings.scale *= 0.9;   // 1/10th decrement normally
    }

    // Ensure we don't go below the minimum zoom
    settings.scale = Math.max(settings.scale, settings.minScale);

    // Calculate the new image dimensions after zoom
    const newWidth = imageRect.width * (settings.scale / oldScale);
    const newHeight = imageRect.height * (settings.scale / oldScale);

    // Calculate the new distance from the image edge to the crop center
    const newDistanceX = relativeX * newWidth;
    const newDistanceY = relativeY * newHeight;

    // Calculate the position adjustment needed
    const adjustX = oldDistanceX - newDistanceX;
    const adjustY = oldDistanceY - newDistanceY;

    // Update image position to maintain the crop center
    settings.imageX += adjustX;
    settings.imageY += adjustY;

    // Apply both the scale and position changes at once
    $sourceImage.css("transform", `scale(${settings.scale})`);
    $imageContainer.css({
      left: settings.imageX + "px",
      top: settings.imageY + "px",
    });

    // Update zoom display
    $(`#${currentPlatform}-zoom`).text(`${Math.round(settings.scale * 100)}%`);

    // Ensure the image covers the frame
    ensureImageCoversFrame();

    updateCropInfo();
  });

  // Modify the movement handlers
  $("#moveLeft").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown && isCtrlKeyDown) {
      settings.imageX -= 0.1; // 1/1000th of normal movement (0.1px)
    } else if (isShiftKeyDown) {
      settings.imageX -= 1;   // 1/100th of normal movement (1px)
    } else {
      settings.imageX -= 10;  // Normal movement (10px)
    }
    $imageContainer.css("left", settings.imageX + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  $("#moveRight").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown && isCtrlKeyDown) {
      settings.imageX += 0.1; // 1/1000th of normal movement (0.1px)
    } else if (isShiftKeyDown) {
      settings.imageX += 1;   // 1/100th of normal movement (1px)
    } else {
      settings.imageX += 10;  // Normal movement (10px)
    }
    $imageContainer.css("left", settings.imageX + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  $("#moveUp").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown && isCtrlKeyDown) {
      settings.imageY -= 0.1; // 1/1000th of normal movement (0.1px)
    } else if (isShiftKeyDown) {
      settings.imageY -= 1;   // 1/100th of normal movement (1px)
    } else {
      settings.imageY -= 10;  // Normal movement (10px)
    }
    $imageContainer.css("top", settings.imageY + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  $("#moveDown").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown && isCtrlKeyDown) {
      settings.imageY += 0.1; // 1/1000th of normal movement (0.1px)
    } else if (isShiftKeyDown) {
      settings.imageY += 1;   // 1/100th of normal movement (1px)
    } else {
      settings.imageY += 10;  // Normal movement (10px)
    }
    $imageContainer.css("top", settings.imageY + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  // Make the image draggable with constraints
  $imageContainer.draggable({
    drag: function (event, ui) {
      // Get the current dimensions
      const cropRect = $cropFrame[0].getBoundingClientRect();
      const imageRect = $sourceImage[0].getBoundingClientRect();
      const containerRect = $cropContainer[0].getBoundingClientRect();

      // Calculate the offsets before the proposed move
      const currentImageLeft = imageRect.left - containerRect.left;
      const currentImageRight = currentImageLeft + imageRect.width;
      const currentImageTop = imageRect.top - containerRect.top;
      const currentImageBottom = currentImageTop + imageRect.height;

      // Calculate the crop frame position relative to the container
      const cropLeft = cropRect.left - containerRect.left;
      const cropRight = cropLeft + cropRect.width;
      const cropTop = cropRect.top - containerRect.top;
      const cropBottom = cropTop + cropRect.height;

      // Calculate the proposed movement
      const deltaX = ui.position.left - imageX;
      const deltaY = ui.position.top - imageY;

      // Calculate the new image position after the proposed move
      const newImageLeft = currentImageLeft + deltaX;
      const newImageRight = currentImageRight + deltaX;
      const newImageTop = currentImageTop + deltaY;
      const newImageBottom = currentImageBottom + deltaY;

      // Check if the proposed move would leave the crop frame uncovered

      // Check left edge - don't allow the image's left edge to move right of the crop's left edge
      if (newImageLeft > cropLeft) {
        ui.position.left = imageX + (cropLeft - currentImageLeft);
      }
      // Check right edge - don't allow the image's right edge to move left of the crop's right edge
      if (newImageRight < cropRight) {
        ui.position.left = imageX + (cropRight - currentImageRight);
      }

      // Check top edge - don't allow the image's top edge to move below the crop's top edge
      if (newImageTop > cropTop) {
        ui.position.top = imageY + (cropTop - currentImageTop);
      }

      // Check bottom edge - don't allow the image's bottom edge to move above the crop's bottom edge
      if (newImageBottom < cropBottom) {
        ui.position.top = imageY + (cropBottom - currentImageBottom);
      }

      // Update our tracking variables with the final position
      imageX = ui.position.left;
      imageY = ui.position.top;

      updateCropInfo();
    },
  });

  function ensureImageCoversFrame() {
    // Force a reflow to get accurate measurements
    $sourceImage[0].offsetHeight;

    const cropRect = $cropFrame[0].getBoundingClientRect();
    const imageRect = $sourceImage[0].getBoundingClientRect();
    const settings = platformSettings[currentPlatform];

    // Check if the image is outside the frame on any side
    let adjustmentNeeded = false;
    let newImageX = settings.imageX;
    let newImageY = settings.imageY;

    // Check left edge
    if (imageRect.left > cropRect.left) {
      newImageX = settings.imageX - (imageRect.left - cropRect.left);
      adjustmentNeeded = true;
    }

    // Check right edge
    if (imageRect.right < cropRect.right) {
      newImageX = settings.imageX + (cropRect.right - imageRect.right);
      adjustmentNeeded = true;
    }

    // Check top edge
    if (imageRect.top > cropRect.top) {
      newImageY = settings.imageY - (imageRect.top - cropRect.top);
      adjustmentNeeded = true;
    }

    // Check bottom edge
    if (imageRect.bottom < cropRect.bottom) {
      newImageY = settings.imageY + (cropRect.bottom - imageRect.bottom);
      adjustmentNeeded = true;
    }

    // Apply the adjustment if needed
    if (adjustmentNeeded) {
      settings.imageX = newImageX;
      settings.imageY = newImageY;
      $imageContainer.css({
        left: settings.imageX + "px",
        top: settings.imageY + "px",
      });
    }
  }
  $("#moveLeft").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown) {
      settings.imageX -= 1; // 1/100th of normal movement (1px)
    } else {
      settings.imageX -= 10; // Normal movement (10px)
    }
    $imageContainer.css("left", settings.imageX + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  $("#moveRight").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown) {
      settings.imageX += 1; // 1/100th of normal movement (1px)
    } else {
      settings.imageX += 10; // Normal movement (10px)
    }
    $imageContainer.css("left", settings.imageX + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  $("#moveUp").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown) {
      settings.imageY -= 1; // 1/100th of normal movement (1px)
    } else {
      settings.imageY -= 10; // Normal movement (10px)
    }
    $imageContainer.css("top", settings.imageY + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });

  $("#moveDown").on("click", function () {
    // Get current settings
    const settings = platformSettings[currentPlatform];
    if (isShiftKeyDown) {
      settings.imageY += 1; // 1/100th of normal movement (1px)
    } else {
      settings.imageY += 10; // Normal movement (10px)
    }
    $imageContainer.css("top", settings.imageY + "px");
    ensureImageCoversFrame();
    updateCropInfo();
  });
  // Handle tab changes
  $(".nav-link").on("click", function () {
    // Save current platform settings before switching
    savePlatformSettings();

    // Switch to new platform
    currentPlatform = this.id.replace("-tab", "");
    
    // Check the corresponding checkbox and don't uncheck others
    $("#" + currentPlatform + "-check").prop("checked", true);

    // Update crop frame for the new platform
    updateCropFrameForPlatform();

    // Apply the stored settings for the new platform
    applyPlatformSettings();

    // Force a reflow to ensure all DOM updates are applied
    $sourceImage[0].offsetHeight;

    // Ensure the image covers the frame after switching
    ensureImageCoversFrame();

    // Update crop info with the new state
    updateCropInfo();
  });
  
  // Also handle checkbox clicks to switch to the corresponding tab
  $("input[type=checkbox][id$='-check']").on("change", function() {
    const platform = this.id.replace("-check", "");
    
    // If checkbox is checked, switch to that tab
    if ($(this).prop("checked")) {
      $("#" + platform + "-tab").click();
    }
    // If unchecked, don't allow if it's the current tab
    else if (platform === currentPlatform) {
      $(this).prop("checked", true); // Keep it checked
    }
  });
  
  // Check the Bluesky checkbox by default
  $("#bluesky-check").prop("checked", true);

  // Add these helper functions
  function savePlatformSettings() {
    const settings = platformSettings[currentPlatform];
    settings.imageX = parseFloat($imageContainer.css("left"));
    settings.imageY = parseFloat($imageContainer.css("top"));
    // scale is already being updated directly in the zoom handlers
  }

  function applyPlatformSettings() {
    const settings = platformSettings[currentPlatform];

    // Apply scale
    $sourceImage.css("transform", `scale(${settings.scale})`);

    // Apply position
    $imageContainer.css({
      left: settings.imageX + "px",
      top: settings.imageY + "px",
    });

    // Update zoom display in the current tab
    $(`#${currentPlatform}-zoom`).text(`${Math.round(settings.scale * 100)}%`);
  }

  // Initialize when the image is loaded
  $sourceImage.on("load", function () {
    // Update the image size display
    const originalWidth = this.naturalWidth;
    const originalHeight = this.naturalHeight;

    // Display the image dimensions
    $("#image-size").text(`${originalWidth} x ${originalHeight} px`);
    // Initialize optimal settings for each platform
    Object.keys(platformDimensions).forEach((platform) => {
      // Store the original currentPlatform value
      const previousPlatform = currentPlatform;

      // Set currentPlatform to the current platform in the loop
      currentPlatform = platform;

      // Initialize the crop frame for this platform
      initCropFrame();

      // Get the crop frame dimensions for this specific platform
      const cropFrameWidth = parseFloat($cropFrame.css("width"));
      const cropFrameHeight = parseFloat($cropFrame.css("height"));

      // Get the original image dimensions
      const originalWidth = $sourceImage[0].naturalWidth;
      const originalHeight = $sourceImage[0].naturalHeight;

      // Calculate aspect ratios for this specific platform
      const imageAspectRatio = originalWidth / originalHeight;
      const frameAspectRatio = cropFrameWidth / cropFrameHeight;

      // Calculate the optimal scale to maximize visible image for this platform
      let initialScale;
      if (imageAspectRatio > frameAspectRatio) {
        // Image is wider than frame (relative to height)
        // Scale based on height to ensure the frame is covered
        initialScale = cropFrameHeight / originalHeight;
      } else {
        // Image is taller than frame (relative to width)
        // Scale based on width to ensure the frame is covered
        initialScale = cropFrameWidth / originalWidth;
      }

      // Add a small buffer (10%) to ensure the image fully covers the frame
      initialScale *= 1.1;

      // Calculate the minimum scale needed to ensure the image covers the crop frame
      const minScaleWidth = cropFrameWidth / originalWidth;
      const minScaleHeight = cropFrameHeight / originalHeight;
      const minScale = Math.max(minScaleWidth, minScaleHeight) * 1.05; // Add 5% buffer

        // Calculate maximum zoom dynamically based on the platform dimensions and image size
        // Set max scale to when the smallest dimension of the image is 2x the corresponding dimension of the crop frame
        let maxScale;
        if (originalWidth / cropFrameWidth < originalHeight / cropFrameHeight) {
            // Width is the limiting factor
            maxScale = (cropFrameWidth * 2) / originalWidth;
        } else {
            // Height is the limiting factor
            maxScale = (cropFrameHeight * 2) / originalHeight;
        }

      // Update the min/max zoom displays for user reference only
      $(`#${platform}-min-zoom`).text(`${Math.round(minScale * 100)}%`);
      $(`#${platform}-max-zoom`).text(`${Math.round(maxScale * 100)}%`);

      // Calculate the scaled image dimensions for this platform
      const scaledWidth = originalWidth * initialScale;
      const scaledHeight = originalHeight * initialScale;

      // Center the image in the container for this platform
      const containerWidth = $cropContainer.width();
      const containerHeight = $cropContainer.height();
      const initialX = (containerWidth - scaledWidth) / 2;
      const initialY = (containerHeight - scaledHeight) / 2;

      // Store the optimal settings for this specific platform
      platformSettings[platform] = {
        scale: initialScale,
        imageX: initialX,
        imageY: initialY,
        minScale: minScale, // Store the minimum scale
        maxScale: maxScale, // Store the maximum scale
      };

      // Update the zoom display for this platform
      $(`#${platform}-zoom`).text(`${Math.round(initialScale * 100)}%`);

      // Restore the original currentPlatform value
      currentPlatform = previousPlatform;
    }); // Reset to the default platform
    currentPlatform = "bluesky";

    // Apply the settings for the current platform
    updateCropFrameForPlatform();
    applyPlatformSettings();

    // Update crop info
    updateCropInfo();

    // Make sure the image is visible
    $sourceImage.css("visibility", "visible");

    // Add a small delay to ensure everything is rendered properly
    setTimeout(function () {
      // Force another update to ensure everything is in sync
      ensureImageCoversFrame();
      updateCropInfo();
    }, 100);
  });

  // Add character counter functionality for all textareas
  $('textarea[id$="-text"]').on('input', function() {
    const platform = this.id.replace('-text', '');
    const charCount = $(this).val().length;
    const maxLength = $(this).attr('maxlength');
    
    // Update the character count
    $(`#${platform}-char-count`).text(charCount);
    
    // Add visual feedback when approaching the limit
    if (charCount >= maxLength * 0.9) {
      $(`#${platform}-char-count`).addClass('text-danger');
    } else {
      $(`#${platform}-char-count`).removeClass('text-danger');
    }
    
    // Update the command to include the post text
    updateCropInfo();
  });

});

// Modify the function to use the global variables directly
function getMinimumScaleForPlatform(platform) {
  // Access the global variables directly
  const cropFrameWidth = parseFloat($("#cropFrame").css("width"));
  const cropFrameHeight = parseFloat($("#cropFrame").css("height"));

  // Get the original image dimensions from the global sourceImage
  const originalWidth = $("#sourceImage")[0].naturalWidth;
  const originalHeight = $("#sourceImage")[0].naturalHeight;

  // Calculate the minimum scale needed to ensure the image covers the crop frame
  const minScaleWidth = cropFrameWidth / originalWidth;
  const minScaleHeight = cropFrameHeight / originalHeight;
  const minScale = Math.max(minScaleWidth, minScaleHeight);

  // Add a small buffer (5%) to ensure the image fully covers the frame
  return minScale * 1.05;
}