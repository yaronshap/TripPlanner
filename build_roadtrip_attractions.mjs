import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "outputs", "northern_states_roadtrip");
const xlsxPath = path.join(outputDir, "northern_states_roadtrip_attractions.xlsx");
const htmlPath = path.join(outputDir, "northern_states_roadtrip_map.html");
const routeGeometryPath = path.join(outputDir, "scenic_roads_routes.json");
const docsDir = path.join(__dirname, "docs");
const docsHtmlPath = path.join(docsDir, "index.html");
const docsNamedHtmlPath = path.join(docsDir, "northern_states_roadtrip_map.html");
const docsXlsxPath = path.join(docsDir, "northern_states_roadtrip_attractions.xlsx");
const noJekyllPath = path.join(docsDir, ".nojekyll");

const states = [
  ["Alabama", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Arizona", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Arkansas", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["California", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Colorado", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Connecticut", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Delaware", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Florida", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Georgia", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Idaho", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Illinois", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Indiana", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Iowa", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Kansas", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Kentucky", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Louisiana", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Maine", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Maryland", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Massachusetts", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Michigan", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Minnesota", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Mississippi", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Missouri", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Montana", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Nebraska", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Nevada", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["New Hampshire", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["New Jersey", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["New Mexico", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["New York", true, "Mainland USA / starting state", "Included because Rochester is the starting point and New York is one of the 48 contiguous U.S. states."],
  ["North Carolina", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["North Dakota", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Ohio", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Oklahoma", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Oregon", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Pennsylvania", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Rhode Island", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["South Carolina", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["South Dakota", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Tennessee", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Texas", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Utah", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Vermont", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Virginia", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Washington", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["West Virginia", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Wisconsin", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
  ["Wyoming", true, "Mainland USA", "Included as one of the 48 contiguous U.S. states."],
];

function audienceForType(type) {
  if (type.includes("National")) return "Families, scenic drivers, outdoor travelers";
  if (type.includes("Museum") || type === "Science") return "Families, history travelers, curious visitors";
  if (type.includes("Beach") || type === "Waterfront") return "Families, beachgoers, scenic travelers";
  if (type.includes("Garden")) return "Garden lovers, families, photographers";
  if (type.includes("Theme Park") || type === "Entertainment") return "Families, thrill seekers, entertainment travelers";
  if (type.includes("Historic") || type === "Memorial") return "History travelers, students, families";
  if (type === "Scenic Town") return "Couples, food lovers, scenic drivers";
  return "Families, road trippers, first-time visitors";
}

function compactAttractionRows(rows) {
  return rows.map(([state, city, longitude, latitude, name, type]) => [
    state,
    city,
    longitude,
    latitude,
    name,
    audienceForType(type),
    `${name} is a notable ${state} stop that adds regional variety and strong road-trip appeal.`,
    type,
  ]);
}

const extraAttractions = [
  ["New York", "Buffalo", -78.878, 42.886, "Buffalo AKG Art Museum", "Art lovers, architecture fans", "A major modern and contemporary collection adds a strong cultural stop near Niagara.", "Museum"],
  ["New York", "Buffalo", -78.878, 42.881, "Theodore Roosevelt Inaugural National Historic Site", "History buffs, families", "The preserved home interprets Roosevelt's unexpected 1901 inauguration.", "Historic Site"],
  ["New York", "Buffalo", -78.873, 42.933, "Frank Lloyd Wright's Martin House", "Architecture fans, design travelers", "A Prairie School masterpiece shows Wright's residential ideas in full.", "Architecture"],
  ["New York", "Buffalo", -78.849, 42.881, "Buffalo and Erie County Naval and Military Park", "Military-history fans, families", "Ships and exhibits bring naval history onto Buffalo's waterfront.", "Museum"],
  ["New York", "Rochester", -77.589, 43.143, "Memorial Art Gallery", "Art lovers, families", "A compact but rich regional art museum makes an easy Rochester stop.", "Museum"],
  ["New York", "Rochester", -77.612, 43.136, "Highland Park", "Families, garden lovers", "Olmsted-designed parkland and lilacs create a relaxed city-nature stop.", "Garden"],
  ["New York", "Auburn", -76.567, 42.932, "Harriet Tubman National Historical Park", "History travelers, students", "Tubman's home and church connect abolition history to a real landscape.", "Historic Site"],
  ["New York", "Canandaigua", -77.28, 42.888, "Sonnenberg Gardens and Mansion", "Garden lovers, architecture fans", "Formal gardens and a historic mansion add Finger Lakes elegance.", "Garden"],
  ["New York", "Skaneateles", -76.429, 42.947, "Skaneateles Lake", "Couples, scenic drivers, families", "Clear water, village streets, and boat cruises make a polished lake stop.", "Waterfront"],
  ["New York", "Albany", -73.761, 42.652, "New York State Capitol and Empire State Plaza", "Architecture fans, history travelers", "Monumental civic architecture and museums anchor the state capital.", "Architecture"],

  ["Pennsylvania", "Scranton", -75.671, 41.411, "Steamtown National Historic Site", "Train fans, families", "Historic locomotives and rail yards tell America's steam-rail story.", "Historic Site"],
  ["Pennsylvania", "Jim Thorpe", -75.737, 40.875, "Lehigh Gorge Scenic Railway", "Families, train fans, leaf peepers", "A heritage train follows river gorge scenery in the Poconos.", "Scenic Railway"],
  ["Pennsylvania", "Jim Thorpe", -75.732, 40.864, "Jim Thorpe Historic District", "Couples, scenic drivers, history fans", "A mountain town of Victorian streets, rail history, and gorge access.", "Scenic Town"],
  ["Pennsylvania", "Harrisburg", -76.884, 40.265, "National Civil War Museum", "History buffs, families", "Balanced exhibits explain the Civil War through military and civilian stories.", "Museum"],
  ["Pennsylvania", "Harrisburg", -76.883, 40.265, "Pennsylvania State Capitol", "Architecture fans, history travelers", "The ornate capitol is a surprisingly rich civic-architecture stop.", "Architecture"],
  ["Pennsylvania", "Allentown", -75.511, 40.603, "Dorney Park and Wildwater Kingdom", "Families, thrill seekers", "Coasters and water rides make a classic eastern Pennsylvania amusement day.", "Theme Park"],
  ["Pennsylvania", "Lancaster", -76.305, 40.037, "Lancaster Central Market", "Food lovers, families", "One of America's oldest public markets showcases Pennsylvania Dutch food culture.", "Food/Market"],
  ["Pennsylvania", "Williamsport", -77.049, 41.242, "Little League World Series Complex", "Baseball families, sports fans", "Youth baseball history and tournament energy define the site.", "Sports"],
  ["Pennsylvania", "Lake Harmony", -75.515, 41.061, "Hickory Run State Park", "Hikers, families, geology fans", "A boulder field, waterfalls, and forest trails make an easy Pocono nature stop.", "Nature"],
  ["Pennsylvania", "Philadelphia", -75.173, 39.953, "Reading Terminal Market", "Food lovers, city explorers", "A dense indoor market makes Philadelphia food traditions easy to sample.", "Food/Market"],

  ["Ohio", "Columbus", -83.009, 39.959, "COSI", "Families, science fans", "Hands-on science exhibits and big-screen programs make learning energetic.", "Science"],
  ["Ohio", "Cincinnati", -84.498, 39.11, "Cincinnati Museum Center at Union Terminal", "Families, architecture fans", "Art Deco architecture houses history, science, and children's museums.", "Museum"],
  ["Ohio", "Marblehead", -82.711, 41.536, "Marblehead Lighthouse State Park", "Photographers, families, lake travelers", "A classic Lake Erie lighthouse anchors shoreline views.", "Historic Site"],
  ["Ohio", "Cincinnati", -84.518, 39.109, "National Underground Railroad Freedom Center", "History travelers, students", "Powerful exhibits connect freedom struggles to the Ohio River setting.", "Museum"],
  ["Ohio", "Cambridge", -81.59, 39.996, "The Wilds", "Families, wildlife lovers", "Open-range safari tours support conservation in reclaimed mine lands.", "Wildlife"],
  ["Ohio", "Geneva-on-the-Lake", -80.953, 41.858, "Geneva-on-the-Lake", "Families, lake travelers", "A nostalgic Lake Erie resort town mixes arcades, beaches, and wineries.", "Scenic Town"],
  ["Ohio", "Chillicothe", -83.01, 39.376, "Hopewell Culture National Historical Park", "History travelers, families", "Ancient earthworks reveal sophisticated Indigenous ceremonial landscapes.", "Historic Site"],
  ["Ohio", "Cleveland", -81.696, 41.511, "Great Lakes Science Center", "Families, science fans", "Hands-on exhibits connect technology, space, and Lake Erie science.", "Science"],
  ["Ohio", "Cleveland", -81.698, 41.511, "USS Cod Submarine Memorial", "Military-history fans, families", "A preserved World War II submarine offers a rare close-quarters tour.", "Historic Site"],
  ["Ohio", "Columbus", -83.003, 39.964, "Short North Arts District", "Art lovers, food lovers, city explorers", "Galleries, murals, restaurants, and boutiques make a lively urban walk.", "Arts/Culture"],

  ["Michigan", "Ann Arbor", -83.737, 42.279, "University of Michigan Museum of Art", "Art lovers, college-town travelers", "Strong collections and campus energy make a polished cultural stop.", "Museum"],
  ["Michigan", "Traverse City", -85.62, 44.763, "Traverse City and Old Mission Peninsula", "Food lovers, couples, scenic drivers", "Lake views, orchards, wineries, and beaches create a signature Michigan stay.", "Food/Drink"],
  ["Michigan", "Lansing", -84.555, 42.733, "Michigan State Capitol", "Architecture fans, history travelers", "A restored capitol anchors Lansing's civic history.", "Architecture"],
  ["Michigan", "Kalamazoo", -85.561, 42.234, "Air Zoo Aerospace and Science Museum", "Aviation fans, families", "Aircraft, simulators, and science exhibits make aviation hands-on.", "Museum"],
  ["Michigan", "Flint", -83.771, 43.016, "Crossroads Village and Huckleberry Railroad", "Families, train fans", "Historic village exhibits and a heritage railroad create a nostalgic outing.", "Living History"],
  ["Michigan", "Ludington", -86.51, 44.032, "Ludington State Park", "Beachgoers, families, hikers", "Dunes, beaches, lighthouse trails, and inland water make a versatile park.", "Nature"],
  ["Michigan", "Marshall", -84.964, 42.272, "Honolulu House Museum", "Architecture fans, history travelers", "A distinctive Italianate and Polynesian-inspired house surprises in small-town Michigan.", "Historic Site"],
  ["Michigan", "Harrisville", -83.321, 44.607, "Huron-Manistee National Forests", "Campers, hikers, anglers", "Forests, rivers, and Lake Huron access support quieter outdoor detours.", "Nature"],
  ["Michigan", "Grand Rapids", -85.67, 42.963, "Gerald R. Ford Presidential Museum", "History buffs, families", "Presidential exhibits add national history to a Grand Rapids visit.", "Museum"],
  ["Michigan", "Detroit", -83.046, 42.339, "Comerica Park", "Baseball fans, families", "Downtown ballpark energy fits Detroit's sports-and-culture corridor.", "Sports"],

  ["Indiana", "Indianapolis", -86.148, 39.768, "Monument Circle", "Architecture fans, city explorers", "The Soldiers and Sailors Monument anchors the capital's downtown core.", "Landmark"],
  ["Indiana", "Indianapolis", -86.171, 39.771, "White River State Park", "Families, walkers, museum visitors", "Museums, trails, canals, and event spaces cluster downtown.", "Urban Park"],
  ["Indiana", "Elkhart", -85.977, 41.683, "RV/MH Hall of Fame", "Road trippers, design-history fans", "Vintage RVs and industry history fit a travel-planning itinerary.", "Museum"],
  ["Indiana", "Columbus", -85.921, 39.201, "Columbus Architecture Tours", "Architecture fans, design travelers", "Modernist civic and church architecture makes the city nationally distinctive.", "Architecture"],
  ["Indiana", "Shipshewana", -85.581, 41.672, "Shipshewana Flea Market and Amish Country", "Food lovers, shoppers, scenic drivers", "Markets, farms, and craft traditions create a relaxed rural stop.", "Food/Market"],
  ["Indiana", "Corydon", -86.126, 38.212, "Corydon Capitol State Historic Site", "History travelers, families", "Indiana's first state capital preserves early statehood stories.", "Historic Site"],
  ["Indiana", "West Lafayette", -86.914, 40.428, "Purdue University Campus", "Families, college travelers, science fans", "A major university campus adds museums, sports, and public art.", "Architecture"],
  ["Indiana", "Evansville", -87.574, 37.975, "Mesker Park Zoo and Botanic Garden", "Families, animal lovers", "Zoo habitats and gardens make a strong southern Indiana family stop.", "Zoo/Aquarium"],
  ["Indiana", "New Harmony", -87.936, 38.13, "New Harmony Historic District", "History travelers, architecture fans", "A utopian-community town offers gardens, historic buildings, and contemplative spaces.", "Historic Site"],
  ["Indiana", "Richmond", -84.889, 39.83, "Richmond and Wayne County Antique Alley", "Shoppers, road trippers", "Antique shops and historic downtowns make a browsing-focused detour.", "Shopping"],

  ["Illinois", "Springfield", -89.647, 39.797, "Lincoln Home National Historic Site", "History buffs, families", "Lincoln's preserved neighborhood makes presidential history concrete.", "Historic Site"],
  ["Illinois", "Springfield", -89.646, 39.819, "Lincoln Tomb", "History travelers, families", "A monumental resting place completes a Lincoln-focused Springfield visit.", "Memorial"],
  ["Illinois", "Chicago", -87.635, 41.888, "Chicago Architecture River Cruise", "Architecture fans, first-time visitors", "Boat tours turn the city's skyline and river history into a clear narrative.", "Waterfront"],
  ["Illinois", "Gurnee", -87.934, 42.37, "Six Flags Great America", "Families, thrill seekers", "Major coasters and water-park access make a Chicago-area amusement anchor.", "Theme Park"],
  ["Illinois", "Peoria", -89.573, 40.689, "Peoria Riverfront Museum", "Families, science fans, art lovers", "Science, art, history, and a planetarium sit on the Illinois River.", "Museum"],
  ["Illinois", "Evanston", -87.676, 42.058, "Baha'i House of Worship", "Architecture fans, culture travelers", "A luminous temple and gardens create a calm North Shore stop.", "Architecture"],
  ["Illinois", "Geneva", -88.358, 41.887, "Fabyan Forest Preserve and Japanese Garden", "Garden lovers, families", "Riverfront trails and a small Japanese garden add Fox River charm.", "Garden"],
  ["Illinois", "Moline", -90.516, 41.506, "John Deere Pavilion", "Families, machinery fans", "Interactive equipment displays tell Midwest agriculture and manufacturing stories.", "Museum"],
  ["Illinois", "Champaign", -88.228, 40.102, "Krannert Art Museum", "Art lovers, college-town travelers", "University collections offer a cultural stop between Chicago and St. Louis.", "Museum"],
  ["Illinois", "Nauvoo", -91.384, 40.55, "Nauvoo Historic District", "History travelers, faith travelers", "Restored buildings interpret a Mississippi River religious and frontier community.", "Historic Site"],

  ["Wisconsin", "Milwaukee", -87.91, 43.038, "Historic Third Ward", "Food lovers, shoppers, city explorers", "Warehouse architecture, galleries, restaurants, and markets make a lively district.", "Food/Market"],
  ["Wisconsin", "Madison", -89.384, 43.074, "Wisconsin State Capitol", "Architecture fans, history travelers", "A domed capitol and lake-centered downtown make a strong city stop.", "Architecture"],
  ["Wisconsin", "Racine", -87.784, 42.727, "SC Johnson Administration Building and Wingspread", "Architecture fans, design travelers", "Frank Lloyd Wright landmarks make Racine a serious architecture detour.", "Architecture"],
  ["Wisconsin", "La Crosse", -91.204, 43.801, "Grandad Bluff", "Scenic drivers, photographers", "A high overlook frames the Mississippi River valley and city below.", "Scenic Overlook"],
  ["Wisconsin", "Superior", -92.039, 46.721, "Amnicon Falls State Park", "Waterfall fans, families", "Cascades, covered bridge views, and short trails fit a Lake Superior route.", "Nature"],
  ["Wisconsin", "Sturgeon Bay", -87.377, 44.834, "Door County Maritime Museum", "Families, maritime-history fans", "Shipbuilding and lighthouse stories add depth to a Door County visit.", "Museum"],
  ["Wisconsin", "Green Bay", -88.016, 44.529, "Bay Beach Wildlife Sanctuary", "Families, birders", "Trails, wildlife rehabilitation, and easy viewing make a quiet Green Bay stop.", "Wildlife"],
  ["Wisconsin", "Eagle", -88.491, 42.866, "Old World Wisconsin", "Families, history travelers", "Open-air farms and villages interpret immigrant life and rural work.", "Living History"],
  ["Wisconsin", "Sturgeon Bay", -87.249, 44.844, "The Ridges Sanctuary", "Birders, walkers, nature lovers", "Rare habitats, boardwalks, and orchids reveal Door County ecology.", "Nature"],
  ["Wisconsin", "Hayward", -91.489, 46.013, "Fresh Water Fishing Hall of Fame", "Anglers, roadside fans, families", "A giant muskie and fishing exhibits make a playful Northwoods stop.", "Roadside"],

  ["Minnesota", "Grand Marais", -90.334, 47.75, "Grand Marais Harbor", "Artists, food lovers, scenic drivers", "A Lake Superior harbor town offers art, dining, and North Shore views.", "Scenic Town"],
  ["Minnesota", "Lutsen", -90.713, 47.636, "Lutsen Mountains", "Skiers, hikers, families", "Mountain lifts and Superior views make a year-round North Shore base.", "Resort"],
  ["Minnesota", "Rochester", -92.463, 44.023, "Mayo Clinic Heritage Hall and Downtown Rochester", "Medical-history fans, city explorers", "Medical innovation history anchors a walkable southern Minnesota city stop.", "Museum"],
  ["Minnesota", "Stillwater", -92.806, 45.056, "Stillwater Historic District", "Couples, food lovers, scenic drivers", "Riverfront streets and historic buildings make an easy Twin Cities day trip.", "Scenic Town"],
  ["Minnesota", "Mankato", -94.001, 44.165, "Minneopa State Park", "Families, waterfall fans, wildlife watchers", "Waterfalls and a bison range create varied prairie-edge scenery.", "Nature"],
  ["Minnesota", "New Ulm", -94.46, 44.315, "New Ulm and Hermann Monument", "Culture travelers, families", "German heritage, brewing history, and a landmark monument define the town.", "Cultural Site"],
  ["Minnesota", "Winona", -91.64, 44.055, "Great River Bluffs State Park", "Hikers, photographers", "Blufftop trails reveal sweeping Mississippi River valley views.", "Nature"],
  ["Minnesota", "Minneapolis", -93.257, 44.975, "Mill City Museum", "History fans, families", "Flour-milling ruins explain how Minneapolis grew on the Mississippi.", "Museum"],
  ["Minnesota", "Duluth", -92.1, 46.785, "Great Lakes Aquarium", "Families, animal lovers", "Freshwater exhibits connect Lake Superior to global aquatic habitats.", "Zoo/Aquarium"],
  ["Minnesota", "Owatonna", -93.226, 44.084, "National Farmers' Bank", "Architecture fans, road trippers", "A Louis Sullivan bank interior offers a jewel-box architecture stop.", "Architecture"],

  ["Iowa", "Sioux City", -96.409, 42.496, "Sioux City Lewis and Clark Interpretive Center", "History travelers, families", "River expedition history fits a western Iowa route.", "Museum"],
  ["Iowa", "Okoboji", -95.13, 43.386, "Iowa Great Lakes Maritime Museum", "Lake travelers, families", "Boating and resort history add context to the Okoboji area.", "Museum"],
  ["Iowa", "Iowa City", -91.535, 41.661, "Old Capitol Museum", "History travelers, college-town explorers", "The first state capitol anchors the University of Iowa campus.", "Museum"],
  ["Iowa", "Cedar Rapids", -91.665, 41.977, "Cedar Rapids Museum of Art", "Art lovers, families", "Regional collections include a strong Grant Wood connection.", "Museum"],
  ["Iowa", "Eldon", -92.216, 40.918, "American Gothic House Center", "Art lovers, roadside travelers", "The house behind Grant Wood's famous painting makes a memorable photo stop.", "Arts/Culture"],
  ["Iowa", "Pella", -92.918, 41.409, "Pella Historical Village and Vermeer Windmill", "Families, culture travelers", "Dutch heritage, gardens, and a working windmill define the town.", "Cultural Site"],
  ["Iowa", "Waterloo", -92.343, 42.497, "John Deere Tractor and Engine Museum", "Families, machinery fans", "Agricultural engineering history connects strongly to Iowa's landscape.", "Museum"],
  ["Iowa", "Council Bluffs", -95.846, 41.258, "Union Pacific Railroad Museum", "Train fans, history travelers", "Railroad expansion stories fit the Missouri River gateway.", "Museum"],
  ["Iowa", "Des Moines", -93.609, 41.586, "Pappajohn Sculpture Park", "Art lovers, walkers", "Large outdoor sculptures make a free downtown Des Moines stop.", "Arts/Culture"],
  ["Iowa", "Davenport", -90.574, 41.52, "Figge Art Museum", "Art lovers, river-city travelers", "A riverfront museum adds visual culture to the Quad Cities.", "Museum"],

  ["North Dakota", "Jamestown", -98.708, 46.91, "Frontier Village and World's Largest Buffalo", "Families, roadside fans", "Western-themed buildings and a giant bison sculpture break up I-94.", "Roadside"],
  ["North Dakota", "Jamestown", -98.706, 46.906, "National Buffalo Museum", "Wildlife fans, families", "Bison history and conservation exhibits complement the roadside landmark.", "Museum"],
  ["North Dakota", "Grand Forks", -97.036, 47.922, "North Dakota Museum of Art", "Art lovers, college-town travelers", "Contemporary art and regional programming add a cultural stop.", "Museum"],
  ["North Dakota", "Grand Forks", -97.07, 47.925, "Ralph Engelstad Arena", "Sports fans, architecture fans", "A major college hockey venue shows North Dakota sports culture.", "Sports"],
  ["North Dakota", "Bismarck", -100.784, 46.807, "Dakota Zoo", "Families, animal lovers", "A manageable zoo on the Missouri River makes a family-friendly pause.", "Zoo/Aquarium"],
  ["North Dakota", "Valley City", -98.002, 46.923, "Sheyenne River Valley National Scenic Byway", "Scenic drivers, history travelers", "River hills, bridges, and prairie towns make a gentle scenic route.", "Scenic Drive"],
  ["North Dakota", "Devils Lake", -98.91, 48.114, "Devils Lake", "Anglers, birders, families", "A large natural lake supports fishing, boating, and bird migration.", "Waterfront"],
  ["North Dakota", "Dickinson", -102.789, 46.879, "Dickinson Museum Center", "Families, fossil fans", "Dinosaur exhibits and regional history make a practical western stop.", "Museum"],
  ["North Dakota", "Medora", -103.532, 46.913, "North Dakota Cowboy Hall of Fame", "Western-history fans, families", "Rodeo, ranching, and Native history deepen a Medora visit.", "Museum"],
  ["North Dakota", "Cavalier", -97.907, 48.783, "Icelandic State Park", "Families, campers, nature lovers", "Lake recreation, trails, and heritage exhibits fit northeastern routes.", "Nature"],

  ["South Dakota", "Rapid City", -103.229, 44.044, "Reptile Gardens", "Families, animal lovers", "A classic Black Hills attraction mixes reptiles, gardens, and shows.", "Zoo/Aquarium"],
  ["South Dakota", "Rapid City", -103.231, 44.041, "Bear Country USA", "Families, wildlife watchers", "Drive-through wildlife viewing makes an easy Black Hills family stop.", "Wildlife"],
  ["South Dakota", "Rapid City", -103.23, 44.085, "Dinosaur Park", "Families, roadside fans", "Vintage hilltop dinosaurs and city views provide a quick nostalgic stop.", "Roadside"],
  ["South Dakota", "Keystone", -103.457, 43.895, "1880 Train", "Train fans, families", "A heritage steam-train ride connects Keystone and Hill City.", "Scenic Railway"],
  ["South Dakota", "Hill City", -103.575, 43.932, "Black Hills Central Railroad", "Train fans, families", "Historic rail travel adds a slower way to see the Black Hills.", "Scenic Railway"],
  ["South Dakota", "Lead", -103.765, 44.353, "Sanford Lab Homestake Visitor Center", "Science fans, history travelers", "A former gold mine now supports deep-underground science.", "Science"],
  ["South Dakota", "Aberdeen", -98.488, 45.464, "Storybook Land", "Families, young kids", "Free storybook-themed parkland makes a playful northern South Dakota stop.", "Theme Park"],
  ["South Dakota", "Brookings", -96.789, 44.316, "South Dakota Art Museum", "Art lovers, college-town travelers", "Regional art and Harvey Dunn works enrich a Brookings visit.", "Museum"],
  ["South Dakota", "Brookings", -96.783, 44.317, "McCrory Gardens", "Garden lovers, families", "Display gardens and arboretum paths add a calm prairie stop.", "Garden"],
  ["South Dakota", "Pierre", -100.346, 44.366, "South Dakota State Capitol", "Architecture fans, history travelers", "Capitol grounds and lake setting make a worthwhile central-state stop.", "Architecture"],

  ["Nebraska", "Omaha", -95.928, 41.224, "Omaha's Henry Doorly Zoo and Aquarium", "Families, animal lovers", "World-class indoor and outdoor habitats make it Nebraska's signature family attraction.", "Zoo/Aquarium"],
  ["Nebraska", "Scottsbluff", -103.707, 41.835, "Scotts Bluff National Monument", "History travelers, hikers, families", "Oregon Trail landmarks and blufftop views connect landscape with migration history.", "National Monument"],
  ["Nebraska", "Gering", -103.349, 41.703, "Chimney Rock National Historic Site", "History travelers, photographers", "A famous Oregon Trail landmark rises dramatically from western Nebraska plains.", "Historic Site"],
  ["Nebraska", "Ashland", -96.502, 41.017, "Strategic Air Command and Aerospace Museum", "Aviation fans, families, veterans", "Large aircraft and space exhibits tell Cold War and aerospace stories.", "Museum"],
  ["Nebraska", "Royal", -98.068, 42.42, "Ashfall Fossil Beds State Historical Park", "Fossil fans, families, science travelers", "An active fossil site preserves prehistoric animals buried by volcanic ash.", "Science"],
  ["Nebraska", "Valentine", -100.547, 42.894, "Niobrara National Scenic River", "Paddlers, families, nature lovers", "Canoeing, tubing, waterfalls, and canyon scenery create a standout outdoor stop.", "Nature"],
  ["Nebraska", "Valentine", -100.31, 42.899, "Smith Falls State Park", "Families, waterfall fans, paddlers", "Nebraska's tallest waterfall pairs naturally with a Niobrara River trip.", "Nature"],
  ["Nebraska", "Alliance", -102.858, 42.142, "Carhenge", "Road trippers, families, photographers", "A playful car-built Stonehenge replica is one of the Plains' great roadside icons.", "Roadside"],
  ["Nebraska", "Mullen", -101.064, 42.05, "Nebraska Sandhills", "Scenic drivers, birders, solitude seekers", "Rolling grass-stabilized dunes and open skies create a distinctive Great Plains landscape.", "Scenic Region"],
  ["Nebraska", "Halsey", -100.29, 41.902, "Nebraska National Forest at Halsey", "Campers, hikers, families", "Hand-planted pine forest rises unexpectedly amid Sandhills grassland.", "Nature"],
  ["Nebraska", "Lincoln", -96.699, 40.813, "Nebraska State Capitol", "Architecture fans, history travelers", "A landmark tower capitol combines mosaics, murals, observation views, and civic symbolism.", "Architecture"],
  ["Nebraska", "Lincoln", -96.681, 40.814, "Sunken Gardens", "Garden lovers, families, photographers", "Formal gardens and seasonal plantings make a peaceful city stop.", "Garden"],
  ["Nebraska", "Lincoln", -96.699, 40.817, "International Quilt Museum", "Art lovers, design travelers", "A globally important quilt collection connects textile art, craft, and culture.", "Museum"],
  ["Nebraska", "Omaha", -95.937, 41.252, "The Durham Museum", "History fans, families, architecture fans", "A grand Art Deco train station houses regional history and rail exhibits.", "Museum"],
  ["Nebraska", "Omaha", -95.932, 41.257, "Old Market Historic District", "Food lovers, shoppers, city explorers", "Brick streets, restaurants, galleries, and nightlife anchor downtown Omaha.", "Scenic Town"],
  ["Nebraska", "Omaha", -95.927, 41.262, "Bob Kerrey Pedestrian Bridge", "Walkers, families, photographers", "A curving bridge lets visitors stand over the Missouri River and state line.", "Landmark"],
  ["Nebraska", "Omaha", -95.942, 41.26, "Joslyn Art Museum", "Art lovers, architecture fans", "An Art Deco building and broad collections make Omaha's major art stop.", "Museum"],
  ["Nebraska", "Kearney", -98.999, 40.666, "The Archway", "Road trippers, families", "An immersive museum spans I-80 and tells Great Platte River Road migration stories.", "Museum"],
  ["Nebraska", "Kearney", -99.081, 40.665, "Fort Kearny State Historical Park", "History travelers, families", "A reconstructed frontier post anchors Oregon Trail and military history.", "Historic Site"],
  ["Nebraska", "Gibbon", -98.909, 40.666, "Rowe Sanctuary", "Birders, photographers, families", "Spring sandhill crane migration makes the Platte River a world-class wildlife spectacle.", "Wildlife"],
  ["Nebraska", "Beatrice", -96.833, 40.289, "Homestead National Historical Park", "History travelers, students, families", "Prairie, cabins, and exhibits interpret the Homestead Act's legacy.", "National Park"],
  ["Nebraska", "North Platte", -100.767, 41.127, "Buffalo Bill Ranch State Historical Park", "Western-history fans, families", "Cody's ranch home connects showmanship, ranching, and frontier mythology.", "Historic Site"],
  ["Nebraska", "North Platte", -100.831, 41.152, "Golden Spike Tower and Bailey Yard", "Train fans, families", "Observation decks overlook one of the world's largest railroad classification yards.", "Observation"],
  ["Nebraska", "Ogallala", -101.718, 41.21, "Lake McConaughy", "Beachgoers, boaters, families", "White sand beaches and big-water recreation create Nebraska's largest reservoir getaway.", "Waterfront"],
  ["Nebraska", "Crawford", -103.751, 42.67, "Fort Robinson State Park", "History travelers, families, outdoor travelers", "Military history, buttes, lodging, trails, and western scenery fill a large park.", "Historic Site"],
  ["Nebraska", "Harrison", -103.58, 42.859, "Agate Fossil Beds National Monument", "Fossil fans, history travelers", "Miocene fossils and Lakota-related collections sit in open prairie scenery.", "National Monument"],
  ["Nebraska", "Crawford", -103.586, 42.858, "Toadstool Geologic Park", "Hikers, photographers, geology fans", "Badlands formations create a surreal short-hike landscape in the Oglala grasslands.", "Nature"],
  ["Nebraska", "Ponca", -96.71, 42.597, "Ponca State Park", "Families, hikers, Missouri River travelers", "Bluffs, forest trails, river views, and cabins make a strong northeast stop.", "Nature"],
  ["Nebraska", "Brownville", -95.657, 40.397, "Brownville Historic District", "History travelers, book lovers, scenic drivers", "A small Missouri River town preserves museums, bookstores, and riverboat heritage.", "Scenic Town"],
  ["Nebraska", "Grand Island", -98.347, 40.924, "Stuhr Museum", "Families, history travelers", "Living-history buildings and regional exhibits interpret prairie settlement life.", "Living History"],

  ["Montana", "Missoula", -113.997, 46.87, "Missoula Downtown and Riverfront", "Food lovers, walkers, college-town travelers", "River trails, markets, and mountain views make Missoula a lively base.", "Scenic Town"],
  ["Montana", "Missoula", -113.993, 46.86, "Fort Missoula Historical Museum", "History travelers, families", "Military, regional, and railroad stories gather in an open-air campus.", "Museum"],
  ["Montana", "Billings", -108.565, 45.779, "Pictograph Cave State Park", "History travelers, families", "Rock art and short trails introduce ancient human presence near Billings.", "Historic Site"],
  ["Montana", "Billings", -108.605, 45.809, "Rimrocks and Zimmerman Park", "Hikers, photographers, city explorers", "Sandstone cliffs give easy overlooks above Billings.", "Nature"],
  ["Montana", "Kalispell", -114.315, 48.203, "Flathead Lake", "Families, boaters, scenic drivers", "A huge mountain lake supports beaches, orchards, and shoreline towns.", "Waterfront"],
  ["Montana", "Great Falls", -111.301, 47.534, "Giant Springs State Park", "Families, walkers, anglers", "Clear springs, river trails, and fish hatchery exhibits make a gentle stop.", "Nature"],
  ["Montana", "Helena", -112.036, 46.589, "Cathedral of St. Helena", "Architecture fans, city explorers", "Twin spires and stained glass create a memorable downtown landmark.", "Architecture"],
  ["Montana", "Anaconda", -113.144, 46.131, "Anaconda Smoke Stack State Park", "Industrial-history fans, photographers", "A massive smelter stack marks Montana's mining and industrial past.", "Historic Site"],
  ["Montana", "Butte", -112.536, 46.012, "World Museum of Mining", "History travelers, families", "Mine yards and underground tours explain Butte's copper era.", "Museum"],
  ["Montana", "Fort Benton", -110.674, 47.818, "Fort Benton Historic District", "History travelers, river-road drivers", "Missouri River steamboat history shapes one of Montana's oldest towns.", "Historic Site"],

  ["Wyoming", "Sheridan", -106.956, 44.797, "Bighorn Scenic Byway", "Scenic drivers, photographers", "Mountain passes, canyons, and ranch country make a classic northern crossing.", "Scenic Drive"],
  ["Wyoming", "Cody", -109.079, 44.526, "Cody Nite Rodeo", "Families, western-culture travelers", "Summer rodeo energy adds living cowboy culture to a Yellowstone gateway.", "Entertainment"],
  ["Wyoming", "Pinedale", -109.856, 42.868, "Museum of the Mountain Man", "History fans, families", "Fur trade and mountain-man history fit the Green River valley.", "Museum"],
  ["Wyoming", "Casper", -106.365, 42.848, "National Historic Trails Interpretive Center", "History travelers, families", "Oregon, Mormon, California, and Pony Express trails converge in exhibits.", "Museum"],
  ["Wyoming", "Casper", -106.326, 42.85, "Tate Geological Museum", "Fossil fans, families", "Dinosaurs, minerals, and mammoth remains make a compact science stop.", "Science"],
  ["Wyoming", "Cheyenne", -104.828, 41.136, "Cheyenne Frontier Days Old West Museum", "Rodeo fans, families", "Rodeo artifacts and western culture explain Cheyenne's signature event.", "Museum"],
  ["Wyoming", "Sundance", -104.372, 44.406, "Vore Buffalo Jump", "History travelers, culture travelers", "Archaeological layers reveal Plains bison hunting traditions.", "Historic Site"],
  ["Wyoming", "Rock Springs", -109.203, 41.587, "Pilot Butte Wild Horse Scenic Loop", "Wildlife watchers, scenic drivers", "A loop road offers chances to see wild horses and high-desert views.", "Scenic Drive"],
  ["Wyoming", "Afton", -110.933, 42.724, "Intermittent Spring", "Hikers, geology fans", "A rhythmic spring creates an unusual short hike in Star Valley.", "Nature"],
  ["Wyoming", "Jackson", -110.762, 43.48, "Jackson Town Square", "Families, shoppers, first-time visitors", "Antler arches, galleries, and restaurants anchor the gateway town.", "Scenic Town"],

  ["Idaho", "Boise", -116.2, 43.608, "Idaho State Capitol", "Architecture fans, history travelers", "The marble-domed capitol anchors downtown Boise and state history.", "Architecture"],
  ["Idaho", "Pocatello", -112.445, 42.861, "Museum of Clean", "Families, quirky-museum fans", "A playful museum turns cleaning history into unexpectedly memorable exhibits.", "Museum"],
  ["Idaho", "Idaho Falls", -112.04, 43.492, "Idaho Falls River Walk", "Walkers, families, road trippers", "Waterfalls, art, and riverfront paths make a pleasant eastern Idaho pause.", "Waterfront"],
  ["Idaho", "McCall", -116.096, 44.912, "Payette Lake", "Families, boaters, skiers", "A mountain lake town supports summer water fun and winter skiing.", "Waterfront"],
  ["Idaho", "Sandpoint", -116.547, 48.276, "Lake Pend Oreille", "Boaters, families, scenic drivers", "Deep lake scenery and a lively town make a strong North Idaho stop.", "Waterfront"],
  ["Idaho", "Bonners Ferry", -116.404, 48.736, "Kootenai National Wildlife Refuge", "Birders, photographers, families", "Wetlands and mountain backdrops offer easy wildlife viewing.", "Wildlife"],
  ["Idaho", "Salmon", -113.897, 45.176, "Sacajawea Interpretive, Cultural and Educational Center", "History travelers, families", "Exhibits connect Lemhi Shoshone culture with Lewis and Clark history.", "Cultural Site"],
  ["Idaho", "Boise", -116.212, 43.611, "Basque Block", "Food lovers, culture travelers", "Restaurants, museums, and festivals highlight Boise's Basque heritage.", "Cultural Site"],
  ["Idaho", "Idaho City", -115.834, 43.828, "Idaho City Historic District", "History travelers, scenic drivers", "Gold-rush buildings and mountain roads make an easy Boise-area detour.", "Historic Site"],
  ["Idaho", "Stanley", -115.057, 44.243, "Redfish Lake", "Families, hikers, paddlers", "Clear water below the Sawtooths creates a postcard mountain-lake stop.", "Waterfront"],

  ["Washington", "Spokane", -117.421, 47.66, "Riverfront Park", "Families, walkers, city explorers", "Falls, paths, art, and a carousel anchor downtown Spokane.", "Urban Park"],
  ["Washington", "Spokane", -117.467, 47.657, "Northwest Museum of Arts and Culture", "Art lovers, history travelers", "Regional art and Inland Northwest history add context to Spokane.", "Museum"],
  ["Washington", "Tacoma", -122.436, 47.246, "Museum of Glass", "Art lovers, families", "Live glassmaking and waterfront exhibits connect Tacoma to studio-glass art.", "Museum"],
  ["Washington", "Tacoma", -122.439, 47.236, "Point Defiance Zoo and Aquarium", "Families, animal lovers", "Zoo, aquarium, gardens, and waterfront parkland fill a full outing.", "Zoo/Aquarium"],
  ["Washington", "Everett", -122.281, 47.982, "Flying Heritage and Combat Armor Museum", "Aviation fans, military-history fans", "Historic aircraft and armor make a substantial Puget Sound museum stop.", "Museum"],
  ["Washington", "Bellingham", -122.478, 48.751, "Chuckanut Drive", "Scenic drivers, cyclists, food lovers", "A coastal road links cliffs, forests, islands views, and oyster stops.", "Scenic Drive"],
  ["Washington", "Vancouver", -122.676, 45.628, "Vancouver Waterfront", "Walkers, food lovers, river travelers", "Restaurants and paths face the Columbia River near Fort Vancouver.", "Waterfront"],
  ["Washington", "Mount Vernon", -122.37, 48.421, "Skagit Valley Tulip Fields", "Garden lovers, photographers", "Spring tulip fields create vivid color below Cascade views.", "Garden"],
  ["Washington", "Ellensburg", -120.547, 46.996, "Kittitas County Historical Museum", "History travelers, road trippers", "Local exhibits add context to the I-90 crossing of central Washington.", "Museum"],
  ["Washington", "Coulee Dam", -118.981, 47.958, "Grand Coulee Dam", "Engineering fans, families", "A massive Columbia River dam explains power, irrigation, and regional change.", "Engineering"],

  ["Oregon", "Portland", -122.676, 45.516, "Portland Art Museum", "Art lovers, city explorers", "Regional and global collections make a central Portland cultural stop.", "Museum"],
  ["Oregon", "Hood River", -121.522, 45.706, "Hood River Waterfront and Fruit Loop", "Food lovers, families, scenic drivers", "River recreation, orchards, and Mount Hood views define the area.", "Food/Drink"],
  ["Oregon", "Tillamook", -123.844, 45.457, "Tillamook Creamery", "Families, food lovers", "Cheese-making exhibits and tastings make an easy coast-route stop.", "Food/Drink"],
  ["Oregon", "Florence", -124.146, 43.931, "Oregon Dunes National Recreation Area", "Families, off-roaders, photographers", "Huge coastal dunes create one of Oregon's most distinctive landscapes.", "Nature"],
  ["Oregon", "Bend", -121.315, 44.058, "Pilot Butte State Scenic Viewpoint", "Scenic drivers, walkers, photographers", "A small volcanic butte gives quick Bend and Cascade views.", "Scenic Overlook"],
  ["Oregon", "Baker City", -117.834, 44.789, "National Historic Oregon Trail Interpretive Center", "History travelers, families", "Exhibits and wagon-rut views explain overland migration.", "Museum"],
  ["Oregon", "Salem", -123.031, 44.938, "Oregon State Capitol State Park", "Architecture fans, history travelers", "Capitol grounds and public art anchor Oregon's state history.", "Architecture"],
  ["Oregon", "Klamath Falls", -121.739, 42.868, "Lava Beds National Monument", "Cave fans, geology travelers", "Lava tubes and high-desert history reward a southern Oregon detour.", "National Monument"],
  ["Oregon", "Eugene", -123.072, 44.052, "Jordan Schnitzer Museum of Art", "Art lovers, college-town travelers", "A university museum adds Asian, regional, and contemporary collections.", "Museum"],
  ["Oregon", "Pendleton", -118.786, 45.674, "Pendleton Underground Tours", "History travelers, road trippers", "Underground spaces and downtown stories add character to eastern Oregon.", "Historic Site"],
];

const attractions = [
  ["New York", "Niagara Falls", -79.074, 43.083, "Niagara Falls State Park", "Families, first-time visitors, photographers", "Iconic waterfalls with close-up overlooks and boat tours.", "Nature"],
  ["New York", "Castile", -78.043, 42.573, "Letchworth State Park", "Hikers, families, waterfall fans", "A dramatic gorge often called the Grand Canyon of the East.", "Nature"],
  ["New York", "Watkins Glen", -76.873, 42.381, "Watkins Glen State Park", "Hikers, photographers, couples", "A compact gorge trail passes waterfalls, bridges, and stone stairs.", "Nature"],
  ["New York", "Corning", -77.055, 42.148, "Corning Museum of Glass", "Families, art lovers, makers", "Live glass demos and deep collections make the craft tangible.", "Museum"],
  ["New York", "Rochester", -77.601, 43.152, "The Strong National Museum of Play", "Families, kids, game fans", "Interactive exhibits make toys, games, and pop culture hands-on.", "Museum"],
  ["New York", "Rochester", -77.58, 43.153, "George Eastman Museum", "Photography fans, history lovers", "A landmark photography collection inside Eastman's historic estate.", "Museum"],
  ["New York", "Syracuse", -76.151, 43.052, "Erie Canal Museum", "History buffs, road trippers", "Explains the canal that reshaped travel, trade, and Upstate towns.", "Museum"],
  ["New York", "Lake Placid", -73.979, 44.279, "Adirondack High Peaks", "Hikers, skiers, outdoor travelers", "Alpine lakes, Olympic history, and rugged mountain trailheads converge.", "Nature"],
  ["New York", "Ausable Chasm", -73.461, 44.525, "Ausable Chasm", "Families, hikers, adventure travelers", "A sandstone gorge with walkways, rafting, and striking rock walls.", "Nature"],
  ["New York", "Alexandria Bay", -75.922, 44.344, "Boldt Castle and Thousand Islands", "Families, couples, boaters", "A castle visit pairs with island scenery on the St. Lawrence River.", "Historic Site"],
  ["New York", "Saratoga Springs", -73.783, 43.083, "Saratoga Race Course", "Sports fans, architecture fans", "One of America's classic horse-racing venues with summer energy.", "Sports"],
  ["New York", "Cooperstown", -74.923, 42.7, "National Baseball Hall of Fame", "Baseball fans, families", "A pilgrimage stop for baseball history, artifacts, and legends.", "Museum"],
  ["New York", "Poughkeepsie", -73.952, 41.711, "Walkway Over the Hudson", "Walkers, cyclists, families", "A high rail bridge offers sweeping Hudson River views.", "Trail"],
  ["New York", "New Windsor", -74.063, 41.424, "Storm King Art Center", "Art lovers, design-minded travelers", "Large-scale sculpture sits across open fields and wooded hills.", "Arts/Culture"],
  ["New York", "West Point", -73.956, 41.391, "West Point and U.S. Military Academy", "History buffs, military families", "Historic grounds overlook the Hudson and tell national military stories.", "Historic Site"],
  ["New York", "Ithaca", -76.536, 42.452, "Museum of the Earth", "Families, science fans", "Fossils and geology exhibits connect New York to deep time.", "Science"],
  ["New York", "Trumansburg", -76.608, 42.538, "Taughannock Falls State Park", "Families, hikers, waterfall fans", "A tall waterfall drops through a Finger Lakes gorge.", "Nature"],
  ["New York", "Seneca Lake", -76.922, 42.515, "Seneca Lake Wine Trail", "Adults, food lovers, scenic drivers", "Lake views and wineries create an easy Finger Lakes loop.", "Food/Drink"],
  ["New York", "Saranac Lake", -74.131, 44.329, "Saranac Lake and Adirondack Villages", "Outdoor travelers, families", "Small-town Adirondack character anchors paddling, hiking, and winter trips.", "Scenic Town"],
  ["New York", "Chautauqua", -79.466, 42.209, "Chautauqua Institution", "Culture travelers, families", "A lakeside campus blends lectures, music, faith, and summer programs.", "Arts/Culture"],

  ["Pennsylvania", "Gettysburg", -77.231, 39.83, "Gettysburg National Military Park", "History buffs, students, families", "The battlefield preserves a pivotal Civil War turning point.", "Historic Site"],
  ["Pennsylvania", "Hershey", -76.658, 40.288, "Hersheypark", "Families, thrill seekers", "Coasters, chocolate theming, and water attractions make it a classic stop.", "Theme Park"],
  ["Pennsylvania", "Mill Run", -79.466, 39.901, "Fallingwater", "Architecture fans, design travelers", "Frank Lloyd Wright's house dramatically spans a waterfall.", "Architecture"],
  ["Pennsylvania", "Philadelphia", -75.15, 39.949, "Independence Hall", "History buffs, families, students", "A foundational American site where the Declaration and Constitution were debated.", "Historic Site"],
  ["Pennsylvania", "Philadelphia", -75.181, 39.966, "Philadelphia Museum of Art", "Art lovers, families", "Major collections, landmark steps, and riverfront setting reward a long visit.", "Museum"],
  ["Pennsylvania", "Philadelphia", -75.172, 39.968, "Eastern State Penitentiary", "History fans, architecture fans", "A haunting prison complex explores justice, design, and reform.", "Historic Site"],
  ["Pennsylvania", "Kennett Square", -75.679, 39.871, "Longwood Gardens", "Garden lovers, families, photographers", "Expansive gardens and conservatories deliver year-round color.", "Garden"],
  ["Pennsylvania", "Benton", -76.306, 41.335, "Ricketts Glen State Park", "Hikers, photographers", "The Falls Trail links many waterfalls in a forested loop.", "Nature"],
  ["Pennsylvania", "Erie", -80.099, 42.153, "Presque Isle State Park", "Beachgoers, birders, cyclists", "Lake Erie beaches and lagoons create a northern-coast playground.", "Nature"],
  ["Pennsylvania", "Pittsburgh", -79.948, 40.439, "Phipps Conservatory and Botanical Gardens", "Families, garden lovers", "Glasshouse rooms mix seasonal displays, architecture, and plant science.", "Garden"],
  ["Pennsylvania", "Pittsburgh", -79.951, 40.444, "Carnegie Museums of Art and Natural History", "Families, art lovers, science fans", "Art, dinosaurs, gems, and global cultures sit under one roof.", "Museum"],
  ["Pennsylvania", "Pittsburgh", -79.996, 40.448, "Andy Warhol Museum", "Art lovers, pop culture fans", "A deep dive into Warhol's work, process, and Pittsburgh roots.", "Museum"],
  ["Pennsylvania", "Strasburg", -76.164, 39.983, "Railroad Museum of Pennsylvania", "Train fans, families", "Historic locomotives and rail cars make industrial history approachable.", "Museum"],
  ["Pennsylvania", "Elysburg", -76.506, 40.881, "Knoebels Amusement Resort", "Families, coaster fans", "Free-entry classic amusement park with beloved wooden coasters.", "Theme Park"],
  ["Pennsylvania", "Ohiopyle", -79.495, 39.869, "Ohiopyle State Park", "Rafters, hikers, families", "Whitewater, waterfalls, and trail access create an active outdoor hub.", "Nature"],
  ["Pennsylvania", "King of Prussia", -75.451, 40.101, "Valley Forge National Historical Park", "History buffs, walkers, families", "Revolutionary War landscapes pair monuments with easy trails.", "Historic Site"],
  ["Pennsylvania", "Shanksville", -78.904, 40.055, "Flight 93 National Memorial", "History travelers, families", "A solemn memorial honors passengers and crew from September 11.", "Memorial"],
  ["Pennsylvania", "Wellsboro", -77.457, 41.7, "Pine Creek Gorge", "Scenic drivers, hikers, cyclists", "Pennsylvania's Grand Canyon offers overlooks and a rail trail.", "Nature"],
  ["Pennsylvania", "Bushkill", -75.008, 41.113, "Bushkill Falls", "Families, waterfall fans", "Boardwalk trails lead to a cluster of Pocono waterfalls.", "Nature"],
  ["Pennsylvania", "Mount Jewett", -78.585, 41.759, "Kinzua Bridge State Park", "Families, photographers, engineering fans", "A skywalk reuses a historic rail viaduct over a forest valley.", "Historic Site"],

  ["Ohio", "Sandusky", -82.678, 41.482, "Cedar Point", "Thrill seekers, families", "A dense lineup of major roller coasters sits on a Lake Erie peninsula.", "Theme Park"],
  ["Ohio", "Cleveland", -81.695, 41.508, "Rock and Roll Hall of Fame", "Music fans, pop culture travelers", "Artifacts and immersive exhibits track rock history and influence.", "Museum"],
  ["Ohio", "Logan", -82.525, 39.426, "Hocking Hills State Park", "Hikers, couples, photographers", "Caves, cliffs, and waterfalls feel wild but accessible.", "Nature"],
  ["Ohio", "Dayton", -84.109, 39.782, "National Museum of the U.S. Air Force", "Aviation fans, families, veterans", "Vast aircraft galleries cover flight from early aviation to space.", "Museum"],
  ["Ohio", "Powell", -83.118, 40.157, "Columbus Zoo and Aquarium", "Families, animal lovers", "Large habitat zones and aquarium exhibits make it an all-day visit.", "Zoo/Aquarium"],
  ["Ohio", "Peninsula", -81.552, 41.281, "Cuyahoga Valley National Park", "Hikers, cyclists, families", "Waterfalls, towpath trails, and a scenic railroad sit near Cleveland.", "National Park"],
  ["Ohio", "Canton", -81.398, 40.821, "Pro Football Hall of Fame", "Sports fans, families", "Football history, bust gallery, and memorabilia anchor a fan pilgrimage.", "Sports"],
  ["Ohio", "Mason", -84.268, 39.344, "Kings Island", "Families, thrill seekers", "A major amusement park with coasters and a large water park.", "Theme Park"],
  ["Ohio", "Cincinnati", -84.508, 39.145, "Cincinnati Zoo and Botanical Garden", "Families, animal lovers", "Historic zoo grounds mix conservation work with popular animal exhibits.", "Zoo/Aquarium"],
  ["Ohio", "Cleveland", -81.611, 41.509, "Cleveland Museum of Art", "Art lovers, families", "Free admission and strong global collections make it an easy cultural stop.", "Museum"],
  ["Ohio", "Columbus", -82.953, 39.966, "Franklin Park Conservatory", "Garden lovers, families", "Plant biomes, glass art, and gardens fill a Victorian glasshouse.", "Garden"],
  ["Ohio", "Peebles", -83.431, 39.025, "Serpent Mound", "History travelers, students", "A major ancient earthwork invites reflection on Indigenous engineering.", "Historic Site"],
  ["Ohio", "Berlin", -81.794, 40.561, "Ohio Amish Country", "Food lovers, scenic drivers, families", "Rolling farms, markets, and craft shops slow the pace.", "Scenic Region"],
  ["Ohio", "Toledo", -83.559, 41.658, "Toledo Museum of Art", "Art lovers, families", "Glass, painting, and sculpture collections are unusually strong.", "Museum"],
  ["Ohio", "Akron", -81.551, 41.104, "Stan Hywet Hall and Gardens", "Architecture fans, garden lovers", "A grand estate preserves early 20th-century design and gardens.", "Historic Site"],
  ["Ohio", "Cleveland", -81.704, 41.484, "West Side Market", "Food lovers, photographers", "Historic market halls showcase Cleveland food culture.", "Food/Market"],
  ["Ohio", "Cincinnati", -84.507, 39.097, "Great American Ball Park", "Baseball fans, families", "Riverfront ballpark with Reds history and skyline views.", "Sports"],
  ["Ohio", "Kirtland", -81.303, 41.612, "Holden Arboretum", "Garden lovers, families, walkers", "Canopy walks and broad gardens make trees the main event.", "Garden"],
  ["Ohio", "Put-in-Bay", -82.819, 41.653, "South Bass Island and Put-in-Bay", "Boaters, families, couples", "An island getaway with lake views, caves, and Perry history.", "Waterfront"],
  ["Ohio", "Youngstown", -80.682, 41.102, "Mill Creek Park", "Families, walkers, garden lovers", "Urban parkland includes lakes, trails, and formal gardens.", "Nature"],

  ["Michigan", "Empire", -86.073, 44.881, "Sleeping Bear Dunes National Lakeshore", "Families, hikers, photographers", "Towering dunes and Lake Michigan overlooks feel epic and accessible.", "National Park"],
  ["Michigan", "Munising", -86.459, 46.564, "Pictured Rocks National Lakeshore", "Paddlers, hikers, photographers", "Colorful cliffs, beaches, and waterfalls line Lake Superior.", "National Park"],
  ["Michigan", "Mackinac Island", -84.627, 45.849, "Mackinac Island", "Families, couples, cyclists", "Car-free streets, lake views, and historic hotels create a timeless stop.", "Island"],
  ["Michigan", "Dearborn", -83.234, 42.303, "The Henry Ford Museum of American Innovation", "Families, history buffs, makers", "Transportation, invention, and American industry are shown through huge artifacts.", "Museum"],
  ["Michigan", "Detroit", -83.064, 42.359, "Detroit Institute of Arts", "Art lovers, families", "Major collections and Rivera murals make it a Midwest art landmark.", "Museum"],
  ["Michigan", "Detroit", -83.081, 42.364, "Motown Museum", "Music fans, pop culture travelers", "Studio A preserves the birthplace of the Motown sound.", "Museum"],
  ["Michigan", "Paradise", -85.256, 46.575, "Tahquamenon Falls State Park", "Families, hikers, waterfall fans", "Powerful amber-colored falls anchor a classic Upper Peninsula detour.", "Nature"],
  ["Michigan", "Houghton", -88.55, 47.995, "Isle Royale National Park", "Backpackers, paddlers, solitude seekers", "Remote Lake Superior wilderness rewards committed outdoor travelers.", "National Park"],
  ["Michigan", "Grand Rapids", -85.588, 42.98, "Frederik Meijer Gardens and Sculpture Park", "Garden lovers, art fans, families", "Botanical gardens and large-scale sculpture share a polished campus.", "Garden"],
  ["Michigan", "Copper Harbor", -87.886, 47.468, "Keweenaw Peninsula", "Scenic drivers, history buffs, cyclists", "Copper mining history, rugged shorelines, and remote roads define the peninsula.", "Scenic Region"],
  ["Michigan", "Mackinaw City", -84.73, 45.817, "Mackinac Bridge", "Road trippers, engineering fans", "The suspension bridge is a Great Lakes engineering icon.", "Landmark"],
  ["Michigan", "Sault Ste. Marie", -84.35, 46.502, "Soo Locks", "Families, engineering fans, boat watchers", "Massive ships rise and fall between Lake Superior and lower lakes.", "Engineering"],
  ["Michigan", "Muskegon", -86.28, 43.347, "Michigan's Adventure", "Families, thrill seekers", "Michigan's largest amusement park pairs coasters with a water park.", "Theme Park"],
  ["Michigan", "Detroit", -82.973, 42.344, "Belle Isle Park", "Families, cyclists, photographers", "Island parkland offers skyline views, aquarium, conservatory, and beaches.", "Urban Park"],
  ["Michigan", "Mears", -86.516, 43.67, "Silver Lake Sand Dunes", "Families, off-roaders, photographers", "Big dunes between inland water and Lake Michigan invite adventure.", "Nature"],
  ["Michigan", "Manistique", -86.015, 46.005, "Kitch-iti-kipi", "Families, photographers", "A clear spring reveals vivid water and moving views from a raft.", "Nature"],
  ["Michigan", "Ontonagon", -89.746, 46.809, "Porcupine Mountains Wilderness State Park", "Hikers, backpackers, photographers", "Old-growth forest, Lake of the Clouds, and Superior shorelines feel remote.", "Nature"],
  ["Michigan", "Holland", -86.208, 42.772, "Holland State Park", "Beachgoers, families", "Lake Michigan beach access and Big Red lighthouse make an easy stop.", "Beach"],
  ["Michigan", "Frankenmuth", -83.738, 43.331, "Frankenmuth", "Families, food lovers", "Bavarian-style streets, chicken dinners, and holiday shopping are crowd pleasers.", "Scenic Town"],
  ["Michigan", "Detroit", -83.043, 42.331, "Detroit Riverwalk", "Walkers, families, city explorers", "Waterfront paths connect parks, public art, skyline views, and restaurants.", "Waterfront"],

  ["Indiana", "Porter", -87.096, 41.653, "Indiana Dunes National Park", "Beachgoers, hikers, birders", "Lake Michigan dunes, beaches, and wetlands create surprising variety.", "National Park"],
  ["Indiana", "Indianapolis", -86.157, 39.811, "Children's Museum of Indianapolis", "Families, kids", "A huge interactive museum blends science, culture, and play.", "Museum"],
  ["Indiana", "Speedway", -86.235, 39.795, "Indianapolis Motor Speedway Museum", "Racing fans, families", "The track and museum anchor IndyCar racing history.", "Sports"],
  ["Indiana", "Santa Claus", -86.915, 38.12, "Holiday World and Splashin' Safari", "Families, thrill seekers", "A friendly theme park adds a standout water park.", "Theme Park"],
  ["Indiana", "Marshall", -87.206, 39.888, "Turkey Run State Park", "Hikers, families", "Sandstone ravines and ladders make short trails memorable.", "Nature"],
  ["Indiana", "Nashville", -86.23, 39.183, "Brown County State Park", "Hikers, leaf peepers, couples", "Rolling hills and fall color make it Indiana's classic scenic park.", "Nature"],
  ["Indiana", "Fishers", -86.018, 39.983, "Conner Prairie", "Families, history buffs", "Living-history exhibits make frontier and aviation stories interactive.", "Living History"],
  ["Indiana", "Fort Wayne", -85.145, 41.106, "Fort Wayne Children's Zoo", "Families, animal lovers", "Compact, high-quality habitats make it especially good with kids.", "Zoo/Aquarium"],
  ["Indiana", "Indianapolis", -86.18, 39.768, "Indianapolis Zoo", "Families, animal lovers", "Zoo, aquarium, and gardens sit beside White River State Park.", "Zoo/Aquarium"],
  ["Indiana", "Indianapolis", -86.169, 39.769, "Eiteljorg Museum", "Art lovers, history travelers", "Western and Native American art collections add a distinctive cultural stop.", "Museum"],
  ["Indiana", "Indianapolis", -86.185, 39.825, "Newfields", "Art lovers, garden lovers", "Art galleries, gardens, and seasonal installations make one flexible visit.", "Museum"],
  ["Indiana", "Madison", -85.421, 38.761, "Clifty Falls State Park", "Hikers, waterfall fans", "Canyon trails and seasonal waterfalls sit near historic Madison.", "Nature"],
  ["Indiana", "Marengo", -86.343, 38.375, "Marengo Cave", "Families, geology fans", "Guided cave tours reveal accessible underground formations.", "Cave"],
  ["Indiana", "French Lick", -86.618, 38.548, "French Lick Resort", "Couples, spa travelers, golfers", "Historic resort hotels pair architecture, mineral-spring history, and golf.", "Resort"],
  ["Indiana", "Clarksville", -85.764, 38.276, "Falls of the Ohio State Park", "Families, fossil fans", "Exposed fossil beds along the Ohio River are easy to explore.", "Science"],
  ["Indiana", "Battle Ground", -86.841, 40.506, "Prophetstown State Park", "Families, cyclists, history travelers", "Prairie restoration, trails, and farm exhibits tell layered land stories.", "Nature"],
  ["Indiana", "Indianapolis", -86.169, 39.769, "Indiana State Museum", "Families, students, history fans", "State history, science, and culture are presented beside the canal.", "Museum"],
  ["Indiana", "Notre Dame", -86.238, 41.702, "Basilica and University of Notre Dame", "Architecture fans, alumni, families", "A famous campus combines architecture, art, and sports tradition.", "Architecture"],
  ["Indiana", "Rockville", -87.23, 39.762, "Parke County Covered Bridges", "Scenic drivers, photographers", "Historic covered bridges create a relaxed rural driving loop.", "Scenic Drive"],
  ["Indiana", "Bloomington", -86.535, 39.166, "WonderLab Museum", "Families, kids, science fans", "Hands-on science exhibits make a lively stop near Indiana University.", "Science"],

  ["Illinois", "Chicago", -87.623, 41.883, "Millennium Park", "First-time visitors, families, photographers", "Public art, gardens, and skyline views anchor downtown Chicago.", "Urban Park"],
  ["Illinois", "Chicago", -87.624, 41.879, "Art Institute of Chicago", "Art lovers, families", "World-class collections make it one of America's essential art museums.", "Museum"],
  ["Illinois", "Chicago", -87.617, 41.866, "Field Museum", "Families, science fans", "Dinosaurs, anthropology, and natural history fill a major museum campus.", "Museum"],
  ["Illinois", "Chicago", -87.614, 41.867, "Shedd Aquarium", "Families, animal lovers", "Aquatic habitats and lakefront views make it a classic Chicago stop.", "Zoo/Aquarium"],
  ["Illinois", "Chicago", -87.635, 41.879, "Willis Tower Skydeck", "First-time visitors, photographers", "High views and glass ledges frame the Chicago skyline.", "Observation"],
  ["Illinois", "Chicago", -87.605, 41.891, "Navy Pier", "Families, lakefront walkers", "Lakefront dining, rides, boat tours, and events gather in one place.", "Waterfront"],
  ["Illinois", "Chicago", -87.635, 41.921, "Lincoln Park Zoo", "Families, animal lovers", "A free zoo sits within a large lakefront park.", "Zoo/Aquarium"],
  ["Illinois", "Chicago", -87.581, 41.79, "Museum of Science and Industry", "Families, science fans", "Large-scale exhibits make technology, weather, and transport immersive.", "Science"],
  ["Illinois", "Oglesby", -89.006, 41.32, "Starved Rock State Park", "Hikers, families, waterfall fans", "Canyons, bluffs, and seasonal waterfalls offer a nature break from Chicago.", "Nature"],
  ["Illinois", "Collinsville", -90.064, 38.655, "Cahokia Mounds State Historic Site", "History travelers, students", "Massive Mississippian earthworks reveal a major pre-Columbian city.", "Historic Site"],
  ["Illinois", "Springfield", -89.644, 39.802, "Abraham Lincoln Presidential Library and Museum", "History buffs, families", "Immersive exhibits connect Lincoln's life to Civil War-era America.", "Museum"],
  ["Illinois", "Rockford", -89.057, 42.295, "Anderson Japanese Gardens", "Garden lovers, photographers", "Carefully composed landscapes create a calm northern Illinois stop.", "Garden"],
  ["Illinois", "Oak Park", -87.8, 41.894, "Frank Lloyd Wright Home and Studio", "Architecture fans, design travelers", "The site traces Wright's early work and Prairie School evolution.", "Architecture"],
  ["Illinois", "Pontiac", -88.63, 40.881, "Route 66 Association Hall of Fame and Museum", "Road trippers, nostalgia fans", "Route 66 stories and memorabilia fit a cross-country itinerary.", "Museum"],
  ["Illinois", "Herod", -88.367, 37.604, "Garden of the Gods Recreation Area", "Hikers, photographers", "Sandstone formations and Shawnee Forest views reward a southern detour.", "Nature"],
  ["Illinois", "Oglesby", -89.025, 41.295, "Matthiessen State Park", "Hikers, families", "Canyons, bridges, and streams offer a quieter complement to Starved Rock.", "Nature"],
  ["Illinois", "Galena", -90.429, 42.417, "Galena Historic District", "Couples, history travelers", "Nineteenth-century architecture and river bluffs make an atmospheric town stop.", "Scenic Town"],
  ["Illinois", "Chicago", -87.626, 41.889, "Chicago Riverwalk", "Walkers, food lovers, architecture fans", "Waterfront paths frame the city's architecture and boat-tour scene.", "Waterfront"],
  ["Illinois", "Chicago", -87.655, 41.948, "Wrigley Field", "Baseball fans, families", "Historic ballpark atmosphere makes a Cubs game feel rooted in place.", "Sports"],
  ["Illinois", "Union", -88.526, 42.228, "Illinois Railway Museum", "Train fans, families", "A large operating collection lets visitors ride historic trains.", "Museum"],

  ["Wisconsin", "Wisconsin Dells", -89.779, 43.625, "Noah's Ark Waterpark", "Families, water-park fans", "One of the country's best-known water parks anchors the Dells.", "Water Park"],
  ["Wisconsin", "Green Bay", -88.062, 44.501, "Lambeau Field", "Football fans, families", "Packers history and stadium tours make it a sports pilgrimage.", "Sports"],
  ["Wisconsin", "Milwaukee", -88.038, 43.03, "Milwaukee County Zoo", "Families, animal lovers", "Large habitats and easy logistics make a full family day.", "Zoo/Aquarium"],
  ["Wisconsin", "Spring Green", -90.07, 43.141, "Taliesin", "Architecture fans, design travelers", "Frank Lloyd Wright's Wisconsin home reveals landscape-driven architecture.", "Architecture"],
  ["Wisconsin", "Milwaukee", -87.896, 43.037, "Discovery World", "Families, science fans", "Hands-on science and technology exhibits sit on the lakefront.", "Science"],
  ["Wisconsin", "Green Bay", -88.016, 44.529, "Bay Beach Amusement Park", "Families, budget travelers", "Classic rides and low prices make an easy Green Bay outing.", "Theme Park"],
  ["Wisconsin", "Spring Green", -90.134, 43.1, "House on the Rock", "Curious travelers, families", "A maximalist roadside attraction full of collections and surreal rooms.", "Roadside"],
  ["Wisconsin", "Baileys Harbor", -87.048, 45.089, "Cana Island Lighthouse", "Families, photographers", "Door County lighthouse views come with a short causeway crossing.", "Historic Site"],
  ["Wisconsin", "Blue Mounds", -89.815, 43.018, "Cave of the Mounds", "Families, geology fans", "Guided cave tours reveal colorful formations near Madison.", "Cave"],
  ["Wisconsin", "Osceola", -92.704, 45.32, "Osceola and St. Croix Valley Railway", "Train fans, families", "Scenic heritage train rides follow river-valley landscapes.", "Scenic Railway"],
  ["Wisconsin", "Bayside", -87.895, 43.181, "Schlitz Audubon Nature Center", "Families, birders, walkers", "Lake Michigan trails and raptor programs make nature accessible.", "Nature"],
  ["Wisconsin", "Wisconsin Dells", -89.771, 43.627, "Wisconsin Dells Scenic Boat Tours", "Families, photographers", "River tours pass sandstone formations that made the Dells famous.", "Waterfront"],
  ["Wisconsin", "Bayfield", -90.665, 46.962, "Apostle Islands National Lakeshore", "Paddlers, hikers, photographers", "Sea caves, islands, and Lake Superior shorelines feel wild and memorable.", "National Park"],
  ["Wisconsin", "Fish Creek", -87.247, 45.128, "Door County Peninsula State Park", "Families, cyclists, couples", "Shoreline roads, bluffs, beaches, and villages define Door County.", "Nature"],
  ["Wisconsin", "Milwaukee", -87.916, 43.032, "Harley-Davidson Museum", "Motorcycle fans, design travelers", "Motorcycle history and industrial design are presented with strong visual punch.", "Museum"],
  ["Wisconsin", "Milwaukee", -87.897, 43.039, "Milwaukee Art Museum", "Art lovers, architecture fans", "A striking lakefront building houses broad art collections.", "Museum"],
  ["Wisconsin", "Oshkosh", -88.578, 43.984, "EAA Aviation Museum", "Aviation fans, families", "Aircraft collections and airshow culture tell grassroots aviation stories.", "Museum"],
  ["Wisconsin", "Baraboo", -89.728, 43.418, "Devil's Lake State Park", "Hikers, beachgoers, climbers", "Quartzite bluffs, lake beaches, and trails make Wisconsin's busiest park.", "Nature"],
  ["Wisconsin", "Madison", -89.335, 43.092, "Olbrich Botanical Gardens", "Garden lovers, families", "Outdoor gardens and a tropical conservatory sit beside Lake Monona.", "Garden"],
  ["Wisconsin", "Baraboo", -89.744, 43.468, "Circus World", "Families, history fans", "Circus wagons, performances, and Ringling history fill a playful museum.", "Museum"],

  ["Minnesota", "Bloomington", -93.242, 44.854, "Mall of America", "Families, shoppers, rainy-day planners", "Shopping, dining, attractions, and an indoor theme park fill a huge complex.", "Shopping"],
  ["Minnesota", "Ely", -91.867, 47.905, "Boundary Waters Canoe Area Wilderness", "Paddlers, campers, solitude seekers", "Lake-to-lake canoe routes offer classic North Woods wilderness.", "Nature"],
  ["Minnesota", "International Falls", -92.837, 48.483, "Voyageurs National Park", "Boaters, anglers, families", "A water-based national park rewards boat travel and northern skies.", "National Park"],
  ["Minnesota", "Park Rapids", -95.208, 47.239, "Itasca State Park", "Families, cyclists, nature lovers", "Visitors can walk across the Mississippi River headwaters.", "Nature"],
  ["Minnesota", "Two Harbors", -91.367, 47.2, "Split Rock Lighthouse", "Photographers, history travelers", "A cliffside lighthouse frames one of Lake Superior's iconic views.", "Historic Site"],
  ["Minnesota", "Two Harbors", -91.464, 47.144, "Gooseberry Falls State Park", "Families, hikers, waterfall fans", "Easy trails and cascades make a classic North Shore stop.", "Nature"],
  ["Minnesota", "Minneapolis", -93.274, 44.958, "Minneapolis Institute of Art", "Art lovers, families", "Free access and global collections make it a high-value city stop.", "Museum"],
  ["Minnesota", "Minneapolis", -93.289, 44.969, "Walker Art Center and Sculpture Garden", "Art lovers, design travelers", "Contemporary art and the famous sculpture garden sit near downtown.", "Arts/Culture"],
  ["Minnesota", "St. Paul", -93.153, 44.982, "Como Park Zoo and Conservatory", "Families, garden lovers", "Free zoo, conservatory, and parkland make an easy urban outing.", "Zoo/Aquarium"],
  ["Minnesota", "Apple Valley", -93.198, 44.768, "Minnesota Zoo", "Families, animal lovers", "Large trails and habitats highlight northern and global wildlife.", "Zoo/Aquarium"],
  ["Minnesota", "Duluth", -91.95, 46.79, "North Shore Scenic Drive", "Scenic drivers, photographers", "Lake Superior cliffs, towns, and waterfalls line a beautiful route.", "Scenic Drive"],
  ["Minnesota", "Duluth", -92.092, 46.779, "Aerial Lift Bridge and Canal Park", "Families, photographers, ship watchers", "Ships pass under a landmark bridge beside Duluth's waterfront.", "Waterfront"],
  ["Minnesota", "Chanhassen", -93.561, 44.862, "Paisley Park", "Music fans, pop culture travelers", "Prince's creative home and studio gives rare insight into his work.", "Museum"],
  ["Minnesota", "St. Paul", -93.099, 44.943, "Science Museum of Minnesota", "Families, science fans", "Dinosaurs, experiments, and riverfront views make science hands-on.", "Science"],
  ["Minnesota", "Minneapolis", -93.211, 44.916, "Minnehaha Falls", "Families, walkers, cyclists", "A photogenic city waterfall connects to trails and parkland.", "Urban Park"],
  ["Minnesota", "Wabasha", -92.031, 44.383, "National Eagle Center", "Birders, families", "Live eagle programs and river migration stories fit a Mississippi stop.", "Wildlife"],
  ["Minnesota", "Pipestone", -96.325, 44.013, "Pipestone National Monument", "History travelers, families", "Sacred quarries and prairie trails interpret Indigenous cultural traditions.", "Historic Site"],
  ["Minnesota", "Carlton", -92.524, 46.655, "Jay Cooke State Park", "Hikers, families, photographers", "Swinging bridge views and rocky river trails sit near Duluth.", "Nature"],
  ["Minnesota", "St. Paul", -93.102, 44.955, "Minnesota State Capitol", "Architecture fans, history travelers", "A restored Beaux-Arts capitol shows civic architecture and state history.", "Architecture"],
  ["Minnesota", "Austin", -92.974, 43.667, "SPAM Museum", "Families, food-history fans", "A quirky free museum turns a famous canned meat into playful history.", "Roadside"],

  ["Iowa", "Maquoketa", -90.76, 42.118, "Maquoketa Caves State Park", "Families, hikers, geology fans", "A network of caves and trails makes a distinctive outdoor stop.", "Nature"],
  ["Iowa", "Harpers Ferry", -91.196, 43.087, "Effigy Mounds National Monument", "History travelers, hikers", "Ancient mound groups sit above Mississippi River bluffs.", "Historic Site"],
  ["Iowa", "Dyersville", -91.047, 42.498, "Field of Dreams Movie Site", "Baseball fans, film lovers", "The preserved ballfield turns a beloved movie into a real visit.", "Sports"],
  ["Iowa", "West Bend", -94.444, 42.962, "Grotto of the Redemption", "Art lovers, faith travelers, roadside fans", "A vast mosaic grotto built with stones and minerals is startlingly detailed.", "Roadside"],
  ["Iowa", "Dubuque", -90.665, 42.496, "National Mississippi River Museum and Aquarium", "Families, river-history fans", "Aquariums, boats, and exhibits explain Mississippi River life.", "Museum"],
  ["Iowa", "Altoona", -93.499, 41.658, "Adventureland Resort", "Families, thrill seekers", "Coasters, water attractions, and resort amenities create a classic park stop.", "Theme Park"],
  ["Iowa", "Amana", -91.869, 41.801, "Amana Colonies", "Food lovers, history travelers", "Historic villages preserve communal heritage, crafts, and hearty food traditions.", "Scenic Town"],
  ["Iowa", "Ames", -93.638, 42.012, "Reiman Gardens", "Garden lovers, families", "Butterflies, themed gardens, and campus setting make it easy to enjoy.", "Garden"],
  ["Iowa", "Des Moines", -93.657, 41.552, "Blank Park Zoo", "Families, animal lovers", "A manageable zoo offers animal encounters and kid-friendly exhibits.", "Zoo/Aquarium"],
  ["Iowa", "Des Moines", -93.603, 41.591, "Iowa State Capitol", "Architecture fans, history travelers", "The gold-domed capitol anchors state history and skyline views.", "Architecture"],
  ["Iowa", "McGregor", -91.155, 43.002, "Pikes Peak State Park", "Scenic drivers, hikers", "High overlooks frame the Mississippi and Wisconsin River confluence.", "Nature"],
  ["Iowa", "Winterset", -94.014, 41.331, "Madison County Covered Bridges", "Photographers, couples, road trippers", "Historic bridges and rural roads create a mellow scenic loop.", "Scenic Drive"],
  ["Iowa", "Clear Lake", -93.384, 43.139, "Surf Ballroom", "Music fans, history travelers", "A landmark venue preserves Buddy Holly-era rock-and-roll history.", "Historic Site"],
  ["Iowa", "West Branch", -91.346, 41.671, "Herbert Hoover National Historic Site", "History buffs, families", "Birthplace grounds and presidential library tell Hoover's life story.", "Historic Site"],
  ["Iowa", "Council Bluffs", -95.86, 41.5, "Loess Hills Scenic Byway", "Scenic drivers, hikers", "Wind-formed hills create an unusual western Iowa landscape.", "Scenic Drive"],
  ["Iowa", "Des Moines", -93.681, 41.583, "Des Moines Art Center", "Art lovers, architecture fans", "Modern architecture and strong collections make a compact cultural stop.", "Museum"],
  ["Iowa", "Urbandale", -93.768, 41.627, "Living History Farms", "Families, history travelers", "Working farm sites show Midwestern life across time.", "Living History"],
  ["Iowa", "Madrid", -93.972, 41.878, "High Trestle Trail Bridge", "Cyclists, walkers, photographers", "A lit rail-trail bridge creates a dramatic evening stop.", "Trail"],
  ["Iowa", "Dubuque", -90.67, 42.501, "Fenelon Place Elevator", "Families, photographers", "A short funicular ride climbs to broad Mississippi River views.", "Landmark"],
  ["Iowa", "Arnolds Park", -95.132, 43.368, "Iowa Great Lakes and Arnolds Park", "Families, lake travelers", "Classic lake resorts, rides, and beaches create a summer vacation feel.", "Waterfront"],

  ["North Dakota", "Medora", -103.531, 46.979, "Theodore Roosevelt National Park South Unit", "Hikers, wildlife watchers, families", "Badlands scenery and bison viewing anchor western North Dakota.", "National Park"],
  ["North Dakota", "Watford City", -103.443, 47.594, "Theodore Roosevelt National Park North Unit", "Hikers, photographers, wildlife watchers", "Quieter badlands overlooks offer a rugged contrast to the South Unit.", "National Park"],
  ["North Dakota", "Belfield", -103.299, 46.896, "Painted Canyon Overlook", "Road trippers, photographers", "A quick interstate stop gives a broad badlands panorama.", "Scenic Overlook"],
  ["North Dakota", "Medora", -103.528, 46.913, "Maah Daah Hey Trail", "Mountain bikers, hikers, adventurers", "A long backcountry trail links badlands, prairie, and public lands.", "Trail"],
  ["North Dakota", "Medora", -103.524, 46.914, "Medora Musical", "Families, road trippers", "An outdoor summer show packages western history with big-stage entertainment.", "Entertainment"],
  ["North Dakota", "Bismarck", -100.782, 46.821, "North Dakota Heritage Center and State Museum", "Families, history fans", "Dinosaurs, Indigenous history, and state stories fill modern galleries.", "Museum"],
  ["North Dakota", "Mandan", -100.889, 46.762, "Fort Abraham Lincoln State Park", "History travelers, families", "Reconstructed earthlodges and military buildings interpret layered frontier history.", "Historic Site"],
  ["North Dakota", "Stanton", -101.385, 47.354, "Knife River Indian Villages National Historic Site", "History travelers, students", "Village sites and earthlodge exhibits share Hidatsa and Mandan history.", "Historic Site"],
  ["North Dakota", "Dunseith", -100.06, 48.999, "International Peace Garden", "Garden lovers, cross-border travelers", "Formal gardens celebrate friendship on the U.S.-Canada border.", "Garden"],
  ["North Dakota", "Minot", -101.297, 48.234, "Scandinavian Heritage Park", "Families, heritage travelers", "Nordic architecture and monuments reflect regional immigrant culture.", "Cultural Site"],
  ["North Dakota", "Regent", -102.56, 46.421, "Enchanted Highway", "Road trippers, photographers", "Giant metal sculptures turn prairie highway miles into roadside theater.", "Roadside"],
  ["North Dakota", "Fargo", -96.814, 46.9, "Fargo Air Museum", "Aviation fans, families", "Aircraft displays and flying history make a compact museum stop.", "Museum"],
  ["North Dakota", "Fargo", -96.789, 46.877, "Plains Art Museum", "Art lovers, city explorers", "Regional and contemporary art add a cultural pause in downtown Fargo.", "Museum"],
  ["North Dakota", "West Fargo", -96.9, 46.877, "Bonanzaville USA", "Families, history travelers", "Historic buildings and artifacts recreate prairie settlement life.", "Living History"],
  ["North Dakota", "Williston", -104.039, 48.001, "Fort Union Trading Post National Historic Site", "History buffs, families", "A reconstructed fur trade post interprets Plains commerce and diplomacy.", "Historic Site"],
  ["North Dakota", "Walhalla", -98.06, 48.906, "Pembina Gorge State Recreation Area", "Hikers, mountain bikers, fall-color seekers", "Wooded hills and trails break the state's open-prairie stereotype.", "Nature"],
  ["North Dakota", "Riverdale", -101.408, 47.495, "Lake Sakakawea and Garrison Dam", "Boaters, anglers, families", "A huge reservoir creates beaches, fishing, and open-water recreation.", "Waterfront"],
  ["North Dakota", "Washburn", -101.026, 47.288, "Lewis and Clark Interpretive Center", "History travelers, families", "Exhibits connect expedition history with the Missouri River landscape.", "Museum"],
  ["North Dakota", "Medora", -103.525, 46.914, "Chateau de Mores State Historic Site", "History buffs, architecture fans", "A preserved ranch home tells the story of Medora's cattle era.", "Historic Site"],
  ["North Dakota", "St. Michael", -98.997, 47.971, "White Horse Hill National Game Preserve", "Wildlife watchers, families", "Prairie and wetland habitat offer bison, elk, birds, and lake views.", "Wildlife"],

  ["South Dakota", "Keystone", -103.459, 43.879, "Mount Rushmore National Memorial", "Families, first-time visitors, history travelers", "The monumental sculpture is one of the region's signature landmarks.", "Memorial"],
  ["South Dakota", "Interior", -102.34, 43.75, "Badlands National Park", "Hikers, photographers, families", "Striped formations, wildlife, and open drives create unforgettable scenery.", "National Park"],
  ["South Dakota", "Custer", -103.505, 43.762, "Custer State Park", "Wildlife watchers, families, scenic drivers", "Bison herds, granite peaks, lakes, and drives fill a huge park.", "Nature"],
  ["South Dakota", "Custer", -103.623, 43.837, "Crazy Horse Memorial", "History travelers, families", "A massive mountain carving and museum interpret Lakota culture and vision.", "Memorial"],
  ["South Dakota", "Hot Springs", -103.483, 43.556, "Wind Cave National Park", "Cave fans, wildlife watchers", "Complex cave passages sit below prairie wildlife habitat.", "National Park"],
  ["South Dakota", "Custer", -103.829, 43.729, "Jewel Cave National Monument", "Cave fans, families", "Guided tours explore one of the world's longest cave systems.", "Cave"],
  ["South Dakota", "Sioux Falls", -96.72, 43.559, "Falls Park", "Families, walkers, photographers", "Pink quartzite falls and historic mills anchor downtown Sioux Falls.", "Urban Park"],
  ["South Dakota", "Spearfish", -103.916, 44.35, "Spearfish Canyon Scenic Byway", "Scenic drivers, hikers, photographers", "Limestone walls, waterfalls, and forest roads make a beautiful drive.", "Scenic Drive"],
  ["South Dakota", "Deadwood", -103.729, 44.376, "Deadwood Historic District", "History fans, nightlife travelers", "Gold-rush buildings and Wild West stories define the town center.", "Historic Site"],
  ["South Dakota", "Hot Springs", -103.48, 43.43, "The Mammoth Site", "Families, fossil fans", "An active dig site preserves dozens of mammoth remains.", "Science"],
  ["South Dakota", "Wall", -102.241, 43.992, "Wall Drug", "Road trippers, families", "A legendary roadside stop mixes food, signs, shopping, and kitsch.", "Roadside"],
  ["South Dakota", "Sturgis", -103.425, 44.475, "Bear Butte State Park", "Hikers, culture travelers", "A sacred butte offers short climbs and broad prairie views.", "Nature"],
  ["South Dakota", "Chamberlain", -99.331, 43.808, "Dignity of Earth and Sky", "Road trippers, art lovers", "A striking sculpture honors Indigenous women above the Missouri River.", "Arts/Culture"],
  ["South Dakota", "Mitchell", -98.026, 43.714, "Corn Palace", "Families, roadside fans", "Changing corn murals turn a civic arena into a folk-art landmark.", "Roadside"],
  ["South Dakota", "Vermillion", -96.925, 42.786, "National Music Museum", "Music fans, families", "A deep instrument collection spans cultures and centuries.", "Museum"],
  ["South Dakota", "Rapid City", -103.059, 44.143, "South Dakota Air and Space Museum", "Aviation fans, families", "Aircraft and missile exhibits sit near Ellsworth Air Force Base.", "Museum"],
  ["South Dakota", "Sioux Falls", -96.598, 43.489, "Good Earth State Park", "Hikers, history travelers", "Prairie trails preserve an important Oneota cultural landscape.", "Nature"],
  ["South Dakota", "De Smet", -97.551, 44.386, "Ingalls Homestead", "Families, literature fans", "Hands-on pioneer activities connect to Laura Ingalls Wilder history.", "Living History"],
  ["South Dakota", "Custer", -103.564, 43.846, "Sylvan Lake", "Families, hikers, photographers", "Granite formations and clear water make a photogenic Black Hills stop.", "Nature"],
  ["South Dakota", "Yankton", -97.48, 42.867, "Lewis and Clark Recreation Area", "Boaters, campers, families", "Missouri River reservoir recreation adds beaches, camping, and water sports.", "Waterfront"],

  ["Montana", "West Glacier", -113.718, 48.759, "Glacier National Park", "Hikers, photographers, families", "Alpine lakes, wildlife, and rugged peaks create a premier national park.", "National Park"],
  ["Montana", "Logan Pass", -113.718, 48.696, "Going-to-the-Sun Road", "Scenic drivers, photographers", "A famous mountain road crosses Glacier's dramatic alpine terrain.", "Scenic Drive"],
  ["Montana", "West Glacier", -113.995, 48.61, "Lake McDonald", "Families, photographers, paddlers", "Clear water, colored stones, and mountain views define the west side.", "Nature"],
  ["Montana", "Bozeman", -111.039, 45.658, "Museum of the Rockies", "Families, dinosaur fans", "Major dinosaur fossils and regional history make it a standout museum.", "Museum"],
  ["Montana", "Crow Agency", -107.427, 45.57, "Little Bighorn Battlefield National Monument", "History travelers, students", "The battlefield interprets a consequential Plains conflict from multiple perspectives.", "Historic Site"],
  ["Montana", "West Yellowstone", -111.104, 44.662, "Grizzly and Wolf Discovery Center", "Families, wildlife fans", "Up-close wildlife education complements a Yellowstone gateway visit.", "Wildlife"],
  ["Montana", "Whitehall", -111.868, 45.838, "Lewis and Clark Caverns State Park", "Families, cave fans", "Guided cave tours and hillside trails make a strong detour.", "Cave"],
  ["Montana", "Red Lodge", -109.413, 45.019, "Beartooth Highway", "Scenic drivers, motorcyclists, photographers", "High alpine switchbacks and views create one of America's great drives.", "Scenic Drive"],
  ["Montana", "Big Sky", -111.401, 45.285, "Big Sky Resort", "Skiers, mountain bikers, families", "Large-mountain terrain gives winter and summer travelers a resort base.", "Resort"],
  ["Montana", "Helena", -112.018, 46.586, "Montana State Capitol", "Architecture fans, history travelers", "Murals, civic architecture, and Helena history make an easy stop.", "Architecture"],
  ["Montana", "Helena", -111.943, 46.743, "Gates of the Mountains", "Boaters, photographers, history fans", "Missouri River canyon boat tours follow Lewis and Clark scenery.", "Waterfront"],
  ["Montana", "Arlee", -114.079, 47.171, "Garden of One Thousand Buddhas", "Culture travelers, photographers", "A peaceful sculpture garden rises unexpectedly in the Jocko Valley.", "Cultural Site"],
  ["Montana", "Great Falls", -111.292, 47.511, "C.M. Russell Museum", "Art lovers, western-history fans", "Western art and Russell's studio illuminate Montana's visual heritage.", "Museum"],
  ["Montana", "Virginia City", -111.946, 45.294, "Virginia City and Nevada City", "History travelers, families", "Preserved gold-rush streets make an atmospheric living-history stop.", "Historic Site"],
  ["Montana", "Whitefish", -114.356, 48.481, "Whitefish Mountain Resort", "Skiers, hikers, families", "Mountain recreation pairs with a lively town near Glacier.", "Resort"],
  ["Montana", "Glendive", -104.718, 47.069, "Makoshika State Park", "Hikers, fossil fans, photographers", "Badlands formations and dinosaur fossils fill Montana's largest state park.", "Nature"],
  ["Montana", "Fort Smith", -107.969, 45.315, "Bighorn Canyon National Recreation Area", "Boaters, hikers, photographers", "Canyon walls and reservoir views create a quieter western landscape.", "Nature"],
  ["Montana", "Deer Lodge", -112.738, 46.408, "Grant-Kohrs Ranch National Historic Site", "History travelers, families", "A working ranch landscape preserves open-range cattle history.", "Historic Site"],
  ["Montana", "Moiese", -114.306, 47.343, "Bison Range", "Wildlife watchers, families", "A scenic wildlife drive offers bison, elk, pronghorn, and mountain views.", "Wildlife"],
  ["Montana", "Livingston", -110.561, 45.661, "Yellowstone Gateway Museum", "History travelers, road trippers", "Local collections add context for Yellowstone gateway towns and rail travel.", "Museum"],

  ["Wyoming", "Yellowstone", -110.829, 44.461, "Old Faithful", "Families, first-time visitors", "A reliable geyser eruption makes Yellowstone's geothermal story immediate.", "National Park"],
  ["Wyoming", "Yellowstone", -110.838, 44.525, "Grand Prismatic Spring", "Photographers, families", "Bright microbial colors create one of Yellowstone's signature sights.", "National Park"],
  ["Wyoming", "Yellowstone", -110.485, 44.719, "Grand Canyon of the Yellowstone", "Photographers, hikers", "Waterfalls and yellow canyon walls create dramatic viewpoints.", "National Park"],
  ["Wyoming", "Moose", -110.705, 43.79, "Grand Teton National Park", "Hikers, photographers, families", "Sharp peaks rise above lakes, meadows, and wildlife habitat.", "National Park"],
  ["Wyoming", "Moose", -110.726, 43.754, "Jenny Lake", "Families, hikers, paddlers", "Boat shuttles and trails give close access to Teton scenery.", "Nature"],
  ["Wyoming", "Devils Tower", -104.715, 44.591, "Devils Tower National Monument", "Climbers, families, photographers", "A striking geologic tower rises above prairie and pine forest.", "National Monument"],
  ["Wyoming", "Cody", -109.057, 44.526, "Buffalo Bill Center of the West", "History fans, families, art lovers", "Five museums explore western art, firearms, Plains cultures, and Cody history.", "Museum"],
  ["Wyoming", "Teton Village", -110.827, 43.588, "Jackson Hole Aerial Tram", "Skiers, hikers, photographers", "A steep tram ride gives fast access to high-mountain views.", "Resort"],
  ["Wyoming", "Jackson", -110.738, 43.501, "National Elk Refuge", "Wildlife watchers, families", "Seasonal elk viewing and sleigh rides sit right beside Jackson.", "Wildlife"],
  ["Wyoming", "Thermopolis", -108.203, 43.65, "Hot Springs State Park", "Families, spa travelers", "Mineral terraces and public soaking pools make a relaxed stop.", "Nature"],
  ["Wyoming", "Kemmerer", -110.763, 41.856, "Fossil Butte National Monument", "Fossil fans, families", "Ancient lake fossils preserve fish, plants, and insects in fine detail.", "National Monument"],
  ["Wyoming", "Fort Laramie", -104.558, 42.213, "Fort Laramie National Historic Site", "History travelers, families", "A major Plains fort interprets migration, trade, and military history.", "Historic Site"],
  ["Wyoming", "Lovell", -108.203, 44.817, "Bighorn Canyon National Recreation Area", "Boaters, hikers, photographers", "Reservoir views and canyon walls make a quiet scenic alternative.", "Nature"],
  ["Wyoming", "Green River", -109.423, 41.0, "Flaming Gorge National Recreation Area", "Boaters, anglers, scenic drivers", "Red canyon walls and reservoir recreation span the Utah-Wyoming border.", "Waterfront"],
  ["Wyoming", "Cheyenne", -104.815, 41.132, "Cheyenne Depot Museum", "Rail fans, history travelers", "A restored depot explains railroad power in Wyoming's capital.", "Museum"],
  ["Wyoming", "Thermopolis", -108.207, 43.647, "Wyoming Dinosaur Center", "Families, fossil fans", "Dinosaur skeletons and dig-site tours make paleontology hands-on.", "Science"],
  ["Wyoming", "Lander", -108.8, 42.743, "Sinks Canyon State Park", "Hikers, families, geology fans", "A river disappears underground and reemerges down canyon.", "Nature"],
  ["Wyoming", "Laramie", -105.377, 41.156, "Vedauwoo Recreation Area", "Climbers, hikers, photographers", "Granite outcrops make a memorable stop near I-80.", "Nature"],
  ["Wyoming", "Lovell", -107.921, 44.826, "Medicine Wheel National Historic Landmark", "Culture travelers, hikers", "A sacred high-elevation stone site invites respectful reflection.", "Historic Site"],
  ["Wyoming", "Centennial", -106.268, 41.342, "Snowy Range Scenic Byway", "Scenic drivers, hikers, photographers", "Alpine lakes and peaks offer a beautiful southern Wyoming drive.", "Scenic Drive"],

  ["Idaho", "Stanley", -114.925, 44.215, "Sawtooth National Recreation Area", "Hikers, campers, photographers", "Jagged peaks and alpine lakes make Idaho's mountain signature.", "Nature"],
  ["Idaho", "Arco", -113.517, 43.416, "Craters of the Moon National Monument", "Families, geology fans", "Lava fields, cones, and caves create a stark volcanic landscape.", "National Monument"],
  ["Idaho", "Twin Falls", -114.401, 42.595, "Shoshone Falls", "Families, photographers", "A broad Snake River waterfall earns the nickname Niagara of the West.", "Nature"],
  ["Idaho", "Riggins", -116.699, 45.55, "Hells Canyon", "Boaters, scenic drivers, adventure travelers", "North America's deepest river gorge delivers dramatic views and rafting.", "Nature"],
  ["Idaho", "Coeur d'Alene", -116.78, 47.677, "Lake Coeur d'Alene", "Families, boaters, couples", "Lakefront paths, boating, and mountain views make a polished stop.", "Waterfront"],
  ["Idaho", "Boise", -116.203, 43.615, "Boise River Greenbelt", "Cyclists, walkers, families", "A leafy river path connects parks, downtown, and neighborhoods.", "Trail"],
  ["Idaho", "Boise", -116.162, 43.602, "Old Idaho Penitentiary", "History fans, families", "Cell blocks and exhibits tell prison, crime, and state history.", "Historic Site"],
  ["Idaho", "Boise", -116.16, 43.6, "Idaho Botanical Garden", "Garden lovers, families", "Dry-climate gardens and seasonal events fill a foothills setting.", "Garden"],
  ["Idaho", "Sun Valley", -114.351, 43.697, "Sun Valley Resort", "Skiers, golfers, couples", "A historic mountain resort anchors skiing, skating, and summer recreation.", "Resort"],
  ["Idaho", "Almo", -113.712, 42.078, "City of Rocks National Reserve", "Climbers, campers, photographers", "Granite spires create one of the West's most distinctive climbing landscapes.", "Nature"],
  ["Idaho", "Bruneau", -115.693, 42.91, "Bruneau Dunes State Park", "Families, sandboarders, stargazers", "Tall dunes, camping, and observatory programs make a unique stop.", "Nature"],
  ["Idaho", "Ashton", -111.333, 44.175, "Mesa Falls", "Families, photographers", "Powerful waterfalls sit in forested country near the Teton route.", "Nature"],
  ["Idaho", "Hagerman", -114.878, 42.811, "Thousand Springs State Park", "Scenic drivers, kayakers, families", "Springs and waterfalls pour from canyon walls into the Snake River.", "Nature"],
  ["Idaho", "Athol", -116.705, 47.909, "Silverwood Theme Park", "Families, thrill seekers", "The Northwest's largest theme park combines coasters and water rides.", "Theme Park"],
  ["Idaho", "Boise", -116.253, 43.564, "World Center for Birds of Prey", "Birders, families", "Raptor exhibits and conservation programs focus on birds of prey.", "Wildlife"],
  ["Idaho", "Lava Hot Springs", -112.011, 42.62, "Lava Hot Springs", "Families, spa travelers", "Hot pools, river tubing, and small-town ease make a relaxing detour.", "Water Park"],
  ["Idaho", "Riggins", -116.315, 45.422, "Salmon River", "Rafters, anglers, adventure travelers", "The River of No Return country is a classic rafting corridor.", "Waterfront"],
  ["Idaho", "Athol", -116.58, 47.969, "Farragut State Park", "Campers, families, lake travelers", "Lake Pend Oreille access and trails fill a former naval training site.", "Nature"],
  ["Idaho", "Lowman", -115.596, 44.072, "Kirkham Hot Springs", "Road trippers, nature lovers", "Roadside mineral pools sit beside the South Fork Payette River.", "Nature"],
  ["Idaho", "Wallace", -115.927, 47.474, "Wallace Historic District", "History fans, road trippers", "A preserved mining town adds character near the Bitterroot route.", "Historic Site"],

  ["Washington", "Port Angeles", -123.604, 47.969, "Olympic National Park", "Hikers, families, photographers", "Rain forest, mountains, and wild coastlines fit one national park.", "National Park"],
  ["Washington", "Ashford", -121.76, 46.852, "Mount Rainier National Park", "Hikers, photographers, families", "A glaciated volcano dominates meadows, forests, and scenic drives.", "National Park"],
  ["Washington", "Marblemount", -121.298, 48.771, "North Cascades National Park", "Hikers, scenic drivers, photographers", "Steep peaks and turquoise lakes create rugged alpine scenery.", "National Park"],
  ["Washington", "Seattle", -122.342, 47.609, "Pike Place Market", "Food lovers, first-time visitors", "Historic market stalls, seafood, flowers, and views define Seattle flavor.", "Food/Market"],
  ["Washington", "Seattle", -122.349, 47.62, "Space Needle", "First-time visitors, photographers", "Observation decks frame Seattle, Puget Sound, and mountain views.", "Observation"],
  ["Washington", "Seattle", -122.348, 47.621, "Museum of Pop Culture", "Music fans, film fans, families", "Immersive exhibits cover music, sci-fi, games, and pop culture.", "Museum"],
  ["Washington", "Seattle", -122.35, 47.62, "Chihuly Garden and Glass", "Art lovers, photographers", "Colorful glass installations glow against gardens and city architecture.", "Arts/Culture"],
  ["Washington", "Friday Harbor", -123.02, 48.535, "San Juan Islands", "Whale watchers, cyclists, couples", "Ferries link islands known for wildlife, sea kayaking, and quiet towns.", "Island"],
  ["Washington", "Leavenworth", -120.661, 47.596, "Leavenworth", "Families, couples, scenic drivers", "A Bavarian-style mountain town pairs festivals with Cascade scenery.", "Scenic Town"],
  ["Washington", "Toutle", -122.188, 46.276, "Mount St. Helens National Volcanic Monument", "Science fans, hikers, families", "Volcanic blast landscapes make geology visible on a large scale.", "National Monument"],
  ["Washington", "Stevenson", -121.927, 45.694, "Columbia River Gorge", "Scenic drivers, hikers, photographers", "River cliffs, wind sports, and viewpoints line the Washington-Oregon border.", "Scenic Region"],
  ["Washington", "Snoqualmie", -121.837, 47.541, "Snoqualmie Falls", "Families, photographers", "A high waterfall and easy viewpoints make a quick Seattle-area escape.", "Nature"],
  ["Washington", "Washtucna", -118.223, 46.663, "Palouse Falls State Park", "Photographers, scenic drivers", "A dramatic waterfall drops into a basalt canyon in eastern Washington.", "Nature"],
  ["Washington", "Forks", -123.933, 47.86, "Hoh Rain Forest", "Hikers, photographers, families", "Mossy old-growth forest shows Olympic's wet coastal ecosystem.", "Nature"],
  ["Washington", "Chelan", -120.029, 47.84, "Lake Chelan", "Families, boaters, wine travelers", "A long clear lake supports boating, beaches, and nearby wineries.", "Waterfront"],
  ["Washington", "Mukilteo", -122.303, 47.923, "Boeing Future of Flight", "Aviation fans, families", "Factory-focused exhibits explain large-aircraft manufacturing.", "Museum"],
  ["Washington", "Seattle", -122.338, 47.607, "Seattle Art Museum", "Art lovers, city explorers", "Global collections sit steps from downtown hotels and Pike Place.", "Museum"],
  ["Washington", "Oak Harbor", -122.642, 48.406, "Deception Pass State Park", "Families, hikers, photographers", "Bridges, cliffs, beaches, and tidewater views make a strong island stop.", "Nature"],
  ["Washington", "Walla Walla", -118.343, 46.067, "Walla Walla Wine Country", "Adults, food lovers, couples", "Tasting rooms and vineyards make a relaxed eastern Washington stay.", "Food/Drink"],
  ["Washington", "Vancouver", -122.671, 45.626, "Fort Vancouver National Historic Site", "History travelers, families", "Reconstructed fur-trade and military sites explain Columbia River history.", "Historic Site"],

  ["Oregon", "Crater Lake", -122.168, 42.944, "Crater Lake National Park", "Scenic drivers, hikers, photographers", "A deep blue volcanic lake is Oregon's only national park.", "National Park"],
  ["Oregon", "Corbett", -122.115, 45.576, "Multnomah Falls and Columbia River Gorge", "Families, hikers, photographers", "A tall waterfall and gorge viewpoints sit close to Portland.", "Nature"],
  ["Oregon", "Cannon Beach", -123.961, 45.891, "Cannon Beach and Haystack Rock", "Families, photographers, couples", "A scenic beach and sea stack define the north Oregon Coast.", "Beach"],
  ["Oregon", "Portland", -122.682, 45.524, "Powell's City of Books", "Book lovers, city explorers", "A huge independent bookstore turns browsing into a destination.", "Shopping"],
  ["Oregon", "Portland", -122.709, 45.518, "Portland Japanese Garden", "Garden lovers, photographers", "Carefully designed gardens overlook Portland and Mount Hood.", "Garden"],
  ["Oregon", "Newport", -124.052, 44.625, "Oregon Coast Aquarium", "Families, marine-life fans", "Coastal habitats and marine exhibits make Newport a family anchor.", "Zoo/Aquarium"],
  ["Oregon", "Silverton", -122.655, 44.877, "Silver Falls State Park", "Hikers, families, waterfall fans", "The Trail of Ten Falls passes behind and beside multiple waterfalls.", "Nature"],
  ["Oregon", "Government Camp", -121.711, 45.331, "Timberline Lodge and Mount Hood", "Skiers, architecture fans, scenic drivers", "Historic lodge architecture sits high on Oregon's signature mountain.", "Architecture"],
  ["Oregon", "Mitchell", -120.265, 44.659, "Painted Hills", "Photographers, geology fans", "Color-banded hills create one of Oregon's most unusual landscapes.", "Nature"],
  ["Oregon", "Terrebonne", -121.14, 44.368, "Smith Rock State Park", "Climbers, hikers, photographers", "Tuff cliffs and river trails make a Central Oregon landmark.", "Nature"],
  ["Oregon", "Ashland", -122.717, 42.193, "Oregon Shakespeare Festival", "Theater lovers, couples", "A major repertory theater anchors Ashland's cultural scene.", "Arts/Culture"],
  ["Oregon", "Astoria", -123.832, 46.188, "Columbia River Maritime Museum", "History fans, families", "Exhibits explain shipwrecks, pilots, and the Columbia River bar.", "Museum"],
  ["Oregon", "McMinnville", -123.146, 45.204, "Evergreen Aviation and Space Museum", "Aviation fans, families", "The Spruce Goose and aerospace exhibits create a large museum visit.", "Museum"],
  ["Oregon", "Cave Junction", -123.407, 42.101, "Oregon Caves National Monument", "Cave fans, families", "Guided marble cave tours pair with forested Siskiyou scenery.", "National Monument"],
  ["Oregon", "Bend", -121.247, 43.722, "Newberry National Volcanic Monument", "Hikers, geology fans, families", "Lava flows, lakes, and obsidian fields show recent volcanic activity.", "National Monument"],
  ["Oregon", "Kimberly", -119.646, 44.548, "John Day Fossil Beds National Monument", "Fossil fans, photographers", "Colorful formations preserve a long record of ancient plants and animals.", "National Monument"],
  ["Oregon", "Bend", -121.333, 44.017, "High Desert Museum", "Families, culture travelers", "Wildlife, history, and art explain the High Desert region.", "Museum"],
  ["Oregon", "Astoria", -123.819, 46.181, "Astoria Column", "Families, photographers", "A hilltop tower gives broad Columbia River and coastal views.", "Landmark"],
  ["Oregon", "Portland", -122.715, 45.51, "Oregon Zoo and Washington Park", "Families, garden lovers", "Zoo, gardens, trails, and museums cluster in Portland's west hills.", "Zoo/Aquarium"],
  ["Oregon", "Joseph", -117.211, 45.345, "Wallowa Lake and Hells Canyon Overlook", "Scenic drivers, hikers, families", "Alpine lake scenery and canyon viewpoints showcase far northeast Oregon.", "Nature"],
];

const mainlandExpansionAttractions = [
  ["Alabama", "Birmingham", -86.814, 33.516, "Birmingham Civil Rights Institute", "History travelers, students, families", "Powerful exhibits and nearby landmarks make civil-rights history tangible.", "Museum"],
  ["Alabama", "Huntsville", -86.655, 34.711, "U.S. Space and Rocket Center", "Families, science fans", "Rockets, spacecraft, and simulators anchor a major space-history stop.", "Science"],
  ["Alabama", "Gulf Shores", -87.653, 30.246, "Gulf State Park", "Beachgoers, families, cyclists", "White-sand beaches, trails, and coastal habitats create a full Gulf Coast stop.", "Beach"],

  ["Arizona", "Grand Canyon Village", -112.112, 36.057, "Grand Canyon National Park", "First-time visitors, hikers, photographers", "Immense canyon overlooks and trails define one of America's signature landscapes.", "National Park"],
  ["Arizona", "Sedona", -111.761, 34.869, "Sedona Red Rock Country", "Hikers, photographers, couples", "Red-rock buttes, trails, and desert light make a memorable scenic base.", "Nature"],
  ["Arizona", "Page", -111.502, 36.862, "Horseshoe Bend", "Photographers, road trippers", "A short walk reaches a dramatic Colorado River overlook.", "Scenic Overlook"],

  ["Arkansas", "Hot Springs", -93.054, 34.514, "Hot Springs National Park", "History travelers, spa fans, families", "Historic bathhouses and forested trails combine city and park experiences.", "National Park"],
  ["Arkansas", "Eureka Springs", -93.739, 36.401, "Thorncrown Chapel", "Architecture fans, couples, scenic drivers", "A glass-and-wood chapel sits quietly in the Ozark forest.", "Architecture"],
  ["Arkansas", "Murfreesboro", -93.676, 34.032, "Crater of Diamonds State Park", "Families, geology fans", "Visitors can search an open field for diamonds and keep what they find.", "Nature"],

  ["California", "Yosemite Valley", -119.593, 37.745, "Yosemite National Park", "Hikers, photographers, families", "Granite cliffs, waterfalls, and giant sequoias make a classic Sierra stop.", "National Park"],
  ["California", "San Francisco", -122.478, 37.819, "Golden Gate Bridge", "First-time visitors, walkers, photographers", "The landmark bridge frames bay, city, and coastal views.", "Landmark"],
  ["California", "Monterey", -121.901, 36.618, "Monterey Bay Aquarium", "Families, marine-life fans", "World-class marine exhibits connect visitors to Pacific Ocean ecology.", "Zoo/Aquarium"],

  ["Colorado", "Estes Park", -105.683, 40.343, "Rocky Mountain National Park", "Hikers, wildlife watchers, scenic drivers", "Alpine roads, lakes, and wildlife make a high-country centerpiece.", "National Park"],
  ["Colorado", "Colorado Springs", -104.88, 38.878, "Garden of the Gods", "Families, hikers, photographers", "Red sandstone formations rise dramatically against Front Range peaks.", "Nature"],
  ["Colorado", "Mesa Verde", -108.462, 37.231, "Mesa Verde National Park", "History travelers, families", "Cliff dwellings preserve extraordinary Ancestral Puebloan architecture.", "National Park"],

  ["Connecticut", "Mystic", -71.963, 41.356, "Mystic Seaport Museum", "Families, maritime-history fans", "Historic ships and waterfront exhibits tell New England maritime stories.", "Museum"],
  ["Connecticut", "New Haven", -72.931, 41.309, "Yale University Art Gallery", "Art lovers, college-town travelers", "A major free art collection anchors a walkable campus visit.", "Museum"],
  ["Connecticut", "East Haddam", -72.344, 41.452, "Gillette Castle State Park", "Families, architecture fans", "A quirky stone castle overlooks the Connecticut River valley.", "Historic Site"],

  ["Delaware", "Rehoboth Beach", -75.077, 38.716, "Rehoboth Beach Boardwalk", "Beachgoers, families, food lovers", "A classic beach boardwalk mixes sand, shops, arcades, and dining.", "Beach"],
  ["Delaware", "Wilmington", -75.609, 39.803, "Nemours Estate", "Garden lovers, architecture fans", "A grand mansion and formal gardens create an elegant Brandywine Valley stop.", "Historic Site"],
  ["Delaware", "Lewes", -75.119, 38.782, "Cape Henlopen State Park", "Beachgoers, birders, cyclists", "Atlantic beaches, dunes, trails, and wartime history fill a coastal park.", "Nature"],

  ["Florida", "Homestead", -80.899, 25.286, "Everglades National Park", "Wildlife watchers, families, paddlers", "Wetlands, mangroves, birds, and alligators create a unique subtropical park.", "National Park"],
  ["Florida", "Orlando", -81.549, 28.418, "Walt Disney World Resort", "Families, theme-park fans", "Large-scale themed parks and resorts make Orlando a major family destination.", "Theme Park"],
  ["Florida", "St. Augustine", -81.312, 29.898, "Castillo de San Marcos National Monument", "History travelers, families", "A Spanish stone fort anchors the oldest European-founded city in the continental U.S.", "National Monument"],

  ["Georgia", "Atlanta", -84.393, 33.763, "Georgia Aquarium", "Families, animal lovers", "Large marine habitats and whale sharks make a major downtown family stop.", "Zoo/Aquarium"],
  ["Georgia", "Savannah", -81.094, 32.08, "Savannah Historic District", "History travelers, walkers, couples", "Squares, live oaks, architecture, and riverfront streets reward slow exploring.", "Historic Site"],
  ["Georgia", "Atlanta", -84.373, 33.756, "Martin Luther King Jr. National Historical Park", "History travelers, students", "Historic buildings connect King's life and the civil-rights movement to place.", "National Park"],

  ["Kansas", "Cottonwood Falls", -96.577, 38.44, "Tallgrass Prairie National Preserve", "Hikers, wildlife watchers, photographers", "Open prairie, bison, and ranch history preserve a rare grassland landscape.", "National Preserve"],
  ["Kansas", "Hutchinson", -97.922, 38.065, "Cosmosphere", "Families, space-history fans", "Spacecraft, rockets, and Cold War artifacts create a substantial science stop.", "Science"],
  ["Kansas", "Lindsborg", -97.674, 38.573, "Lindsborg and Coronado Heights", "Culture travelers, scenic drivers", "Swedish heritage and a hilltop castle overlook central Kansas farmland.", "Scenic Town"],

  ["Kentucky", "Mammoth Cave", -86.101, 37.187, "Mammoth Cave National Park", "Families, cave fans, hikers", "The world's longest known cave system pairs guided tours with forest trails.", "National Park"],
  ["Kentucky", "Louisville", -85.764, 38.257, "Louisville Slugger Museum and Factory", "Baseball fans, families", "Bat-making tours and baseball artifacts create an easy downtown stop.", "Museum"],
  ["Kentucky", "Lexington", -84.604, 38.149, "Kentucky Horse Park", "Families, horse lovers", "Museums, shows, and barns explain the state's horse culture.", "Museum"],

  ["Louisiana", "New Orleans", -90.063, 29.958, "French Quarter", "Music lovers, food lovers, first-time visitors", "Historic streets, live music, food, and architecture define New Orleans.", "Historic Site"],
  ["Louisiana", "Vacherie", -90.776, 30.005, "Oak Alley Plantation", "History travelers, architecture fans", "A famous oak-lined approach frames a complex plantation-history site.", "Historic Site"],
  ["Louisiana", "Lafayette", -92.019, 30.21, "Vermilionville Historic Village", "Culture travelers, families", "Living-history exhibits present Cajun, Creole, and Native American traditions.", "Living History"],

  ["Maine", "Bar Harbor", -68.209, 44.338, "Acadia National Park", "Hikers, families, photographers", "Rocky coast, carriage roads, mountains, and ocean views define coastal Maine.", "National Park"],
  ["Maine", "Portland", -70.228, 43.623, "Portland Head Light", "Photographers, history travelers, families", "A classic lighthouse overlooks Casco Bay from a rocky park.", "Historic Site"],
  ["Maine", "Camden", -69.065, 44.21, "Camden Hills State Park", "Hikers, scenic drivers", "Mount Battie views sweep over harbor islands and Penobscot Bay.", "Nature"],

  ["Maryland", "Baltimore", -76.619, 39.285, "National Aquarium", "Families, marine-life fans", "Harborfront exhibits and aquatic habitats anchor Baltimore's Inner Harbor.", "Zoo/Aquarium"],
  ["Maryland", "Sharpsburg", -77.739, 39.476, "Antietam National Battlefield", "History travelers, students", "Preserved battlefield landscapes interpret a pivotal Civil War day.", "National Battlefield"],
  ["Maryland", "Ocean City", -75.087, 38.333, "Ocean City Boardwalk", "Beachgoers, families", "Beach, amusements, food, and arcades create a classic Atlantic resort stop.", "Beach"],

  ["Massachusetts", "Boston", -71.057, 42.359, "Freedom Trail", "History travelers, families, walkers", "A walkable route links many Revolutionary-era landmarks in central Boston.", "Historic Site"],
  ["Massachusetts", "Stockbridge", -73.336, 42.283, "Norman Rockwell Museum", "Art lovers, families", "Illustration collections and studio context illuminate a beloved American artist.", "Museum"],
  ["Massachusetts", "Provincetown", -70.178, 42.049, "Cape Cod National Seashore", "Beachgoers, cyclists, photographers", "Ocean beaches, dunes, lighthouses, and villages shape the outer Cape.", "National Seashore"],

  ["Mississippi", "Biloxi", -88.885, 30.396, "Biloxi Lighthouse and Beach", "Beachgoers, families, photographers", "A Gulf Coast lighthouse and beach make an easy coastal landmark.", "Historic Site"],
  ["Mississippi", "Jackson", -90.178, 32.298, "Mississippi Civil Rights Museum", "History travelers, students", "Strong exhibits trace the state's civil-rights struggles and leaders.", "Museum"],
  ["Mississippi", "Tupelo", -88.719, 34.259, "Elvis Presley Birthplace", "Music fans, families", "A modest birthplace site connects Elvis history to north Mississippi.", "Historic Site"],

  ["Missouri", "St. Louis", -90.184, 38.624, "Gateway Arch National Park", "Families, architecture fans, history travelers", "The soaring arch and museum mark westward expansion on the Mississippi.", "National Park"],
  ["Missouri", "Kansas City", -94.587, 39.081, "National WWI Museum and Memorial", "History travelers, families", "Comprehensive exhibits and skyline views create a powerful museum visit.", "Museum"],
  ["Missouri", "Branson", -93.338, 36.667, "Silver Dollar City", "Families, thrill seekers", "Coasters, crafts, shows, and Ozark theming make a major amusement stop.", "Theme Park"],

  ["Nevada", "Boulder City", -114.737, 36.016, "Hoover Dam", "Engineering fans, families", "Massive concrete engineering and Colorado River views make a classic stop.", "Engineering"],
  ["Nevada", "Las Vegas", -115.175, 36.114, "Las Vegas Strip", "Entertainment travelers, food lovers, architecture fans", "Resorts, shows, public art, and themed architecture create a dense urban spectacle.", "Entertainment"],
  ["Nevada", "Baker", -114.257, 38.984, "Great Basin National Park", "Hikers, cave fans, stargazers", "Bristlecone pines, alpine terrain, caves, and dark skies reward a remote detour.", "National Park"],

  ["New Hampshire", "Lincoln", -71.686, 44.054, "Kancamagus Highway", "Scenic drivers, leaf peepers, photographers", "Mountain roads, river stops, and fall color define a White Mountains drive.", "Scenic Drive"],
  ["New Hampshire", "Franconia", -71.682, 44.161, "Franconia Notch State Park", "Hikers, families, photographers", "A mountain pass links trails, cliffs, lakes, and aerial tram views.", "Nature"],
  ["New Hampshire", "Portsmouth", -70.754, 43.076, "Strawbery Banke Museum", "History travelers, families", "Preserved houses interpret centuries of coastal New Hampshire life.", "Living History"],

  ["New Jersey", "Jersey City", -74.044, 40.69, "Liberty State Park", "Families, skyline watchers, walkers", "Harbor views frame Manhattan, Ellis Island, and the Statue of Liberty.", "Urban Park"],
  ["New Jersey", "Cape May", -74.922, 38.935, "Cape May Historic District", "Beachgoers, architecture fans, couples", "Victorian streets, beaches, and lighthouse views create a polished shore stop.", "Historic Site"],
  ["New Jersey", "Princeton", -74.667, 40.349, "Princeton University Art Museum and Campus", "Art lovers, architecture fans", "Campus walks and collections make Princeton a compact cultural stop.", "Museum"],

  ["New Mexico", "Carlsbad", -104.553, 32.148, "Carlsbad Caverns National Park", "Cave fans, families, photographers", "Huge limestone chambers and bat flights create a dramatic underground visit.", "National Park"],
  ["New Mexico", "Santa Fe", -105.938, 35.688, "Santa Fe Plaza and Palace of the Governors", "Art lovers, history travelers, food lovers", "Historic adobe architecture, museums, galleries, and food anchor downtown Santa Fe.", "Historic Site"],
  ["New Mexico", "Alamogordo", -106.171, 32.779, "White Sands National Park", "Families, photographers, hikers", "Wave-like gypsum dunes create a bright and unusual desert landscape.", "National Park"],

  ["North Carolina", "Asheville", -82.552, 35.54, "Biltmore Estate", "Architecture fans, garden lovers, families", "A grand mansion, gardens, and mountain setting anchor Asheville touring.", "Historic Site"],
  ["North Carolina", "Manteo", -75.67, 35.936, "Outer Banks and Cape Hatteras National Seashore", "Beachgoers, lighthouse fans, families", "Barrier islands, lighthouses, and Atlantic beaches define the coast.", "National Seashore"],
  ["North Carolina", "Bryson City", -83.489, 35.602, "Great Smoky Mountains National Park", "Hikers, families, wildlife watchers", "Forests, waterfalls, and mountain roads fill America's most visited national park.", "National Park"],

  ["Oklahoma", "Oklahoma City", -97.517, 35.473, "Oklahoma City National Memorial and Museum", "History travelers, families", "A reflective memorial and museum honor victims and explain the 1995 bombing.", "Memorial"],
  ["Oklahoma", "Tulsa", -95.965, 36.136, "Philbrook Museum of Art", "Art lovers, garden lovers", "An Italianate villa, gardens, and collections create a refined Tulsa stop.", "Museum"],
  ["Oklahoma", "Sulphur", -97.018, 34.496, "Chickasaw National Recreation Area", "Families, hikers, swimmers", "Springs, streams, trails, and lakes make a gentle outdoor destination.", "National Recreation Area"],

  ["Rhode Island", "Newport", -71.306, 41.469, "The Breakers", "Architecture fans, history travelers", "A Gilded Age mansion showcases Newport's grand seaside estate era.", "Historic Site"],
  ["Rhode Island", "Providence", -71.407, 41.826, "RISD Museum", "Art lovers, design travelers", "A strong art and design collection sits beside a creative city campus.", "Museum"],
  ["Rhode Island", "Narragansett", -71.455, 41.361, "Narragansett Town Beach", "Beachgoers, families, surfers", "A broad sandy beach gives Rhode Island a classic coastal stop.", "Beach"],

  ["South Carolina", "Charleston", -79.931, 32.776, "Charleston Historic District", "History travelers, food lovers, walkers", "Historic streets, harbor views, and architecture define a major Southern city.", "Historic Site"],
  ["South Carolina", "Hopkins", -80.78, 33.792, "Congaree National Park", "Hikers, paddlers, wildlife watchers", "Boardwalks and paddling routes explore old-growth bottomland forest.", "National Park"],
  ["South Carolina", "Myrtle Beach", -78.887, 33.689, "Myrtle Beach Boardwalk", "Beachgoers, families", "Beach, restaurants, arcades, and entertainment create a busy coastal resort stop.", "Beach"],

  ["Tennessee", "Gatlinburg", -83.508, 35.611, "Great Smoky Mountains National Park", "Hikers, families, wildlife watchers", "Mountain roads, trails, waterfalls, and wildlife anchor eastern Tennessee.", "National Park"],
  ["Tennessee", "Memphis", -90.023, 35.047, "Graceland", "Music fans, families", "Elvis Presley's home and exhibits make a major American music-history stop.", "Historic Site"],
  ["Tennessee", "Nashville", -86.778, 36.162, "Country Music Hall of Fame and Museum", "Music fans, culture travelers", "Artifacts, recordings, and exhibits tell country music's broad story.", "Museum"],

  ["Texas", "San Antonio", -98.486, 29.426, "The Alamo and San Antonio Missions", "History travelers, families", "Spanish colonial missions and river-city history anchor San Antonio.", "Historic Site"],
  ["Texas", "Big Bend", -103.25, 29.25, "Big Bend National Park", "Hikers, stargazers, scenic drivers", "Desert, mountains, canyons, and Rio Grande views reward a remote trip.", "National Park"],
  ["Texas", "Houston", -95.089, 29.551, "Space Center Houston", "Families, science fans", "NASA history, spacecraft, and mission exhibits make a substantial science stop.", "Science"],

  ["Utah", "Springdale", -112.989, 37.298, "Zion National Park", "Hikers, photographers, families", "Sandstone cliffs, canyon trails, and shuttle-access viewpoints define southern Utah.", "National Park"],
  ["Utah", "Moab", -109.593, 38.733, "Arches National Park", "Hikers, photographers, scenic drivers", "Natural arches and red-rock formations create a compact desert landmark.", "National Park"],
  ["Utah", "Bryce Canyon City", -112.187, 37.628, "Bryce Canyon National Park", "Photographers, hikers, families", "Hoodoo amphitheaters and rim walks make a vivid high-plateau stop.", "National Park"],

  ["Vermont", "Stowe", -72.702, 44.466, "Stowe Mountain Resort and Smugglers Notch", "Scenic drivers, skiers, hikers", "Mountain roads, village charm, and trails define a classic Vermont base.", "Resort"],
  ["Vermont", "Woodstock", -72.519, 43.632, "Marsh-Billings-Rockefeller National Historical Park", "History travelers, walkers", "Conservation history, trails, and village scenery combine in Woodstock.", "National Park"],
  ["Vermont", "Shelburne", -73.231, 44.374, "Shelburne Museum", "Families, art lovers, history travelers", "Buildings, folk art, design, and Americana form a wide-ranging museum campus.", "Museum"],

  ["Virginia", "Luray", -78.453, 38.664, "Shenandoah National Park", "Hikers, scenic drivers, wildlife watchers", "Skyline Drive, waterfalls, and Blue Ridge overlooks make a classic route.", "National Park"],
  ["Virginia", "Williamsburg", -76.707, 37.27, "Colonial Williamsburg", "History travelers, families", "Restored streets and interpreters bring colonial-era Virginia into focus.", "Living History"],
  ["Virginia", "Charlottesville", -78.452, 38.01, "Monticello", "History travelers, architecture fans", "Jefferson's mountaintop home offers architecture, gardens, and layered history.", "Historic Site"],

  ["West Virginia", "Glen Jean", -81.081, 37.927, "New River Gorge National Park and Preserve", "Hikers, rafters, scenic drivers", "A deep gorge, bridge views, trails, and whitewater anchor southern West Virginia.", "National Park"],
  ["West Virginia", "Davis", -79.469, 39.107, "Blackwater Falls State Park", "Waterfall fans, hikers, photographers", "Dark-water falls and canyon viewpoints make a mountain-state highlight.", "Nature"],
  ["West Virginia", "Harpers Ferry", -77.731, 39.326, "Harpers Ferry National Historical Park", "History travelers, hikers", "Historic streets sit at a dramatic river confluence and Appalachian Trail crossing.", "National Park"],
];

const mainlandExpansionAdditionalAttractions = compactAttractionRows([
  ["Alabama", "Montgomery", -86.308, 32.377, "National Memorial for Peace and Justice", "Memorial"],
  ["Alabama", "Montgomery", -86.303, 32.377, "Legacy Museum", "Museum"],
  ["Alabama", "Tuskegee", -85.679, 32.43, "Tuskegee Airmen National Historic Site", "National Historic Site"],
  ["Alabama", "Tuskegee", -85.71, 32.43, "Tuskegee Institute National Historic Site", "National Historic Site"],
  ["Alabama", "Mobile", -88.04, 30.681, "USS Alabama Battleship Memorial Park", "Museum"],
  ["Alabama", "Mobile", -88.043, 30.692, "Mobile Carnival Museum", "Museum"],
  ["Alabama", "Mobile", -88.158, 30.704, "Bellingrath Gardens and Home", "Garden"],
  ["Alabama", "Florence", -87.668, 34.793, "Frank Lloyd Wright Rosenbaum House", "Architecture"],
  ["Alabama", "Tuscumbia", -87.703, 34.731, "Ivy Green", "Historic Site"],
  ["Alabama", "Muscle Shoals", -87.667, 34.744, "Muscle Shoals Sound Studio", "Music"],
  ["Alabama", "Fort Payne", -85.618, 34.502, "Little River Canyon National Preserve", "National Preserve"],
  ["Alabama", "Mentone", -85.584, 34.547, "DeSoto State Park", "Nature"],
  ["Alabama", "Delta", -85.806, 33.485, "Cheaha State Park", "Nature"],
  ["Alabama", "Anniston", -85.821, 33.77, "Anniston Museum of Natural History", "Museum"],
  ["Alabama", "Birmingham", -86.791, 33.486, "Birmingham Botanical Gardens", "Garden"],
  ["Alabama", "Birmingham", -86.809, 33.521, "McWane Science Center", "Science"],
  ["Alabama", "Birmingham", -86.815, 33.521, "Alabama Theatre", "Architecture"],
  ["Alabama", "Birmingham", -86.814, 33.521, "16th Street Baptist Church", "Historic Site"],
  ["Alabama", "Huntsville", -86.585, 34.73, "Huntsville Botanical Garden", "Garden"],
  ["Alabama", "Huntsville", -86.586, 34.73, "Burritt on the Mountain", "Living History"],
  ["Alabama", "Huntsville", -86.588, 34.729, "Monte Sano State Park", "Nature"],
  ["Alabama", "Decatur", -86.987, 34.604, "Wheeler National Wildlife Refuge", "Wildlife"],
  ["Alabama", "Dauphin Island", -88.078, 30.251, "Dauphin Island Sea Lab Estuarium", "Zoo/Aquarium"],
  ["Alabama", "Dauphin Island", -88.112, 30.25, "Fort Gaines", "Historic Site"],
  ["Alabama", "Auburn", -85.486, 32.606, "Jule Collins Smith Museum of Fine Art", "Museum"],
  ["Alabama", "Moundville", -87.63, 33.0, "Moundville Archaeological Park", "Historic Site"],
  ["Alabama", "Eufaula", -85.148, 31.891, "Lakepoint State Park", "Nature"],

  ["Arizona", "Page", -111.374, 36.862, "Antelope Canyon", "Nature"],
  ["Arizona", "Tucson", -111.166, 32.296, "Saguaro National Park", "National Park"],
  ["Arizona", "Petrified Forest", -109.788, 35.065, "Petrified Forest National Park", "National Park"],
  ["Arizona", "Flagstaff", -111.511, 35.205, "Lowell Observatory", "Science"],
  ["Arizona", "Flagstaff", -111.502, 35.198, "Walnut Canyon National Monument", "National Monument"],
  ["Arizona", "Flagstaff", -111.836, 35.371, "Sunset Crater Volcano National Monument", "National Monument"],
  ["Arizona", "Camp Verde", -111.836, 34.612, "Montezuma Castle National Monument", "National Monument"],
  ["Arizona", "Williams", -112.19, 35.25, "Bearizona Wildlife Park", "Wildlife"],
  ["Arizona", "Tucson", -110.992, 32.244, "Arizona-Sonora Desert Museum", "Museum"],
  ["Arizona", "Tucson", -110.87, 32.221, "Pima Air and Space Museum", "Museum"],
  ["Arizona", "Tucson", -110.86, 32.128, "Mission San Xavier del Bac", "Historic Site"],
  ["Arizona", "Phoenix", -112.072, 33.448, "Desert Botanical Garden", "Garden"],
  ["Arizona", "Phoenix", -112.073, 33.448, "Heard Museum", "Museum"],
  ["Arizona", "Phoenix", -112.073, 33.449, "Musical Instrument Museum", "Museum"],
  ["Arizona", "Scottsdale", -111.844, 33.494, "Taliesin West", "Architecture"],
  ["Arizona", "Apache Junction", -111.475, 33.459, "Lost Dutchman State Park", "Nature"],
  ["Arizona", "Bisbee", -109.929, 31.449, "Bisbee Historic District", "Scenic Town"],
  ["Arizona", "Tombstone", -110.067, 31.713, "Tombstone Historic District", "Historic Site"],
  ["Arizona", "Winslow", -110.165, 35.024, "Meteor Crater Natural Landmark", "Nature"],
  ["Arizona", "Lake Havasu City", -114.342, 34.483, "London Bridge", "Landmark"],
  ["Arizona", "Cottonwood", -112.027, 34.753, "Tuzigoot National Monument", "National Monument"],
  ["Arizona", "Chinle", -109.471, 36.154, "Canyon de Chelly National Monument", "National Monument"],
  ["Arizona", "Globe", -110.771, 33.284, "Tonto National Monument", "National Monument"],
  ["Arizona", "Willcox", -109.39, 32.012, "Chiricahua National Monument", "National Monument"],
  ["Arizona", "Oracle", -110.757, 32.61, "Biosphere 2", "Science"],
  ["Arizona", "Prescott", -112.468, 34.54, "Watson Lake", "Nature"],
  ["Arizona", "Jerome", -112.114, 34.748, "Jerome State Historic Park", "Historic Site"],

  ["Arkansas", "Ponca", -93.401, 36.022, "Buffalo National River", "National River"],
  ["Arkansas", "Little Rock", -92.299, 34.747, "Little Rock Central High School National Historic Site", "National Historic Site"],
  ["Arkansas", "Little Rock", -92.304, 34.746, "William J. Clinton Presidential Library", "Museum"],
  ["Arkansas", "Bentonville", -94.208, 36.381, "Crystal Bridges Museum of American Art", "Museum"],
  ["Arkansas", "Bentonville", -94.209, 36.372, "The Momentary", "Arts/Culture"],
  ["Arkansas", "Bentonville", -94.209, 36.37, "Walmart Museum", "Museum"],
  ["Arkansas", "Mountain View", -92.117, 35.869, "Ozark Folk Center State Park", "Living History"],
  ["Arkansas", "Mountain View", -92.123, 35.87, "Blanchard Springs Caverns", "Nature"],
  ["Arkansas", "Eureka Springs", -93.739, 36.401, "Turpentine Creek Wildlife Refuge", "Wildlife"],
  ["Arkansas", "Eureka Springs", -93.738, 36.401, "Christ of the Ozarks", "Landmark"],
  ["Arkansas", "Rogers", -94.118, 36.333, "Hobbs State Park-Conservation Area", "Nature"],
  ["Arkansas", "Garfield", -93.946, 36.424, "Pea Ridge National Military Park", "National Battlefield"],
  ["Arkansas", "Fort Smith", -94.422, 35.386, "Fort Smith National Historic Site", "National Historic Site"],
  ["Arkansas", "Paris", -93.644, 35.167, "Mount Magazine State Park", "Nature"],
  ["Arkansas", "Morrilton", -92.936, 35.156, "Petit Jean State Park", "Nature"],
  ["Arkansas", "Bismarck", -93.159, 34.263, "DeGray Lake Resort State Park", "Nature"],
  ["Arkansas", "West Fork", -94.186, 35.798, "Devil's Den State Park", "Nature"],
  ["Arkansas", "Jonesboro", -90.704, 35.843, "Craighead Forest Park", "Urban Park"],
  ["Arkansas", "Stuttgart", -91.548, 34.499, "Museum of the Arkansas Grand Prairie", "Museum"],
  ["Arkansas", "Dumas", -91.493, 33.884, "Arkansas Post National Memorial", "National Memorial"],
  ["Arkansas", "Hope", -93.592, 33.667, "President William Jefferson Clinton Birthplace Home", "Historic Site"],
  ["Arkansas", "West Memphis", -90.179, 35.147, "Big River Crossing", "Trail"],
  ["Arkansas", "El Dorado", -92.665, 33.21, "Murphy Arts District", "Arts/Culture"],
  ["Arkansas", "Pine Bluff", -92.004, 34.229, "Delta Rivers Nature Center", "Nature"],
  ["Arkansas", "Mammoth Spring", -91.54, 36.495, "Mammoth Spring State Park", "Nature"],
  ["Arkansas", "Heber Springs", -92.036, 35.491, "Greers Ferry Lake", "Waterfront"],
  ["Arkansas", "Hot Springs", -93.06, 34.503, "Garvan Woodland Gardens", "Garden"],

  ["California", "Anaheim", -117.918, 33.812, "Disneyland Resort", "Theme Park"],
  ["California", "Los Angeles", -118.342, 34.102, "Griffith Observatory", "Science"],
  ["California", "Los Angeles", -118.321, 34.134, "Hollywood Sign and Griffith Park", "Landmark"],
  ["California", "Los Angeles", -118.244, 34.053, "The Getty Center", "Museum"],
  ["California", "Los Angeles", -118.36, 34.063, "Los Angeles County Museum of Art", "Museum"],
  ["California", "Universal City", -118.354, 34.138, "Universal Studios Hollywood", "Theme Park"],
  ["California", "San Diego", -117.15, 32.735, "San Diego Zoo", "Zoo/Aquarium"],
  ["California", "San Diego", -117.24, 32.764, "Balboa Park", "Urban Park"],
  ["California", "San Diego", -117.255, 32.735, "Cabrillo National Monument", "National Monument"],
  ["California", "Long Beach", -118.193, 33.752, "Aquarium of the Pacific", "Zoo/Aquarium"],
  ["California", "Santa Monica", -118.497, 34.01, "Santa Monica Pier", "Waterfront"],
  ["California", "San Simeon", -121.166, 35.685, "Hearst Castle", "Historic Site"],
  ["California", "Big Sur", -121.808, 36.27, "Big Sur Coast and Bixby Bridge", "Scenic Drive"],
  ["California", "Sequoia National Park", -118.565, 36.486, "Sequoia and Kings Canyon National Parks", "National Park"],
  ["California", "Death Valley", -116.825, 36.532, "Death Valley National Park", "National Park"],
  ["California", "Joshua Tree", -116.166, 34.135, "Joshua Tree National Park", "National Park"],
  ["California", "Redwood National Park", -124.004, 41.214, "Redwood National and State Parks", "National Park"],
  ["California", "Lassen Volcanic National Park", -121.51, 40.497, "Lassen Volcanic National Park", "National Park"],
  ["California", "Napa", -122.286, 38.298, "Napa Valley", "Food/Drink"],
  ["California", "Santa Barbara", -119.698, 34.42, "Santa Barbara Mission and Waterfront", "Historic Site"],
  ["California", "Palm Springs", -116.545, 33.83, "Palm Springs Aerial Tramway", "Scenic Overlook"],
  ["California", "San Francisco", -122.42, 37.808, "Alcatraz Island", "Historic Site"],
  ["California", "San Francisco", -122.486, 37.769, "Golden Gate Park", "Urban Park"],
  ["California", "San Jose", -121.893, 37.331, "Winchester Mystery House", "Historic Site"],
  ["California", "Sacramento", -121.494, 38.576, "California State Railroad Museum", "Museum"],
  ["California", "Santa Cruz", -122.025, 36.965, "Santa Cruz Beach Boardwalk", "Theme Park"],
  ["California", "Pinnacles National Park", -121.146, 36.49, "Pinnacles National Park", "National Park"],

  ["Colorado", "Colorado Springs", -105.044, 38.84, "Pikes Peak", "Scenic Overlook"],
  ["Colorado", "Colorado Springs", -104.991, 38.873, "Manitou Cliff Dwellings", "Historic Site"],
  ["Colorado", "Denver", -104.99, 39.739, "Denver Art Museum", "Museum"],
  ["Colorado", "Denver", -104.981, 39.739, "Denver Botanic Gardens", "Garden"],
  ["Colorado", "Denver", -104.879, 39.668, "Denver Museum of Nature and Science", "Museum"],
  ["Colorado", "Morrison", -105.205, 39.665, "Red Rocks Park and Amphitheatre", "Entertainment"],
  ["Colorado", "Boulder", -105.292, 39.999, "Flatirons", "Nature"],
  ["Colorado", "Golden", -105.224, 39.756, "Colorado Railroad Museum", "Museum"],
  ["Colorado", "Idaho Springs", -105.52, 39.742, "Mount Evans Scenic Byway", "Scenic Drive"],
  ["Colorado", "Glenwood Springs", -107.324, 39.55, "Glenwood Hot Springs", "Resort"],
  ["Colorado", "Glenwood Springs", -107.324, 39.548, "Hanging Lake", "Nature"],
  ["Colorado", "Aspen", -106.987, 39.071, "Maroon Bells", "Nature"],
  ["Colorado", "Black Canyon", -107.741, 38.575, "Black Canyon of the Gunnison National Park", "National Park"],
  ["Colorado", "Great Sand Dunes", -105.512, 37.733, "Great Sand Dunes National Park", "National Park"],
  ["Colorado", "Cañon City", -105.317, 38.46, "Royal Gorge Bridge and Park", "Scenic Overlook"],
  ["Colorado", "Durango", -107.88, 37.275, "Durango and Silverton Narrow Gauge Railroad", "Scenic Railway"],
  ["Colorado", "Telluride", -107.812, 37.937, "Telluride Historic District and Gondola", "Scenic Town"],
  ["Colorado", "Ouray", -107.671, 38.022, "Ouray Hot Springs and Million Dollar Highway", "Scenic Drive"],
  ["Colorado", "Vail", -106.374, 39.64, "Vail Village", "Resort"],
  ["Colorado", "Breckenridge", -106.038, 39.482, "Breckenridge Historic District", "Scenic Town"],
  ["Colorado", "Leadville", -106.292, 39.25, "Leadville Historic District", "Historic Site"],
  ["Colorado", "Dinosaur", -108.995, 40.437, "Dinosaur National Monument", "National Monument"],
  ["Colorado", "Grand Junction", -108.73, 39.042, "Colorado National Monument", "National Monument"],
  ["Colorado", "Pagosa Springs", -107.01, 37.269, "Pagosa Springs Hot Springs", "Resort"],
  ["Colorado", "Steamboat Springs", -106.823, 40.485, "Fish Creek Falls", "Nature"],
  ["Colorado", "Fort Collins", -105.077, 40.585, "Horsetooth Reservoir", "Waterfront"],
  ["Colorado", "Pueblo", -104.609, 38.254, "Historic Arkansas Riverwalk of Pueblo", "Waterfront"],

  ["Connecticut", "Hartford", -72.683, 41.765, "Mark Twain House and Museum", "Museum"],
  ["Connecticut", "Hartford", -72.674, 41.763, "Wadsworth Atheneum Museum of Art", "Museum"],
  ["Connecticut", "Hartford", -72.68, 41.764, "Connecticut Science Center", "Science"],
  ["Connecticut", "Norwalk", -73.416, 41.101, "The Maritime Aquarium", "Zoo/Aquarium"],
  ["Connecticut", "Bridgeport", -73.188, 41.186, "Beardsley Zoo", "Zoo/Aquarium"],
  ["Connecticut", "New Haven", -72.927, 41.308, "Yale Peabody Museum", "Museum"],
  ["Connecticut", "Waterbury", -73.051, 41.558, "Mattatuck Museum", "Museum"],
  ["Connecticut", "Litchfield", -73.189, 41.747, "White Memorial Conservation Center", "Nature"],
  ["Connecticut", "Cornwall", -73.37, 41.819, "Mohawk Mountain State Forest", "Nature"],
  ["Connecticut", "Kent", -73.414, 41.762, "Kent Falls State Park", "Nature"],
  ["Connecticut", "Danbury", -73.453, 41.394, "Danbury Railway Museum", "Museum"],
  ["Connecticut", "Mashantucket", -71.974, 41.473, "Mashantucket Pequot Museum", "Museum"],
  ["Connecticut", "Groton", -72.077, 41.354, "Submarine Force Museum", "Museum"],
  ["Connecticut", "Essex", -72.39, 41.353, "Essex Steam Train and Riverboat", "Scenic Railway"],
  ["Connecticut", "Old Lyme", -72.328, 41.324, "Florence Griswold Museum", "Museum"],
  ["Connecticut", "New Britain", -72.79, 41.664, "New Britain Museum of American Art", "Museum"],
  ["Connecticut", "Stamford", -73.538, 41.053, "Stamford Museum and Nature Center", "Museum"],
  ["Connecticut", "Norfolk", -73.2, 41.99, "Infinity Music Hall", "Entertainment"],
  ["Connecticut", "Gillette Castle", -72.343, 41.452, "Connecticut River Scenic Overlook", "Scenic Overlook"],
  ["Connecticut", "Madison", -72.598, 41.263, "Hammonasset Beach State Park", "Beach"],
  ["Connecticut", "Milford", -73.101, 41.194, "Silver Sands State Park", "Beach"],
  ["Connecticut", "New London", -72.1, 41.355, "Lyman Allyn Art Museum", "Museum"],
  ["Connecticut", "Windsor Locks", -72.651, 41.929, "New England Air Museum", "Museum"],
  ["Connecticut", "Bristol", -72.945, 41.671, "Lake Compounce", "Theme Park"],
  ["Connecticut", "Thomaston", -73.074, 41.674, "Railroad Museum of New England", "Museum"],
  ["Connecticut", "Ridgefield", -73.498, 41.282, "Aldrich Contemporary Art Museum", "Museum"],
  ["Connecticut", "West Hartford", -72.747, 41.762, "Elizabeth Park Rose Garden", "Garden"],

  ["Delaware", "Wilmington", -75.566, 39.798, "Hagley Museum and Library", "Museum"],
  ["Delaware", "Wilmington", -75.597, 39.798, "Winterthur Museum, Garden and Library", "Museum"],
  ["Delaware", "Wilmington", -75.552, 39.748, "Delaware Art Museum", "Museum"],
  ["Delaware", "Wilmington", -75.562, 39.739, "Brandywine Zoo", "Zoo/Aquarium"],
  ["Delaware", "New Castle", -75.566, 39.662, "New Castle Historic District", "Historic Site"],
  ["Delaware", "Dover", -75.524, 39.157, "Air Mobility Command Museum", "Museum"],
  ["Delaware", "Dover", -75.524, 39.158, "First State Heritage Park", "Historic Site"],
  ["Delaware", "Dover", -75.532, 39.157, "Biggs Museum of American Art", "Museum"],
  ["Delaware", "Dover", -75.532, 39.158, "John Dickinson Plantation", "Historic Site"],
  ["Delaware", "Lewes", -75.139, 38.774, "Zwaanendael Museum", "Museum"],
  ["Delaware", "Lewes", -75.139, 38.775, "Lightship Overfalls", "Historic Site"],
  ["Delaware", "Lewes", -75.092, 38.789, "Fort Miles Museum", "Museum"],
  ["Delaware", "Milton", -75.313, 38.777, "Prime Hook National Wildlife Refuge", "Wildlife"],
  ["Delaware", "Fenwick Island", -75.052, 38.451, "Fenwick Island State Park", "Beach"],
  ["Delaware", "Bethany Beach", -75.056, 38.539, "Bethany Beach Boardwalk", "Beach"],
  ["Delaware", "Dewey Beach", -75.075, 38.692, "Dewey Beach", "Beach"],
  ["Delaware", "Laurel", -75.546, 38.56, "Trap Pond State Park", "Nature"],
  ["Delaware", "Smyrna", -75.469, 39.291, "Bombay Hook National Wildlife Refuge", "Wildlife"],
  ["Delaware", "Middletown", -75.716, 39.449, "Lums Pond State Park", "Nature"],
  ["Delaware", "Yorklyn", -75.676, 39.808, "Auburn Valley State Park", "Historic Site"],
  ["Delaware", "Hockessin", -75.697, 39.787, "Mt. Cuba Center", "Garden"],
  ["Delaware", "Rehoboth Beach", -75.076, 38.721, "Funland", "Theme Park"],
  ["Delaware", "Rehoboth Beach", -75.08, 38.716, "Delaware Seashore State Park", "Beach"],
  ["Delaware", "Odessa", -75.66, 39.457, "Historic Odessa", "Historic Site"],
  ["Delaware", "Georgetown", -75.385, 38.69, "Marvel Carriage Museum", "Museum"],
  ["Delaware", "Milford", -75.427, 38.912, "Mispillion Riverwalk", "Waterfront"],
  ["Delaware", "Wilmington", -75.55, 39.744, "Wilmington Riverfront", "Waterfront"],

  ["Florida", "Orlando", -81.469, 28.472, "Universal Orlando Resort", "Theme Park"],
  ["Florida", "Orlando", -81.459, 28.411, "SeaWorld Orlando", "Theme Park"],
  ["Florida", "Tampa", -82.421, 28.036, "Busch Gardens Tampa Bay", "Theme Park"],
  ["Florida", "Merritt Island", -80.681, 28.524, "Kennedy Space Center Visitor Complex", "Science"],
  ["Florida", "Miami Beach", -80.13, 25.782, "South Beach and Art Deco Historic District", "Beach"],
  ["Florida", "Key West", -81.806, 24.555, "Ernest Hemingway Home and Museum", "Museum"],
  ["Florida", "Key West", -81.805, 24.546, "Dry Tortugas National Park", "National Park"],
  ["Florida", "Sarasota", -82.548, 27.381, "The Ringling", "Museum"],
  ["Florida", "Tampa", -82.466, 27.95, "Tampa Riverwalk", "Waterfront"],
  ["Florida", "Clearwater", -82.828, 27.978, "Clearwater Beach", "Beach"],
  ["Florida", "St. Petersburg", -82.634, 27.767, "The Dalí Museum", "Museum"],
  ["Florida", "St. Petersburg", -82.64, 27.773, "Sunken Gardens", "Garden"],
  ["Florida", "Naples", -81.807, 26.142, "Naples Pier and Beach", "Beach"],
  ["Florida", "Sanibel", -82.111, 26.448, "J.N. Ding Darling National Wildlife Refuge", "Wildlife"],
  ["Florida", "Fort Myers", -81.872, 26.634, "Edison and Ford Winter Estates", "Historic Site"],
  ["Florida", "Palm Beach", -80.039, 26.715, "Flagler Museum", "Museum"],
  ["Florida", "West Palm Beach", -80.05, 26.715, "Norton Museum of Art", "Museum"],
  ["Florida", "Fort Lauderdale", -80.104, 26.119, "Las Olas Boulevard and Riverwalk", "Waterfront"],
  ["Florida", "Jacksonville", -81.658, 30.332, "Cummer Museum of Art and Gardens", "Museum"],
  ["Florida", "Jacksonville", -81.395, 30.386, "Timucuan Ecological and Historic Preserve", "National Preserve"],
  ["Florida", "Daytona Beach", -81.022, 29.187, "Daytona International Speedway", "Sports"],
  ["Florida", "Pensacola", -87.303, 30.35, "National Naval Aviation Museum", "Museum"],
  ["Florida", "Pensacola Beach", -87.151, 30.334, "Gulf Islands National Seashore", "National Seashore"],
  ["Florida", "Crystal River", -82.594, 28.895, "Crystal River National Wildlife Refuge", "Wildlife"],
  ["Florida", "Ocala", -81.854, 29.187, "Silver Springs State Park", "Nature"],
  ["Florida", "Gainesville", -82.324, 29.651, "Florida Museum of Natural History", "Museum"],
  ["Florida", "Tallahassee", -84.283, 30.438, "Florida Historic Capitol Museum", "Museum"],

  ["Georgia", "Atlanta", -84.394, 33.762, "World of Coca-Cola", "Museum"],
  ["Georgia", "Atlanta", -84.39, 33.76, "Atlanta Botanical Garden", "Garden"],
  ["Georgia", "Atlanta", -84.386, 33.789, "High Museum of Art", "Museum"],
  ["Georgia", "Atlanta", -84.39, 33.755, "National Center for Civil and Human Rights", "Museum"],
  ["Georgia", "Stone Mountain", -84.145, 33.806, "Stone Mountain Park", "Nature"],
  ["Georgia", "Kennesaw", -84.594, 33.984, "Kennesaw Mountain National Battlefield Park", "National Battlefield"],
  ["Georgia", "Macon", -83.634, 32.84, "Ocmulgee Mounds National Historical Park", "National Historical Park"],
  ["Georgia", "Macon", -83.632, 32.84, "The Allman Brothers Band Museum at the Big House", "Museum"],
  ["Georgia", "Augusta", -81.974, 33.476, "Augusta Riverwalk", "Waterfront"],
  ["Georgia", "Athens", -83.373, 33.956, "State Botanical Garden of Georgia", "Garden"],
  ["Georgia", "Athens", -83.377, 33.951, "Georgia Museum of Art", "Museum"],
  ["Georgia", "Columbus", -84.991, 32.461, "National Infantry Museum", "Museum"],
  ["Georgia", "Columbus", -84.992, 32.46, "Chattahoochee RiverWalk", "Waterfront"],
  ["Georgia", "Warm Springs", -84.686, 32.888, "Little White House Historic Site", "Historic Site"],
  ["Georgia", "Pine Mountain", -84.874, 32.829, "Callaway Resort and Gardens", "Garden"],
  ["Georgia", "Dahlonega", -83.985, 34.533, "Dahlonega Gold Museum", "Museum"],
  ["Georgia", "Helen", -83.735, 34.701, "Helen Alpine Village", "Scenic Town"],
  ["Georgia", "Tallulah Falls", -83.395, 34.735, "Tallulah Gorge State Park", "Nature"],
  ["Georgia", "Blue Ridge", -84.324, 34.863, "Blue Ridge Scenic Railway", "Scenic Railway"],
  ["Georgia", "Jekyll Island", -81.411, 31.068, "Jekyll Island Historic District", "Historic Site"],
  ["Georgia", "Jekyll Island", -81.408, 31.074, "Georgia Sea Turtle Center", "Wildlife"],
  ["Georgia", "St. Simons Island", -81.394, 31.136, "St. Simons Lighthouse Museum", "Museum"],
  ["Georgia", "Cumberland Island", -81.45, 30.858, "Cumberland Island National Seashore", "National Seashore"],
  ["Georgia", "Plains", -84.392, 32.034, "Jimmy Carter National Historical Park", "National Historical Park"],
  ["Georgia", "Thomasville", -83.978, 30.837, "Pebble Hill Plantation", "Historic Site"],
  ["Georgia", "Okefenokee", -82.273, 30.734, "Okefenokee National Wildlife Refuge", "Wildlife"],
  ["Georgia", "Savannah", -81.099, 32.084, "Bonaventure Cemetery", "Historic Site"],

  ["Kansas", "Wichita", -97.336, 37.687, "Sedgwick County Zoo", "Zoo/Aquarium"],
  ["Kansas", "Wichita", -97.34, 37.692, "Botanica Wichita", "Garden"],
  ["Kansas", "Wichita", -97.337, 37.688, "Exploration Place", "Science"],
  ["Kansas", "Wichita", -97.335, 37.687, "Old Cowtown Museum", "Living History"],
  ["Kansas", "Wichita", -97.33, 37.687, "Keeper of the Plains", "Landmark"],
  ["Kansas", "Topeka", -95.689, 39.05, "Kansas State Capitol", "Architecture"],
  ["Kansas", "Topeka", -95.695, 39.05, "Evel Knievel Museum", "Museum"],
  ["Kansas", "Topeka", -95.696, 39.05, "Brown v. Board of Education National Historical Park", "National Historical Park"],
  ["Kansas", "Lawrence", -95.235, 38.959, "University of Kansas Natural History Museum", "Museum"],
  ["Kansas", "Lawrence", -95.238, 38.959, "Spencer Museum of Art", "Museum"],
  ["Kansas", "Kansas City", -94.629, 39.086, "Kansas Speedway", "Sports"],
  ["Kansas", "Kansas City", -94.608, 39.085, "Strawberry Hill Museum", "Museum"],
  ["Kansas", "Overland Park", -94.687, 38.982, "Overland Park Arboretum and Botanical Gardens", "Garden"],
  ["Kansas", "Hutchinson", -97.87, 38.061, "Strataca", "Museum"],
  ["Kansas", "Abilene", -97.214, 38.917, "Eisenhower Presidential Library and Museum", "Museum"],
  ["Kansas", "Abilene", -97.214, 38.916, "Seelye Mansion", "Historic Site"],
  ["Kansas", "Lindsborg", -97.674, 38.573, "Birger Sandzén Memorial Gallery", "Museum"],
  ["Kansas", "Council Grove", -96.491, 38.661, "Council Grove Santa Fe Trail Sites", "Historic Site"],
  ["Kansas", "Strong City", -96.54, 38.397, "Flint Hills Scenic Byway", "Scenic Drive"],
  ["Kansas", "Manhattan", -96.571, 39.183, "Flint Hills Discovery Center", "Museum"],
  ["Kansas", "Manhattan", -96.586, 39.195, "Konza Prairie Biological Station", "Nature"],
  ["Kansas", "Lucas", -98.535, 39.058, "Garden of Eden", "Roadside"],
  ["Kansas", "Liberal", -100.921, 37.043, "Dorothy's House and Land of Oz", "Roadside"],
  ["Kansas", "Dodge City", -100.018, 37.753, "Boot Hill Museum", "Museum"],
  ["Kansas", "Monument Rocks", -100.763, 38.791, "Monument Rocks National Natural Landmark", "Nature"],
  ["Kansas", "Scott City", -100.907, 38.68, "Little Jerusalem Badlands State Park", "Nature"],
  ["Kansas", "Hays", -99.326, 38.879, "Sternberg Museum of Natural History", "Museum"],

  ["Kentucky", "Louisville", -85.766, 38.257, "Churchill Downs and Kentucky Derby Museum", "Museum"],
  ["Kentucky", "Louisville", -85.759, 38.254, "Muhammad Ali Center", "Museum"],
  ["Kentucky", "Louisville", -85.742, 38.247, "Waterfront Park", "Urban Park"],
  ["Kentucky", "Louisville", -85.761, 38.253, "Frazier History Museum", "Museum"],
  ["Kentucky", "Lexington", -84.503, 38.041, "Mary Todd Lincoln House", "Historic Site"],
  ["Kentucky", "Lexington", -84.452, 38.049, "Ashland, The Henry Clay Estate", "Historic Site"],
  ["Kentucky", "Lexington", -84.58, 38.117, "Keeneland", "Sports"],
  ["Kentucky", "Frankfort", -84.873, 38.2, "Buffalo Trace Distillery", "Food/Drink"],
  ["Kentucky", "Frankfort", -84.875, 38.2, "Kentucky State Capitol", "Architecture"],
  ["Kentucky", "Bardstown", -85.466, 37.809, "My Old Kentucky Home State Park", "Historic Site"],
  ["Kentucky", "Bardstown", -85.467, 37.808, "Bardstown Historic District", "Scenic Town"],
  ["Kentucky", "Corbin", -84.096, 36.948, "Cumberland Falls State Resort Park", "Nature"],
  ["Kentucky", "Slade", -83.677, 37.797, "Red River Gorge Geological Area", "Nature"],
  ["Kentucky", "Slade", -83.684, 37.777, "Natural Bridge State Resort Park", "Nature"],
  ["Kentucky", "Paducah", -88.6, 37.087, "National Quilt Museum", "Museum"],
  ["Kentucky", "Paducah", -88.601, 37.087, "Paducah Wall to Wall Murals", "Arts/Culture"],
  ["Kentucky", "Bowling Green", -86.374, 36.991, "National Corvette Museum", "Museum"],
  ["Kentucky", "Bowling Green", -86.443, 36.913, "Lost River Cave", "Nature"],
  ["Kentucky", "Hodgenville", -85.739, 37.572, "Abraham Lincoln Birthplace National Historical Park", "National Historical Park"],
  ["Kentucky", "Harrodsburg", -84.847, 37.762, "Shaker Village of Pleasant Hill", "Living History"],
  ["Kentucky", "Newport", -84.497, 39.095, "Newport Aquarium", "Zoo/Aquarium"],
  ["Kentucky", "Covington", -84.511, 39.083, "MainStrasse Village", "Scenic Town"],
  ["Kentucky", "Owensboro", -87.113, 37.774, "Bluegrass Music Hall of Fame and Museum", "Museum"],
  ["Kentucky", "Pineville", -83.706, 36.746, "Pine Mountain State Resort Park", "Nature"],
  ["Kentucky", "Prestonsburg", -82.773, 37.665, "Mountain Arts Center", "Arts/Culture"],
  ["Kentucky", "Morehead", -83.435, 38.183, "Cave Run Lake", "Waterfront"],
  ["Kentucky", "Williamstown", -84.56, 38.622, "Ark Encounter", "Theme Park"],

  ["Louisiana", "New Orleans", -90.07, 29.951, "National WWII Museum", "Museum"],
  ["Louisiana", "New Orleans", -90.064, 29.958, "Jackson Square and St. Louis Cathedral", "Historic Site"],
  ["Louisiana", "New Orleans", -90.078, 29.94, "Garden District", "Historic Site"],
  ["Louisiana", "New Orleans", -90.081, 29.987, "City Park and New Orleans Museum of Art", "Urban Park"],
  ["Louisiana", "New Orleans", -90.064, 29.958, "Preservation Hall", "Music"],
  ["Louisiana", "Baton Rouge", -91.187, 30.457, "Louisiana State Capitol", "Architecture"],
  ["Louisiana", "Baton Rouge", -91.185, 30.447, "USS Kidd Veterans Museum", "Museum"],
  ["Louisiana", "Baton Rouge", -91.191, 30.452, "Louisiana's Old State Capitol", "Historic Site"],
  ["Louisiana", "Lafayette", -92.02, 30.214, "Acadian Village", "Living History"],
  ["Louisiana", "Avery Island", -91.912, 29.902, "Tabasco Factory and Jungle Gardens", "Garden"],
  ["Louisiana", "Breaux Bridge", -91.9, 30.274, "Lake Martin", "Wildlife"],
  ["Louisiana", "Jean Lafitte", -90.127, 29.734, "Barataria Preserve", "National Preserve"],
  ["Louisiana", "Natchitoches", -93.086, 31.76, "Natchitoches Historic District", "Historic Site"],
  ["Louisiana", "Natchitoches", -93.001, 31.654, "Cane River Creole National Historical Park", "National Historical Park"],
  ["Louisiana", "Shreveport", -93.75, 32.514, "R.W. Norton Art Gallery", "Museum"],
  ["Louisiana", "Shreveport", -93.749, 32.514, "Sci-Port Discovery Center", "Science"],
  ["Louisiana", "Monroe", -92.118, 32.51, "Biedenharn Museum and Gardens", "Museum"],
  ["Louisiana", "Alexandria", -92.445, 31.311, "Alexandria Zoological Park", "Zoo/Aquarium"],
  ["Louisiana", "Alexandria", -92.445, 31.312, "Kent Plantation House", "Historic Site"],
  ["Louisiana", "Lafayette", -92.02, 30.214, "Acadiana Center for the Arts", "Arts/Culture"],
  ["Louisiana", "Lake Charles", -93.217, 30.226, "Creole Nature Trail Adventure Point", "Nature"],
  ["Louisiana", "Lake Charles", -93.224, 30.226, "Charpentier Historic District", "Historic Site"],
  ["Louisiana", "Vacherie", -90.805, 30.0, "Laura Plantation", "Historic Site"],
  ["Louisiana", "Darrow", -90.913, 30.14, "Houmas House Estate and Gardens", "Garden"],
  ["Louisiana", "St. Francisville", -91.389, 30.779, "Rosedown Plantation State Historic Site", "Historic Site"],
  ["Louisiana", "St. Francisville", -91.376, 30.779, "Tunica Hills Wildlife Management Area", "Nature"],
  ["Louisiana", "Grand Isle", -89.987, 29.236, "Grand Isle State Park", "Beach"],

  ["Maine", "Rockland", -69.109, 44.104, "Farnsworth Art Museum", "Museum"],
  ["Maine", "Rockland", -69.106, 44.104, "Maine Lighthouse Museum", "Museum"],
  ["Maine", "Boothbay Harbor", -69.629, 43.852, "Coastal Maine Botanical Gardens", "Garden"],
  ["Maine", "Camden", -69.063, 44.209, "Camden Harbor", "Waterfront"],
  ["Maine", "Kennebunkport", -70.477, 43.361, "Kennebunkport Dock Square", "Scenic Town"],
  ["Maine", "Ogunquit", -70.6, 43.248, "Marginal Way", "Trail"],
  ["Maine", "Ogunquit", -70.6, 43.249, "Ogunquit Beach", "Beach"],
  ["Maine", "York", -70.594, 43.165, "Nubble Lighthouse", "Historic Site"],
  ["Maine", "Freeport", -70.103, 43.857, "L.L.Bean Flagship Campus", "Shopping"],
  ["Maine", "Portland", -70.255, 43.657, "Old Port", "Scenic Town"],
  ["Maine", "Portland", -70.254, 43.656, "Portland Museum of Art", "Museum"],
  ["Maine", "Portland", -70.255, 43.655, "Casco Bay Islands", "Waterfront"],
  ["Maine", "Augusta", -69.782, 44.307, "Maine State Museum", "Museum"],
  ["Maine", "Bangor", -68.771, 44.801, "Stephen King's Bangor Landmarks", "Arts/Culture"],
  ["Maine", "Bangor", -68.772, 44.802, "Cole Land Transportation Museum", "Museum"],
  ["Maine", "Millinocket", -68.921, 45.904, "Baxter State Park and Mount Katahdin", "Nature"],
  ["Maine", "Rangeley", -70.642, 44.966, "Rangeley Lakes Scenic Byway", "Scenic Drive"],
  ["Maine", "Greenville", -69.591, 45.459, "Moosehead Lake", "Waterfront"],
  ["Maine", "Lubec", -67.012, 44.815, "West Quoddy Head Light", "Historic Site"],
  ["Maine", "Machias", -67.458, 44.715, "Bold Coast Scenic Byway", "Scenic Drive"],
  ["Maine", "Bath", -69.814, 43.912, "Maine Maritime Museum", "Museum"],
  ["Maine", "Bristol", -69.508, 43.879, "Pemaquid Point Lighthouse", "Historic Site"],
  ["Maine", "Damariscotta", -69.518, 44.032, "Damariscotta River and Oyster Country", "Food/Drink"],
  ["Maine", "Castine", -68.798, 44.388, "Castine Historic District", "Historic Site"],
  ["Maine", "Bar Harbor", -68.203, 44.387, "Abbe Museum", "Museum"],
  ["Maine", "Skowhegan", -69.718, 44.766, "Skowhegan State Fairgrounds and Downtown", "Scenic Town"],
  ["Maine", "Bethel", -70.791, 44.405, "Sunday River Resort", "Resort"],

  ["Maryland", "Baltimore", -76.609, 39.283, "Fort McHenry National Monument and Historic Shrine", "National Monument"],
  ["Maryland", "Baltimore", -76.617, 39.286, "American Visionary Art Museum", "Museum"],
  ["Maryland", "Baltimore", -76.619, 39.297, "The Walters Art Museum", "Museum"],
  ["Maryland", "Baltimore", -76.606, 39.287, "Baltimore Museum of Industry", "Museum"],
  ["Maryland", "Baltimore", -76.615, 39.285, "Inner Harbor", "Waterfront"],
  ["Maryland", "Annapolis", -76.492, 38.978, "Maryland State House", "Historic Site"],
  ["Maryland", "Annapolis", -76.483, 38.984, "U.S. Naval Academy", "Historic Site"],
  ["Maryland", "Annapolis", -76.477, 38.972, "Annapolis Historic District", "Historic Site"],
  ["Maryland", "Frederick", -77.412, 39.414, "National Museum of Civil War Medicine", "Museum"],
  ["Maryland", "Frederick", -77.455, 39.358, "Monocacy National Battlefield", "National Battlefield"],
  ["Maryland", "Boonsboro", -77.621, 39.486, "South Mountain State Battlefield", "Historic Site"],
  ["Maryland", "Hagerstown", -77.72, 39.641, "Chesapeake and Ohio Canal National Historical Park", "National Historical Park"],
  ["Maryland", "Williamsport", -77.82, 39.601, "C&O Canal Cushwa Basin", "Historic Site"],
  ["Maryland", "Cumberland", -78.762, 39.652, "Western Maryland Scenic Railroad", "Scenic Railway"],
  ["Maryland", "Oakland", -79.37, 39.509, "Deep Creek Lake", "Waterfront"],
  ["Maryland", "Swanton", -79.419, 39.5, "Swallow Falls State Park", "Nature"],
  ["Maryland", "Cambridge", -76.052, 38.572, "Harriet Tubman Underground Railroad National Historical Park", "National Historical Park"],
  ["Maryland", "Cambridge", -76.047, 38.57, "Blackwater National Wildlife Refuge", "Wildlife"],
  ["Maryland", "St. Michaels", -76.223, 38.785, "Chesapeake Bay Maritime Museum", "Museum"],
  ["Maryland", "Easton", -76.076, 38.774, "Academy Art Museum", "Museum"],
  ["Maryland", "Assateague Island", -75.16, 38.086, "Assateague Island National Seashore", "National Seashore"],
  ["Maryland", "Berlin", -75.217, 38.322, "Berlin Historic District", "Scenic Town"],
  ["Maryland", "Solomons", -76.46, 38.318, "Calvert Marine Museum", "Museum"],
  ["Maryland", "Laurel", -76.875, 39.076, "Patuxent Research Refuge", "Wildlife"],
  ["Maryland", "College Park", -76.941, 38.989, "College Park Aviation Museum", "Museum"],
  ["Maryland", "Potomac", -77.246, 39.001, "Great Falls Tavern and Billy Goat Trail", "Nature"],
  ["Maryland", "Ellicott City", -76.799, 39.268, "Historic Ellicott City", "Scenic Town"],

  ["Massachusetts", "Boston", -71.049, 42.36, "Boston Tea Party Ships and Museum", "Museum"],
  ["Massachusetts", "Boston", -71.094, 42.346, "Museum of Fine Arts Boston", "Museum"],
  ["Massachusetts", "Boston", -71.071, 42.367, "Museum of Science", "Science"],
  ["Massachusetts", "Boston", -71.05, 42.358, "New England Aquarium", "Zoo/Aquarium"],
  ["Massachusetts", "Boston", -71.097, 42.346, "Isabella Stewart Gardner Museum", "Museum"],
  ["Massachusetts", "Cambridge", -71.116, 42.374, "Harvard Art Museums", "Museum"],
  ["Massachusetts", "Cambridge", -71.11, 42.376, "Harvard Museum of Natural History", "Museum"],
  ["Massachusetts", "Salem", -70.896, 42.519, "Peabody Essex Museum", "Museum"],
  ["Massachusetts", "Salem", -70.896, 42.521, "Salem Maritime National Historic Site", "National Historic Site"],
  ["Massachusetts", "Concord", -71.349, 42.47, "Minute Man National Historical Park", "National Historical Park"],
  ["Massachusetts", "Plymouth", -70.669, 41.958, "Plimoth Patuxet Museums", "Living History"],
  ["Massachusetts", "Plymouth", -70.663, 41.958, "Plymouth Rock and Mayflower II", "Historic Site"],
  ["Massachusetts", "New Bedford", -70.934, 41.636, "New Bedford Whaling Museum", "Museum"],
  ["Massachusetts", "New Bedford", -70.923, 41.635, "New Bedford Whaling National Historical Park", "National Historical Park"],
  ["Massachusetts", "Gloucester", -70.664, 42.615, "Cape Ann and Gloucester Harbor", "Waterfront"],
  ["Massachusetts", "Rockport", -70.62, 42.656, "Motif No. 1 and Bearskin Neck", "Scenic Town"],
  ["Massachusetts", "Lowell", -71.309, 42.645, "Lowell National Historical Park", "National Historical Park"],
  ["Massachusetts", "Lexington", -71.23, 42.449, "Lexington Battle Green", "Historic Site"],
  ["Massachusetts", "Worcester", -71.802, 42.262, "Worcester Art Museum", "Museum"],
  ["Massachusetts", "Springfield", -72.586, 42.101, "Naismith Basketball Hall of Fame", "Museum"],
  ["Massachusetts", "Springfield", -72.589, 42.102, "The Amazing World of Dr. Seuss Museum", "Museum"],
  ["Massachusetts", "Lenox", -73.283, 42.35, "Tanglewood", "Entertainment"],
  ["Massachusetts", "North Adams", -73.115, 42.702, "MASS MoCA", "Museum"],
  ["Massachusetts", "Williamstown", -73.213, 42.711, "Clark Art Institute", "Museum"],
  ["Massachusetts", "Sturbridge", -72.099, 42.108, "Old Sturbridge Village", "Living History"],
  ["Massachusetts", "Sandwich", -70.493, 41.758, "Heritage Museums and Gardens", "Garden"],
  ["Massachusetts", "Falmouth", -70.641, 41.552, "Shining Sea Bikeway", "Trail"],

  ["Mississippi", "Natchez", -91.403, 31.56, "Natchez National Historical Park", "National Historical Park"],
  ["Mississippi", "Natchez", -91.402, 31.561, "Longwood", "Historic Site"],
  ["Mississippi", "Vicksburg", -90.85, 32.346, "Vicksburg National Military Park", "National Battlefield"],
  ["Mississippi", "Vicksburg", -90.88, 32.352, "Biedenharn Coca-Cola Museum", "Museum"],
  ["Mississippi", "Jackson", -90.178, 32.299, "Mississippi Museum of Art", "Museum"],
  ["Mississippi", "Jackson", -90.178, 32.3, "Mississippi Museum of Natural Science", "Museum"],
  ["Mississippi", "Jackson", -90.179, 32.299, "Eudora Welty House and Garden", "Historic Site"],
  ["Mississippi", "Oxford", -89.519, 34.366, "University of Mississippi and The Grove", "Architecture"],
  ["Mississippi", "Oxford", -89.519, 34.367, "Rowan Oak", "Historic Site"],
  ["Mississippi", "Clarksdale", -90.57, 34.2, "Delta Blues Museum", "Museum"],
  ["Mississippi", "Clarksdale", -90.571, 34.2, "Ground Zero Blues Club", "Music"],
  ["Mississippi", "Indianola", -90.655, 33.45, "B.B. King Museum and Delta Interpretive Center", "Museum"],
  ["Mississippi", "Cleveland", -90.724, 33.744, "GRAMMY Museum Mississippi", "Museum"],
  ["Mississippi", "Tupelo", -88.703, 34.257, "Natchez Trace Parkway Visitor Center", "National Parkway"],
  ["Mississippi", "Port Gibson", -90.984, 31.96, "Windsor Ruins", "Historic Site"],
  ["Mississippi", "Biloxi", -88.891, 30.396, "Maritime and Seafood Industry Museum", "Museum"],
  ["Mississippi", "Biloxi", -88.949, 30.393, "Beauvoir", "Historic Site"],
  ["Mississippi", "Ocean Springs", -88.827, 30.411, "Walter Anderson Museum of Art", "Museum"],
  ["Mississippi", "Gulfport", -89.092, 30.367, "Mississippi Aquarium", "Zoo/Aquarium"],
  ["Mississippi", "Hattiesburg", -89.292, 31.327, "Hattiesburg Zoo", "Zoo/Aquarium"],
  ["Mississippi", "Hattiesburg", -89.293, 31.328, "African American Military History Museum", "Museum"],
  ["Mississippi", "Laurel", -89.13, 31.694, "Lauren Rogers Museum of Art", "Museum"],
  ["Mississippi", "Ridgeland", -90.123, 32.429, "Ross Barnett Reservoir", "Waterfront"],
  ["Mississippi", "Meridian", -88.704, 32.365, "Mississippi Arts and Entertainment Experience", "Museum"],
  ["Mississippi", "Columbus", -88.428, 33.495, "Tennessee Williams Home and Welcome Center", "Historic Site"],
  ["Mississippi", "Greenwood", -90.18, 33.517, "Museum of the Mississippi Delta", "Museum"],
  ["Mississippi", "Lorman", -91.054, 31.821, "Natchez Trace Parkway", "Scenic Drive"],

  ["Missouri", "St. Louis", -90.294, 38.636, "Saint Louis Zoo", "Zoo/Aquarium"],
  ["Missouri", "St. Louis", -90.294, 38.639, "Saint Louis Art Museum", "Museum"],
  ["Missouri", "St. Louis", -90.288, 38.615, "Missouri Botanical Garden", "Garden"],
  ["Missouri", "St. Louis", -90.201, 38.633, "City Museum", "Museum"],
  ["Missouri", "St. Louis", -90.191, 38.623, "Busch Stadium", "Sports"],
  ["Missouri", "Kansas City", -94.586, 39.084, "Nelson-Atkins Museum of Art", "Museum"],
  ["Missouri", "Kansas City", -94.585, 39.083, "Kauffman Center for the Performing Arts", "Entertainment"],
  ["Missouri", "Kansas City", -94.58, 39.101, "City Market", "Food/Market"],
  ["Missouri", "Kansas City", -94.58, 39.083, "Negro Leagues Baseball Museum", "Museum"],
  ["Missouri", "Kansas City", -94.48, 39.006, "Kansas City Zoo and Aquarium", "Zoo/Aquarium"],
  ["Missouri", "Branson", -93.281, 36.643, "Titanic Museum Attraction", "Museum"],
  ["Missouri", "Branson", -93.285, 36.64, "Table Rock Lake", "Waterfront"],
  ["Missouri", "Branson", -93.329, 36.64, "Dolly Parton's Stampede", "Entertainment"],
  ["Missouri", "Springfield", -93.294, 37.209, "Wonders of Wildlife National Museum and Aquarium", "Museum"],
  ["Missouri", "Springfield", -93.292, 37.209, "Fantastic Caverns", "Nature"],
  ["Missouri", "Hannibal", -91.358, 39.708, "Mark Twain Boyhood Home and Museum", "Museum"],
  ["Missouri", "Jefferson City", -92.173, 38.579, "Missouri State Capitol", "Architecture"],
  ["Missouri", "Jefferson City", -92.174, 38.578, "Missouri State Penitentiary", "Historic Site"],
  ["Missouri", "Independence", -94.421, 39.091, "Harry S. Truman Presidential Library and Museum", "Museum"],
  ["Missouri", "Independence", -94.421, 39.09, "National Frontier Trails Museum", "Museum"],
  ["Missouri", "Ste. Genevieve", -90.043, 37.978, "Ste. Genevieve National Historical Park", "National Historical Park"],
  ["Missouri", "Camdenton", -92.769, 38.032, "Ha Ha Tonka State Park", "Nature"],
  ["Missouri", "Eminence", -91.36, 37.146, "Ozark National Scenic Riverways", "National River"],
  ["Missouri", "Van Buren", -91.014, 36.995, "Big Spring", "Nature"],
  ["Missouri", "Rocheport", -92.563, 38.979, "Katy Trail State Park", "Trail"],
  ["Missouri", "Arrow Rock", -92.947, 39.07, "Arrow Rock State Historic Site", "Historic Site"],
  ["Missouri", "Fulton", -91.947, 38.846, "National Churchill Museum", "Museum"],

  ["Nevada", "Las Vegas", -115.172, 36.169, "Fremont Street Experience", "Entertainment"],
  ["Nevada", "Las Vegas", -115.176, 36.112, "Bellagio Conservatory and Fountains", "Entertainment"],
  ["Nevada", "Las Vegas", -115.175, 36.113, "The Neon Museum", "Museum"],
  ["Nevada", "Las Vegas", -115.141, 36.172, "Mob Museum", "Museum"],
  ["Nevada", "Las Vegas", -115.177, 36.169, "Red Rock Canyon National Conservation Area", "Nature"],
  ["Nevada", "Overton", -114.513, 36.429, "Valley of Fire State Park", "Nature"],
  ["Nevada", "Henderson", -114.873, 36.011, "Lake Mead National Recreation Area", "National Recreation Area"],
  ["Nevada", "Reno", -119.813, 39.529, "National Automobile Museum", "Museum"],
  ["Nevada", "Reno", -119.812, 39.528, "Nevada Museum of Art", "Museum"],
  ["Nevada", "Reno", -119.813, 39.529, "Truckee Riverwalk", "Waterfront"],
  ["Nevada", "Sparks", -119.755, 39.535, "Sparks Marina Park", "Waterfront"],
  ["Nevada", "Incline Village", -119.952, 39.252, "Lake Tahoe Nevada State Park", "Nature"],
  ["Nevada", "Carson City", -119.766, 39.164, "Nevada State Museum", "Museum"],
  ["Nevada", "Carson City", -119.766, 39.163, "Nevada State Capitol", "Architecture"],
  ["Nevada", "Virginia City", -119.649, 39.309, "Virginia City Historic District", "Historic Site"],
  ["Nevada", "Ely", -114.887, 39.247, "Nevada Northern Railway Museum", "Museum"],
  ["Nevada", "Ely", -114.888, 39.246, "Ward Charcoal Ovens State Historic Park", "Historic Site"],
  ["Nevada", "Tonopah", -117.23, 38.067, "Tonopah Historic Mining Park", "Historic Site"],
  ["Nevada", "Goldfield", -117.235, 37.708, "Goldfield Historic District", "Historic Site"],
  ["Nevada", "Beatty", -116.828, 36.903, "Rhyolite Ghost Town", "Historic Site"],
  ["Nevada", "Panaca", -114.512, 37.617, "Cathedral Gorge State Park", "Nature"],
  ["Nevada", "Caliente", -114.522, 37.614, "Kershaw-Ryan State Park", "Nature"],
  ["Nevada", "Alamo", -115.123, 37.364, "Pahranagat National Wildlife Refuge", "Wildlife"],
  ["Nevada", "Austin", -117.069, 39.493, "Toiyabe Range and Austin Historic District", "Scenic Town"],
  ["Nevada", "Winnemucca", -117.736, 40.973, "Humboldt Museum", "Museum"],
  ["Nevada", "Lovelock", -118.473, 40.18, "Lovers Lock Plaza", "Roadside"],
  ["Nevada", "Genoa", -119.846, 39.006, "Genoa Historic District", "Historic Site"],

  ["New Hampshire", "Mount Washington", -71.304, 44.271, "Mount Washington Auto Road", "Scenic Drive"],
  ["New Hampshire", "Mount Washington", -71.287, 44.27, "Mount Washington Cog Railway", "Scenic Railway"],
  ["New Hampshire", "North Conway", -71.128, 44.054, "Conway Scenic Railroad", "Scenic Railway"],
  ["New Hampshire", "North Conway", -71.12, 44.054, "Cathedral Ledge", "Scenic Overlook"],
  ["New Hampshire", "Lincoln", -71.686, 44.045, "Flume Gorge", "Nature"],
  ["New Hampshire", "Lincoln", -71.684, 44.045, "Clark's Bears", "Theme Park"],
  ["New Hampshire", "Lincoln", -71.681, 44.161, "Cannon Mountain Aerial Tramway", "Scenic Overlook"],
  ["New Hampshire", "Franconia", -71.698, 44.174, "The Basin", "Nature"],
  ["New Hampshire", "Bethlehem", -71.685, 44.28, "The Rocks Estate", "Historic Site"],
  ["New Hampshire", "Littleton", -71.77, 44.306, "Littleton Main Street", "Scenic Town"],
  ["New Hampshire", "Moultonborough", -71.321, 43.738, "Castle in the Clouds", "Historic Site"],
  ["New Hampshire", "Wolfeboro", -71.21, 43.584, "Lake Winnipesaukee", "Waterfront"],
  ["New Hampshire", "Meredith", -71.499, 43.657, "Winnipesaukee Scenic Railroad", "Scenic Railway"],
  ["New Hampshire", "Canterbury", -71.566, 43.338, "Canterbury Shaker Village", "Living History"],
  ["New Hampshire", "Concord", -71.549, 43.208, "New Hampshire State House", "Architecture"],
  ["New Hampshire", "Manchester", -71.454, 42.995, "Currier Museum of Art", "Museum"],
  ["New Hampshire", "Manchester", -71.466, 42.982, "SEE Science Center", "Science"],
  ["New Hampshire", "Derry", -71.327, 42.88, "Robert Frost Farm State Historic Site", "Historic Site"],
  ["New Hampshire", "Exeter", -70.947, 42.981, "American Independence Museum", "Museum"],
  ["New Hampshire", "Portsmouth", -70.755, 43.076, "Market Square", "Scenic Town"],
  ["New Hampshire", "Portsmouth", -70.713, 43.071, "Wentworth-Coolidge Mansion", "Historic Site"],
  ["New Hampshire", "Rye", -70.757, 43.045, "Odiorne Point State Park", "Nature"],
  ["New Hampshire", "Hampton", -70.812, 42.907, "Hampton Beach", "Beach"],
  ["New Hampshire", "Peterborough", -71.95, 42.87, "Mariposa Museum and World Culture Center", "Museum"],
  ["New Hampshire", "Keene", -72.279, 42.933, "Cheshire Rail Trail", "Trail"],
  ["New Hampshire", "Hanover", -72.289, 43.704, "Hood Museum of Art", "Museum"],
  ["New Hampshire", "Holderness", -71.59, 43.727, "Squam Lakes Natural Science Center", "Nature"],

  ["New Jersey", "Jersey City", -74.045, 40.699, "Empty Sky Memorial", "Memorial"],
  ["New Jersey", "Newark", -74.171, 40.735, "Newark Museum of Art", "Museum"],
  ["New Jersey", "Newark", -74.172, 40.735, "Branch Brook Park", "Urban Park"],
  ["New Jersey", "Hoboken", -74.032, 40.744, "Hoboken Waterfront Walkway", "Waterfront"],
  ["New Jersey", "Paterson", -74.181, 40.916, "Paterson Great Falls National Historical Park", "National Historical Park"],
  ["New Jersey", "West Orange", -74.233, 40.785, "Thomas Edison National Historical Park", "National Historical Park"],
  ["New Jersey", "Morristown", -74.532, 40.797, "Morristown National Historical Park", "National Historical Park"],
  ["New Jersey", "Princeton", -74.669, 40.35, "Princeton Battlefield State Park", "Historic Site"],
  ["New Jersey", "Trenton", -74.742, 40.22, "New Jersey State Museum", "Museum"],
  ["New Jersey", "Trenton", -74.767, 40.216, "Grounds For Sculpture", "Arts/Culture"],
  ["New Jersey", "Camden", -75.121, 39.944, "Adventure Aquarium", "Zoo/Aquarium"],
  ["New Jersey", "Camden", -75.121, 39.945, "Battleship New Jersey Museum and Memorial", "Museum"],
  ["New Jersey", "Atlantic City", -74.422, 39.364, "Atlantic City Boardwalk", "Beach"],
  ["New Jersey", "Atlantic City", -74.439, 39.355, "Absecon Lighthouse", "Historic Site"],
  ["New Jersey", "Wildwood", -74.812, 38.99, "Wildwood Boardwalk", "Beach"],
  ["New Jersey", "Cape May", -74.959, 38.934, "Cape May Lighthouse", "Historic Site"],
  ["New Jersey", "Ocean City", -74.574, 39.277, "Ocean City Boardwalk", "Beach"],
  ["New Jersey", "Asbury Park", -74.012, 40.22, "Asbury Park Boardwalk", "Beach"],
  ["New Jersey", "Sandy Hook", -74.004, 40.464, "Gateway National Recreation Area Sandy Hook", "National Recreation Area"],
  ["New Jersey", "Tuckerton", -74.342, 39.603, "Tuckerton Seaport", "Museum"],
  ["New Jersey", "Jackson", -74.443, 40.138, "Six Flags Great Adventure", "Theme Park"],
  ["New Jersey", "Flemington", -74.86, 40.506, "Northlandz", "Museum"],
  ["New Jersey", "Sussex", -74.697, 41.199, "High Point State Park", "Nature"],
  ["New Jersey", "Delaware Water Gap", -75.08, 40.986, "Delaware Water Gap National Recreation Area", "National Recreation Area"],
  ["New Jersey", "Clinton", -74.91, 40.637, "Red Mill Museum Village", "Museum"],
  ["New Jersey", "Millville", -75.039, 39.402, "WheatonArts", "Arts/Culture"],
  ["New Jersey", "Paramus", -74.071, 40.927, "Bergen County Zoo", "Zoo/Aquarium"],

  ["New Mexico", "Santa Fe", -105.938, 35.687, "Georgia O'Keeffe Museum", "Museum"],
  ["New Mexico", "Santa Fe", -105.938, 35.688, "Museum of International Folk Art", "Museum"],
  ["New Mexico", "Santa Fe", -105.939, 35.688, "Canyon Road", "Arts/Culture"],
  ["New Mexico", "Albuquerque", -106.651, 35.084, "Old Town Albuquerque", "Historic Site"],
  ["New Mexico", "Albuquerque", -106.619, 35.187, "Sandia Peak Tramway", "Scenic Overlook"],
  ["New Mexico", "Albuquerque", -106.651, 35.085, "Indian Pueblo Cultural Center", "Museum"],
  ["New Mexico", "Albuquerque", -106.65, 35.084, "National Museum of Nuclear Science and History", "Museum"],
  ["New Mexico", "Taos", -105.573, 36.438, "Taos Pueblo", "Historic Site"],
  ["New Mexico", "Taos", -105.575, 36.407, "Rio Grande Gorge Bridge", "Scenic Overlook"],
  ["New Mexico", "Los Alamos", -106.306, 35.88, "Bandelier National Monument", "National Monument"],
  ["New Mexico", "Los Alamos", -106.306, 35.879, "Bradbury Science Museum", "Science"],
  ["New Mexico", "Jemez Springs", -106.689, 35.77, "Valles Caldera National Preserve", "National Preserve"],
  ["New Mexico", "Grants", -107.995, 35.039, "El Malpais National Monument", "National Monument"],
  ["New Mexico", "Ramah", -108.052, 35.037, "El Morro National Monument", "National Monument"],
  ["New Mexico", "Nageezi", -107.956, 36.06, "Chaco Culture National Historical Park", "National Historical Park"],
  ["New Mexico", "Farmington", -108.218, 36.729, "Aztec Ruins National Monument", "National Monument"],
  ["New Mexico", "Farmington", -108.218, 36.728, "Bisti/De-Na-Zin Wilderness", "Nature"],
  ["New Mexico", "Ruidoso", -105.673, 33.331, "Ski Apache and Sierra Blanca", "Resort"],
  ["New Mexico", "Capitan", -105.578, 33.545, "Smokey Bear Historical Park", "Museum"],
  ["New Mexico", "Roswell", -104.523, 33.394, "International UFO Museum and Research Center", "Museum"],
  ["New Mexico", "Las Cruces", -106.779, 32.31, "Organ Mountains-Desert Peaks National Monument", "National Monument"],
  ["New Mexico", "Las Cruces", -106.778, 32.31, "Mesilla Plaza", "Historic Site"],
  ["New Mexico", "Socorro", -106.889, 34.058, "Bosque del Apache National Wildlife Refuge", "Wildlife"],
  ["New Mexico", "Truth or Consequences", -107.252, 33.128, "Riverbend Hot Springs", "Resort"],
  ["New Mexico", "Silver City", -108.276, 32.77, "Gila Cliff Dwellings National Monument", "National Monument"],
  ["New Mexico", "Tucumcari", -103.725, 35.171, "Route 66 Tucumcari Murals", "Roadside"],
  ["New Mexico", "Las Vegas", -105.223, 35.594, "Las Vegas Plaza Historic District", "Historic Site"],

  ["North Carolina", "Charlotte", -80.843, 35.227, "NASCAR Hall of Fame", "Museum"],
  ["North Carolina", "Charlotte", -80.844, 35.227, "Discovery Place Science", "Science"],
  ["North Carolina", "Charlotte", -80.944, 35.104, "Carowinds", "Theme Park"],
  ["North Carolina", "Raleigh", -78.639, 35.78, "North Carolina Museum of Natural Sciences", "Museum"],
  ["North Carolina", "Raleigh", -78.639, 35.779, "North Carolina Museum of Art", "Museum"],
  ["North Carolina", "Durham", -78.938, 35.994, "Sarah P. Duke Gardens", "Garden"],
  ["North Carolina", "Durham", -78.939, 35.995, "Museum of Life and Science", "Science"],
  ["North Carolina", "Chapel Hill", -79.055, 35.913, "Ackland Art Museum", "Museum"],
  ["North Carolina", "Greensboro", -79.792, 36.073, "International Civil Rights Center and Museum", "Museum"],
  ["North Carolina", "Winston-Salem", -80.244, 36.096, "Old Salem Museums and Gardens", "Living History"],
  ["North Carolina", "Asheville", -82.55, 35.595, "Blue Ridge Parkway Visitor Center", "Scenic Drive"],
  ["North Carolina", "Asheville", -82.555, 35.595, "North Carolina Arboretum", "Garden"],
  ["North Carolina", "Linville", -81.928, 35.972, "Grandfather Mountain", "Nature"],
  ["North Carolina", "Blowing Rock", -81.678, 36.135, "The Blowing Rock", "Scenic Overlook"],
  ["North Carolina", "Chimney Rock", -82.25, 35.439, "Chimney Rock State Park", "Nature"],
  ["North Carolina", "Bryson City", -83.447, 35.43, "Great Smoky Mountains Railroad", "Scenic Railway"],
  ["North Carolina", "Wilmington", -77.949, 34.236, "Battleship North Carolina", "Museum"],
  ["North Carolina", "Wilmington", -77.945, 34.225, "Airlie Gardens", "Garden"],
  ["North Carolina", "Wilmington", -77.948, 34.236, "Wilmington Riverwalk", "Waterfront"],
  ["North Carolina", "Kure Beach", -77.907, 33.954, "Fort Fisher State Historic Site", "Historic Site"],
  ["North Carolina", "Kure Beach", -77.908, 33.955, "North Carolina Aquarium at Fort Fisher", "Zoo/Aquarium"],
  ["North Carolina", "Beaufort", -76.665, 34.718, "North Carolina Maritime Museum", "Museum"],
  ["North Carolina", "New Bern", -77.044, 35.108, "Tryon Palace", "Historic Site"],
  ["North Carolina", "Nags Head", -75.67, 35.957, "Jockey's Ridge State Park", "Nature"],
  ["North Carolina", "Kill Devil Hills", -75.668, 36.017, "Wright Brothers National Memorial", "National Memorial"],
  ["North Carolina", "Manteo", -75.67, 35.936, "Roanoke Island Festival Park", "Living History"],
  ["North Carolina", "Ocracoke", -75.986, 35.115, "Ocracoke Village and Lighthouse", "Historic Site"],
]);

const mainlandExpansionAdditionalAttractions2 = compactAttractionRows([
  ["Oklahoma", "Oklahoma City", -97.516, 35.468, "National Cowboy and Western Heritage Museum", "Museum"],
  ["Oklahoma", "Oklahoma City", -97.509, 35.463, "First Americans Museum", "Museum"],
  ["Oklahoma", "Oklahoma City", -97.512, 35.47, "Myriad Botanical Gardens", "Garden"],
  ["Oklahoma", "Oklahoma City", -97.512, 35.471, "Bricktown Canal", "Waterfront"],
  ["Oklahoma", "Oklahoma City", -97.513, 35.472, "Science Museum Oklahoma", "Science"],
  ["Oklahoma", "Oklahoma City", -97.514, 35.473, "Oklahoma City Museum of Art", "Museum"],
  ["Oklahoma", "Tulsa", -95.992, 36.153, "Gathering Place", "Urban Park"],
  ["Oklahoma", "Tulsa", -95.99, 36.154, "Gilcrease Museum", "Museum"],
  ["Oklahoma", "Tulsa", -95.989, 36.153, "Woody Guthrie Center", "Museum"],
  ["Oklahoma", "Tulsa", -95.988, 36.152, "Tulsa Art Deco District", "Architecture"],
  ["Oklahoma", "Tulsa", -95.987, 36.152, "Cain's Ballroom", "Music"],
  ["Oklahoma", "Bartlesville", -95.98, 36.747, "Price Tower", "Architecture"],
  ["Oklahoma", "Pawhuska", -96.337, 36.667, "Tallgrass Prairie Preserve", "Nature"],
  ["Oklahoma", "Claremore", -95.616, 36.312, "Will Rogers Memorial Museum", "Museum"],
  ["Oklahoma", "Miami", -94.877, 36.874, "Coleman Theatre", "Architecture"],
  ["Oklahoma", "Afton", -94.962, 36.693, "Route 66 Vintage Iron Motorcycle Museum", "Museum"],
  ["Oklahoma", "Arcadia", -97.323, 35.666, "Round Barn and POPS 66", "Roadside"],
  ["Oklahoma", "Catoosa", -95.746, 36.188, "Blue Whale of Catoosa", "Roadside"],
  ["Oklahoma", "Lawton", -98.501, 34.608, "Wichita Mountains Wildlife Refuge", "Wildlife"],
  ["Oklahoma", "Cache", -98.628, 34.629, "Medicine Park", "Scenic Town"],
  ["Oklahoma", "Davis", -97.119, 34.428, "Turner Falls Park", "Nature"],
  ["Oklahoma", "Tahlequah", -94.97, 35.916, "Cherokee Heritage Center", "Cultural Site"],
  ["Oklahoma", "Guthrie", -97.425, 35.878, "Guthrie Historic District", "Historic Site"],
  ["Oklahoma", "Enid", -97.878, 36.397, "Leonardo's Children's Museum", "Museum"],
  ["Oklahoma", "Woodward", -99.39, 36.433, "Plains Indians and Pioneers Museum", "Museum"],
  ["Oklahoma", "Boise City", -102.512, 36.73, "Black Mesa State Park", "Nature"],
  ["Oklahoma", "McAlester", -95.769, 34.933, "Robbers Cave State Park", "Nature"],

  ["Rhode Island", "Newport", -71.312, 41.475, "Cliff Walk", "Trail"],
  ["Rhode Island", "Newport", -71.313, 41.475, "Marble House", "Historic Site"],
  ["Rhode Island", "Newport", -71.314, 41.476, "The Elms", "Historic Site"],
  ["Rhode Island", "Newport", -71.327, 41.49, "Fort Adams State Park", "Historic Site"],
  ["Rhode Island", "Newport", -71.317, 41.482, "International Tennis Hall of Fame", "Museum"],
  ["Rhode Island", "Newport", -71.314, 41.483, "Newport Harbor", "Waterfront"],
  ["Rhode Island", "Providence", -71.412, 41.824, "WaterFire Providence", "Entertainment"],
  ["Rhode Island", "Providence", -71.409, 41.826, "Roger Williams Park Zoo", "Zoo/Aquarium"],
  ["Rhode Island", "Providence", -71.41, 41.825, "Rhode Island State House", "Architecture"],
  ["Rhode Island", "Providence", -71.401, 41.827, "Benefit Street", "Historic Site"],
  ["Rhode Island", "Pawtucket", -71.382, 41.878, "Slater Mill Historic Site", "Historic Site"],
  ["Rhode Island", "Bristol", -71.267, 41.668, "Blithewold Mansion, Gardens and Arboretum", "Garden"],
  ["Rhode Island", "Bristol", -71.262, 41.671, "Herreshoff Marine Museum", "Museum"],
  ["Rhode Island", "Bristol", -71.271, 41.668, "Colt State Park", "Nature"],
  ["Rhode Island", "Jamestown", -71.361, 41.497, "Beavertail Lighthouse Museum", "Historic Site"],
  ["Rhode Island", "Middletown", -71.253, 41.485, "Sachuest Point National Wildlife Refuge", "Wildlife"],
  ["Rhode Island", "Little Compton", -71.161, 41.51, "Sakonnet Point", "Scenic Overlook"],
  ["Rhode Island", "Westerly", -71.827, 41.377, "Watch Hill", "Scenic Town"],
  ["Rhode Island", "Westerly", -71.827, 41.378, "Napatree Point Conservation Area", "Nature"],
  ["Rhode Island", "Block Island", -71.57, 41.172, "Mohegan Bluffs", "Scenic Overlook"],
  ["Rhode Island", "Block Island", -71.575, 41.164, "Southeast Lighthouse", "Historic Site"],
  ["Rhode Island", "North Kingstown", -71.449, 41.57, "Wickford Village", "Scenic Town"],
  ["Rhode Island", "Warwick", -71.39, 41.703, "Goddard Memorial State Park", "Nature"],
  ["Rhode Island", "Exeter", -71.65, 41.573, "Yawgoo Valley", "Resort"],
  ["Rhode Island", "Smithfield", -71.55, 41.922, "Lincoln Woods State Park", "Nature"],
  ["Rhode Island", "Tiverton", -71.197, 41.625, "Tiverton Four Corners", "Scenic Town"],
  ["Rhode Island", "South Kingstown", -71.521, 41.443, "The Towers and Narragansett Pier", "Architecture"],

  ["South Carolina", "Charleston", -79.934, 32.776, "Fort Sumter and Fort Moultrie National Historical Park", "National Historical Park"],
  ["South Carolina", "Charleston", -79.933, 32.776, "Magnolia Plantation and Gardens", "Garden"],
  ["South Carolina", "Charleston", -79.932, 32.777, "Middleton Place", "Garden"],
  ["South Carolina", "Charleston", -79.93, 32.776, "Patriots Point Naval and Maritime Museum", "Museum"],
  ["South Carolina", "Charleston", -79.929, 32.775, "South Carolina Aquarium", "Zoo/Aquarium"],
  ["South Carolina", "Mount Pleasant", -79.863, 32.794, "Boone Hall Plantation and Gardens", "Historic Site"],
  ["South Carolina", "Myrtle Beach", -78.886, 33.715, "Brookgreen Gardens", "Garden"],
  ["South Carolina", "Myrtle Beach", -78.887, 33.689, "SkyWheel Myrtle Beach", "Entertainment"],
  ["South Carolina", "Murrells Inlet", -79.041, 33.55, "Huntington Beach State Park", "Beach"],
  ["South Carolina", "Columbia", -81.034, 34.0, "Riverbanks Zoo and Garden", "Zoo/Aquarium"],
  ["South Carolina", "Columbia", -81.035, 34.0, "South Carolina State Museum", "Museum"],
  ["South Carolina", "Columbia", -81.036, 34.001, "Columbia Canal and Riverfront Park", "Waterfront"],
  ["South Carolina", "Greenville", -82.401, 34.848, "Falls Park on the Reedy", "Urban Park"],
  ["South Carolina", "Greenville", -82.4, 34.848, "Greenville County Museum of Art", "Museum"],
  ["South Carolina", "Spartanburg", -81.933, 34.949, "BMW Zentrum Museum", "Museum"],
  ["South Carolina", "Rock Hill", -81.025, 34.924, "Glencairn Garden", "Garden"],
  ["South Carolina", "Camden", -80.607, 34.246, "Historic Camden Revolutionary War Site", "Historic Site"],
  ["South Carolina", "Aiken", -81.72, 33.56, "Hopelands Gardens", "Garden"],
  ["South Carolina", "Hilton Head Island", -80.752, 32.216, "Harbour Town Lighthouse", "Landmark"],
  ["South Carolina", "Hilton Head Island", -80.74, 32.164, "Coligny Beach Park", "Beach"],
  ["South Carolina", "Beaufort", -80.669, 32.431, "Beaufort Historic District", "Historic Site"],
  ["South Carolina", "Beaufort", -80.669, 32.43, "Penn Center", "Historic Site"],
  ["South Carolina", "Saint Helena Island", -80.625, 32.388, "Hunting Island State Park", "Beach"],
  ["South Carolina", "Gaffney", -81.65, 35.071, "Peachoid", "Roadside"],
  ["South Carolina", "Walhalla", -83.064, 34.768, "Stumphouse Tunnel Park", "Historic Site"],
  ["South Carolina", "Mountain Rest", -83.131, 34.817, "Oconee State Park", "Nature"],
  ["South Carolina", "Cleveland", -82.605, 35.067, "Table Rock State Park", "Nature"],

  ["Tennessee", "Nashville", -86.781, 36.158, "Ryman Auditorium", "Music"],
  ["Tennessee", "Nashville", -86.783, 36.238, "Grand Ole Opry", "Music"],
  ["Tennessee", "Nashville", -86.778, 36.162, "Johnny Cash Museum", "Museum"],
  ["Tennessee", "Nashville", -86.768, 36.149, "The Parthenon", "Architecture"],
  ["Tennessee", "Nashville", -86.775, 36.166, "Tennessee State Museum", "Museum"],
  ["Tennessee", "Memphis", -90.049, 35.14, "National Civil Rights Museum", "Museum"],
  ["Tennessee", "Memphis", -90.052, 35.139, "Sun Studio", "Music"],
  ["Tennessee", "Memphis", -90.048, 35.14, "Beale Street", "Entertainment"],
  ["Tennessee", "Memphis", -90.047, 35.139, "Memphis Rock 'n' Soul Museum", "Museum"],
  ["Tennessee", "Memphis", -90.038, 35.149, "Stax Museum of American Soul Music", "Museum"],
  ["Tennessee", "Chattanooga", -85.309, 35.055, "Tennessee Aquarium", "Zoo/Aquarium"],
  ["Tennessee", "Chattanooga", -85.352, 35.018, "Lookout Mountain and Rock City", "Nature"],
  ["Tennessee", "Chattanooga", -85.34, 35.019, "Ruby Falls", "Nature"],
  ["Tennessee", "Chattanooga", -85.309, 35.054, "Chattanooga Choo Choo", "Historic Site"],
  ["Tennessee", "Knoxville", -83.92, 35.961, "Sunsphere and World's Fair Park", "Landmark"],
  ["Tennessee", "Knoxville", -83.92, 35.962, "Ijams Nature Center", "Nature"],
  ["Tennessee", "Pigeon Forge", -83.53, 35.794, "Dollywood", "Theme Park"],
  ["Tennessee", "Pigeon Forge", -83.531, 35.795, "Titanic Museum Attraction", "Museum"],
  ["Tennessee", "Gatlinburg", -83.514, 35.714, "Ober Mountain", "Resort"],
  ["Tennessee", "Gatlinburg", -83.511, 35.711, "Ripley's Aquarium of the Smokies", "Zoo/Aquarium"],
  ["Tennessee", "Lynchburg", -86.374, 35.283, "Jack Daniel Distillery", "Food/Drink"],
  ["Tennessee", "Murfreesboro", -86.43, 35.845, "Stones River National Battlefield", "National Battlefield"],
  ["Tennessee", "Franklin", -86.87, 35.925, "Carter House and Carnton", "Historic Site"],
  ["Tennessee", "Shiloh", -88.322, 35.138, "Shiloh National Military Park", "National Battlefield"],
  ["Tennessee", "Bristol", -82.188, 36.595, "Birthplace of Country Music Museum", "Museum"],
  ["Tennessee", "Cookeville", -85.504, 36.162, "Cummins Falls State Park", "Nature"],
  ["Tennessee", "Spencer", -85.356, 35.675, "Fall Creek Falls State Park", "Nature"],

  ["Texas", "Austin", -97.743, 30.267, "Texas State Capitol", "Architecture"],
  ["Texas", "Austin", -97.772, 30.264, "Barton Springs Pool", "Nature"],
  ["Texas", "Austin", -97.739, 30.274, "Bullock Texas State History Museum", "Museum"],
  ["Texas", "Austin", -97.745, 30.265, "Lady Bird Lake Hike and Bike Trail", "Trail"],
  ["Texas", "San Antonio", -98.486, 29.424, "San Antonio River Walk", "Waterfront"],
  ["Texas", "San Antonio", -98.46, 29.357, "Mission San José", "Historic Site"],
  ["Texas", "San Antonio", -98.469, 29.423, "Pearl District", "Food/Market"],
  ["Texas", "Houston", -95.39, 29.722, "Museum of Fine Arts Houston", "Museum"],
  ["Texas", "Houston", -95.389, 29.721, "Houston Museum of Natural Science", "Museum"],
  ["Texas", "Houston", -95.39, 29.72, "Houston Zoo", "Zoo/Aquarium"],
  ["Texas", "Dallas", -96.808, 32.779, "The Sixth Floor Museum at Dealey Plaza", "Museum"],
  ["Texas", "Dallas", -96.801, 32.787, "Dallas Museum of Art", "Museum"],
  ["Texas", "Dallas", -96.806, 32.783, "Perot Museum of Nature and Science", "Science"],
  ["Texas", "Fort Worth", -97.364, 32.789, "Fort Worth Stockyards", "Historic Site"],
  ["Texas", "Fort Worth", -97.364, 32.75, "Kimbell Art Museum", "Museum"],
  ["Texas", "Waco", -97.146, 31.552, "Magnolia Market at the Silos", "Shopping"],
  ["Texas", "Waco", -97.12, 31.558, "Waco Mammoth National Monument", "National Monument"],
  ["Texas", "Galveston", -94.797, 29.301, "The Strand Historic District", "Historic Site"],
  ["Texas", "Galveston", -94.775, 29.27, "Moody Gardens", "Garden"],
  ["Texas", "Corpus Christi", -97.395, 27.815, "USS Lexington Museum", "Museum"],
  ["Texas", "Padre Island", -97.381, 27.422, "Padre Island National Seashore", "National Seashore"],
  ["Texas", "Fredericksburg", -98.872, 30.275, "National Museum of the Pacific War", "Museum"],
  ["Texas", "Johnson City", -98.623, 30.24, "Lyndon B. Johnson National Historical Park", "National Historical Park"],
  ["Texas", "Amarillo", -101.922, 35.188, "Cadillac Ranch", "Roadside"],
  ["Texas", "Canyon", -101.664, 34.94, "Palo Duro Canyon State Park", "Nature"],
  ["Texas", "El Paso", -106.485, 31.761, "Franklin Mountains State Park", "Nature"],
  ["Texas", "Grapevine", -97.078, 32.934, "Grapevine Historic Main Street", "Scenic Town"],

  ["Utah", "Moab", -109.82, 38.213, "Canyonlands National Park", "National Park"],
  ["Utah", "Torrey", -111.262, 38.291, "Capitol Reef National Park", "National Park"],
  ["Utah", "Mexican Hat", -109.84, 37.004, "Monument Valley Navajo Tribal Park", "Nature"],
  ["Utah", "Moab", -109.55, 38.573, "Dead Horse Point State Park", "Nature"],
  ["Utah", "Kanab", -112.684, 37.047, "Grand Staircase-Escalante National Monument", "National Monument"],
  ["Utah", "Escalante", -111.602, 37.771, "Escalante Petrified Forest State Park", "Nature"],
  ["Utah", "Blanding", -109.779, 37.625, "Natural Bridges National Monument", "National Monument"],
  ["Utah", "Jensen", -109.303, 40.441, "Dinosaur National Monument", "National Monument"],
  ["Utah", "Vernal", -109.529, 40.456, "Utah Field House of Natural History", "Museum"],
  ["Utah", "Salt Lake City", -111.891, 40.76, "Temple Square", "Historic Site"],
  ["Utah", "Salt Lake City", -111.876, 40.765, "Natural History Museum of Utah", "Museum"],
  ["Utah", "Salt Lake City", -111.93, 40.761, "Red Butte Garden", "Garden"],
  ["Utah", "Salt Lake City", -111.895, 40.759, "Utah State Capitol", "Architecture"],
  ["Utah", "Park City", -111.498, 40.646, "Park City Main Street", "Scenic Town"],
  ["Utah", "Park City", -111.497, 40.65, "Utah Olympic Park", "Sports"],
  ["Utah", "Provo", -111.658, 40.246, "Bridal Veil Falls", "Nature"],
  ["Utah", "Lehi", -111.894, 40.427, "Thanksgiving Point", "Museum"],
  ["Utah", "Ogden", -111.973, 41.223, "Hill Aerospace Museum", "Museum"],
  ["Utah", "Ogden", -111.973, 41.224, "Ogden Union Station", "Museum"],
  ["Utah", "Heber City", -111.413, 40.508, "Heber Valley Railroad", "Scenic Railway"],
  ["Utah", "Midway", -111.474, 40.523, "Homestead Crater", "Nature"],
  ["Utah", "Logan", -111.833, 41.736, "Logan Canyon Scenic Byway", "Scenic Drive"],
  ["Utah", "Garden City", -111.321, 41.946, "Bear Lake State Park", "Waterfront"],
  ["Utah", "St. George", -113.584, 37.096, "Snow Canyon State Park", "Nature"],
  ["Utah", "Cedar City", -112.848, 37.677, "Cedar Breaks National Monument", "National Monument"],
  ["Utah", "Kanab", -112.529, 37.051, "Coral Pink Sand Dunes State Park", "Nature"],
  ["Utah", "Boulder", -111.429, 37.905, "Highway 12 Scenic Byway", "Scenic Drive"],

  ["Vermont", "Burlington", -73.213, 44.475, "Church Street Marketplace", "Shopping"],
  ["Vermont", "Burlington", -73.219, 44.476, "Waterfront Park and Lake Champlain", "Waterfront"],
  ["Vermont", "Shelburne", -73.243, 44.376, "Shelburne Farms", "Historic Site"],
  ["Vermont", "Vergennes", -73.247, 44.167, "Lake Champlain Maritime Museum", "Museum"],
  ["Vermont", "Middlebury", -73.167, 44.015, "Middlebury College Museum of Art", "Museum"],
  ["Vermont", "Addison", -73.268, 44.067, "Chimney Point State Historic Site", "Historic Site"],
  ["Vermont", "Ferrisburgh", -73.275, 44.218, "Button Bay State Park", "Nature"],
  ["Vermont", "Montpelier", -72.575, 44.262, "Vermont State House", "Architecture"],
  ["Vermont", "Waterbury", -72.754, 44.337, "Ben and Jerry's Factory", "Food/Drink"],
  ["Vermont", "Waterbury", -72.751, 44.34, "Cold Hollow Cider Mill", "Food/Drink"],
  ["Vermont", "Stowe", -72.701, 44.466, "Trapp Family Lodge", "Resort"],
  ["Vermont", "Stowe", -72.686, 44.528, "Mount Mansfield", "Nature"],
  ["Vermont", "Morrisville", -72.598, 44.562, "Lamoille Valley Rail Trail", "Trail"],
  ["Vermont", "Jay", -72.504, 44.936, "Jay Peak Resort", "Resort"],
  ["Vermont", "St. Johnsbury", -72.015, 44.42, "Fairbanks Museum and Planetarium", "Museum"],
  ["Vermont", "Quechee", -72.418, 43.647, "Quechee Gorge", "Nature"],
  ["Vermont", "Woodstock", -72.518, 43.624, "Billings Farm and Museum", "Living History"],
  ["Vermont", "Woodstock", -72.519, 43.625, "Woodstock Village", "Scenic Town"],
  ["Vermont", "Rutland", -72.979, 43.607, "Pine Hill Park", "Nature"],
  ["Vermont", "Killington", -72.821, 43.604, "Killington Resort", "Resort"],
  ["Vermont", "Grafton", -72.61, 43.172, "Grafton Village", "Scenic Town"],
  ["Vermont", "Manchester", -73.072, 43.163, "Hildene", "Historic Site"],
  ["Vermont", "Bennington", -73.214, 42.878, "Bennington Battle Monument", "Historic Site"],
  ["Vermont", "Bennington", -73.215, 42.879, "Bennington Museum", "Museum"],
  ["Vermont", "Brattleboro", -72.558, 42.85, "Brattleboro Museum and Art Center", "Museum"],
  ["Vermont", "Windsor", -72.39, 43.48, "American Precision Museum", "Museum"],
  ["Vermont", "Windsor", -72.391, 43.479, "Cornish-Windsor Covered Bridge", "Historic Site"],

  ["Virginia", "Arlington", -77.07, 38.88, "Arlington National Cemetery", "Historic Site"],
  ["Virginia", "Mount Vernon", -77.087, 38.708, "George Washington's Mount Vernon", "Historic Site"],
  ["Virginia", "Alexandria", -77.046, 38.805, "Old Town Alexandria", "Scenic Town"],
  ["Virginia", "Manassas", -77.522, 38.813, "Manassas National Battlefield Park", "National Battlefield"],
  ["Virginia", "Fredericksburg", -77.46, 38.299, "Fredericksburg and Spotsylvania National Military Park", "National Battlefield"],
  ["Virginia", "Richmond", -77.433, 37.54, "Virginia Museum of Fine Arts", "Museum"],
  ["Virginia", "Richmond", -77.434, 37.541, "Maymont", "Garden"],
  ["Virginia", "Richmond", -77.433, 37.542, "American Civil War Museum", "Museum"],
  ["Virginia", "Richmond", -77.431, 37.539, "Lewis Ginter Botanical Garden", "Garden"],
  ["Virginia", "Williamsburg", -76.707, 37.271, "Jamestown Settlement", "Living History"],
  ["Virginia", "Williamsburg", -76.707, 37.272, "American Revolution Museum at Yorktown", "Museum"],
  ["Virginia", "Williamsburg", -76.645, 37.234, "Busch Gardens Williamsburg", "Theme Park"],
  ["Virginia", "Norfolk", -76.292, 36.846, "Nauticus and Battleship Wisconsin", "Museum"],
  ["Virginia", "Norfolk", -76.292, 36.847, "Chrysler Museum of Art", "Museum"],
  ["Virginia", "Virginia Beach", -75.978, 36.852, "Virginia Beach Boardwalk", "Beach"],
  ["Virginia", "Virginia Beach", -76.053, 36.906, "First Landing State Park", "Nature"],
  ["Virginia", "Chincoteague", -75.378, 37.933, "Chincoteague National Wildlife Refuge", "Wildlife"],
  ["Virginia", "Charlottesville", -78.456, 38.035, "University of Virginia", "Architecture"],
  ["Virginia", "Charlottesville", -78.522, 38.008, "Michie Tavern", "Historic Site"],
  ["Virginia", "Staunton", -79.071, 38.149, "Frontier Culture Museum", "Living History"],
  ["Virginia", "Staunton", -79.072, 38.15, "American Shakespeare Center", "Entertainment"],
  ["Virginia", "Natural Bridge", -79.545, 37.63, "Natural Bridge State Park", "Nature"],
  ["Virginia", "Roanoke", -79.941, 37.271, "Mill Mountain Star", "Landmark"],
  ["Virginia", "Roanoke", -79.94, 37.272, "Virginia Museum of Transportation", "Museum"],
  ["Virginia", "Abingdon", -82.0, 36.71, "Virginia Creeper Trail", "Trail"],
  ["Virginia", "Bristol", -82.188, 36.596, "Birthplace of Country Music Museum", "Museum"],
  ["Virginia", "Luray", -78.483, 38.665, "Luray Caverns", "Nature"],

  ["West Virginia", "Charleston", -81.633, 38.349, "West Virginia State Capitol", "Architecture"],
  ["West Virginia", "Charleston", -81.633, 38.348, "West Virginia State Museum", "Museum"],
  ["West Virginia", "Huntington", -82.441, 38.419, "Heritage Farm Museum and Village", "Living History"],
  ["West Virginia", "Huntington", -82.445, 38.422, "Huntington Museum of Art", "Museum"],
  ["West Virginia", "Point Pleasant", -82.137, 38.844, "Mothman Museum", "Museum"],
  ["West Virginia", "Moundsville", -80.742, 39.918, "West Virginia Penitentiary", "Historic Site"],
  ["West Virginia", "Moundsville", -80.743, 39.917, "Grave Creek Mound Archaeological Complex", "Historic Site"],
  ["West Virginia", "Wheeling", -80.721, 40.064, "Oglebay Park", "Urban Park"],
  ["West Virginia", "Wheeling", -80.722, 40.063, "Wheeling Suspension Bridge", "Historic Site"],
  ["West Virginia", "Morgantown", -79.956, 39.63, "Coopers Rock State Forest", "Nature"],
  ["West Virginia", "Fairmont", -80.142, 39.486, "Pricketts Fort State Park", "Living History"],
  ["West Virginia", "Clarksburg", -80.344, 39.28, "Trans-Allegheny Lunatic Asylum", "Historic Site"],
  ["West Virginia", "Weston", -80.468, 39.039, "Stonewall Resort State Park", "Resort"],
  ["West Virginia", "Davis", -79.489, 39.039, "Canaan Valley Resort State Park", "Resort"],
  ["West Virginia", "Davis", -79.466, 39.11, "Dolly Sods Wilderness", "Nature"],
  ["West Virginia", "Seneca Rocks", -79.376, 38.834, "Seneca Rocks", "Nature"],
  ["West Virginia", "Marlinton", -80.016, 38.224, "Cass Scenic Railroad State Park", "Scenic Railway"],
  ["West Virginia", "White Sulphur Springs", -80.306, 37.786, "The Greenbrier", "Resort"],
  ["West Virginia", "Lewisburg", -80.445, 37.802, "Lost World Caverns", "Nature"],
  ["West Virginia", "Lewisburg", -80.445, 37.801, "Lewisburg Historic District", "Scenic Town"],
  ["West Virginia", "Beckley", -81.189, 37.778, "Beckley Exhibition Coal Mine", "Museum"],
  ["West Virginia", "Fayetteville", -81.08, 38.052, "New River Gorge Bridge", "Landmark"],
  ["West Virginia", "Ansted", -81.102, 38.137, "Hawks Nest State Park", "Nature"],
  ["West Virginia", "Logan", -81.993, 37.848, "Hatfield-McCoy Trails", "Trail"],
  ["West Virginia", "Bluefield", -81.222, 37.269, "East River Mountain Overlook", "Scenic Overlook"],
  ["West Virginia", "Berkeley Springs", -78.229, 39.626, "Berkeley Springs State Park", "Resort"],
  ["West Virginia", "Shepherdstown", -77.805, 39.43, "Shepherdstown Historic District", "Scenic Town"],
]);

const sourceRows = [
  ["General attraction selection", "State tourism and national park official sites were used as primary orientation sources, with well-known regional landmarks filled in from established public references."],
  ["Alabama", "https://alabama.travel/"],
  ["Arizona", "https://www.visitarizona.com/"],
  ["Arkansas", "https://www.arkansas.com/"],
  ["California", "https://www.visitcalifornia.com/"],
  ["Colorado", "https://www.colorado.com/"],
  ["Connecticut", "https://ctvisit.com/"],
  ["Delaware", "https://www.visitdelaware.com/"],
  ["Florida", "https://www.visitflorida.com/"],
  ["Georgia", "https://www.exploregeorgia.org/"],
  ["Idaho", "https://visitidaho.org/"],
  ["Illinois", "https://www.enjoyillinois.com/"],
  ["Indiana", "https://www.visitindiana.com/"],
  ["Iowa", "https://www.traveliowa.com/"],
  ["Kansas", "https://www.travelks.com/"],
  ["Kentucky", "https://www.kentuckytourism.com/"],
  ["Louisiana", "https://www.louisianatravel.com/"],
  ["Maine", "https://visitmaine.com/"],
  ["Maryland", "https://www.visitmaryland.org/"],
  ["Massachusetts", "https://www.visitma.com/"],
  ["Michigan", "https://www.michigan.org/"],
  ["Minnesota", "https://www.exploreminnesota.com/"],
  ["Mississippi", "https://visitmississippi.org/"],
  ["Missouri", "https://www.visitmo.com/"],
  ["Montana", "https://www.visitmt.com/"],
  ["Nebraska", "https://visitnebraska.com/"],
  ["Nevada", "https://travelnevada.com/"],
  ["New Hampshire", "https://www.visitnh.gov/"],
  ["New Jersey", "https://visitnj.org/"],
  ["New Mexico", "https://www.newmexico.org/"],
  ["New York", "https://www.iloveny.com/things-to-do/"],
  ["North Carolina", "https://www.visitnc.com/"],
  ["North Dakota", "https://www.ndtourism.com/"],
  ["Pennsylvania", "https://www.visitpa.com/"],
  ["Ohio", "https://ohio.org/things-to-do"],
  ["Oklahoma", "https://www.travelok.com/"],
  ["Oregon", "https://traveloregon.com/"],
  ["Rhode Island", "https://www.visitrhodeisland.com/"],
  ["South Carolina", "https://discoversouthcarolina.com/"],
  ["South Dakota", "https://www.travelsouthdakota.com/"],
  ["Tennessee", "https://www.tnvacation.com/"],
  ["Texas", "https://www.traveltexas.com/"],
  ["Utah", "https://www.visitutah.com/"],
  ["Vermont", "https://www.vermontvacation.com/"],
  ["Virginia", "https://www.virginia.org/"],
  ["Washington", "https://stateofwatourism.com/"],
  ["West Virginia", "https://wvtourism.com/"],
  ["Wisconsin", "https://www.travelwisconsin.com/"],
  ["Wyoming", "https://travelwyoming.com/"],
  ["National Park Service reference", "https://www.nps.gov/"],
  ["America's Byways", "https://www.byways.org/"],
  ["Wisconsin Scenic Byways", "https://wisconsindot.gov/Pages/travel/road/scenic-ways/default.aspx"],
  ["Minnesota Scenic Byways", "https://dot.mn.gov/scenicbyways/index.html"],
  ["Montana Scenic-Historic Byways", "https://www.mdt.mt.gov/travinfo/scenic.aspx"],
  ["Wyoming Scenic Byways", "https://dot.state.wy.us/home/travel/scenic_byways.html"],
  ["Nebraska Scenic Byways", "https://visitnebraska.com/scenic-byways"],
  ["Nebraska DOT Scenic Byways", "https://dot.nebraska.gov/travel/scenic-byways/"],
];

const tourismSites = {
  Alabama: "alabama.travel",
  Arizona: "visitarizona.com",
  Arkansas: "arkansas.com",
  California: "visitcalifornia.com",
  Colorado: "colorado.com",
  Connecticut: "ctvisit.com",
  Delaware: "visitdelaware.com",
  Florida: "visitflorida.com",
  Georgia: "exploregeorgia.org",
  Idaho: "visitidaho.org",
  Illinois: "enjoyillinois.com",
  Indiana: "visitindiana.com",
  Iowa: "traveliowa.com",
  Kansas: "travelks.com",
  Kentucky: "kentuckytourism.com",
  Louisiana: "louisianatravel.com",
  Maine: "visitmaine.com",
  Maryland: "visitmaryland.org",
  Massachusetts: "visitma.com",
  Michigan: "michigan.org",
  Minnesota: "exploreminnesota.com",
  Mississippi: "visitmississippi.org",
  Missouri: "visitmo.com",
  Montana: "visitmt.com",
  Nebraska: "visitnebraska.com",
  Nevada: "travelnevada.com",
  "New Hampshire": "visitnh.gov",
  "New Jersey": "visitnj.org",
  "New Mexico": "newmexico.org",
  "New York": "iloveny.com",
  "North Carolina": "visitnc.com",
  "North Dakota": "ndtourism.com",
  Ohio: "ohio.org",
  Oklahoma: "travelok.com",
  Oregon: "traveloregon.com",
  "Pennsylvania": "visitpa.com",
  "Rhode Island": "visitrhodeisland.com",
  "South Carolina": "discoversouthcarolina.com",
  "South Dakota": "travelsouthdakota.com",
  Tennessee: "tnvacation.com",
  Texas: "traveltexas.com",
  Utah: "visitutah.com",
  Vermont: "vermontvacation.com",
  Virginia: "virginia.org",
  "Washington": "stateofwatourism.com",
  "West Virginia": "wvtourism.com",
  Wisconsin: "travelwisconsin.com",
  Wyoming: "travelwyoming.com",
};

const scenicRoads = [
  ["New York", "Great Lakes Seaway Trail", "Niagara Falls", "Alexandria Bay", "Lake Ontario shoreline, historic harbor towns, lighthouses, and St. Lawrence River views.", "Great Lakes shoreline", "https://www.byways.org/explore/byways/2489", [[43.083, -79.074], [43.26, -79.06], [43.45, -76.51], [43.96, -76.12], [44.34, -75.92]], true],
  ["New York", "High Peaks Scenic Byway", "Lake Placid", "Keene Valley", "Adirondack mountain roads, Olympic sites, forests, and trailhead access.", "Mountains and forests", "https://www.iloveny.com/things-to-do/scenic-drives/", [[44.279, -73.979], [44.22, -73.79], [44.19, -73.79], [44.16, -73.77]], true],
  ["Pennsylvania", "Route 6 Heritage Corridor", "Warren", "Scranton", "Northern Pennsylvania towns, forests, lakes, and small museums across a long east-west route.", "Forests and small towns", "https://www.paroute6.com/", [[41.84, -79.15], [41.75, -77.3], [41.7, -76.0], [41.41, -75.67]], true],
  ["Pennsylvania", "Laurel Highlands Scenic Byway", "Ohiopyle", "Johnstown", "Ridges, river valleys, Frank Lloyd Wright sites, and state parks in southwestern Pennsylvania.", "Ridges and river valleys", "https://www.laurelhighlands.org/", [[39.87, -79.5], [40.03, -79.26], [40.16, -79.08], [40.33, -78.92]], true],
  ["Ohio", "Lake Erie Coastal Ohio Trail", "Toledo", "Conneaut", "Lake Erie beaches, lighthouses, islands, port cities, and maritime history.", "Great Lakes shoreline", "https://www.shoresandislands.com/", [[41.66, -83.56], [41.5, -82.94], [41.48, -82.68], [41.51, -81.7], [41.95, -80.55]], true],
  ["Ohio", "Ohio River Scenic Byway", "Cincinnati", "Marietta", "River towns, bridges, historic districts, and Ohio River overlooks.", "River valleys", "https://www.byways.org/explore/byways/2285", [[39.1, -84.51], [38.75, -82.99], [38.73, -82.88], [39.42, -81.45]], true],
  ["Michigan", "M-22 Scenic Drive", "Manistee", "Traverse City", "Lake Michigan beaches, dunes, orchards, villages, and Leelanau Peninsula views.", "Great Lakes shoreline", "https://www.michigan.org/article/trip-idea/m-22-scenic-drive", [[44.25, -86.32], [44.67, -86.21], [44.88, -86.07], [45.0, -85.76], [44.76, -85.62]], true],
  ["Michigan", "Keweenaw Peninsula Scenic Drive", "Houghton", "Copper Harbor", "Copper-mining towns, rugged Lake Superior shorelines, forests, and remote overlooks.", "Lake Superior and forests", "https://www.michigan.org/", [[47.12, -88.57], [47.24, -88.45], [47.39, -88.19], [47.47, -87.89]], true],
  ["Indiana", "Ohio River Scenic Byway", "Madison", "Corydon", "Historic river towns, limestone bluffs, bridges, and southern Indiana landscapes.", "River bluffs", "https://www.byways.org/explore/byways/2285", [[38.76, -85.42], [38.29, -85.76], [38.21, -86.13], [37.97, -87.57]], true],
  ["Indiana", "Historic Michigan Road", "Madison", "South Bend", "Early-state road corridor connecting towns, architecture, and Indiana history.", "Historic towns and farmland", "https://www.visitindiana.com/", [[38.76, -85.42], [39.77, -86.16], [40.05, -86.47], [41.68, -86.25]], true],
  ["Illinois", "Great River Road Illinois", "Galena", "Cairo", "Mississippi River bluffs, small towns, overlooks, and river history along western Illinois.", "River bluffs", "https://www.greatriverroad-illinois.org/", [[42.42, -90.43], [41.51, -90.52], [39.93, -91.41], [38.89, -90.18], [37.0, -89.18]], true],
  ["Illinois", "Illinois Route 66 Scenic Byway", "Chicago", "St. Louis", "Classic roadside stops, diners, murals, neon, and Route 66 nostalgia.", "Roadside Americana", "https://illinoisroute66.org/", [[41.88, -87.63], [41.53, -88.08], [40.88, -88.63], [39.78, -89.65], [38.63, -90.2]], true],
  ["Wisconsin", "Wisconsin Great River Road", "Prescott", "Kieler", "Mississippi River bluffs, river towns, overlooks, and eagle-watching pullouts.", "River bluffs", "https://wisconsindot.gov/Pages/travel/road/scenic-ways/byways.aspx", [[44.75, -92.8], [44.38, -91.93], [43.81, -91.25], [43.05, -91.14], [42.58, -90.6]], true],
  ["Wisconsin", "Door County Coastal Byway", "Sturgeon Bay", "Northport", "Peninsula villages, Lake Michigan and Green Bay shorelines, lighthouses, and orchards.", "Coastal villages", "https://doorcountycoastalbyway.org/", [[44.84, -87.38], [45.05, -87.28], [45.13, -87.25], [45.21, -87.07], [45.29, -86.99]], true],
  ["Minnesota", "North Shore Scenic Drive", "Duluth", "Grand Portage", "Lake Superior cliffs, waterfalls, harbors, state parks, and boreal forest.", "Lake Superior cliffs", "https://www.exploreminnesota.com/profile/north-shore-scenic-drive/2342", [[46.79, -92.1], [47.14, -91.46], [47.64, -90.71], [47.75, -90.33], [47.96, -89.69]], true],
  ["Minnesota", "Great River Road Minnesota", "Bemidji", "La Crescent", "Mississippi headwaters, river towns, bluffs, parks, and cultural sites.", "River valleys and bluffs", "https://www.mnmississippiriver.com/", [[47.47, -94.88], [46.36, -94.2], [45.56, -94.16], [44.95, -93.1], [43.83, -91.3]], true],
  ["Iowa", "Loess Hills National Scenic Byway", "Akron", "Hamburg", "Wind-formed hills, prairie remnants, overlooks, and western Iowa small towns.", "Prairie hills", "https://www.traveliowa.com/trails/loess-hills-national-scenic-byway/15/", [[42.83, -96.56], [42.5, -96.41], [41.26, -95.86], [40.61, -95.66]], true],
  ["Iowa", "Iowa Great River Road", "Lansing", "Keokuk", "Mississippi River bluffs, river towns, museums, locks, and scenic overlooks.", "River bluffs", "https://www.traveliowa.com/trails/great-river-road-national-scenic-byway/13/", [[43.36, -91.22], [42.5, -90.67], [41.52, -90.57], [40.4, -91.38]], true],
  ["North Dakota", "Sheyenne River Valley National Scenic Byway", "Valley City", "Lisbon", "Rolling river valley, prairie bridges, historic sites, and small towns.", "Prairie river valley", "https://www.ndtourism.com/", [[46.92, -98.0], [46.78, -97.98], [46.44, -97.68]], true],
  ["North Dakota", "Killdeer Mountain Four Bears Scenic Byway", "Manning", "New Town", "Badlands edges, prairie, lake views, and cultural-history stops.", "Badlands and prairie", "https://www.ndtourism.com/", [[47.23, -102.77], [47.39, -102.32], [47.98, -102.49]], true],
  ["South Dakota", "Peter Norbeck Scenic Byway", "Custer", "Mount Rushmore", "Granite tunnels, pigtail bridges, Black Hills forests, and landmark views.", "Granite mountains", "https://www.travelsouthdakota.com/trip-ideas/article/peter-norbeck-scenic-byway", [[43.76, -103.6], [43.84, -103.56], [43.87, -103.48], [43.88, -103.46]], true],
  ["South Dakota", "Spearfish Canyon Scenic Byway", "Spearfish", "Cheyenne Crossing", "Limestone canyon walls, waterfalls, trout streams, and forest colors.", "Canyon and forest", "https://www.travelsouthdakota.com/trip-ideas/article/spearfish-canyon-scenic-byway", [[44.49, -103.86], [44.35, -103.92], [44.29, -103.87]], true],
  ["Nebraska", "Sandhills Journey National Scenic Byway", "Grand Island", "Alliance", "Nebraska Highway 2 crosses rolling Sandhills, prairie rivers, crane country, starry skies, and national forest scenery.", "Sandhills and prairie", "https://visitnebraska.com/scenic-byways", [[40.924, -98.342], [40.998, -98.912], [41.404, -99.639], [41.902, -100.29], [42.05, -101.064], [42.1, -102.87]], true],
  ["Nebraska", "Outlaw Trail Scenic Byway", "South Sioux City", "Valentine", "Nebraska Highway 12 follows Missouri and Niobrara River country, bluffs, tribal lands, small towns, and outlaw-era stories.", "River bluffs and Sandhills", "https://visitnebraska.com/scenic-byways", [[42.474, -96.414], [42.809, -97.498], [42.835, -98.47], [42.872, -99.715], [42.872, -100.551]], true],
  ["Nebraska", "Western Trails Scenic and Historic Byway", "Ogallala", "Wyoming border", "U.S. 26 and Nebraska 92 trace Oregon Trail landmarks, Lake McConaughy, Chimney Rock, and Scotts Bluff.", "Trail landmarks and bluffs", "https://dot.nebraska.gov/travel/scenic-byways/", [[41.128, -101.719], [41.48, -102.78], [41.703, -103.349], [41.835, -103.707], [41.866, -104.03]], true],
  ["Nebraska", "385-Gold Rush Scenic Byway", "Chadron", "Sidney", "U.S. 385 crosses Panhandle buttes, pine ridges, Carhenge, ranch country, and Sidney-Deadwood Trail history.", "Buttes and High Plains", "https://dot.nebraska.gov/travel/scenic-byways/", [[42.829, -103.001], [42.67, -103.751], [42.142, -102.858], [41.866, -103.664], [41.142, -102.978]], true],
  ["Montana", "Beartooth Highway", "Red Lodge", "Cooke City", "High alpine switchbacks, tundra, lakes, and vast mountain views.", "Alpine mountains", "https://www.byways.org/explore/byways/2281", [[45.19, -109.25], [45.03, -109.42], [44.97, -109.47], [44.94, -109.61], [45.02, -109.93]], true],
  ["Montana", "Going-to-the-Sun Road", "West Glacier", "St. Mary", "Glacier National Park's famous alpine crossing with lakes, cliffs, and high passes.", "Alpine mountains and lakes", "https://www.nps.gov/glac/planyourvisit/goingtothesunroad.htm", [[48.5, -113.98], [48.7, -113.72], [48.69, -113.53], [48.75, -113.43]], true],
  ["Wyoming", "Chief Joseph Scenic Byway", "Cody", "Beartooth Highway", "Absaroka mountain views, historic landscapes, and dramatic switchbacks.", "Mountains and canyons", "https://travelwyoming.com/listings/chief-joseph-scenic-byway/", [[44.53, -109.06], [44.47, -109.43], [44.84, -109.65], [44.94, -109.61]], true],
  ["Wyoming", "Centennial Scenic Byway", "Dubois", "Pinedale", "Wind River, Teton gateway country, high valleys, and national-forest scenery.", "Mountains and sage valleys", "https://www.recreation.gov/gateways/13902", [[43.53, -109.63], [43.86, -110.59], [43.48, -110.76], [42.87, -109.86]], true],
  ["Idaho", "Sawtooth Scenic Byway", "Shoshone", "Stanley", "Lava plains, mountain valleys, alpine lakes, and jagged Sawtooth views.", "Mountains and meadows", "https://visitidaho.org/things-to-do/road-trips/sawtooth-scenic-byway/", [[42.94, -114.41], [43.68, -114.36], [44.07, -114.74], [44.22, -114.93]], true],
  ["Idaho", "International Selkirk Loop", "Sandpoint", "Bonners Ferry", "Lake Pend Oreille, forested mountains, wildlife refuges, and borderland towns.", "Lakes and mountains", "https://selkirkloop.org/", [[48.28, -116.55], [48.47, -116.55], [48.69, -116.32]], true],
  ["Washington", "Cascade Loop Scenic Byway", "Everett", "Whidbey Island", "Cascades, river valleys, Bavarian Leavenworth, orchards, and Puget Sound islands.", "Mountains, orchards, coast", "https://www.cascadeloop.com/", [[47.98, -122.2], [47.86, -121.97], [47.6, -120.66], [48.47, -120.18], [48.5, -122.6]], true],
  ["Washington", "Chuckanut Drive", "Burlington", "Bellingham", "Coastal cliffs, forest curves, island views, and oyster-country pullouts.", "Coastal forest", "https://stateofwatourism.com/", [[48.47, -122.33], [48.61, -122.43], [48.75, -122.48]], true],
  ["Oregon", "Historic Columbia River Highway", "Troutdale", "The Dalles", "Waterfalls, basalt cliffs, river overlooks, and early highway engineering.", "River gorge and waterfalls", "https://traveloregon.com/things-to-do/trip-ideas/scenic-byways/historic-columbia-river-highway/", [[45.54, -122.39], [45.58, -122.12], [45.69, -121.52], [45.6, -121.18]], true],
  ["Oregon", "Hells Canyon Scenic Byway", "La Grande", "Baker City", "Wallowa Mountains, ranch valleys, canyon overlooks, and northeast Oregon towns.", "Mountains and canyon", "https://traveloregon.com/things-to-do/trip-ideas/scenic-byways/hells-canyon-scenic-byway/", [[45.33, -118.09], [45.35, -117.23], [45.57, -117.92], [44.78, -117.83]], true],
];

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function googleMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function attractionLinks(item) {
  const place = `${item.name} ${item.city} ${item.state}`;
  const tourismSite = tourismSites[item.state] || "usa.gov";
  return [
    googleSearchUrl(`${place} official website`),
    googleSearchUrl(`site:${tourismSite} ${item.name}`),
    googleSearchUrl(`${place} visitor information`),
    googleSearchUrl(`${place} photos`),
    item.type.includes("National") ? googleSearchUrl(`site:nps.gov ${item.name}`) : googleSearchUrl(`${place} wikipedia OR wikivoyage`),
  ];
}

async function loadDetailedRouteGeometry() {
  try {
    const payload = JSON.parse(await fs.readFile(routeGeometryPath, "utf8"));
    return payload.routes || {};
  } catch {
    return {};
  }
}

function simplifyPath(points, tolerance = 0.01) {
  if (!Array.isArray(points) || points.length <= 2) return points || [];
  const sqTolerance = tolerance * tolerance;

  function sqDist(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
  }

  function sqSegDist(p, p1, p2) {
    let x = p1[0];
    let y = p1[1];
    let dx = p2[0] - x;
    let dy = p2[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }

  const radial = [points[0]];
  let prev = points[0];
  for (let i = 1; i < points.length; i += 1) {
    if (sqDist(points[i], prev) > sqTolerance) {
      radial.push(points[i]);
      prev = points[i];
    }
  }
  if (prev !== points[points.length - 1]) radial.push(points[points.length - 1]);

  const simplified = [radial[0]];
  function simplifyDps(start, end) {
    let maxSqDist = sqTolerance;
    let index = 0;
    for (let i = start + 1; i < end; i += 1) {
      const sqDistance = sqSegDist(radial[i], radial[start], radial[end]);
      if (sqDistance > maxSqDist) {
        index = i;
        maxSqDist = sqDistance;
      }
    }
    if (maxSqDist > sqTolerance) {
      if (index - start > 1) simplifyDps(start, index);
      simplified.push(radial[index]);
      if (end - index > 1) simplifyDps(index, end);
    }
  }
  simplifyDps(0, radial.length - 1);
  simplified.push(radial[radial.length - 1]);
  return simplified;
}

const typeColors = {
  "Nature": "#2e7d32",
  "National Park": "#1b5e20",
  "National Monument": "#4caf50",
  "Museum": "#6a1b9a",
  "Historic Site": "#8d6e63",
  "Theme Park": "#ef6c00",
  "Water Park": "#0288d1",
  "Zoo/Aquarium": "#00838f",
  "Garden": "#43a047",
  "Sports": "#c62828",
  "Arts/Culture": "#ad1457",
  "Scenic Drive": "#f9a825",
  "Waterfront": "#0277bd",
  "Beach": "#00acc1",
  "Roadside": "#795548",
  "Architecture": "#455a64",
  "Science": "#3949ab",
  "Wildlife": "#558b2f",
  "Trail": "#7cb342",
  "Resort": "#5e35b1",
  "Food/Market": "#d84315",
  "Food/Drink": "#bf360c",
  "Scenic Town": "#00897b",
  "Scenic Region": "#009688",
  "Cave": "#5d4037",
  "Shopping": "#ec407a",
  "Observation": "#546e7a",
  "Memorial": "#616161",
  "Urban Park": "#66bb6a",
  "Island": "#039be5",
  "Engineering": "#607d8b",
  "Living History": "#a1887f",
  "Scenic Railway": "#8e24aa",
  "Cultural Site": "#9c27b0",
  "Scenic Overlook": "#fbc02d",
  "Entertainment": "#e91e63",
  "Landmark": "#546e7a",
};

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function rowsForWorkbook() {
  return [
    ...attractions,
    ...extraAttractions,
    ...mainlandExpansionAttractions,
    ...mainlandExpansionAdditionalAttractions,
    ...mainlandExpansionAdditionalAttractions2,
  ].map((row, index) => {
    const item = {
      id: index + 1,
      state: row[0],
      city: row[1],
      longitude: row[2],
      latitude: row[3],
      name: row[4],
      audience: row[5],
      why: row[6],
      type: row[7],
      attractionSelected: true,
    };
    const links = attractionLinks(item);
    return {
      ...item,
      link1: links[0],
      link2: links[1],
      link3: links[2],
      link4: links[3],
      link5: links[4],
      googleMaps: googleMapsUrl(`${item.name}, ${item.city}, ${item.state}`),
    };
  });
}

async function createWorkbook(data) {
  const workbook = Workbook.create();
  const overview = workbook.worksheets.add("Overview");
  const ws = workbook.worksheets.add("Attractions");
  const stateWs = workbook.worksheets.add("States");
  const roadWs = workbook.worksheets.add("Scenic Roads");
  const sourceWs = workbook.worksheets.add("Sources");

  for (const sheet of [overview, ws, stateWs, roadWs, sourceWs]) {
    sheet.showGridLines = false;
  }

  overview.getRange("A1:H1").merge();
  overview.getRange("A1").values = [["Mainland USA Road Trip Attraction Planner"]];
  overview.getRange("A1").format = { fill: "#1F4E5F", font: { bold: true, color: "#FFFFFF", size: 16 }, horizontalAlignment: "left" };
  overview.getRange("A3:B9").values = [
    ["Starting point", "Rochester, NY"],
    ["State scope", "All 48 contiguous U.S. states"],
    ["States included", states.length],
    ["Attractions included", data.length],
    ["Scenic roads included", scenicRoads.length],
    ["Default selection", "All mainland states and all attractions selected"],
    ["Map companion", "Open northern_states_roadtrip_map.html"],
  ];
  overview.getRange("A3:A9").format = { font: { bold: true }, fill: "#E6F0F3" };
  overview.getRange("A11:H11").merge();
  overview.getRange("A11").values = [["Use the States worksheet to toggle whole states, the Attraction Selected column on Attractions to toggle individual stops, and the Road Selected column on Scenic Roads to toggle scenic-route lines. The HTML map includes matching interactive controls and starts from the same default mainland-USA selection."]];
  overview.getRange("A11").format = { wrapText: true, fill: "#FFF8E1" };
  overview.getRange("A1:H12").format.columnWidth = 20;

  const headers = [
    "State", "Nearest City", "Longitude", "Latitude", "Attraction Name",
    "Audience", "Why Interesting", "Attraction Type", "Link 1", "Link 2",
    "Link 3", "Link 4", "Link 5", "Google Maps Link", "Attraction Selected",
    "State Selected", "Visualize",
  ];
  ws.getRangeByIndexes(0, 0, 1, headers.length).values = [headers];
  ws.getRangeByIndexes(0, 0, 1, headers.length).format = {
    fill: "#1F4E5F",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  const valueRows = data.map((item) => [
    item.state, item.city, item.longitude, item.latitude, item.name,
    item.audience, item.why, item.type, item.link1, item.link2,
    item.link3, item.link4, item.link5, item.googleMaps, item.attractionSelected,
    null, null,
  ]);
  ws.getRangeByIndexes(1, 0, valueRows.length, headers.length).values = valueRows;
  const formulaRows = data.map((_, idx) => {
    const r = idx + 2;
    return [
      `=IFERROR(VLOOKUP(A${r},States!$A$2:$B$${states.length + 1},2,FALSE),FALSE)`,
      `=AND(OR(O${r}=TRUE,O${r}="TRUE"),OR(P${r}=TRUE,P${r}="TRUE"))`,
    ];
  });
  ws.getRangeByIndexes(1, 15, formulaRows.length, 2).formulas = formulaRows;
  ws.getRangeByIndexes(1, 14, valueRows.length, 1).dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
  ws.getRangeByIndexes(1, 0, valueRows.length, headers.length).format.wrapText = true;
  const attractionEndRow = data.length + 1;
  ws.getRange(`A1:Q${attractionEndRow}`).format.verticalAlignment = "top";
  ws.getRange(`A1:A${attractionEndRow}`).format.columnWidth = 15;
  ws.getRange(`B1:B${attractionEndRow}`).format.columnWidth = 18;
  ws.getRange(`C1:D${attractionEndRow}`).format.columnWidth = 11;
  ws.getRange(`E1:E${attractionEndRow}`).format.columnWidth = 34;
  ws.getRange(`F1:G${attractionEndRow}`).format.columnWidth = 38;
  ws.getRange(`H1:H${attractionEndRow}`).format.columnWidth = 18;
  ws.getRange(`I1:N${attractionEndRow}`).format.columnWidth = 34;
  ws.getRange(`O1:Q${attractionEndRow}`).format.columnWidth = 14;
  ws.freezePanes.freezeRows(1);
  ws.tables.add(`A1:Q${attractionEndRow}`, true, "AttractionsTable");

  const stateHeaders = ["State", "Selected", "Scope Band", "Notes"];
  stateWs.getRange("A1:D1").values = [stateHeaders];
  stateWs.getRange("A1:D1").format = {
    fill: "#1F4E5F",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
  };
  stateWs.getRangeByIndexes(1, 0, states.length, stateHeaders.length).values = states;
  stateWs.getRangeByIndexes(1, 1, states.length, 1).dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
  const stateEndRow = states.length + 1;
  stateWs.getRange(`A1:D${stateEndRow}`).format.wrapText = true;
  stateWs.getRange(`A1:A${stateEndRow}`).format.columnWidth = 18;
  stateWs.getRange(`B1:B${stateEndRow}`).format.columnWidth = 12;
  stateWs.getRange(`C1:C${stateEndRow}`).format.columnWidth = 24;
  stateWs.getRange(`D1:D${stateEndRow}`).format.columnWidth = 48;
  stateWs.freezePanes.freezeRows(1);
  stateWs.tables.add(`A1:D${stateEndRow}`, true, "StatesTable");

  const roadHeaders = [
    "State", "Scenic Road", "Start / Nearest City", "End / Nearest City", "Brief Description",
    "Scenery Type", "Info / Images Link", "Google Maps Link", "Approximate Path",
    "Road Selected", "State Selected", "Visualize",
  ];
  roadWs.getRange("A1:L1").values = [roadHeaders];
  roadWs.getRange("A1:L1").format = {
    fill: "#1F4E5F",
    font: { bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  const roadValueRows = scenicRoads.map((road) => [
    road[0], road[1], road[2], road[3], road[4], road[5], road[6],
    googleMapsUrl(`${road[1]}, ${road[0]}`), JSON.stringify(road[7]), road[8],
    null, null,
  ]);
  roadWs.getRangeByIndexes(1, 0, roadValueRows.length, roadHeaders.length).values = roadValueRows;
  const roadFormulaRows = scenicRoads.map((_, idx) => {
    const r = idx + 2;
    return [
      `=IFERROR(VLOOKUP(A${r},States!$A$2:$B$${states.length + 1},2,FALSE),FALSE)`,
      `=AND(OR(J${r}=TRUE,J${r}="TRUE"),OR(K${r}=TRUE,K${r}="TRUE"))`,
    ];
  });
  roadWs.getRangeByIndexes(1, 10, roadFormulaRows.length, 2).formulas = roadFormulaRows;
  roadWs.getRangeByIndexes(1, 9, roadValueRows.length, 1).dataValidation = { rule: { type: "list", values: ["TRUE", "FALSE"] } };
  const roadEndRow = scenicRoads.length + 1;
  roadWs.getRange(`A1:L${roadEndRow}`).format.wrapText = true;
  roadWs.getRange(`A1:L${roadEndRow}`).format.verticalAlignment = "top";
  roadWs.getRange(`A1:A${roadEndRow}`).format.columnWidth = 15;
  roadWs.getRange(`B1:D${roadEndRow}`).format.columnWidth = 24;
  roadWs.getRange(`E1:E${roadEndRow}`).format.columnWidth = 50;
  roadWs.getRange(`F1:F${roadEndRow}`).format.columnWidth = 24;
  roadWs.getRange(`G1:H${roadEndRow}`).format.columnWidth = 42;
  roadWs.getRange(`I1:I${roadEndRow}`).format.columnWidth = 34;
  roadWs.getRange(`J1:L${roadEndRow}`).format.columnWidth = 14;
  roadWs.freezePanes.freezeRows(1);
  roadWs.tables.add(`A1:L${roadEndRow}`, true, "ScenicRoadsTable");

  sourceWs.getRange("A1:B1").values = [["Source / Use", "Link or Note"]];
  sourceWs.getRange("A1:B1").format = { fill: "#1F4E5F", font: { bold: true, color: "#FFFFFF" } };
  sourceWs.getRangeByIndexes(1, 0, sourceRows.length, 2).values = sourceRows;
  sourceWs.getRange(`A1:B${sourceRows.length + 1}`).format.wrapText = true;
  sourceWs.getRange(`A1:A${sourceRows.length + 1}`).format.columnWidth = 28;
  sourceWs.getRange(`B1:B${sourceRows.length + 1}`).format.columnWidth = 80;
  sourceWs.tables.add(`A1:B${sourceRows.length + 1}`, true, "SourcesTable");

  const errorScan = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 20 },
    summary: "formula error scan",
  });
  console.log(errorScan.ndjson);

  console.log("Skipped workbook preview images for the expanded mainland-USA dataset.");

  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(xlsxPath);
}

function createMapHtml(data, detailedRouteGeometry = {}) {
  const typeOptions = [...new Set(data.map((d) => d.type))].sort();
  const stateOptions = states.map((s) => s[0]);
  const stateAbbreviations = {
    Alabama: "AL",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
  };
  const mapData = data.map((item) => ({
    state: item.state,
    city: item.city,
    lon: item.longitude,
    lat: item.latitude,
    name: item.name,
    audience: item.audience,
    why: item.why,
    type: item.type,
    selected: item.attractionSelected,
    maps: item.googleMaps,
    color: typeColors[item.type] || "#555555",
  }));
  const roadData = scenicRoads.map((road) => {
    const key = `${road[0]}|${road[1]}`;
    const detailed = detailedRouteGeometry[key]?.geometry;
    const pathPoints = Array.isArray(detailed) && detailed.length > road[7].length
      ? simplifyPath(detailed, 0.006)
      : road[7];
    return {
      state: road[0],
      name: road[1],
      start: road[2],
      end: road[3],
      description: road[4],
      scenery: road[5],
      link: road[6],
      maps: googleMapsUrl(`${road[1]}, ${road[0]}`),
      path: pathPoints,
      routePointCount: pathPoints.length,
      routeSource: Array.isArray(detailed) ? "Road-following routing geometry" : "Simplified waypoint geometry",
      selected: road[8],
    };
  });
  const normalizeLocationKey = (value) => String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[.]/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  const localLocationLookup = {};
  const cityGroups = new Map();
  const stateGroups = new Map();
  mapData.forEach((item) => {
    const cityKey = `${item.city}|${item.state}`;
    if (!cityGroups.has(cityKey)) {
      cityGroups.set(cityKey, {
        city: item.city,
        state: item.state,
        latSum: 0,
        lonSum: 0,
        count: 0,
      });
    }
    const group = cityGroups.get(cityKey);
    group.latSum += item.lat;
    group.lonSum += item.lon;
    group.count += 1;
    if (!stateGroups.has(item.state)) {
      stateGroups.set(item.state, {
        state: item.state,
        latSum: 0,
        lonSum: 0,
        count: 0,
      });
    }
    const stateGroup = stateGroups.get(item.state);
    stateGroup.latSum += item.lat;
    stateGroup.lonSum += item.lon;
    stateGroup.count += 1;
  });
  const cityNameCounts = new Map();
  cityGroups.forEach((group) => {
    const cityKey = normalizeLocationKey(group.city);
    cityNameCounts.set(cityKey, (cityNameCounts.get(cityKey) || 0) + 1);
  });
  function addLocalLocationAlias(alias, entry) {
    const key = normalizeLocationKey(alias);
    if (!key || localLocationLookup[key]) return;
    localLocationLookup[key] = entry;
  }
  cityGroups.forEach((group) => {
    const lat = group.latSum / group.count;
    const lon = group.lonSum / group.count;
    const abbr = stateAbbreviations[group.state] || group.state;
    const entry = {
      name: `${group.city}, ${group.state}`,
      label: `${group.city}, ${group.state}`,
      lat,
      lon,
      source: "local-city",
    };
    addLocalLocationAlias(`${group.city}, ${group.state}`, entry);
    addLocalLocationAlias(`${group.city} ${group.state}`, entry);
    addLocalLocationAlias(`${group.city}, ${abbr}`, entry);
    addLocalLocationAlias(`${group.city} ${abbr}`, entry);
    if ((cityNameCounts.get(normalizeLocationKey(group.city)) || 0) === 1) {
      addLocalLocationAlias(group.city, entry);
    }
  });
  stateGroups.forEach((group) => {
    const entry = {
      name: group.state,
      label: group.state,
      lat: group.latSum / group.count,
      lon: group.lonSum / group.count,
      source: "local-state",
    };
    addLocalLocationAlias(group.state, entry);
    addLocalLocationAlias(stateAbbreviations[group.state] || group.state, entry);
  });
  mapData.forEach((item) => {
    const entry = {
      name: item.name,
      label: `${item.name} (${item.city}, ${item.state})`,
      lat: item.lat,
      lon: item.lon,
      source: "local-attraction",
    };
    addLocalLocationAlias(item.name, entry);
    addLocalLocationAlias(`${item.name}, ${item.city}, ${item.state}`, entry);
    addLocalLocationAlias(`${item.name}, ${item.city}, ${stateAbbreviations[item.state] || item.state}`, entry);
  });
  const localLocationEntries = Object.entries(localLocationLookup);
  const legend = typeOptions.map((type) => `<label class="chip"><input type="checkbox" class="type-filter" value="${htmlEscape(type)}" checked><span style="background:${typeColors[type] || "#555555"}"></span>${htmlEscape(type)}</label>`).join("");
  const stateControls = stateOptions.map((state) => `<label class="check"><input type="checkbox" class="state-filter" value="${htmlEscape(state)}" checked>${htmlEscape(state)}</label>`).join("");
  const roadControls = roadData.map((road) => `<label class="check"><input type="checkbox" class="road-filter" value="${htmlEscape(road.name)}" checked>${htmlEscape(road.name)}</label>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mainland USA Road Trip Attractions Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Segoe UI, Arial, sans-serif; color: #1f2933; background: #f4f7f8; }
    .shell { display: grid; grid-template-columns: 360px 1fr; min-height: 100vh; }
    aside { padding: 18px; background: #ffffff; border-right: 1px solid #dbe4e8; overflow: auto; }
    h1 { font-size: 20px; margin: 0 0 6px; }
    .sub { margin: 0 0 16px; color: #53636d; line-height: 1.35; font-size: 13px; }
    .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0 16px; }
    .metric { border: 1px solid #dbe4e8; border-radius: 8px; padding: 10px; background: #f9fbfc; }
    .metric strong { display: block; font-size: 20px; }
    .metric span { font-size: 12px; color: #53636d; }
    input[type="search"] { width: 100%; padding: 10px 12px; border: 1px solid #c9d6dc; border-radius: 8px; font-size: 14px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: #53636d; margin: 18px 0 8px; }
    .checks { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 10px; }
    .check, .chip { display: flex; align-items: center; gap: 7px; font-size: 13px; min-height: 26px; }
    .chip span { width: 12px; height: 12px; border-radius: 50%; display: inline-block; flex: 0 0 12px; }
    .actions { display: flex; gap: 8px; margin-top: 10px; }
    button, .file-load { border: 1px solid #9ab1bc; background: #fff; color: #244653; border-radius: 8px; padding: 8px 10px; cursor: pointer; }
    button:hover { background: #eef5f7; }
    .file-load { display: block; margin-top: 8px; text-align: center; font-size: 13px; }
    .file-load:hover { background: #eef5f7; }
    .file-load input { display: none; }
    .save-actions { display: flex; gap: 8px; margin-top: 10px; }
    #map { height: 100vh; width: 100%; background: #e7eef2; }
    .tile-warning { position: absolute; z-index: 450; right: 14px; bottom: 24px; max-width: 320px; background: rgba(255,255,255,.94); border: 1px solid #d5e0e5; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #33444c; box-shadow: 0 4px 18px rgba(0,0,0,.12); display: none; }
    .leaflet-popup-content { font-size: 13px; line-height: 1.35; }
    .popup-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
    .tag { display: inline-block; margin: 5px 0; padding: 3px 7px; border-radius: 999px; color: #fff; font-size: 12px; }
    .popup-actions { display: flex; gap: 8px; margin-top: 8px; }
    .popup-btn { border: 1px solid #9ab1bc; background: #fff; color: #244653; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 12px; }
    .popup-btn:hover { background: #eef5f7; }
    .status-pill { display: inline-block; margin-left: 6px; padding: 2px 7px; border-radius: 999px; font-size: 11px; vertical-align: middle; }
    .status-on { background: #dff3e4; color: #1b5e20; }
    .status-off { background: #eceff1; color: #546e7a; }
    .route-panel { margin-top: 14px; padding: 12px; border: 1px solid #dbe4e8; border-radius: 8px; background: #f9fbfc; }
    .route-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .route-grid .field-wide { grid-column: 1 / -1; }
    .route-panel label { display: block; font-size: 12px; color: #53636d; margin-bottom: 4px; }
    .route-panel input[type="number"], .route-panel select { width: 100%; padding: 8px 10px; border: 1px solid #c9d6dc; border-radius: 8px; font-size: 13px; background: #fff; }
    .route-actions { display: flex; gap: 8px; margin-top: 10px; }
    .route-error { margin-top: 8px; color: #b91c1c; font-size: 12px; min-height: 16px; }
    .route-summary { margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .route-stat { border: 1px solid #dbe4e8; border-radius: 8px; padding: 8px; background: #fff; }
    .route-stat strong { display: block; font-size: 16px; }
    .route-stat span { font-size: 11px; color: #61727c; }
    .route-note { grid-column: 1 / -1; border: 1px solid #d9e8ef; border-radius: 8px; padding: 8px 10px; background: #f3f9fc; color: #41606e; font-size: 12px; line-height: 1.35; }
    .day-list { margin-top: 10px; display: grid; gap: 8px; }
    .day-card { border: 1px solid #dbe4e8; border-radius: 8px; padding: 10px; background: #fff; cursor: pointer; }
    .day-card.active { border-color: #245164; box-shadow: 0 0 0 2px rgba(36,81,100,.12); }
    .day-card.rest { background: #fcfcf8; }
    .day-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
    .day-meta, .day-stop { font-size: 12px; color: #4e5f69; line-height: 1.35; }
    .day-stop { margin-top: 4px; }
    .route-badge { background: #245164; color: #fff; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,.2); }
    .night-badge { background: #7c3aed; color: #fff; min-width: 34px; height: 26px; padding: 0 8px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-size: 11px; font-weight: 700; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,.25); }
    .rest-badge { background: #0f766e; }
    .attraction-list { margin-top: 10px; border: 1px solid #dbe4e8; border-radius: 8px; background: #fbfcfd; max-height: 240px; overflow: auto; }
    .attr-row { display: grid; grid-template-columns: 18px 1fr; gap: 8px; padding: 8px 10px; border-bottom: 1px solid #eef3f5; align-items: start; font-size: 13px; }
    .attr-row:last-child { border-bottom: 0; }
    .attr-name { font-weight: 600; }
    .attr-meta { color: #61727c; font-size: 12px; margin-top: 2px; }
    .helper { color: #61727c; font-size: 12px; margin-top: 6px; line-height: 1.35; }
    @media (max-width: 900px) {
      .shell { grid-template-columns: 1fr; }
      aside { max-height: 46vh; border-right: 0; border-bottom: 1px solid #dbe4e8; }
      #map { height: 54vh; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside>
      <h1>Mainland USA Road Trip</h1>
      <p class="sub">Attraction candidates across all 48 contiguous U.S. states, with Rochester, NY as the default starting point and selectable scenic roads where available.</p>
      <input id="search" type="search" placeholder="Search attractions, cities, audience, or why...">
      <label class="file-load">Load edited workbook<input id="workbookInput" type="file" accept=".xlsx,.xls"></label>
      <div class="save-actions">
        <button id="exportState">Export Selections</button>
        <label class="file-load" style="margin-top:0;">Import Selections<input id="importState" type="file" accept=".json"></label>
      </div>
      <div class="route-panel">
        <h2>Route Planner</h2>
        <div class="route-grid">
          <div class="field-wide">
            <label for="routeStart">Start attraction</label>
            <select id="routeStart"></select>
          </div>
          <div class="field-wide">
            <label for="routeEnd">End attraction</label>
            <select id="routeEnd"></select>
          </div>
          <div>
            <label for="routeMaxHours">Max driving hours / day</label>
            <input id="routeMaxHours" type="number" min="1" max="12" step="0.5" value="5">
          </div>
          <div>
            <label for="routeRestDays">Rest days</label>
            <input id="routeRestDays" type="number" min="0" max="30" step="1" value="0">
          </div>
        </div>
        <div class="route-actions">
          <button id="computeRoute">Compute Route</button>
          <button id="clearRoute">Clear Route</button>
          <button id="toggleRouteLines">Hide Route</button>
          <button id="toggleNightStops">Hide Night Stops</button>
        </div>
        <div id="routeError" class="route-error"></div>
        <div id="routeSummary" class="route-summary"></div>
        <div id="dayList" class="day-list"></div>
      </div>
      <div class="summary">
        <div class="metric"><strong id="visibleCount">0</strong><span>visible stops</span></div>
        <div class="metric"><strong>${data.length}</strong><span>total stops</span></div>
        <div class="metric"><strong id="visibleRoadCount">0</strong><span>visible roads</span></div>
        <div class="metric"><strong>${roadData.length}</strong><span>total roads</span></div>
      </div>
      <h2>States</h2>
      <div class="actions"><button id="allStates">All</button><button id="noStates">None</button></div>
      <div class="checks" id="stateFilters">${stateControls}</div>
      <h2>Types</h2>
      <div class="actions"><button id="allTypes">All</button><button id="noTypes">None</button></div>
      <div class="checks" id="typeFilters">${legend}</div>
      <h2>Scenic Roads</h2>
      <label class="check"><input id="showRoads" type="checkbox" checked>Show scenic roads</label>
      <div class="actions"><button id="allRoads">All</button><button id="noRoads">None</button></div>
      <div class="checks" id="roadFilters">${roadControls}</div>
      <h2>Attractions</h2>
      <div class="actions"><button id="selectFiltered">Select Filtered</button><button id="clearFiltered">Clear Filtered</button></div>
      <div class="helper"><span id="selectedCount">0</span> selected. This browser remembers your attraction selections for this HTML file.</div>
      <div id="attractionList" class="attraction-list"></div>
    </aside>
    <main id="map"></main>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
  <script>
    const attractions = ${JSON.stringify(mapData)};
    const scenicRoads = ${JSON.stringify(roadData)};
    let activeAttractions = attractions;
    let activeRoads = scenicRoads;
    const STORAGE_KEY = "roadtrip2026-map-state-v2";
    const map = L.map("map", { preferCanvas: true }).setView([44.7, -99.5], 4);
    const tileWarning = L.DomUtil.create("div", "tile-warning", map.getContainer());
    tileWarning.textContent = "The attraction markers still work, but the background map tiles could not load. Try opening this file through a local web server if your browser blocks local-file tile requests.";
    const baseTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    baseTiles.on("tileerror", () => { tileWarning.style.display = "block"; });
    const layer = L.layerGroup().addTo(map);
    const roadLayer = L.layerGroup().addTo(map);
    const routeLineLayer = L.layerGroup().addTo(map);
    const routeMarkerLayer = L.layerGroup().addTo(map);
    const visibleCount = document.getElementById("visibleCount");
    const visibleRoadCount = document.getElementById("visibleRoadCount");
    const selectedCount = document.getElementById("selectedCount");
    const attractionList = document.getElementById("attractionList");
    const routeStartInput = document.getElementById("routeStart");
    const routeEndInput = document.getElementById("routeEnd");
    const routeMaxHoursInput = document.getElementById("routeMaxHours");
    const routeRestDaysInput = document.getElementById("routeRestDays");
    const toggleRouteLinesButton = document.getElementById("toggleRouteLines");
    const toggleNightStopsButton = document.getElementById("toggleNightStops");
    const routeError = document.getElementById("routeError");
    const routeSummaryEl = document.getElementById("routeSummary");
      const dayListEl = document.getElementById("dayList");
      const dayColors = ["#245164", "#7c3aed", "#0f766e", "#b45309", "#be185d", "#1d4ed8", "#4d7c0f", "#9f1239"];
      const reverseGeocodeCache = new Map();
      const localLocationLookup = ${JSON.stringify(localLocationLookup)};
      const localLocationEntries = ${JSON.stringify(localLocationEntries)};
      let currentRouteSummary = null;
      let currentDayPlan = [];
      let routeDisplayState = { showRouteLines: true, showNightStops: true };
      let currentRouteLayers = {
        linesByDay: new Map(),
        markersByDay: new Map(),
        routeLines: [],
        overnightMarkers: [],
        stopBadges: [],
        activeDay: null
      };
    function attractionKey(item) {
      return [item.state, item.city, item.name].join(" | ");
    }
    function roadKey(item) {
      return [item.state, item.name].join(" | ");
    }
    function routeAttractionByKey(key) {
      return activeAttractions.find((item) => attractionKey(item) === key) || null;
    }
    function loadStoredState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { attractionSelections: {}, roadSelections: {}, filters: {} };
      } catch {
        return { attractionSelections: {}, roadSelections: {}, filters: {} };
      }
    }
    function buildStatePayload() {
      const persistedDayPlan = currentDayPlan.map((day) => ({
        dayNumber: day.dayNumber,
        type: day.type,
        startLabel: day.startLabel,
        attractions: day.attractions,
        driveHours: day.driveHours,
        driveMiles: day.driveMiles,
        visitHours: day.visitHours,
        overnightLabel: day.overnightLabel,
        overnightLat: day.overnightLat,
        overnightLon: day.overnightLon,
        destinationReached: !!day.destinationReached,
        summaryStopCount: day.summaryStopCount
      }));
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        attractionSelections: Object.fromEntries(activeAttractions.map((item) => [attractionKey(item), !!item.selected])),
        roadSelections: Object.fromEntries(activeRoads.map((item) => [roadKey(item), !!item.selected])),
        routeInputs: {
          startLocation: routeStartInput.value,
          endLocation: routeEndInput.value,
          startLabel: routeStartInput.options[routeStartInput.selectedIndex] ? routeStartInput.options[routeStartInput.selectedIndex].text : "",
          endLabel: routeEndInput.options[routeEndInput.selectedIndex] ? routeEndInput.options[routeEndInput.selectedIndex].text : "",
          maxDriveHoursPerDay: routeMaxHoursInput.value,
          restDays: routeRestDaysInput.value,
          showRouteLines: routeDisplayState.showRouteLines,
          showNightStops: routeDisplayState.showNightStops,
        },
        routeSummary: currentRouteSummary,
        dayPlan: persistedDayPlan,
        filters: {
          search: document.getElementById("search").value,
          states: checks(".state-filter"),
          types: checks(".type-filter"),
          roads: checks(".road-filter"),
          showRoads: document.getElementById("showRoads").checked,
        },
      };
    }
    function saveStoredState() {
      const payload = buildStatePayload();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return payload;
    }
    function applyStoredSelections() {
      const stored = loadStoredState();
      applySelectionPayload(stored, false);
      return stored.filters || {};
    }
    function applySelectionPayload(payload, persist = true) {
      const attractionSelections = payload && payload.attractionSelections ? payload.attractionSelections : {};
      const roadSelections = payload && payload.roadSelections ? payload.roadSelections : {};
      activeAttractions.forEach((item) => {
        const key = attractionKey(item);
        if (Object.prototype.hasOwnProperty.call(attractionSelections, key)) item.selected = !!attractionSelections[key];
      });
      activeRoads.forEach((item) => {
        const key = roadKey(item);
        if (Object.prototype.hasOwnProperty.call(roadSelections, key)) item.selected = !!roadSelections[key];
      });
      if (persist) localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return payload && payload.filters ? payload.filters : {};
    }
    function restoreFilterState(filters) {
      if (filters.search) document.getElementById("search").value = filters.search;
      if (Array.isArray(filters.states)) document.querySelectorAll(".state-filter").forEach((el) => { el.checked = filters.states.includes(el.value); });
      if (Array.isArray(filters.types)) document.querySelectorAll(".type-filter").forEach((el) => { el.checked = filters.types.includes(el.value); });
      if (Array.isArray(filters.roads)) document.querySelectorAll(".road-filter").forEach((el) => { el.checked = filters.roads.includes(el.value); });
      if (typeof filters.showRoads === "boolean") document.getElementById("showRoads").checked = filters.showRoads;
    }
    function normalizeRouteOptionText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[.]/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s+/g, " ")
        .trim();
    }
    function defaultRouteAttractionKey() {
      const rochesterItem = activeAttractions.find((item) => item.city === "Rochester" && item.state === "New York");
      return rochesterItem ? attractionKey(rochesterItem) : (activeAttractions[0] ? attractionKey(activeAttractions[0]) : "");
    }
    function routeSelectionValueForSavedInput(savedValue, fallbackValue) {
      const optionValues = [...routeStartInput.options].map((option) => option.value);
      if (savedValue && optionValues.includes(savedValue)) return savedValue;
      const normalizedSaved = normalizeRouteOptionText(savedValue);
      if (normalizedSaved) {
        const match = activeAttractions.find((item) => {
          const abbr = ${JSON.stringify(stateAbbreviations)}[item.state] || item.state;
          const candidates = [
            attractionKey(item),
            item.name,
            item.name + " (" + item.city + ", " + item.state + ")",
            item.name + " - " + item.city + ", " + item.state,
            item.city + ", " + item.state,
            item.city + ", " + abbr
          ];
          return candidates.some((candidate) => normalizeRouteOptionText(candidate) === normalizedSaved);
        });
        if (match) return attractionKey(match);
      }
      return fallbackValue;
    }
    function renderRouteLocationOptions(routeInputs = {}) {
      const items = activeAttractions.slice().sort((a, b) =>
        a.state.localeCompare(b.state) ||
        a.city.localeCompare(b.city) ||
        a.name.localeCompare(b.name)
      );
      const optionHtml = items.map((item) => {
        const key = attractionKey(item);
        const label = item.name + " - " + item.city + ", " + item.state;
        return '<option value="' + esc(key) + '">' + esc(label) + '</option>';
      }).join("");
      routeStartInput.innerHTML = optionHtml;
      routeEndInput.innerHTML = optionHtml;
      const fallbackKey = defaultRouteAttractionKey();
      routeStartInput.value = routeSelectionValueForSavedInput(routeInputs.startLocation || routeInputs.startLocationKey || routeInputs.startLabel, fallbackKey);
      routeEndInput.value = routeSelectionValueForSavedInput(routeInputs.endLocation || routeInputs.endLocationKey || routeInputs.endLabel, fallbackKey);
    }
    function updateRouteToggleButtons() {
      toggleRouteLinesButton.textContent = routeDisplayState.showRouteLines ? "Hide Route" : "Show Route";
      toggleNightStopsButton.textContent = routeDisplayState.showNightStops ? "Hide Night Stops" : "Show Night Stops";
    }
    function applyRouteVisibility() {
      currentRouteLayers.routeLines.forEach((line) => {
        if (routeDisplayState.showRouteLines) {
          if (!routeLineLayer.hasLayer(line)) routeLineLayer.addLayer(line);
        } else if (routeLineLayer.hasLayer(line)) {
          routeLineLayer.removeLayer(line);
        }
      });
      currentRouteLayers.overnightMarkers.forEach((marker) => {
        if (routeDisplayState.showNightStops) {
          if (!routeMarkerLayer.hasLayer(marker)) routeMarkerLayer.addLayer(marker);
        } else if (routeMarkerLayer.hasLayer(marker)) {
          routeMarkerLayer.removeLayer(marker);
        }
      });
      updateRouteToggleButtons();
    }
    function restoreRouteInputs(routeInputs) {
      renderRouteLocationOptions(routeInputs || {});
      routeDisplayState.showRouteLines = routeInputs && typeof routeInputs.showRouteLines === "boolean" ? routeInputs.showRouteLines : true;
      routeDisplayState.showNightStops = routeInputs && typeof routeInputs.showNightStops === "boolean" ? routeInputs.showNightStops : true;
      updateRouteToggleButtons();
      if (!routeInputs) return;
      if (routeInputs.maxDriveHoursPerDay !== undefined && routeInputs.maxDriveHoursPerDay !== null && routeInputs.maxDriveHoursPerDay !== "") routeMaxHoursInput.value = routeInputs.maxDriveHoursPerDay;
      if (routeInputs.restDays !== undefined && routeInputs.restDays !== null && routeInputs.restDays !== "") routeRestDaysInput.value = routeInputs.restDays;
    }
    function esc(value) {
      return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
    }
    function truthy(value) {
      if (value === true || value === 1) return true;
      if (value === false || value === 0 || value == null) return false;
      return ["true", "yes", "y", "1", "selected"].includes(String(value).trim().toLowerCase());
    }
    function mapsLink(query) {
      return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
    }
    function checks(selector) {
      return [...document.querySelectorAll(selector + ":checked")].map((el) => el.value);
    }
    function marker(item) {
      const m = L.circleMarker([item.lat, item.lon], {
        radius: item.selected ? 7 : 5,
        color: item.selected ? "#ffffff" : "#90a4ae",
        weight: item.selected ? 1.5 : 1.2,
        fillColor: item.selected ? item.color : "#cfd8dc",
        fillOpacity: item.selected ? 0.9 : 0.45
      });
      const popup = '<div class="popup-title">' + esc(item.name) + '</div>' +
        '<div>' + esc(item.city) + ', ' + esc(item.state) + '</div>' +
        '<span class="tag" style="background:' + esc(item.color) + '">' + esc(item.type) + '</span>' +
        '<span class="status-pill ' + (item.selected ? 'status-on' : 'status-off') + '">' + (item.selected ? 'Selected' : 'Not selected') + '</span>' +
        '<div><strong>Audience:</strong> ' + esc(item.audience) + '</div>' +
        '<div><strong>Why:</strong> ' + esc(item.why) + '</div>' +
        '<div><a href="' + esc(item.maps) + '" target="_blank" rel="noopener">Open in Google Maps</a></div>' +
        '<div class="popup-actions"><button class="popup-btn popup-toggle-attraction" data-key="' + esc(attractionKey(item)) + '">' + (item.selected ? 'Unselect' : 'Select') + '</button></div>';
      m.bindPopup(popup);
      return m;
    }
    function roadLine(item) {
      const line = L.polyline(item.path, {
        color: "#111827",
        weight: 4,
        opacity: 0.72,
        dashArray: "8 7"
      });
      const popup = '<div class="popup-title">' + esc(item.name) + '</div>' +
        '<div>' + esc(item.start) + ' to ' + esc(item.end) + ', ' + esc(item.state) + '</div>' +
        '<span class="tag" style="background:#111827">' + esc(item.scenery) + '</span>' +
        '<div>' + esc(item.description) + '</div>' +
        '<div><strong>Route detail:</strong> ' + esc(item.routePointCount) + ' road-following points</div>' +
        '<div><a href="' + esc(item.link) + '" target="_blank" rel="noopener">Info / images</a> - <a href="' + esc(item.maps) + '" target="_blank" rel="noopener">Google Maps</a></div>';
      line.bindPopup(popup);
      return line;
    }
    function setRouteError(message) {
      routeError.textContent = message || "";
    }
      function visitDurationHours(type) {
        const map = {
        Observation: 0.75,
        Landmark: 0.75,
        Roadside: 0.75,
        "Scenic Overlook": 0.75,
        Nature: 1.5,
        Trail: 1.5,
        Garden: 1.5,
        Beach: 1.5,
        Waterfront: 1.5,
        "Urban Park": 1.5,
        Wildlife: 1.5,
        "Historic Site": 2,
        Architecture: 2,
        Science: 2,
        Sports: 2,
        "Scenic Town": 2,
        "Scenic Region": 2,
        "Living History": 2,
        "Cultural Site": 2,
        Museum: 2.5,
        "Arts/Culture": 2.5,
        "Zoo/Aquarium": 2.5,
        "National Monument": 2.5,
        "National Park": 3.5,
        "Theme Park": 3.5,
        "Water Park": 3.5,
        Resort: 3.5,
        Shopping: 3.5,
        "Food/Market": 3.5,
        "Food/Drink": 3.5
        };
        return map[type] || 2;
      }
      function routeNodeLabel(node) {
        if (!node) return "";
        if (node.kind === "attraction") return node.name;
        if (node.kind === "end" || node.kind === "start" || node.kind === "waypoint-stop") return node.name;
        if (node.city && node.state) return node.city + ", " + node.state;
        return node.name || "";
      }
    function haversineHours(a, b) {
      const R = 3958.8;
      const toRad = (deg) => deg * Math.PI / 180;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lon - a.lon);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const miles = 2 * R * Math.asin(Math.sqrt(h));
      return miles / 52;
    }
    function haversineMiles(a, b) {
      const R = 3958.8;
      const toRad = (deg) => deg * Math.PI / 180;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lon - a.lon);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    }
    function lineDistance(a, b) {
      const dLat = a.lat - b.lat;
      const dLon = a.lon - b.lon;
      return dLat * dLat + dLon * dLon;
    }
    function interpolatePoint(a, b, t) {
      return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t
      ];
    }
    function splitRoutePath(path, distanceMiles, durationHours, segmentCount) {
      if (segmentCount <= 1 || !Array.isArray(path) || path.length < 2) {
        return [{
          path,
          distanceMiles,
          durationHours,
          endLat: path[path.length - 1][0],
          endLon: path[path.length - 1][1]
        }];
      }
      const cumulative = [0];
      for (let i = 1; i < path.length; i += 1) {
        cumulative.push(cumulative[i - 1] + haversineMiles(
          { lat: path[i - 1][0], lon: path[i - 1][1] },
          { lat: path[i][0], lon: path[i][1] }
        ));
      }
      const totalMiles = cumulative[cumulative.length - 1] || distanceMiles || 0.001;
      const targetStep = totalMiles / segmentCount;
      const segments = [];
      let currentSegment = [path[0]];
      let lastCutMiles = 0;
      let nextCutMiles = targetStep;
      for (let i = 1; i < path.length; i += 1) {
        const prev = path[i - 1];
        const curr = path[i];
        const prevMiles = cumulative[i - 1];
        const currMiles = cumulative[i];
        while (nextCutMiles < currMiles - 1e-9 && segments.length < segmentCount - 1) {
          const t = (nextCutMiles - prevMiles) / (currMiles - prevMiles);
          const cutPoint = interpolatePoint(prev, curr, t);
          currentSegment.push(cutPoint);
          const segMiles = nextCutMiles - lastCutMiles;
          const ratio = segMiles / totalMiles;
          segments.push({
            path: currentSegment,
            distanceMiles: distanceMiles * ratio,
            durationHours: durationHours * ratio,
            endLat: cutPoint[0],
            endLon: cutPoint[1]
          });
          currentSegment = [cutPoint];
          lastCutMiles = nextCutMiles;
          nextCutMiles += targetStep;
        }
        currentSegment.push(curr);
      }
      const remainingMiles = Math.max(0, totalMiles - lastCutMiles);
      const remainingRatio = remainingMiles / totalMiles;
      segments.push({
        path: currentSegment,
        distanceMiles: distanceMiles * remainingRatio,
        durationHours: durationHours * remainingRatio,
        endLat: currentSegment[currentSegment.length - 1][0],
        endLon: currentSegment[currentSegment.length - 1][1]
      });
      return segments;
    }
    function buildApproximateLeg(fromPoint, toPoint, reason = "") {
      const crowMiles = Math.max(1, haversineMiles(fromPoint, toPoint));
      const distanceMiles = crowMiles * 1.18;
      const durationHours = Math.max(0.25, distanceMiles / 55);
      return {
        distanceMiles,
        durationHours,
        path: [
          [fromPoint.lat, fromPoint.lon],
          [toPoint.lat, toPoint.lon]
        ],
        steps: [],
        approximate: true,
        reason
      };
    }
    function splitLegByDriveTime(leg, maxDriveHoursPerDay) {
      const targetHours = Math.max(0.25, maxDriveHoursPerDay * 0.9);
      if (leg.durationHours <= targetHours) {
        return [{
          path: leg.path,
          distanceMiles: leg.distanceMiles,
          durationHours: leg.durationHours,
          endLat: leg.path[leg.path.length - 1][0],
          endLon: leg.path[leg.path.length - 1][1]
        }];
      }
      const rawSteps = Array.isArray(leg.steps) && leg.steps.length ? leg.steps : [{
        path: leg.path,
        distanceMiles: leg.distanceMiles,
        durationHours: leg.durationHours
      }];
      const pieces = [];
      rawSteps.forEach((step) => {
        const count = Math.max(1, Math.ceil(step.durationHours / targetHours));
        const splitPieces = splitRoutePath(step.path, step.distanceMiles, step.durationHours, count);
        splitPieces.forEach((piece) => pieces.push(piece));
      });
      const segments = [];
      let currentPath = [];
      let currentDistanceMiles = 0;
      let currentDurationHours = 0;
      function flushCurrent() {
        if (!currentPath.length) return;
        segments.push({
          path: currentPath,
          distanceMiles: currentDistanceMiles,
          durationHours: currentDurationHours,
          endLat: currentPath[currentPath.length - 1][0],
          endLon: currentPath[currentPath.length - 1][1]
        });
        currentPath = [];
        currentDistanceMiles = 0;
        currentDurationHours = 0;
      }
      pieces.forEach((piece) => {
        const wouldExceed = currentDurationHours > 0 && currentDurationHours + piece.durationHours > targetHours;
        if (wouldExceed) flushCurrent();
        if (!currentPath.length) {
          currentPath = piece.path.slice();
        } else {
          currentPath = currentPath.concat(piece.path.slice(1));
        }
        currentDistanceMiles += piece.distanceMiles;
        currentDurationHours += piece.durationHours;
      });
      flushCurrent();
      return segments;
    }
    function getSelectedAttractionsForRouting() {
      return activeAttractions.filter((item) => item.selected);
    }
    function normalizeLocationText(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[.]/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s+/g, " ")
        .trim();
    }
    function compactLocationText(value) {
      return normalizeLocationText(value).replace(/[^a-z0-9]/g, "");
    }
    function scoreLocalLocationMatch(queryKey, aliasKey) {
      if (!queryKey || !aliasKey) return 0;
      if (queryKey === aliasKey) return 1000;
      const queryCompact = compactLocationText(queryKey);
      const aliasCompact = compactLocationText(aliasKey);
      if (queryCompact && queryCompact === aliasCompact) return 950;
      const queryTokens = queryKey.split(/[,\s]+/).filter(Boolean);
      const aliasTokens = aliasKey.split(/[,\s]+/).filter(Boolean);
      let score = 0;
      if (aliasKey.startsWith(queryKey) || queryKey.startsWith(aliasKey)) score += 180;
      if (aliasKey.includes(queryKey) || queryKey.includes(aliasKey)) score += 120;
      queryTokens.forEach((token) => {
        if (aliasTokens.includes(token)) score += token.length >= 4 ? 70 : 35;
        else if (aliasTokens.some((aliasToken) => aliasToken.startsWith(token) || token.startsWith(aliasToken))) {
          score += token.length >= 4 ? 35 : 15;
        }
      });
      if (queryCompact && aliasCompact && (aliasCompact.includes(queryCompact) || queryCompact.includes(aliasCompact))) {
        score += 90;
      }
      return score;
    }
    function resolveLocalLocation(query) {
      const key = normalizeLocationText(query);
      const entry = localLocationLookup[key];
      if (!entry) {
        const compactKey = compactLocationText(key);
        let bestEntry = null;
        let bestScore = 0;
        localLocationEntries.forEach(([aliasKey, candidate]) => {
          const score = scoreLocalLocationMatch(key, aliasKey);
          if (compactKey && compactKey === compactLocationText(aliasKey) && score < 950) {
            bestEntry = candidate;
            bestScore = 950;
            return;
          }
          if (score > bestScore) {
            bestScore = score;
            bestEntry = candidate;
          }
        });
        if (!bestEntry || bestScore < 180) return null;
        return {
          name: query,
          label: bestEntry.label || query,
          lat: Number(bestEntry.lat),
          lon: Number(bestEntry.lon),
          local: true,
          source: bestEntry.source || "local"
        };
      }
      return {
        name: query,
        label: entry.label || query,
        lat: Number(entry.lat),
        lon: Number(entry.lon),
        local: true,
        source: entry.source || "local"
      };
    }
    async function geocodeLocation(query) {
      const localMatch = resolveLocalLocation(query);
      if (localMatch) return localMatch;
      const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + encodeURIComponent(query);
      try {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Geocoding failed");
        const data = await response.json();
        if (!Array.isArray(data) || !data.length) throw new Error("Location not found");
        return {
          name: query,
          label: data[0].display_name || query,
          lat: Number(data[0].lat),
          lon: Number(data[0].lon)
        };
      } catch (error) {
        throw new Error(error && error.message === "Location not found"
          ? "Location not found"
          : "Could not reach the geocoding service. Try a known city/state like Rochester, NY."
        );
      }
    }
    async function reverseGeocodeLocation(lat, lon) {
      const cacheKey = lat.toFixed(3) + "," + lon.toFixed(3);
      if (reverseGeocodeCache.has(cacheKey)) return reverseGeocodeCache.get(cacheKey);
      const url = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon);
      try {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) {
          const fallback = { name: "Stop near " + lat.toFixed(2) + ", " + lon.toFixed(2), lat, lon };
          reverseGeocodeCache.set(cacheKey, fallback);
          return fallback;
        }
        const data = await response.json();
        const address = data.address || {};
        const town = address.city || address.town || address.village || address.hamlet || address.county || "Route stop";
        const state = address.state || "";
        const label = state ? town + ", " + state : town;
        const resolved = { name: label, lat, lon };
        reverseGeocodeCache.set(cacheKey, resolved);
        return resolved;
      } catch {
        const fallback = { name: "Stop near " + lat.toFixed(2) + ", " + lon.toFixed(2), lat, lon };
        reverseGeocodeCache.set(cacheKey, fallback);
        return fallback;
      }
    }
    function buildOptimizedOrder(startPoint, attractionsToRoute) {
      const remaining = attractionsToRoute.slice();
      const ordered = [];
      let current = startPoint;
      while (remaining.length) {
        let bestIndex = 0;
        let bestDistance = Infinity;
        remaining.forEach((item, index) => {
          const dist = lineDistance(current, { lat: item.lat, lon: item.lon });
          if (dist < bestDistance) {
            bestDistance = dist;
            bestIndex = index;
          }
        });
        const next = remaining.splice(bestIndex, 1)[0];
        ordered.push(next);
        current = { lat: next.lat, lon: next.lon };
      }
      const route = [startPoint, ...ordered];
      if (ordered.length < 3) return ordered;
      let improved = true;
      while (improved) {
        improved = false;
        for (let i = 1; i < route.length - 2; i += 1) {
          for (let j = i + 1; j < route.length - 1; j += 1) {
            const a = route[i - 1];
            const b = route[i];
            const c = route[j];
            const d = route[j + 1];
            const currentCost = haversineHours(a, b) + haversineHours(c, d);
            const swapCost = haversineHours(a, c) + haversineHours(b, d);
            if (swapCost + 0.001 < currentCost) {
              const reversed = route.slice(i, j + 1).reverse();
              route.splice(i, j - i + 1, ...reversed);
              improved = true;
            }
          }
        }
      }
      return route.slice(1);
    }
      async function fetchLegRoute(fromPoint, toPoint) {
        const coords = fromPoint.lon + "," + fromPoint.lat + ";" + toPoint.lon + "," + toPoint.lat;
        const url = "https://router.project-osrm.org/route/v1/driving/" + coords + "?overview=full&geometries=geojson&steps=true";
        try {
          const response = await fetch(url);
          if (!response.ok) return buildApproximateLeg(fromPoint, toPoint, "routing service unavailable");
          const payload = await response.json();
          const route = payload.routes && payload.routes[0];
          if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)) {
            return buildApproximateLeg(fromPoint, toPoint, "routing service returned incomplete geometry");
          }
          const routeLeg = route.legs && route.legs[0];
          const steps = routeLeg && Array.isArray(routeLeg.steps) ? routeLeg.steps.map((step) => ({
            distanceMiles: step.distance / 1609.344,
            durationHours: step.duration / 3600,
            path: step.geometry && Array.isArray(step.geometry.coordinates) && step.geometry.coordinates.length
              ? step.geometry.coordinates.map(([lon, lat]) => [lat, lon])
              : []
          })).filter((step) => Array.isArray(step.path) && step.path.length >= 2) : [];
          return {
            distanceMiles: route.distance / 1609.344,
            durationHours: route.duration / 3600,
            path: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
            steps,
            approximate: false,
            reason: ""
          };
        } catch {
          return buildApproximateLeg(fromPoint, toPoint, "routing request failed in the browser");
        }
      }
      async function fetchRouteLegs(startPoint, orderedStops, endPoint) {
        const points = [startPoint, ...orderedStops, endPoint];
        const legs = [];
        let usedApproximation = false;
        const approximationReasons = new Set();
        for (let i = 0; i < points.length - 1; i += 1) {
          const leg = await fetchLegRoute(points[i], points[i + 1]);
          if (leg.approximate) {
            usedApproximation = true;
            if (leg.reason) approximationReasons.add(leg.reason);
          }
          legs.push(leg);
        }
        return {
          legs,
          usedApproximation,
          approximationReasons: [...approximationReasons]
        };
      }
      async function expandLongDriveLegs(startPoint, orderedStops, endPoint, legs, maxDriveHoursPerDay) {
        const nodes = [
          { kind: "start", name: startPoint.name, lat: startPoint.lat, lon: startPoint.lon },
          ...orderedStops.map((stop) => ({ ...stop, kind: "attraction" })),
          { kind: "end", name: endPoint.name, lat: endPoint.lat, lon: endPoint.lon }
      ];
      const expandedNodes = [nodes[0]];
      const expandedLegs = [];
      for (let i = 0; i < legs.length; i += 1) {
        const leg = legs[i];
        const targetNode = nodes[i + 1];
          if (leg.durationHours <= maxDriveHoursPerDay) {
            expandedLegs.push({ ...leg });
            expandedNodes.push(targetNode);
            continue;
          }
          const segments = splitLegByDriveTime(leg, maxDriveHoursPerDay);
          for (let j = 0; j < segments.length; j += 1) {
            const segment = segments[j];
            if (j < segments.length - 1) {
              const stopPoint = await reverseGeocodeLocation(segment.endLat, segment.endLon);
              expandedLegs.push(segment);
            expandedNodes.push({
              kind: "waypoint-stop",
              name: stopPoint.name,
              lat: segment.endLat,
              lon: segment.endLon,
              synthetic: true
            });
          } else {
            expandedLegs.push(segment);
            expandedNodes.push(targetNode);
          }
        }
      }
      return { nodes: expandedNodes, legs: expandedLegs };
    }
    function buildDrivingDays(startPoint, endPoint, expandedNodes, expandedLegs, maxDriveHoursPerDay) {
      const maxVisitHoursPerDay = 8;
      const days = [];
        function emptyDay(dayNumber, originNode) {
          return {
            dayNumber,
            type: "drive",
            startLabel: originNode.name,
          startLat: originNode.lat,
          startLon: originNode.lon,
            attractions: [],
            driveHours: 0,
            driveMiles: 0,
            visitHours: 0,
            pathSegments: [],
            routeSegments: [],
            overnightLabel: "",
            overnightLat: null,
            overnightLon: null,
            destinationReached: false,
            summaryStopCount: 0
        };
      }
      let dayNumber = 1;
      let currentDay = emptyDay(dayNumber, expandedNodes[0]);
      let legIndex = 0;
      while (legIndex < expandedLegs.length) {
        const sourceNode = expandedNodes[legIndex];
        const targetNode = expandedNodes[legIndex + 1];
        const leg = expandedLegs[legIndex];
        const visitHours = targetNode.kind === "attraction" ? visitDurationHours(targetNode.type) : 0;
        const exceeds = (currentDay.driveHours + leg.durationHours > maxDriveHoursPerDay || currentDay.visitHours + visitHours > maxVisitHoursPerDay) && (currentDay.driveHours > 0 || currentDay.attractions.length > 0);
        if (exceeds) {
          currentDay.overnightLabel = sourceNode.kind === "attraction" ? sourceNode.city + ", " + sourceNode.state : sourceNode.name;
          currentDay.overnightLat = sourceNode.lat;
          currentDay.overnightLon = sourceNode.lon;
          currentDay.summaryStopCount = currentDay.attractions.length;
          days.push(currentDay);
          dayNumber += 1;
          currentDay = emptyDay(dayNumber, sourceNode);
          continue;
          }
          currentDay.driveHours += leg.durationHours;
          currentDay.driveMiles += leg.distanceMiles;
          currentDay.pathSegments.push(leg.path);
          currentDay.routeSegments.push({
            path: leg.path,
            startLabel: routeNodeLabel(sourceNode),
            endLabel: routeNodeLabel(targetNode),
            driveHours: leg.durationHours,
            driveMiles: leg.distanceMiles,
            attractionNames: targetNode.kind === "attraction" ? [targetNode.name] : [],
            isSyntheticStop: targetNode.kind === "waypoint-stop"
          });
          if (targetNode.kind === "attraction") {
            currentDay.attractions.push({
              key: attractionKey(targetNode),
              name: targetNode.name,
            city: targetNode.city,
            state: targetNode.state,
            type: targetNode.type,
            lat: targetNode.lat,
            lon: targetNode.lon,
            visitHours
          });
          currentDay.visitHours += visitHours;
        }
        legIndex += 1;
      }
      const finalNode = expandedNodes[expandedNodes.length - 1];
      currentDay.destinationReached = true;
      currentDay.overnightLabel = finalNode.kind === "end" ? endPoint.name : (finalNode.city ? finalNode.city + ", " + finalNode.state : finalNode.name);
      currentDay.overnightLat = finalNode.lat;
      currentDay.overnightLon = finalNode.lon;
      currentDay.summaryStopCount = currentDay.attractions.length;
      days.push(currentDay);
      return days;
    }
    function insertRestDays(driveDays, restDayCount) {
      if (!restDayCount) return driveDays.map((day) => ({ ...day }));
      const results = driveDays.map((day) => ({ ...day }));
      const candidateCount = Math.max(1, results.length - 1);
      const used = new Set();
      const insertions = [];
      for (let i = 0; i < restDayCount; i += 1) {
        const target = Math.min(candidateCount - 1, Math.max(0, Math.round(((i + 1) * candidateCount) / (restDayCount + 1)) - 1));
        let chosen = target;
        while (used.has(chosen) && chosen < candidateCount - 1) chosen += 1;
        while (used.has(chosen) && chosen > 0) chosen -= 1;
        used.add(chosen);
        insertions.push(chosen);
      }
      insertions.sort((a, b) => a - b);
      let offset = 0;
      insertions.forEach((afterIndex) => {
        const anchorDay = results[afterIndex + offset];
        results.splice(afterIndex + offset + 1, 0, {
          dayNumber: 0,
          type: "rest",
          startLabel: anchorDay.overnightLabel,
          startLat: anchorDay.overnightLat,
          startLon: anchorDay.overnightLon,
            attractions: [],
            driveHours: 0,
            driveMiles: 0,
            visitHours: 0,
            pathSegments: [],
            routeSegments: [],
            overnightLabel: anchorDay.overnightLabel,
            overnightLat: anchorDay.overnightLat,
            overnightLon: anchorDay.overnightLon,
            destinationReached: anchorDay.destinationReached,
            summaryStopCount: 0
        });
        offset += 1;
      });
      return results.map((day, index) => ({ ...day, dayNumber: index + 1 }));
    }
      function summarizeRoute(dayPlan, restDayCount, selectedStopCount, options = {}) {
        const totals = dayPlan.reduce((acc, day) => {
          acc.driveHours += day.driveHours;
          acc.driveMiles += day.driveMiles;
          if (day.type === "drive") acc.driveDays += 1;
          return acc;
      }, { driveHours: 0, driveMiles: 0, driveDays: 0 });
      return {
        selectedStopCount,
          totalDriveHours: totals.driveHours,
          totalDriveMiles: totals.driveMiles,
          driveDays: totals.driveDays,
          restDays: restDayCount,
          totalTripDays: dayPlan.length,
          approximateRouting: Boolean(options.approximateRouting),
          approximationReasons: Array.isArray(options.approximationReasons) ? options.approximationReasons : []
        };
      }
    function round1(value) {
      return Math.round(value * 10) / 10;
    }
    function hasCompatibleSavedRoute(dayPlan) {
      if (!Array.isArray(dayPlan) || !dayPlan.length) return false;
      const known = new Set(activeAttractions.map((item) => attractionKey(item)));
      return dayPlan.every((day) => !Array.isArray(day.attractions) || day.attractions.every((stop) => !stop.key || known.has(stop.key)));
    }
      function renderRouteSummary() {
        if (!currentRouteSummary) {
          routeSummaryEl.innerHTML = "";
          dayListEl.innerHTML = "";
          return;
        }
        const statsHtml = [
          ["Stops", currentRouteSummary.selectedStopCount],
          ["Miles", round1(currentRouteSummary.totalDriveMiles)],
          ["Drive hrs", round1(currentRouteSummary.totalDriveHours)],
          ["Trip days", currentRouteSummary.totalTripDays],
          ["Drive days", currentRouteSummary.driveDays],
          ["Rest days", currentRouteSummary.restDays]
        ].map(([label, value]) => '<div class="route-stat"><strong>' + esc(value) + '</strong><span>' + esc(label) + '</span></div>').join("");
        const noteHtml = currentRouteSummary.approximateRouting
          ? '<div class="route-note">Using approximate route geometry for some legs because the live routing service was unavailable.</div>'
          : "";
        routeSummaryEl.innerHTML = statsHtml + noteHtml;
        dayListEl.innerHTML = currentDayPlan.map((day) => {
        const stopLines = day.attractions.map((stop, index) => '<div class="day-stop">' + esc(index + 1 + ". " + stop.name + " - " + stop.city + ", " + stop.state) + '</div>').join("");
        const title = day.type === "rest" ? "Day " + day.dayNumber + " - Rest Day" : "Day " + day.dayNumber;
        const meta = day.type === "rest"
          ? 'No driving scheduled. Rest in ' + esc(day.overnightLabel) + '.'
          : 'Start: ' + esc(day.startLabel) + ' | Drive: ' + esc(round1(day.driveHours)) + 'h, ' + esc(round1(day.driveMiles)) + ' mi | Visit: ' + esc(round1(day.visitHours)) + 'h | Overnight: ' + esc(day.overnightLabel);
        return '<div class="day-card ' + (day.type === "rest" ? "rest" : "") + '" data-day="' + esc(day.dayNumber) + '">' +
          '<div class="day-title">' + esc(title) + '</div>' +
          '<div class="day-meta">' + meta + '</div>' +
          stopLines +
          '</div>';
      }).join("");
    }
    function clearRouteVisuals(preserveSummary = false) {
      routeLineLayer.clearLayers();
      routeMarkerLayer.clearLayers();
      currentRouteLayers = {
        linesByDay: new Map(),
        markersByDay: new Map(),
        routeLines: [],
        overnightMarkers: [],
        stopBadges: [],
        activeDay: null
      };
      if (!preserveSummary) {
        currentRouteSummary = null;
        currentDayPlan = [];
        renderRouteSummary();
      }
    }
      function routeBadgeIcon(label, className) {
        return L.divIcon({
          className: "",
          html: '<div class="' + className + '">' + esc(label) + '</div>',
          iconSize: [34, 26],
          iconAnchor: [17, 13]
        });
      }
      function routeSegmentPopup(day, segment, index, totalSegments) {
        const attractionsCovered = segment.attractionNames && segment.attractionNames.length
          ? segment.attractionNames.map((name) => '<div class="day-stop">' + esc(name) + '</div>').join("")
          : '<div class="day-stop">No attraction stop on this segment.</div>';
        const segmentNote = segment.isSyntheticStop
          ? '<div class="day-stop">Ends at an inserted overnight stop.</div>'
          : '';
        return '<div class="popup-title">Day ' + esc(day.dayNumber) + ' Segment ' + esc(index + 1) + ' of ' + esc(totalSegments) + '</div>' +
          '<div><strong>Starting point:</strong> ' + esc(segment.startLabel) + '</div>' +
          '<div><strong>End point:</strong> ' + esc(segment.endLabel) + '</div>' +
          '<div><strong>Driving:</strong> ' + esc(round1(segment.driveHours)) + 'h, ' + esc(round1(segment.driveMiles)) + ' mi</div>' +
          '<div><strong>Attractions covered:</strong></div>' +
          attractionsCovered +
          segmentNote;
      }
      function highlightDay(dayNumber) {
        currentRouteLayers.activeDay = dayNumber;
        dayListEl.querySelectorAll(".day-card").forEach((card) => {
          card.classList.toggle("active", Number(card.dataset.day) === dayNumber);
        });
      currentRouteLayers.linesByDay.forEach((lines, key) => {
        lines.forEach((line) => line.setStyle({
          weight: key === dayNumber ? 7 : 4,
          opacity: key === dayNumber ? 1 : 0.58
        }));
      });
      currentRouteLayers.markersByDay.forEach((markers, key) => {
        markers.forEach((marker) => {
          const iconEl = marker.getElement();
          if (iconEl) iconEl.style.transform = key === dayNumber ? "scale(1.08)" : "scale(1)";
        });
      });
    }
    function renderComputedRoute(dayPlan, fitToBounds = true) {
      clearRouteVisuals(true);
      const bounds = [];
      let stopOrder = 1;
        dayPlan.forEach((day) => {
          const markers = [];
          const lines = [];
          if (day.type === "drive") {
            const color = dayColors[(day.dayNumber - 1) % dayColors.length];
            day.routeSegments.forEach((segment, index) => {
              const line = L.polyline(segment.path, { color, weight: 4, opacity: 0.82 }).addTo(routeLineLayer);
              line.bindPopup(routeSegmentPopup(day, segment, index, day.routeSegments.length));
              line.on("click", () => highlightDay(day.dayNumber));
              lines.push(line);
              currentRouteLayers.routeLines.push(line);
              segment.path.forEach((point) => bounds.push(point));
            });
            day.attractions.forEach((stop) => {
              const badge = L.marker([stop.lat, stop.lon], { icon: routeBadgeIcon(String(stopOrder), "route-badge"), keyboard: false }).addTo(routeMarkerLayer);
              badge.bindPopup('<div class="popup-title">Stop ' + esc(stopOrder) + '</div><div>' + esc(stop.name) + '</div><div>' + esc(stop.city) + ', ' + esc(stop.state) + '</div><div>Day ' + esc(day.dayNumber) + '</div>');
              badge.on("click", () => highlightDay(day.dayNumber));
              markers.push(badge);
              currentRouteLayers.stopBadges.push(badge);
              bounds.push([stop.lat, stop.lon]);
              stopOrder += 1;
            });
          }
        const restClass = day.type === "rest" ? "night-badge rest-badge" : "night-badge";
        const restLabel = day.type === "rest" ? "Rest " + day.dayNumber : (day.destinationReached ? "Day " + day.dayNumber : "Night " + day.dayNumber);
        const overnightMarker = L.marker([day.overnightLat, day.overnightLon], { icon: routeBadgeIcon(restLabel, restClass), keyboard: false }).addTo(routeMarkerLayer);
        overnightMarker.bindPopup(
          '<div class="popup-title">' + esc(day.type === "rest" ? "Rest Day " + day.dayNumber : "Day " + day.dayNumber + " Overnight") + '</div>' +
          '<div>' + esc(day.overnightLabel) + '</div>' +
          '<div>' + esc(day.type === "rest" ? "No driving scheduled." : round1(day.driveHours) + 'h driving, ' + day.summaryStopCount + ' attractions.') + '</div>'
        );
          overnightMarker.on("click", () => highlightDay(day.dayNumber));
          markers.push(overnightMarker);
          currentRouteLayers.overnightMarkers.push(overnightMarker);
          bounds.push([day.overnightLat, day.overnightLon]);
          currentRouteLayers.linesByDay.set(day.dayNumber, lines);
          currentRouteLayers.markersByDay.set(day.dayNumber, markers);
        });
        renderRouteSummary();
        applyRouteVisibility();
        if (dayPlan.length) highlightDay(1);
        if (fitToBounds && bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
      }
    async function computeRoutePlan() {
      setRouteError("");
      const selectedAttractions = getSelectedAttractionsForRouting();
      if (!selectedAttractions.length) {
        setRouteError("Select at least one attraction before computing a route.");
        return;
      }
      if (selectedAttractions.length > 40) {
        setRouteError("Please narrow the route to 40 selected attractions or fewer.");
        return;
      }
      const maxDriveHoursPerDay = Number(routeMaxHoursInput.value || 5);
      const restDayCount = Math.max(0, Math.floor(Number(routeRestDaysInput.value || 0)));
      const startKey = routeStartInput.value || defaultRouteAttractionKey();
      const endKey = routeEndInput.value || defaultRouteAttractionKey();
      if (!Number.isFinite(maxDriveHoursPerDay) || maxDriveHoursPerDay <= 0) {
        setRouteError("Enter a valid maximum driving hours per day.");
        return;
      }
      try {
        document.getElementById("computeRoute").disabled = true;
        document.getElementById("computeRoute").textContent = "Computing...";
        const startAttraction = routeAttractionByKey(startKey);
        const endAttraction = routeAttractionByKey(endKey);
        if (!startAttraction || !endAttraction) throw new Error("Choose valid start and end attractions.");
        const startPoint = {
          name: startAttraction.name,
          label: startAttraction.name + " - " + startAttraction.city + ", " + startAttraction.state,
          lat: startAttraction.lat,
          lon: startAttraction.lon
        };
        const endPoint = {
          name: endAttraction.name,
          label: endAttraction.name + " - " + endAttraction.city + ", " + endAttraction.state,
          lat: endAttraction.lat,
          lon: endAttraction.lon
        };
        const routedAttractions = selectedAttractions.filter((item) => {
          const key = attractionKey(item);
          return key !== startKey && key !== endKey;
        });
        const orderedStops = buildOptimizedOrder(startPoint, routedAttractions);
          const routeResult = await fetchRouteLegs(startPoint, orderedStops, endPoint);
          const expandedRoute = await expandLongDriveLegs(startPoint, orderedStops, endPoint, routeResult.legs, maxDriveHoursPerDay);
          const driveDays = buildDrivingDays(startPoint, endPoint, expandedRoute.nodes, expandedRoute.legs, maxDriveHoursPerDay);
          const fullPlan = insertRestDays(driveDays, restDayCount);
          currentDayPlan = fullPlan;
          currentRouteSummary = summarizeRoute(fullPlan, restDayCount, routedAttractions.length, {
            approximateRouting: routeResult.usedApproximation,
            approximationReasons: routeResult.approximationReasons
          });
          renderComputedRoute(fullPlan, true);
          saveStoredState();
        } catch (error) {
          if (error && error.message === "Location not found") {
            setRouteError("Could not resolve the start or end location.");
          } else if (error && error.message) {
            setRouteError("Route computation failed: " + error.message);
          } else {
            setRouteError("Route computation failed. Please try again.");
          }
        } finally {
        document.getElementById("computeRoute").disabled = false;
        document.getElementById("computeRoute").textContent = "Compute Route";
      }
    }
    function matchesAttractionFilters(item) {
      const stateSet = new Set(checks(".state-filter"));
      const typeSet = new Set(checks(".type-filter"));
      const q = document.getElementById("search").value.trim().toLowerCase();
      const text = [item.name, item.city, item.state, item.type, item.audience, item.why].join(" ").toLowerCase();
      return stateSet.has(item.state) && typeSet.has(item.type) && (!q || text.includes(q));
    }
    function renderAttractionList() {
      const items = activeAttractions.filter((item) => matchesAttractionFilters(item));
      selectedCount.textContent = activeAttractions.filter((item) => item.selected).length;
      if (!items.length) {
        attractionList.innerHTML = '<div class="attr-row"><div></div><div class="attr-meta">No attractions match the current filters.</div></div>';
        return;
      }
      attractionList.innerHTML = items.map((item) => '<label class="attr-row">' +
        '<input class="attr-select" type="checkbox" data-key="' + esc(attractionKey(item)) + '"' + (item.selected ? ' checked' : '') + '>' +
        '<div><div class="attr-name">' + esc(item.name) + '</div><div class="attr-meta">' + esc(item.city) + ', ' + esc(item.state) + ' - ' + esc(item.type) + '</div></div>' +
        '</label>').join("");
    }
    function update(options = {}) {
      const shouldFit = options.fitToBounds !== false;
      layer.clearLayers();
      roadLayer.clearLayers();
      const stateSet = new Set(checks(".state-filter"));
      const typeSet = new Set(checks(".type-filter"));
      const roadSet = new Set(checks(".road-filter"));
      const showRoads = document.getElementById("showRoads").checked;
      const q = document.getElementById("search").value.trim().toLowerCase();
      const bounds = [];
      let count = 0;
      let roadCount = 0;
      activeAttractions.forEach((item) => {
        const text = [item.name, item.city, item.state, item.type, item.audience, item.why].join(" ").toLowerCase();
        if (!stateSet.has(item.state) || !typeSet.has(item.type) || (q && !text.includes(q))) return;
        marker(item).addTo(layer);
        bounds.push([item.lat, item.lon]);
        count += 1;
      });
      if (showRoads) {
        activeRoads.forEach((item) => {
          const text = [item.name, item.start, item.end, item.state, item.scenery, item.description].join(" ").toLowerCase();
          if (!item.selected || !stateSet.has(item.state) || !roadSet.has(item.name) || (q && !text.includes(q))) return;
          roadLine(item).addTo(roadLayer);
          item.path.forEach((point) => bounds.push(point));
          roadCount += 1;
        });
      }
      visibleCount.textContent = count;
      visibleRoadCount.textContent = roadCount;
      renderAttractionList();
      saveStoredState();
      if (shouldFit && bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
    }
    document.querySelectorAll('.state-filter, .type-filter, .road-filter, #search, #showRoads').forEach((el) => el.addEventListener("input", () => update({ fitToBounds: true })));
    document.getElementById("allStates").addEventListener("click", () => { document.querySelectorAll(".state-filter").forEach((el) => el.checked = true); update({ fitToBounds: true }); });
    document.getElementById("noStates").addEventListener("click", () => { document.querySelectorAll(".state-filter").forEach((el) => el.checked = false); update({ fitToBounds: true }); });
    document.getElementById("allTypes").addEventListener("click", () => { document.querySelectorAll(".type-filter").forEach((el) => el.checked = true); update({ fitToBounds: true }); });
    document.getElementById("noTypes").addEventListener("click", () => { document.querySelectorAll(".type-filter").forEach((el) => el.checked = false); update({ fitToBounds: true }); });
    document.getElementById("allRoads").addEventListener("click", () => { document.querySelectorAll(".road-filter").forEach((el) => el.checked = true); update({ fitToBounds: true }); });
    document.getElementById("noRoads").addEventListener("click", () => { document.querySelectorAll(".road-filter").forEach((el) => el.checked = false); update({ fitToBounds: true }); });
    document.getElementById("selectFiltered").addEventListener("click", () => { activeAttractions.forEach((item) => { if (matchesAttractionFilters(item)) item.selected = true; }); update({ fitToBounds: false }); });
    document.getElementById("clearFiltered").addEventListener("click", () => { activeAttractions.forEach((item) => { if (matchesAttractionFilters(item)) item.selected = false; }); update({ fitToBounds: false }); });
    attractionList.addEventListener("input", (event) => {
      if (!event.target.classList.contains("attr-select")) return;
      const targetKey = event.target.getAttribute("data-key");
      const item = activeAttractions.find((entry) => attractionKey(entry) === targetKey);
      if (!item) return;
      item.selected = event.target.checked;
      update({ fitToBounds: false });
    });
    map.getContainer().addEventListener("click", (event) => {
      const button = event.target.closest(".popup-toggle-attraction");
      if (!button) return;
      const targetKey = button.getAttribute("data-key");
      const item = activeAttractions.find((entry) => attractionKey(entry) === targetKey);
      if (!item) return;
      item.selected = !item.selected;
      map.closePopup();
      update({ fitToBounds: false });
    });
    document.getElementById("exportState").addEventListener("click", () => {
      const payload = saveStoredState();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const link = document.createElement("a");
      link.href = url;
      link.download = "roadtrip-map-selections-" + stamp + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    document.getElementById("importState").addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        restoreFilterState(applySelectionPayload(payload, true));
        restoreRouteInputs(payload.routeInputs);
        clearRouteVisuals();
        if (payload.routeSummary && hasCompatibleSavedRoute(payload.dayPlan)) {
          currentRouteSummary = payload.routeSummary;
          currentDayPlan = payload.dayPlan;
          renderRouteSummary();
        } else {
          currentRouteSummary = null;
          currentDayPlan = [];
          renderRouteSummary();
        }
        update({ fitToBounds: true });
      } catch (error) {
        alert("Could not import selections from that JSON file.");
      } finally {
        event.target.value = "";
      }
    });
      document.getElementById("workbookInput").addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file || !window.XLSX) return;
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const attractionRows = XLSX.utils.sheet_to_json(wb.Sheets.Attractions || wb.Sheets["Attractions"], { defval: "" });
      const roadRows = wb.Sheets["Scenic Roads"] ? XLSX.utils.sheet_to_json(wb.Sheets["Scenic Roads"], { defval: "" }) : [];
      const stateRows = XLSX.utils.sheet_to_json(wb.Sheets.States || wb.Sheets["States"], { defval: "" });
      const stateSelected = new Map(stateRows.map((row) => [row.State, truthy(row.Selected)]));
      const typeColors = ${JSON.stringify(typeColors)};
      activeAttractions = attractionRows
        .filter((row) => row.State && row["Attraction Name"])
        .map((row) => ({
          state: row.State,
          city: row["Nearest City"],
          lon: Number(row.Longitude),
          lat: Number(row.Latitude),
          name: row["Attraction Name"],
          audience: row.Audience,
          why: row["Why Interesting"],
          type: row["Attraction Type"],
          selected: truthy(row["Attraction Selected"]) && (stateSelected.has(row.State) ? stateSelected.get(row.State) : truthy(row["State Selected"])),
          maps: row["Google Maps Link"] || mapsLink(row["Attraction Name"] + ", " + row["Nearest City"] + ", " + row.State),
          color: typeColors[row["Attraction Type"]] || "#555555"
        }))
        .filter((item) => Number.isFinite(item.lon) && Number.isFinite(item.lat));
      activeRoads = roadRows
        .filter((row) => row.State && row["Scenic Road"])
        .map((row) => {
          let path = [];
          try { path = JSON.parse(row["Approximate Path"] || "[]"); } catch { path = []; }
          return {
            state: row.State,
            name: row["Scenic Road"],
            start: row["Start / Nearest City"],
            end: row["End / Nearest City"],
            description: row["Brief Description"],
            scenery: row["Scenery Type"],
            link: row["Info / Images Link"],
            maps: row["Google Maps Link"] || mapsLink(row["Scenic Road"] + ", " + row.State),
            path,
            routePointCount: path.length,
            routeSource: "Workbook path geometry",
            selected: truthy(row["Road Selected"]) && (stateSelected.has(row.State) ? stateSelected.get(row.State) : truthy(row["State Selected"]))
          };
        })
        .filter((item) => Array.isArray(item.path) && item.path.length > 1);
      renderRouteLocationOptions(loadStoredState().routeInputs || {});
      applyStoredSelections();
      clearRouteVisuals();
      setRouteError("");
      update({ fitToBounds: true });
      });
      document.getElementById("computeRoute").addEventListener("click", () => { computeRoutePlan(); });
      document.getElementById("clearRoute").addEventListener("click", () => {
        clearRouteVisuals();
        setRouteError("");
        saveStoredState();
      });
      toggleRouteLinesButton.addEventListener("click", () => {
        routeDisplayState.showRouteLines = !routeDisplayState.showRouteLines;
        applyRouteVisibility();
        saveStoredState();
      });
      toggleNightStopsButton.addEventListener("click", () => {
        routeDisplayState.showNightStops = !routeDisplayState.showNightStops;
        applyRouteVisibility();
        saveStoredState();
      });
      dayListEl.addEventListener("click", (event) => {
        const card = event.target.closest(".day-card");
        if (!card) return;
        highlightDay(Number(card.dataset.day));
      });
    dayListEl.addEventListener("mouseover", (event) => {
      const card = event.target.closest(".day-card");
      if (!card) return;
      highlightDay(Number(card.dataset.day));
    });
    const restoredFilters = applyStoredSelections();
      const restoredState = loadStoredState();
      restoreFilterState(restoredFilters);
      restoreRouteInputs(restoredState.routeInputs);
      if (restoredState.routeSummary && hasCompatibleSavedRoute(restoredState.dayPlan)) {
        currentRouteSummary = restoredState.routeSummary;
        currentDayPlan = restoredState.dayPlan;
        renderRouteSummary();
      }
      updateRouteToggleButtons();
      update({ fitToBounds: true });
  </script>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });
  const data = rowsForWorkbook();
  const detailedRouteGeometry = await loadDetailedRouteGeometry();
  await createWorkbook(data);
  const mapHtml = createMapHtml(data, detailedRouteGeometry);
  await fs.writeFile(htmlPath, mapHtml, "utf8");
  await fs.writeFile(docsHtmlPath, mapHtml, "utf8");
  await fs.writeFile(docsNamedHtmlPath, mapHtml, "utf8");
  await fs.copyFile(xlsxPath, docsXlsxPath);
  await fs.writeFile(noJekyllPath, "", "utf8");
  await fs.writeFile(path.join(outputDir, "attractions_data.json"), JSON.stringify(data, null, 2), "utf8");
  console.log(`Wrote ${xlsxPath}`);
  console.log(`Wrote ${htmlPath}`);
  console.log(`Wrote ${docsHtmlPath}`);
  console.log(`Rows: ${data.length}`);
}

await main();
process.exitCode = 0;
