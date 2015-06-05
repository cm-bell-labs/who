<!--

//get the OS
if (navigator.platform.indexOf("Win") != -1)
   os = "win_";
if (navigator.platform.indexOf("Linux") != -1)
   os = "lin_";
if (navigator.platform.indexOf("Unix") != -1)
   os = "unix_";
if (navigator.platform.indexOf("Mac") != -1)
   os = "mac_";


//get the browser
if (navigator.appName.indexOf("Netscape") != -1) {
   browser = "ns";
   if (parseInt(navigator.appVersion) >= 5)
      browser += "6";
}
if (navigator.appName.indexOf("Microsoft") != -1) {
   browser = "ie";
   if (navigator.appVersion.indexOf("MSIE 5.0") != -1)
      browser += "5";
   if (navigator.appVersion.indexOf("MSIE 5.5") != -1)
      browser += "5.5";
	if (navigator.appVersion.indexOf("MSIE 6.0") != -1)
      browser += "6";
}
if (navigator.appName.indexOf("Konqueror") != -1)
   browser = "kon";
if (navigator.appName.indexOf("Lynx") != -1)
   browser = "lynx";
if (navigator.appName.indexOf("Opera") != -1)
   browser = "opera";

if(os != "" && browser != "")
   style = os + browser + ".css";
else
   style = "style.css";

//This is the link to all the style sheets, you can keep them pointing to our site or we can send them to you and you can reference them //locally 
document.writeln("<link rel=STYLESHEET type=\"text/css\" href=\"http://www.caldera.com/htmlf/" + style + "\">");


// -->