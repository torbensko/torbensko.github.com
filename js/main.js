
// Note 1: With an AJAX approach, we cannot get the body tag. To make this work, we need to
// wrap the contents of the page in an div, which in this case has the ajaxFrame class.

$(function() {

	// Algorithmically work out the seperation between entries (seems dirty - open to a better idea).
	var tmp = $("<div>", {class: "timeline timeline-entry"}).append($("<div>", {class: "vertical-rule"}));
	$("body").prepend(tmp);

	var vr = $(".vertical-rule", tmp);
	normalMarginTop = vr.css("margin-top");
	normalHeight = vr.css("height");
	vr.addClass("collapse");
	collapsedHeight = vr.css("height");
	tmp.remove();

	$(".menu-category").each(function() {
		prevSteps = 0;

		function advanceMenu(menuItem) {
			// Pretend the background was clicked on, in order to have the content hidden
			$("#overlay").click();

			// how many across are we?
			var steps = $(".category-menu .menu-category").index(menuItem);
			var stepSize = parseInt($(".menu-category").outerWidth());

			// Pad it with extra entries on the end
			for(var i = 0; i < (steps - prevSteps); i++) {

				$(".category-menu .menu-category:last-child").after(
					$(".category-menu .menu-category").eq(prevSteps + i).clone().click(function() {
						advanceMenu($(this));
					})
				);
			}
			prevSteps = steps;

			$(".category-menu .scrolling").animate({"margin-left": (-stepSize*steps)+'px'});
			
			// Filter the timeline:
			//	Fade out the dot (it shouldn't vertically offset other elements, so removing it shouldn't have any effect)
			//	Collapse the timeline between the entries`
			var toShow = menuItem.data("category").length > 0 ? $('.'+menuItem.data("category")) : $(".timeline-entry");
			$(".dot:hidden", toShow).fadeIn();

			toShow.each(function(i) {
				console.log(i);

				var isLeft = $(this).hasClass("left");
				var nextLeft = isLeft;

				if(i < toShow.length-1)
					nextLeft = toShow.eq(i+1).hasClass("left");

				var height = (isLeft == nextLeft ? normalHeight : collapsedHeight);

				var vr = $(".vertical-rule", $(this));
				vr.animate({ "height": height, "margin-top": normalMarginTop });

			});

			var toHide = $(".timeline-entry:visible").not(toShow);
			if(toHide.length > 0) {
				$(".dot", toHide).fadeOut();
				$(".vertical-rule", toHide).animate({height: "0px", "margin-top": "0px"});
			}
		}

		$(this).click(function() { 
			advanceMenu($(this));
		});
	});


	// make the overlay responsive to the window size (including absolute content)
	sizeOverlay();
	$(window).on("resize", sizeOverlay); // we manually resize it

	// Converts site links into AJAX requests. Uses the history API to make it appear
	// like the user is still jumping between pages.
	$("a.ajax").each(function() { // only do it for ones we've explicitly specified

		var pageUrl = $(this).attr("href");
		var cssName = pageUrlToCssName(pageUrl);
		var target = getCousin($(this), ".content", ".timeline-entry");

		if(target.length == 0) {
			console.error("no where to place the ajax content", pageUrl);
			return;
		}

		// Replace the link with a span to avoid it having normal link behaviour. 
		// Setting the href to # as this will influence the history.
		var _this = $("<span>", {class: "a"});
		_this.data("href", $(this).attr("href"));
		_this.text($(this).text());
		$(this).replaceWith(_this);

		_this.click(function() {

			// Is the content already loaded into the DOM
			if(target.children().length > 0) {
				_revealContent(pageUrl);
				return;
			}

			// Load the content into the DOM (see Note 1)
			$.ajax({
				url: _this.data("href"),
				dataType: "html",
				success: function(data) {

					data = $(data);

					// Add the content into the document. In doing so, we mark it up with the name to make it
					// possible to find the content later

					var content = $(".ajax-content", data);
					if(content == 0) {
						log.error("no ajax content found");
						return;
					} else {
						target.append(content).hide().addClass(cssName);
					}

					var bgImg = $(".background-img", data);
					if(bgImg.length > 0)
						$("#background-container").append(bgImg.hide().addClass(cssName));

					// Reveal the content
					_revealContent(pageUrl);
				}
			});
		}); // _this.click(function(...
	}); // $("a.ajax").each(...

	$('#overlay').click(function() {
		$(".hidable").fadeIn();
		$(".dim").removeClass("dim", 500);
		$(".content").fadeOut();
		history.pushState(null, null, "/");
	});

}); // end anonmous loading function


// Show the content for the chosen entry.
function _revealContent(entryURL) {

	var cssName = pageUrlToCssName(entryURL);
	var contents = $(".content."+cssName);

	if(contents.length == 0) {
		console.log("unable to find content to show", cssName);
		return;
	}

	if(contents.is(":visible")) {
		console.log("content already showing", cssName);
		return;
	}

	var oldBgImg = $("#background-container >:visible");
	var newBgImg = $("#background-container ."+cssName);

	if(oldBgImg.hasClass(cssName))
		oldBgImg = []; // pretend we didn't find an image

	// Order:
	//	1. Switch contents
	// 	2. Hide existing background image (optional - if exist)
	// 	3. Switch the scheme (background color and theme)
	// 	4. Show the new background image (optional)

	// 1:
	contents.fadeIn(500, sizeOverlay);
	$(".hidable").not(getCousin(contents, ".hidable", ".timeline-entry")).fadeOut(500);
	$(".dimable").not(getCousin(contents, ".dimable", ".timeline-entry")).addClass("dim", 500);
	// update the URL
	history.pushState(null, null, entryURL);

	// 3:
	function _switchScheme() {
		var existingScheme = undefined;
		if($("body").attr("class")) {
			$($("body").attr("class").split(/ /)).each(function(k,v) { 
				if(v.match(/^scheme-.*/)) 
					existingScheme = v;
			});
		}

		var newScheme = newBgImg.data("scheme");

		// tweak the colour scheme
		if(existingScheme != newScheme) {
			if(existingScheme)
				$("body").removeClass(existingScheme, 500);
			if(newScheme)
				$("body").addClass(newScheme, 500);
		}

		// default to white when a colour is not specified
		var bgColor = newBgImg.css("background-color") ? newBgImg.css("background-color") : "rbg(0,0,0)";

		$("body").animate({"background-color": bgColor}, 500, function() {
			// 4;
			if(newBgImg.is(":hidden"))
				newBgImg.fadeIn(1000);
		});

	}

	// 2:
	if(oldBgImg.length > 0) {
		oldBgImg.fadeOut(200, _switchScheme);
	} else {
		_switchScheme();
	}

}



// This caters for when the absolute content is longer than the relative stuff.
function sizeOverlay() {
  return $('#overlay')
  		.width($(document).width())
  		.height($(document).height());
};

function pageUrlToCssName(url) {
	return '_'+url.replace(/[^\w_-]/g, '');
}
