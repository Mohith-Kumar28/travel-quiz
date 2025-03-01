import { Destination } from "@/types";

export const destinations: Destination[] = [
  {
    alias: "dst1",
    name: "Paris",
    clues: [
      "Home to a famous tower finished in 1889",
      "Called the City of Light"
    ],
    funFacts: [
      "The Louvre is the world's largest art museum.",
      "Famous for café culture and haute cuisine."
    ]
  },
  {
    alias: "dst2",
    name: "Tokyo",
    clues: [
      "Capital city with over 13 million residents",
      "Known for high-tech, anime, and cherry blossoms"
    ],
    funFacts: [
      "It's the most populous metropolitan area in the world.",
      "Tsukiji once was the world's largest fish market."
    ]
  },
  {
    alias: "dst3",
    name: "New York City",
    clues: [
      "The Big Apple",
      "Home to a famous statue gifted by France"
    ],
    funFacts: [
      "More than 800 languages are spoken in this city.",
      "The first pizzeria in America opened here in 1905."
    ]
  },
  {
    alias: "dst4",
    name: "Venice",
    clues: [
      "City of canals and masks",
      "Famous for its glass-making industry"
    ],
    funFacts: [
      "Built on more than 100 small islands in a lagoon.",
      "The city has over 400 bridges connecting its islands."
    ]
  },
  {
    alias: "dst5",
    name: "Dubai",
    clues: [
      "Home to the world's tallest building",
      "A desert oasis of luxury and innovation"
    ],
    funFacts: [
      "Police here drive supercars like Lamborghinis and Ferraris.",
      "Has the world's largest choreographed fountain system."
    ]
  },
  {
    alias: "dst6",
    name: "Sydney",
    clues: [
      "Famous for its shell-shaped opera house",
      "Largest city in the land down under"
    ],
    funFacts: [
      "The Opera House has over one million roof tiles.",
      "The Harbour Bridge is nicknamed 'The Coathanger' due to its shape."
    ]
  },
  {
    alias: "dst7",
    name: "Rio de Janeiro",
    clues: [
      "Watched over by Christ the Redeemer",
      "Home to the world's largest carnival"
    ],
    funFacts: [
      "The Christ the Redeemer statue was struck by lightning during a storm in 2014.",
      "Copacabana beach is 4km long and made of imported Portuguese sand."
    ]
  },
  {
    alias: "dst8",
    name: "Barcelona",
    clues: [
      "Famous for Gaudi's unfinished cathedral",
      "Home to the legendary Camp Nou stadium"
    ],
    funFacts: [
      "The Sagrada Familia has been under construction for over 140 years.",
      "Las Ramblas was once a stream bed before becoming a famous street."
    ]
  },
  {
    alias: "dst9",
    name: "Cairo",
    clues: [
      "City of the pyramids",
      "Capital on the banks of the Nile"
    ],
    funFacts: [
      "The Great Pyramid was the tallest man-made structure for over 3,800 years.",
      "The city's name means 'The Victorious' in Arabic."
    ]
  },
  {
    alias: "dst10",
    name: "Singapore",
    clues: [
      "City where chewing gum is banned",
      "Known for its iconic Marina Bay Sands hotel"
    ],
    funFacts: [
      "It's one of only three city-states in the world.",
      "Has the world's first night safari and largest glass greenhouse."
    ]
  },
  {
    alias: "dst11",
    name: "Machu Picchu",
    clues: [
      "Lost city of the Incas",
      "Sits high in the Andes mountains"
    ],
    funFacts: [
      "Built without the use of mortar or metal tools.",
      "The stones are cut so precisely that a knife blade cannot fit between them."
    ]
  },
  {
    alias: "dst12",
    name: "Istanbul",
    clues: [
      "The only city that spans two continents",
      "Once known as Constantinople"
    ],
    funFacts: [
      "The Grand Bazaar is one of the world's oldest and largest covered markets.",
      "The Hagia Sophia has served as both a church and a mosque."
    ]
  },
  {
    alias: "dst13",
    name: "Amsterdam",
    clues: [
      "City of canals and bicycles",
      "Known for its narrow houses and tulips"
    ],
    funFacts: [
      "Has more bikes than people - approximately 850,000 bikes.",
      "Many houses are tilted forward to help move furniture up using pulleys."
    ]
  },
  {
    alias: "dst14",
    name: "Kyoto",
    clues: [
      "Japan's former imperial capital",
      "Famous for its golden pavilion"
    ],
    funFacts: [
      "Home to over 1,600 Buddhist temples and 400 Shinto shrines.",
      "Was removed from the atomic bomb target list during WWII due to its cultural significance."
    ]
  }
];

export const getRandomDestination = (): Destination => {
  const randomIndex = Math.floor(Math.random() * destinations.length);
  return destinations[randomIndex];
};

export const getRandomOptions = (correctAnswer: string): string[] => {
  const options = new Set<string>([correctAnswer]);
  while (options.size < 4) {
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    options.add(randomDest.name);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}; 