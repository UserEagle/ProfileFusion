const baseImageBasePath = 'https://usereagle.github.io/ProfileFusion/asset/image/';
let stage, layer, imageObj, baseImageKonva, transformer,
    reader, subImage, group, subGroupImage,
    textName, textTeam, $name, $team;

// Function to load and change the base image
function loadBaseImage(selectedImage, clearInputs) {
    imageObj.src = baseImageBasePath + selectedImage;
    if (clearInputs) {
        $name.val('');
        $team.val('');
    }
}

// Initialize Konva stage and layer
function initializeCanvas() {
    let $canvas = $('#canvas');
    stage = new Konva.Stage({
        container: 'canvas',
        width: $canvas.width(),
        height: $canvas.height()
    });

    layer = new Konva.Layer();
    stage.add(layer);

    imageObj = new Image();
    imageObj.onload = function() {
        // Clear previous base image
        if (baseImageKonva) {
            baseImageKonva.destroy();
        }

        baseImageKonva = new Konva.Image({
            x: 0,
            y: 0,
            image: imageObj,
            width: stage.width(), // Adjust as needed
            height: stage.height() // Adjust as needed
        });

        layer.add(baseImageKonva);
        layer.draw();
    };

    // Load the initial base image
    let $baseImageSelector = $('#baseImageSelector');
    loadBaseImage($baseImageSelector.val());

    // Event listener for changing the base image
    $baseImageSelector.on('change', function () {
        loadBaseImage($(this).val(), true);
    });

    textName = new Konva.Text({
        y: 355,
        fontSize: 14,
        fill: 'black',
    });
    textName.setAttr("x", (stage.width() - textName.width()) / 2);

    textTeam = new Konva.Text({
        y: 368,
        fontSize: 10,
        fill: 'black'
    });
    textTeam.setAttr("x", (stage.width() - textTeam.width()) / 2);

    /*
        // For Testing
        setTimeout(function () {
            layer.add(textName);
            layer.add(textTeam);
            layer.draw();
        }, 1000);
    */
}

$(document).ready(function () {

    $name = $('#name');
    $team = $('#team');

    initializeCanvas();

    $('#uploadForm').on('submit', function (event) {
        event.preventDefault();

        const name = $name.val();
        const team = $team.val();

        const file = $('#imageUpload')[0].files[0];

        if (file) {
            reader = new FileReader();
            reader.onload = function (e) {
                subImage = new Image();
                subImage.onload = function () {
                    // Clear previous uploaded images
                    layer.find('Image').forEach(function (image) {
                        if (image !== baseImageKonva) {
                            image.destroy();
                        }
                    });
                    if (transformer) {
                        transformer.destroy(); // Remove the previous transformer
                    }

                    // Create a group with a circular clip
                    group = new Konva.Group({
                        x: 70, // Center the group
                        y: 150, // Center the group
                        clipFunc: function (ctx) {
                            ctx.arc(100, 100, 100, 0, Math.PI * 2, false); // x, y, radius
                        }
                    });

                    // Add the group to the layer
                    layer.add(group);

                    // Create the uploaded image
                    subGroupImage = new Konva.Image({
                        x: 0, // Position inside the group
                        y: 0, // Position inside the group
                        image: subImage,
                        width: 200, // Make the width match the diameter of the clip
                        height: 200, // Make the height match the diameter of the clip
                        draggable: true, // Allow image dragging
                    });

                    // Add the image to the group
                    group.add(subGroupImage);

                    // Enable resizing/scaling of the image
                    transformer = new Konva.Transformer({
                        node: subGroupImage,
                        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                        boundBoxFunc: function (oldBox, newBox) {
                            // limit resize to not go below a minimum size
                            if (newBox.width < 50 || newBox.height < 50) {
                                return oldBox;
                            }
                            return newBox;
                        }
                    });
                    layer.add(transformer);

                    // Ensure the group and image are drawn
                    layer.draw();
                };
                subImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        // Clear previous text elements
        layer.find('Text').forEach(function (text) {
            text.destroy();
        });

        textName.setText(`${name}`);
        textTeam.setText(`${team}`);

        textName.setAttr("x", (stage.width() - textName.width()) / 2);
        textTeam.setAttr("x", (stage.width() - textTeam.width()) / 2);

        layer.add(textName);
        layer.add(textTeam);
        layer.draw();
    });

    $('#downloadButton').on('click', function () {

        // Hide the transformer before exporting
        transformer.hide();
        layer.draw(); // Re-draw layer without the transformer

        // Export the stage (canvas) to an image
        const dataURL = stage.toDataURL({pixelRatio: 2});

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'final_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show the transformer again after exporting
        transformer.show();
        layer.draw(); // Re-draw layer with the transformer
    });
});
