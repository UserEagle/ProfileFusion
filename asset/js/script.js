const baseImageBasePath = 'https://usereagle.github.io/ProfileFusion/asset/image/';
let stage, layer, imageObj, baseImageKonva, transformer,
    reader, subImage, group, subGroupImage,
    textName, textTeam, $name, $team;

function loadBaseImage(selectedImage, clearInputs) {
    imageObj.src = baseImageBasePath + selectedImage;
    if (clearInputs) {
        $name.val('');
        $team.val('');
    }
}

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
        if (baseImageKonva) {
            baseImageKonva.destroy();
        }

        baseImageKonva = new Konva.Image({
            x: 0,
            y: 0,
            image: imageObj,
            width: stage.width(),
            height: stage.height()
        });

        layer.add(baseImageKonva);
        layer.draw();
    };

    // Load the initial base image
    let $baseImageSelector = $('#baseImageSelector');
    loadBaseImage($baseImageSelector.val());

    $baseImageSelector.on('change', function () {
        loadBaseImage($(this).val(), true);
    });

    textName = new Konva.Text({
        y: 355,
        fontSize: 14,
        fontStyle: 'bold',
        fill: '#c57327',
    });
    textName.setAttr("x", (stage.width() - textName.width()) / 2);

    textTeam = new Konva.Text({
        y: 370,
        fontSize: 10,
        fontStyle: 'bold',
        fill: '#414833'
    });
    textTeam.setAttr("x", (stage.width() - textTeam.width()) / 2);
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
                subImage.src = e.target.result;
                subImage.onload = function () {
                    layer.find('Image').forEach(function (image) {
                        if (image !== baseImageKonva) {
                            image.destroy();
                        }
                    });
                    if (transformer) {
                        transformer.destroy();
                    }

                    // Create a group with a circular clip
                    group = new Konva.Group({
                        x: 70,
                        y: 150,
                        clipFunc: function (ctx) {
                            ctx.arc(100, 100, 100, 0, Math.PI * 2, false);
                        }
                    });

                    layer.add(group);

                    const baseImageRect = baseImageKonva.getClientRect();

                    const aspectRatio = subImage.width / subImage.height;
                    const desiredWidth = 250;
                    const desiredHeight = desiredWidth / aspectRatio;
                    const sgiX = (baseImageRect.x + baseImageRect.width / 2 - desiredWidth / 2) - group.attrs.x;
                    const sgiY = (baseImageRect.y + baseImageRect.height / 2 - desiredHeight / 2) - group.attrs.y;

                    subGroupImage = new Konva.Image({
                        x: sgiX,
                        y: sgiY,
                        image: subImage,
                        width: desiredWidth,
                        height: desiredHeight,
                        draggable: true,
                    });

                    group.add(subGroupImage);

                    transformer = new Konva.Transformer({
                        node: subGroupImage,
                        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                        boundBoxFunc: function (oldBox, newBox) {
                            if (newBox.width < 50 || newBox.height < 50) {
                                return oldBox;
                            }
                            return newBox;
                        }
                    });
                    layer.add(transformer);

                    layer.draw();
                };
            };
            reader.readAsDataURL(file);
        }

        layer.find('Text').forEach(function (text) {
            text.destroy();
        });

        textName.setText(`${name?.toUpperCase()}`);
        textTeam.setText(`( ${team?.toUpperCase()} )`);

        textName.setAttr("x", (stage.width() - textName.width()) / 2);
        textTeam.setAttr("x", (stage.width() - textTeam.width()) / 2);

        layer.add(textName);
        layer.add(textTeam);
        layer.draw();
    });

    $('#downloadButton').on('click', function () {

        transformer.hide();
        layer.draw(); // Re-draw layer without the transformer

        // Export the stage (canvas) to an image
        const dataURL = stage.toDataURL({pixelRatio: 2});

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'U&I - Born To Win.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        transformer.show();
        layer.draw();
    });
});
