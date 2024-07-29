$(document).ready(function(){
    var current_fs, next_fs, previous_fs; // fieldsets
    var left, opacity, scale; // fieldset properties which we will animate
    var animating; // flag to prevent quick multi-click glitches

    // Load saved form data from localStorage
    loadSavedFormData();

    $(".next").click(function(){
        if(animating) return false;
        animating = true;
        
        current_fs = $(this).parent();
        next_fs = $(this).parent().next();
        
        // activate next step on progressbar using the index of next_fs
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
        
        // show the next fieldset
        next_fs.show(); 
        
        // hide the current fieldset with style
        current_fs.animate({opacity: 0}, {
            step: function(now, mx) {
                // as the opacity of current_fs reduces to 0 - stored in "now"
                // 1. scale current_fs down to 80%
                scale = 1 - (1 - now) * 0.2;
                // 2. bring next_fs from the right(50%)
                left = (now * 50) + "%";
                // 3. increase opacity of next_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({
                    'transform': 'scale(' + scale + ')',
                    'position': 'absolute'
                });
                next_fs.css({'left': left, 'opacity': opacity});
            }, 
            duration: 800, 
            complete: function(){
                current_fs.hide();
                animating = false;
            }, 
            // this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    });

    $(".previous").click(function(){
        if(animating) return false;
        animating = true;
        
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();
        
        // de-activate current step on progressbar
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
        
        // show the previous fieldset
        previous_fs.show(); 
        
        // hide the current fieldset with style
        current_fs.animate({opacity: 0}, {
            step: function(now, mx) {
                // as the opacity of current_fs reduces to 0 - stored in "now"
                // 1. scale previous_fs from 80% to 100%
                scale = 0.8 + (1 - now) * 0.2;
                // 2. take current_fs to the right(50%) - from 0%
                left = ((1 - now) * 50) + "%";
                // 3. increase opacity of previous_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({'left': left});
                previous_fs.css({'transform': 'scale(' + scale + ')', 'opacity': opacity});
            }, 
            duration: 800, 
            complete: function(){
                current_fs.hide();
                animating = false;
            }, 
            // this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    });

    $('.submit').click(function(event){
        event.preventDefault();
        var formData = $("#msform").serialize(); // Serialize form data
    
        $.ajax({
            url: '/Kitchen', // Ensure this matches your server route
            type: 'POST',
            data: formData,
            success: function(response) {
                console.log(formData); // Log form data for debugging
                // Clear form data and show thank you popup
                localStorage.removeItem('multistepFormData'); // Clear saved data
                $("#msform")[0].reset(); // Reset the form
                $("#msform fieldset").hide(); // Hide all fieldsets
                $("#thankYouPopup").show(); // Show the thank you popup
                showThankYouPopup(); // Show the thank you message
            },
            error: function(xhr, status, error) {
                // Save form data to localStorage in case of an error
                saveFormData();
                console.error('Error:', status, error);
                alert('An error occurred while submitting the form. Please check the console for details.');
            }
        });
    });
    
    // Color picker logic
    var selectedColors = [];

    $(".color-option").click(function() {
        var color = $(this).css("background-color");

        if (selectedColors.length < 2) {
            selectedColors.push(color);
            updateColorInput();
        } else {
            alert("You can only select two colors.");
        }
    });

    function updateColorInput() {
        $("#colorInput").val(selectedColors.join(", "));
    }

    // Thank You Pop-Up 
    function showThankYouPopup() {
        var popup = $("#thankYouPopup");
        var text = "Thank You, your site is cooking and will be ready in a few days. We will get back to you as soon as we are done, don't tense!";
        var index = 0;

        popup.show();   
        var interval = setInterval(function() {
            $(".popup-text").append(text.charAt(index));
            index++;
            if (index >= text.length) {
                clearInterval(interval);
            }
        }, 50);
    }

    // Save form data to localStorage
    function saveFormData() {
        var formData = $("#msform").serializeArray();
        var dataObject = {};
        $.each(formData, function() {
            if (dataObject[this.name]) {
                if (!dataObject[this.name].push) {
                    dataObject[this.name] = [dataObject[this.name]];
                }
                dataObject[this.name].push(this.value || '');
            } else {
                dataObject[this.name] = this.value || '';
            }
        });
        localStorage.setItem('multistepFormData', JSON.stringify(dataObject));
    }

    // Load saved form data from localStorage
    function loadSavedFormData() {
        var savedData = localStorage.getItem('multistepFormData');
        if (savedData) {
            var dataObject = JSON.parse(savedData);
            $.each(dataObject, function(name, value) {
                $("[name='" + name + "']").val(value);
            });
            // Restore color selection
            var colors = dataObject['brandcolors'] ? dataObject['brandcolors'].split(', ') : [];
            selectedColors = colors;
            updateColorInput();
        }
    }
});
