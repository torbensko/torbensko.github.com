
function getCousin(element, cousinSelector, parentSelector) {
	return $(cousinSelector, element.parents(parentSelector).first());	
}
