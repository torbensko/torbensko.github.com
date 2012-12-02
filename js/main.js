
$(function() {

	// make the overlay responsive to the window size (including absolute content)
	sizeOverlay();
	$(window).on("resize", sizeOverlay); // we manually resize it

	// Converts site links into AJAX requests. Uses the history API to make it appear
	// like the user is still jumping between pages.
	$("a.ajax").each(function() { // only do it for ones we've explicitly specified
		var target = $("#"+$(this).data("target"));
		if(target.length == 0) {
			console.error("no where to place the ajax content");
			return;
		}

		var _this = $("<span>", {class: "a"});
		_this.data("href", $(this).attr("href"));

		// remove the link (avoid just setting the href to # as this will influence the history)
		_this.text($(this).text());
		$(this).replaceWith(_this);

		_this.click(function() {
			// have we already done this?
			if(target.length != 0 && target.children().length > 0) {
				_revealContent(target);
				return;
			}

			// With an AJAX approach, we cannot get the body tag. To make this work, we need to
			// wrap the contents of the page in an div, which in this case has the ajaxFrame class.
			$.ajax({
				url: _this.data("href"),
				dataType: "html",
				success: function(data) {

					data = $(data);

					// add the content in
					var content = $(".ajax-content", data);
					if(content == 0) {
						log.error("no ajax content found");
					} else {
						target.append($(".ajax-content", data));
						_revealContent(target);
					}

					// change the website theme
					bgImg = $(".background-img", data);
					if(bgImg.length > 0)
					{
						// Hide the image before changing the background colour. Likewise, we change
						// the background colour before showing the new image.

						function _showNew() {
							$("#background-container").append(bgImg.hide());

							var existingScheme = $("body").data("scheme");
							var newScheme = bgImg.data("scheme");

							// tweak the colour scheme
							if(existingScheme != newScheme) {
								if(existingScheme)
									$("body").removeClass(existingScheme, 500).data("scheme", null);
								if(newScheme)
									$("body").addClass(newScheme, 500).data("scheme", newScheme);
							}

							$("body").animate({"background-color": bgImg.css("background-color")}, 1000, function() {
								bgImg.fadeIn();
							});
						}

						var oldBgImg = $("#background-container *:visible");

						if(oldBgImg.length > 0)
							oldBgImg.fadeOut(_showNew);
						else
							_showNew();
						
					}
				}
			});

			// update the URL
			history.pushState(null, null, _this.data("href"));
		}); // _this.click(function(...
	}); // $("a.ajax").each(...

	$('#overlay').click(function() {
		// restore eveything to normal
		$(".pre-entry").fadeIn();
		$(".dim").removeClass("dim", 500);
		$(".content:visible").fadeOut();
	});

}); // end anonmous loading function


// Show the content for the chosen entry.
function _revealContent(contents) {
	contents.fadeIn(500, sizeOverlay);

	var oldestAncestor = contents.first().parents(".timeline-entry").first();
	$(".pre-entry").not($(".pre-entry", oldestAncestor)).fadeOut(500);
	$(".dimable").not($(".dimable", oldestAncestor)).addClass("dim", 500);
}



// This caters for when the absolute content is longer than the relative stuff.
function sizeOverlay() {
  return $('#overlay')
  		.width($(document).width())
  		.height($(document).height());
};
