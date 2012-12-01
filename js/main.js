
$(function() {

	// make the overlay responsive to the window size (including absolute content)
	sizeOverlay();
	$(window).on("resize", sizeOverlay); // we manually resize it

	// Converts site links into AJAX requests. Uses the history API to make it appear
	// like the user is still jumping between pages.
	$("a.ajax").each(function() { // only do it for ones we've explicitly specified
		var _this = $("<span>", {class: "a"});
			var target = $("#"+$(this).data("target"));

		_this.data("href", $(this).attr("href"));

		// remove the link (avoid just setting the href to # as this will influence the history)
		_this.text($(this).text());
		$(this).replaceWith(_this);

		_this.click(function() {

			// show the content for the chosen entry
			function _revealContent() {
				target.fadeIn(500, sizeOverlay);
				$(".pre-entry").not(_this.parents()).fadeOut(500);
				$(".dimable").not(
						// find the parent element and then any dimable children (allows for cousin elements)
						$(".dimable", _this.first().parents(".timeline-entry").first())
					).addClass("dim", 500);
			}

			// have we already done this?
			if(target.length != 0 && target.children().length > 0) {
				_revealContent();
				return;
			}

			// update the URL
			history.pushState(null, null, _this.data("href"));
			
			// swap the content
			function _showContent() {

				if(target.length == 0)
					target = $(".ajax-container"); // look for a generic container

				if(target.length == 0) {
					console.error("no where to place the ajax content");
					return;
				}

				target.load(_this.data("href")+" .ajax-content");
				_revealContent();
			};

			if($(".ajax-content:visible").length > 0) {
				// remove the existing AJAX content
				$(".ajax-content").fadeOut(function() {
					_showContent();
				});
			} else {
				_showContent();
			}
		}); // _this.click(function(...
	}); // $("a.ajax").each(...

	$('#overlay').click(function() {
		// restore eveything to normal
		$(".pre-entry").fadeIn();
		$(".dim").removeClass("dim", 500);
		$(".content:visible").fadeOut();
	});

}); // end anonmous loading function



// This caters for when the absolute content is longer than the relative stuff.
function sizeOverlay() {
  return $('#overlay')
  		.width($(document).width())
  		.height($(document).height());
};
