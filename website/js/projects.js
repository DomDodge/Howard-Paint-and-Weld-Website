/*
 * SITE CONTENT — edit this file to change text and photos. No other code changes needed.
 *
 * Photo file names are the names inside /images. The site automatically uses the
 * optimized copies in /images/web and /images/thumb (run tools/optimize-images.py
 * after adding photos) and falls back to the original if a copy is missing.
 */

/* The three services. The nav, service card, gallery filter and quote form all key off these ids. */
window.SERVICES = {
  painting: {
    label: "Painting",
    title: "Expert Painting",
    lead: "Interior or exterior, one door or the whole house. Howard preps it right, masks it clean, and lays down a finish that lasts through the Utah sun.",
    list: [
      "Interior walls, ceilings & trim",
      "Exterior repaints, stucco & siding",
      "Kitchen cabinet refinishing",
      "Front doors & garage doors",
      "Stairways & railings",
      "Epoxy garage floors"
    ],
    feature: { before: "kitchen3-before.jpeg", after: "kitchen3-after.jpeg", caption: "Kitchen cabinets: oak and white to a deep navy and bright white." },
    cta: "Get a Painting Quote",
    submit: "Send Painting Request",
    placeholder: "Which rooms or surfaces, current colors, anything that needs repair first…"
  },
  handyman: {
    label: "Handyman",
    title: "Expert Handyman",
    lead: "With over 30 years of experience, Howard Painting and Welding LLC delivers top-quality solutions for all your needs, from custom projects to everyday repairs. Whatever you need, we’ve got you covered!",
    list: [
      "Pergolas & patio covers",
      "Stucco & exterior wall repair",
      "Basement finishing & remodels",
      "Doors, trim & drywall",
      "Everyday fixes around the house"
    ],
    feature: { before: "small-overhang-before.JPG", after: "small-overhang-after.JPG", caption: "Side-yard patio cover, from a single post to a full timber frame." },
    cta: "Get a Handyman Quote",
    submit: "Send Handyman Request",
    placeholder: "What needs fixing or building, rough measurements, any materials you already have…"
  },
  welding: {
    label: "Welding",
    title: "Expert Welding",
    lead: "Custom steel gates, fences and railings, designed for your home and built in the shop. Strong welds, clean lines, and a finish that matches your style.",
    list: [
      "Custom driveway & courtyard gates",
      "Fencing & railings",
      "Decorative metalwork & accents",
      "Repairs to existing steel",
      "Painted or powder-coated finishes"
    ],
    feature: { before: "custom-gate-2.jpeg", after: "custom-gate-6.jpeg", caption: "Courtyard gate: raw steel in the shop to finished and installed." },
    cta: "Get a Welding Quote",
    submit: "Send Welding Request",
    placeholder: "What you'd like built or repaired, size, style ideas, where it's going…"
  }
};

/*
 * GALLERY — before/after pairs and single photos.
 *   With "before": the grid shows the after photo and reveals the before on hover.
 *   Without "before": the photo is shown as-is.
 */
window.GALLERY = [
  // Painting
  { service: "painting", title: "Kitchen Cabinets",        before: "kitchen3-before.jpeg",   after: "kitchen3-after.jpeg" },
  { service: "painting", title: "Two-Story Garage Doors",  before: "garage3-before.jpeg",    after: "garage3-after.jpeg" },
  { service: "painting", title: "Front Entry Door",        before: "door-before.jpeg",       after: "door-after.jpeg" },
  { service: "painting", title: "Wraparound Balcony",      before: "hall-before.jpeg",       after: "hall-after.jpeg" },
  { service: "painting", title: "Garage Door Refinish",    before: "garage2-before.jpeg",    after: "garage2-after.jpeg" },
  { service: "painting", title: "White Kitchen Cabinets",  before: "kitchen-before.jpeg",    after: "kitchen-after.jpeg" },
  { service: "painting", title: "Oval Glass Entry Door",   before: "door3-before.jpeg",      after: "door3-after.jpeg" },
  { service: "painting", title: "Three-Car Garage",        before: "garage1-before.jpeg",    after: "garage1-after.jpeg" },
  { service: "painting", title: "Stairway & Railing",      before: "stairs-before.JPG",      after: "stairs-after.JPG" },
  { service: "painting", title: "Kitchenette Cabinets",    before: "kitchen2-before.jpeg",   after: "kitchen2-after.jpeg" },
  { service: "painting", title: "Bold Red Front Door",                                       after: "IMG_1241.JPG" },

  // Handyman
  { service: "handyman", title: "Side-Yard Patio Cover",   before: "small-overhang-before.JPG", after: "small-overhang-after.JPG" },
  { service: "handyman", title: "Stucco Wall Restoration", before: "house-wall-1.jpeg",      after: "house-wall-2.jpeg" },
  { service: "handyman", title: "Basement Finish",                                           after: "manti-room-after.jpeg" },
  { service: "handyman", title: "Basement Stairway",                                         after: "manti-stairs-after.jpeg" },

  // Welding
  { service: "welding",  title: "Sun Medallion Driveway Gate",                               after: "IMG_1104.JPG" },
  { service: "welding",  title: "Pottery Motif Courtyard Gate",                              after: "IMG_2187.JPG" },
  { service: "welding",  title: "Arched Garden Gate",                                        after: "2D4B8032-4A3E-4CF8-AE84-6FFBAF0B198B.jpeg" },
  { service: "welding",  title: "Arched Privacy Gate",                                       after: "IMG_1136.JPG" },
  { service: "welding",  title: "Perimeter Fence & Gate",                                    after: "IMG_1118.JPG" },
  { service: "welding",  title: "Custom Courtyard Gate",   before: "custom-gate-2.jpeg",     after: "custom-gate-6.jpeg" }
];

/*
 * PROJECT SPOTLIGHTS — jobs with 3+ photos, shown step by step in order.
 */
window.SHOWCASES = [
  {
    service: "welding",
    title: "Custom Courtyard Gate",
    summary: "A double courtyard gate designed around the home’s modern lines, fabricated in the shop, fitted on site, and finished with bright accent pieces.",
    steps: [
      { src: "custom-gate-1.jpeg", caption: "Frame and arcs laid out in the shop" },
      { src: "custom-gate-2.jpeg", caption: "Both panels welded up" },
      { src: "custom-gate-3.jpeg", caption: "Detail of the sweeping arc design" },
      { src: "custom-gate-4.jpeg", caption: "Test fit on site in raw steel" },
      { src: "custom-gate-5.jpeg", caption: "Masked and painted in place" },
      { src: "custom-gate-6.jpeg", caption: "Finished and installed" }
    ]
  },
  {
    service: "painting",
    title: "Full Exterior Repaint",
    summary: "A tired tan exterior brought back to a crisp, bright white, with siding, trim and porch posts all prepped and sprayed.",
    steps: [
      { src: "house-1.jpeg", caption: "Before: faded tan siding" },
      { src: "house-2.jpeg", caption: "Prep and spraying underway" },
      { src: "house-4.jpeg", caption: "Finished: bright white with natural wood posts" },
      { src: "house3.jpeg",  caption: "Finished: bay window side" }
    ]
  },
  {
    service: "handyman",
    title: "Backyard Pergola",
    summary: "A large wood pergola built over the back patio, giving filtered shade all afternoon without blocking the view.",
    steps: [
      { src: "overhand-angle-1.JPG",    caption: "Beams and rafters going up" },
      { src: "overhang-angle-2.JPG",    caption: "Rafter tails cut and set" },
      { src: "overhand-angle-3.JPG",    caption: "Framing complete over the pool deck" },
      { src: "overhang-finished-1.JPG", caption: "Finished at dusk" },
      { src: "overhang-finished-2.JPG", caption: "Finished: full-length view" },
      { src: "overhang-finished-3.JPG", caption: "Finished: afternoon shade" }
    ]
  },
  {
    service: "painting",
    title: "Entry Door Set",
    summary: "Front and side doors pulled, primed, sprayed a rich blue and re-hung, with the decorative glass protected the whole way.",
    steps: [
      { src: "doors-1.jpeg", caption: "Doors pulled, masked and primed" },
      { src: "doors-2.jpeg", caption: "Color coat sprayed" },
      { src: "doors-3.jpeg", caption: "Re-hung at the front entry" },
      { src: "doors-4.jpeg", caption: "Finished front door" }
    ]
  },
  {
    service: "handyman",
    title: "Patio Pergola",
    summary: "A new pergola framed off the back of the house to turn a bare concrete slab into a shaded outdoor room.",
    steps: [
      { src: "porch-before.JPG", caption: "Posts and first beam set" },
      { src: "porch-after.JPG",  caption: "Rafters going on" },
      { src: "porch-2.JPG",      caption: "Finished pergola" }
    ]
  },
  {
    service: "painting",
    title: "Double Door Refinish",
    summary: "Weathered double doors sanded and refinished in a rich dark finish that stands up to the elements.",
    steps: [
      { src: "doors-before.JPG", caption: "Before: peeling and sun-worn" },
      { src: "doors-2.JPG",      caption: "Sanded and prepped" },
      { src: "doors-after.JPG",  caption: "Finished" }
    ]
  },
  {
    service: "painting",
    title: "Great Room Repaint",
    summary: "A large open great room with timber beams and curved walls, painted with care around the furniture and finishes.",
    steps: [
      { src: "livingroom-1.jpeg", caption: "Great room with curved window wall" },
      { src: "livingroom-2.jpeg", caption: "Walls painted around the timber beams" },
      { src: "livingroom-3.jpeg", caption: "Open dining and kitchen area" }
    ]
  },
  {
    service: "painting",
    title: "Epoxy Garage Floor",
    summary: "A plain concrete garage floor turned into a glossy, easy-to-clean flake epoxy finish.",
    steps: [
      { src: "IMG_0838.JPG", caption: "Laying down the flake coat" },
      { src: "IMG_0836.JPG", caption: "Close-up of the flake finish" },
      { src: "IMG_0839.JPG", caption: "Finished high-gloss floor" }
    ]
  }
];
