/**
 * Script to seed the 12-day Uganda tour
 * Usage: node scripts/seed-uganda-tour.js
 */

const SUPABASE_URL = "https://uxdiipqxujzbzfizbhic.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "REDACTED_KEY";

const ugandaTour = {
  title: "12 Days Uganda: Exploring the Wild West",
  slug: "12-day-uganda-explore-the-west",
  description: "Wild and adventurous – this is your 12-day journey through Uganda's Wild West! Experience rhinos, elephants, lions, mountain gorillas and chimps across world-class national parks.",
  overview: "The western part of Uganda is home to all the big and famous parks, which you'll all get to see! Look forward to meeting fascinating animals such as rhinos, elephants, lions, mountain gorillas AND chimps. Furthermore, you'll not only sit in your car but also head into emerald and ochre paradises by boat or on foot.",
  duration: "12 days",
  price: 3825,
  price_note: "price p.p. incl. guide, safari jeep, hotel and park entrance fees, excl. international flight (based on six persons)",
  destinations: ["Uganda"],
  category: "Uganda",
  highlights: [
    "Up-close rhino encounters at Ziwa Rhino Sanctuary",
    "Boat safari to impressive Murchison Falls",
    "Chimpanzee trekking in Kibale National Park",
    "Royal safari in Queen Elizabeth National Park",
    "Mountain gorilla trekking in Bwindi",
    "Walking safari in Lake Mburo National Park"
  ],
  inclusions: [
    "24/7 service",
    "12 days accommodation",
    "All accommodations included",
    "Drinking water in safari jeeps",
    "Full board (meals)",
    "Game drives",
    "Luxurious private 4×4 Safari Jeep",
    "Park entrance fees",
    "Private guide speaking fluently English",
    "Reservation costs",
    "Fully accredited under SGR"
  ],
  exclusions: [
    "Visas",
    "Travel insurance",
    "International flights (can be booked on request)",
    "Mountain gorilla trekking permit (must be booked separately)"
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival at Entebbe International Airport",
      description: "You arrive at Entebbe International Airport, your gateway to the diverse beauty of Uganda! This is the country of adventurous mountain gorilla and chimp trekking, stunning wildlife safaris, amazing road trips and wilderness adventures by boat, bike, horse or foot. Experience the warm hospitality of the Ugandan people and be amazed by the cultural encounters with the different indigenous tribes. Our driver awaits you in the airport, carrying a sign with your name on it. Welcome to Uganda!",
      activities: []
    },
    {
      day: 2,
      title: "Drive to Murchison Falls National Park with Rhino Trekking",
      description: "From Entebbe you make your way to the country's oldest national park: Murchison Falls. On the way you take a break visiting the rhinos of the Ziwa Rhino Sanctuary and once arrived in Murchison, you can start looking forward to a jeep safari of the unique kind.",
      activities: [
        "Rhino trekking at Ziwa Rhino Sanctuary",
        "Drive from Entebbe / Kampala to Murchison Falls National Park",
        "Jeep safari in Murchison Falls National Park"
      ]
    },
    {
      day: 3,
      title: "Two Safaris and a Hike in Murchison Falls",
      description: "In a jeep, with a boat and on foot – this is how you discover the best Murchison Falls National Park has to offer. Get ready to be wowed by African animals, Ugandan landscapes and captivating waterfalls.",
      activities: [
        "Boat safari to the Murchison Falls",
        "Top of the Falls hike",
        "Jeep safari in Murchison Falls National Park"
      ]
    },
    {
      day: 4,
      title: "Drive from Murchison Falls National Park to Kibale National Park",
      description: "Today you drive from Murchison Falls to Kibale National Park. This 6-hour drive leads you past welcoming villages, rainforests, charming tea plantations and mesmerizing crater lakes towards Fort Portal - a friendly and hospitable gateway city to Uganda's adventures. If the weather is clear, you can see the Rwenzori Mountains with their snow-capped peaks. And then, get ready for Kibale Forest, the primate capital of the world with no less than 13 different species of monkeys!",
      activities: [
        "Drive from Murchison Falls to Kibale National Park"
      ]
    },
    {
      day: 5,
      title: "Chimpanzee Trekking and Swamp Walk in Kibale",
      description: "In the depths of the rainforest you get to observe our closest relatives play, eat and groom each other – an experience which will make everyone's eyes sparkle! And since the jungle holds many more treasures, you go on the hunt for them afterwards during a swamp walk (not literally!).",
      activities: [
        "Chimpanzee trekking in Kibale National Park",
        "Swamp walk in Bigodi Wetland Sanctuary at Kibale National Park"
      ]
    },
    {
      day: 6,
      title: "Drive to Queen Elizabeth National Park and Jeep Safari",
      description: "The drive to Queen Elizabeth National Park is like a trailer for the big movie – your safari, which happens on the very same day! The superstars of the most royal of all parks cannot wait to pose for your pictures.",
      activities: [
        "Drive from Kibale to Queen Elizabeth National Park",
        "Jeep safari in Queen Elizabeth National Park"
      ]
    },
    {
      day: 7,
      title: "Discover Queen Elizabeth National Park in a Jeep and a Boat",
      description: "After discovering countless gems of Queen Elizabeth National Park on land, it's time to hop into a comfy boat and do the same on the Kazinga channel – the home of hippos, crocodiles and colourful birds.",
      activities: [
        "Jeep safari in Queen Elizabeth National Park",
        "Boat safari on the Kazinga Channel"
      ]
    },
    {
      day: 8,
      title: "Drive from Queen Elizabeth to Bwindi Impenetrable National Park",
      description: "Enjoy the beauty of Uganda on a 5 to 6-hour drive from Queen Elizabeth National Park to Bwindi Impenetrable Forest National Park. Observe the landscape gradually transforming from open savannah plains to thick and lush green forests. A memorable drive!",
      activities: [
        "Drive from Queen Elizabeth to Bwindi Impenetrable National Park"
      ]
    },
    {
      day: 9,
      title: "Mountain Gorilla Trekking in Rushaga (Southern Sector)",
      description: "The Rushaga sector in the southern part of Bwindi Impenetrable National Park is home to eight gorilla families, some of which are still unaccustomed to human presence. During a mountain gorilla trekking tour, you can hike along challenging trails, spending either an hour with the habituated groups or, at an extra cost, up to four hours observing the less familiar giants in their natural habitat. This once-in-a-lifetime experience, where you can watch the gorillas eat, play, and be guarded by the silverback, will leave you in awe and may even bring tears of joy to your eyes. Please note that gorilla trekking is conducted in groups of up to 8 people, requires proper hiking shoes, and typically lasts 2 to 4 hours. Also, since this is a very popular activity which needs both a permit and a guide, it has to be booked separately and well in advance.",
      activities: [
        "Mountain gorilla trekking in Rushaga (southern sector)"
      ]
    },
    {
      day: 10,
      title: "Drive from Bwindi Impenetrable National Park to Lake Mburo National Park",
      description: "After your amazing gorilla trekking experience, you drive from Bwindi Impenetrable to Lake Mburo National Park. During this 7-hour road trip, you see the forest-like landscape gradually transform into soft verdant hills and open savannah. Lake Mburo is packed with wildlife seeking green vegetation and refreshment, so grab your binoculars and be sure to stay on the lookout for zebras, giraffes and many different bird species!",
      activities: [
        "Drive from Bwindi to Lake Mburo National Park"
      ]
    },
    {
      day: 11,
      title: "Two Safaris in Lake Mburo National Park",
      description: "Marvel at African wildlife from up close (like really close!) during a walking safari in Lake Mburo National Park and step into your private jeep to dive even deeper into the unique landscape around the glistening Lake Mburo.",
      activities: [
        "Walking safari in Lake Mburo National Park",
        "Jeep safari in Lake Mburo National Park"
      ]
    },
    {
      day: 12,
      title: "Return to Entebbe for Your Flight Home",
      description: "After some exhilarating days, the end of your adventure is near. Enjoy the ride back to where it all started, take in the stunning views once more and take off with new memories that last forever. Or simply stay a little longer.",
      activities: [
        "Drive back to Entebbe",
        "Flight home from Entebbe (not included in the price)"
      ]
    }
  ],
  image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
    "https://images.unsplash.com/photo-1504681869696-d977e117a495?w=800&q=80"
  ],
  is_featured: true,
  is_published: true
};

async function seedTour() {
  try {
    // First check if tour already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/tours?slug=eq.${encodeURIComponent(ugandaTour.slug)}`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const existingTours = await checkResponse.json();
    
    if (existingTours && existingTours.length > 0) {
      console.log('✅ Tour already exists in the database');
      console.log('Tour ID:', existingTours[0].id);
      return;
    }

    // Insert the tour
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/tours`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(ugandaTour)
      }
    );

    const result = await response.json();
    
    if (response.ok && result.length > 0) {
      console.log('✅ Uganda tour added to experiences successfully!');
      console.log('Tour ID:', result[0].id);
      console.log('Tour will appear when filtering by Uganda');
    } else {
      console.error('❌ Failed to add tour:');
      console.error(result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

seedTour();
