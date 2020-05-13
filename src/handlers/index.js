import dateHandler from "./dateHandler";
import regExpHandler from "./regExpHandler";
import functionHandler from "./functionHandler";

export default {
	// Handler for Date() instances
	"Date": dateHandler,
	
	// Handler for RegExp() instances
	"RegExp": regExpHandler,
	
	// Handler for Function() instances
	"Function": functionHandler
};