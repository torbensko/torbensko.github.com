
$(function() {

	// Converts site links into AJAX requests. Uses the history API to make it appear
	// like the user is still jumping between pages.
	$("a.ajax").each(function() { // only do it for ones we've explicitly specified
		var link = $("<span>", {class: "a"});
			var target = $("#"+$(this).data("target"));

		link.data("href", $(this).attr("href"));

		// remove the link (avoid just setting the href to # as this will influence the history)
		link.text($(this).text());
		$(this).replaceWith(link);

		link.click(function() {

			// have we already done this?
			if(target.length != 0 && target.children().length > 0) {
				target.fadeIn();
				return;
			}

			// update the URL
			history.pushState(null, null, link.data("href"));
			
			// swap the content
			function _showContent() {

				if(target.length == 0)
					target = $(".ajax-container"); // look for a generic container

				if(target.length == 0) {
					console.error("no where to place the ajax content");
					return;
				}
				console.log("hello "+target.attr("id"));

				target.load(link.data("href")+" .ajax-content");
				target.fadeIn();
				target.css("background", "red");
			};

			if($(".ajax-content:visible").length > 0) {
				// remove the existing AJAX content
				$(".ajax-content").fadeOut(function() {
					_showContent();
				});
			} else {
				_showContent();
			}
		}); // link.click(function(...
	}); // $("a.ajax").each(...

}); // end anonmous loading function
