$(document).ready(function() {
    // Social media platform dimensions (width, height)
    const platformDimensions = {
        'bluesky': { width: 1200, height: 675 },
        'instagram': { width: 1080, height: 1080 },
        'facebook': { width: 1200, height: 630 },
        'threads': { width: 1080, height: 1350 },
        'twitter': { width: 1200, height: 675 }
    };

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const imageName = urlParams.get('image');
    
    if (!imageName) {
        alert('No image specified. Please add ?image=filename to the URL.');
        return;
    }

    // Set image source
    const $sourceImage = $('#sourceImage');
    $sourceImage.attr('src', '/uploads/' + imageName);

    // Update the filename display
    $('#image-filename').text(imageName);
    
    // Update zoom display (initial value)
    $('#image-zoom').text('100%');

    // Variables for image manipulation
    let scale = 1;
    let imageX = 0;
    let imageY = 0;
    let cropX = 0;
    let cropY = 0;
    let currentPlatform = 'bluesky'; // Default platform
    
    const $cropContainer = $('#cropContainer');
    const $imageContainer = $('#imageContainer');
    const $cropFrame = $('#cropFrame');
    
    // Initialize the crop frame with the default platform dimensions
    function initCropFrame() {
        const containerWidth = $cropContainer.width();
        const containerHeight = $cropContainer.height();
        
        // Calculate the scale factor to fit the crop frame within the container
        const platformRatio = platformDimensions[currentPlatform].width / platformDimensions[currentPlatform].height;
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
            width: frameWidth + 'px',
            height: frameHeight + 'px'
        });
        
        // Center the crop frame
        cropX = (containerWidth - frameWidth) / 2;
        cropY = (containerHeight - frameHeight) / 2;
        $cropFrame.css({
            left: cropX + 'px',
            top: cropY + 'px'
        });
        
        updateCropInfo();
    }
    
    // Update crop frame when platform changes
    function updateCropFrameForPlatform() {
        const containerWidth = $cropContainer.width();
        const containerHeight = $cropContainer.height();
        
        const platformRatio = platformDimensions[currentPlatform].width / platformDimensions[currentPlatform].height;
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
            width: frameWidth + 'px',
            height: frameHeight + 'px'
        });
        
        // Keep the crop frame centered
        cropX = (containerWidth - frameWidth) / 2;
        cropY = (containerHeight - frameHeight) / 2;
        $cropFrame.css({
            left: cropX + 'px',
            top: cropY + 'px'
        });
        
        updateCropInfo();
    }
    
    // Make the crop frame draggable
    $cropFrame.draggable({
        containment: $cropContainer,
        drag: function(event, ui) {
            cropX = ui.position.left;
            cropY = ui.position.top;
            updateCropInfo();
        }
    });
    
    // Make the image draggable
    $imageContainer.draggable({
        drag: function(event, ui) {
            imageX = ui.position.left;
            imageY = ui.position.top;
            updateCropInfo();
        }
    });
    
    // Update crop information and ImageMagick command
    function updateCropInfo() {
        // Calculate the actual crop coordinates relative to the original image
        const imageRect = $sourceImage[0].getBoundingClientRect();
        const cropRect = $cropFrame[0].getBoundingClientRect();
        
        // Calculate the crop coordinates in the original image scale
        const originalImageWidth = $sourceImage[0].naturalWidth;
        const originalImageHeight = $sourceImage[0].naturalHeight;
        const displayedImageWidth = imageRect.width;
        const displayedImageHeight = imageRect.height;
        
        // Calculate the scale between original and displayed image
        const widthRatio = originalImageWidth / displayedImageWidth;
        const heightRatio = originalImageHeight / displayedImageHeight;
        
        // Calculate the crop position relative to the image
        const cropContainerRect = $cropContainer[0].getBoundingClientRect();
        const relativeX = cropRect.left - imageRect.left;
        const relativeY = cropRect.top - imageRect.top;
        
        // Calculate the crop position in the original image coordinates
        const originalX = Math.max(0, Math.round(relativeX * widthRatio));
        const originalY = Math.max(0, Math.round(relativeY * heightRatio));
        
        // Calculate the crop width and height in the original image coordinates
        const originalWidth = Math.min(
            originalImageWidth - originalX,
            Math.round(cropRect.width * widthRatio)
        );
        const originalHeight = Math.min(
            originalImageHeight - originalY,
            Math.round(cropRect.height * heightRatio)
        );
        
        // Update position display
        $(`#${currentPlatform}-position`).text(`X: ${originalX}, Y: ${originalY}`);
        
        // Generate ImageMagick command
        const targetWidth = platformDimensions[currentPlatform].width;
        const targetHeight = platformDimensions[currentPlatform].height;
        
        const command = `convert "${imageName}" -crop ${originalWidth}x${originalHeight}+${originalX}+${originalY} -resize ${targetWidth}x${targetHeight} "${currentPlatform}_${imageName}"`;
        
        $(`#${currentPlatform}-command`).text(command);
    }
    
    // Handle zoom and move controls
    $('#zoomIn').on('click', function() {
        // Calculate maximum zoom based on the crop frame dimensions and image resolution
        const cropFrameWidth = parseFloat($cropFrame.css('width'));
        const cropFrameHeight = parseFloat($cropFrame.css('height'));
        
        // Get the target dimensions for the platform
        const targetWidth = platformDimensions[currentPlatform].width;
        const targetHeight = platformDimensions[currentPlatform].height;
        
        // Calculate the ratio between displayed crop frame and target dimensions
        const widthRatio = targetWidth / cropFrameWidth;
        const heightRatio = targetHeight / cropFrameHeight;
        
        // Maximum zoom is when the crop frame area contains exactly the number of pixels needed for the target
        const maxScale = Math.max(widthRatio, heightRatio);
        
        if (scale < maxScale) {
            scale *= 1.1;
            // Ensure we don't exceed the maximum zoom
            scale = Math.min(scale, maxScale);
            $sourceImage.css('transform', `scale(${scale})`);
            // Update zoom display (rounded to nearest percent)
            $('#image-zoom').text(`${Math.round(scale * 100)}%`);
            updateCropInfo();
        }
    });
    
    $('#zoomOut').on('click', function() {
        // Calculate minimum zoom required to fit the crop frame
        const cropFrameWidth = parseFloat($cropFrame.css('width'));
        const cropFrameHeight = parseFloat($cropFrame.css('height'));
        
        // Calculate the minimum scale needed to ensure the image is at least as large as the crop frame
        const minScaleWidth = cropFrameWidth / $sourceImage[0].naturalWidth;
        const minScaleHeight = cropFrameHeight / $sourceImage[0].naturalHeight;
        const minScale = Math.max(minScaleWidth, minScaleHeight);
        
        // Add a small buffer to ensure the image is slightly larger than the frame
        const minZoom = minScale * 1.05;
        
        if (scale > minZoom) {
            scale *= 0.9;
            // Ensure we don't go below the minimum zoom
            scale = Math.max(scale, minZoom);
            $sourceImage.css('transform', `scale(${scale})`);
            // Update zoom display (rounded to nearest percent)
            $('#image-zoom').text(`${Math.round(scale * 100)}%`);
            updateCropInfo();
        }
    });
    
    $('#moveLeft').on('click', function() {
        imageX -= 10;
        $imageContainer.css('left', imageX + 'px');
        updateCropInfo();
    });
    
    $('#moveRight').on('click', function() {
        imageX += 10;
        $imageContainer.css('left', imageX + 'px');
        updateCropInfo();
    });
    
    $('#moveUp').on('click', function() {
        imageY -= 10;
        $imageContainer.css('top', imageY + 'px');
        updateCropInfo();
    });
    
    $('#moveDown').on('click', function() {
        imageY += 10;
        $imageContainer.css('top', imageY + 'px');
        updateCropInfo();
    });
    
    // Handle tab changes
    $('.nav-link').on('click', function() {
        currentPlatform = this.id.replace('-tab', '');
        updateCropFrameForPlatform();
    });
    
    // Initialize when the image is loaded
    $sourceImage.on('load', function() {
        // Update the image size display
        const originalWidth = this.naturalWidth;
        const originalHeight = this.naturalHeight;
        $('#image-size').text(`${originalWidth} × ${originalHeight}px`);
        
        // Center the image initially
        const containerWidth = $cropContainer.width();
        const containerHeight = $cropContainer.height();
        
        $imageContainer.css({
            left: (containerWidth - $sourceImage.width()) / 2 + 'px',
            top: (containerHeight - $sourceImage.height()) / 2 + 'px'
        });
        
        initCropFrame();
    });
});