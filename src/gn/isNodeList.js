// isNodeList
// @require "/src/gn/base.js"

gn.isNodeList = function (el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== 'undefined'; 
};