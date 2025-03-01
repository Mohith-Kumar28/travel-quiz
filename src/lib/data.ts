import { Destination } from "@/types";

export const destinations: Destination[] = [
  {
    alias: "dst1",
    name: "Taj Mahal",
    clues: [
      "A white marble mausoleum built by Shah Jahan",
      "Located in Agra, Uttar Pradesh",
      "One of the Seven Wonders of the World"
    ],
    funFacts: [
      "The Taj Mahal changes color throughout the day.",
      "It took over 22 years and 20,000 workers to complete."
    ]
  },
  {
    alias: "dst2",
    name: "Varanasi",
    clues: [
      "One of the oldest continuously inhabited cities in the world",
      "Located on the banks of the River Ganges",
      "Known as the spiritual capital of India"
    ],
    funFacts: [
      "Mark Twain once said: 'Older than history, older than tradition, older even than legend'",
      "The city is known for its 88 ghats along the river."
    ]
  },
  {
    alias: "dst3",
    name: "Jaipur",
    clues: [
      "Known as the Pink City",
      "Capital of Rajasthan",
      "Home to the Hawa Mahal"
    ],
    funFacts: [
      "The entire city was painted pink to welcome King Edward VII in 1876.",
      "The Hawa Mahal has 953 small windows called jharokhas."
    ]
  },
  {
    alias: "dst4",
    name: "Kerala",
    clues: [
      "Known as God's Own Country",
      "Famous for its backwaters and houseboats",
      "Home to the ancient martial art Kalaripayattu"
    ],
    funFacts: [
      "It has a 100% literacy rate, the highest in India.",
      "The state produces 70% of India's spices."
    ]
  },
  {
    alias: "dst5",
    name: "Ladakh",
    clues: [
      "Known as the Land of High Passes",
      "Home to the world's highest motorable road",
      "Famous for its Buddhist monasteries"
    ],
    funFacts: [
      "Pangong Lake changes colors throughout the day.",
      "The Magnetic Hill appears to defy gravity."
    ]
  },
  {
    alias: "dst6",
    name: "Hampi",
    clues: [
      "Ancient ruins of the Vijayanagara Empire",
      "Located in Karnataka",
      "Known for its boulder-strewn landscape"
    ],
    funFacts: [
      "The Vittala Temple has musical pillars that produce different musical notes when struck.",
      "It was once one of the richest cities in the world."
    ]
  },
  {
    alias: "dst7",
    name: "Amritsar",
    clues: [
      "Home to the Golden Temple",
      "Located in Punjab",
      "Known for its Wagah Border ceremony"
    ],
    funFacts: [
      "The Golden Temple's langar serves free meals to over 100,000 people daily.",
      "The temple is covered with 750 kg of pure gold."
    ]
  },
  {
    alias: "dst8",
    name: "Goa",
    clues: [
      "India's smallest state",
      "Known for its beaches and Portuguese architecture",
      "Famous for its carnival celebrations"
    ],
    funFacts: [
      "It was a Portuguese colony for 450 years.",
      "The Basilica of Bom Jesus holds the remains of St. Francis Xavier."
    ]
  },
  {
    alias: "dst9",
    name: "Mysore",
    clues: [
      "City of Palaces",
      "Famous for its Dasara celebrations",
      "Home to the magnificent Mysore Palace"
    ],
    funFacts: [
      "The Mysore Palace is illuminated by 97,000 light bulbs.",
      "It's known as the Yoga capital of India."
    ]
  },
  {
    alias: "dst10",
    name: "Darjeeling",
    clues: [
      "Known for its tea plantations",
      "Home to the Toy Train",
      "View point for Kanchenjunga peak"
    ],
    funFacts: [
      "The Darjeeling Himalayan Railway is a UNESCO World Heritage site.",
      "The name comes from 'Dorje Ling' meaning place of the thunderbolt."
    ]
  },
  {
    alias: "dst11",
    name: "Udaipur",
    clues: [
      "City of Lakes",
      "Known as the Venice of the East",
      "Home to the Lake Palace"
    ],
    funFacts: [
      "The Lake Palace appears to float on Lake Pichola.",
      "Parts of the James Bond film 'Octopussy' were filmed here."
    ]
  },
  {
    alias: "dst12",
    name: "Khajuraho",
    clues: [
      "Famous for its intricate temple architecture",
      "UNESCO World Heritage site in Madhya Pradesh",
      "Known for its unique sculptures"
    ],
    funFacts: [
      "Only 20 of the original 85 temples remain today.",
      "The temples were lost to the world until 1838 when they were rediscovered by a British army captain."
    ]
  },
  {
    alias: "dst13",
    name: "Rann of Kutch",
    clues: [
      "World's largest salt desert",
      "Located in Gujarat",
      "Famous for its white desert under full moon"
    ],
    funFacts: [
      "The salt marsh covers an area of 7,505 square kilometers.",
      "It's home to the unique wild ass species found nowhere else in India."
    ]
  },
  {
    alias: "dst14",
    name: "Kaziranga",
    clues: [
      "Home to two-thirds of the world's one-horned rhinoceros",
      "National Park in Assam",
      "Located along the Brahmaputra River"
    ],
    funFacts: [
      "It has the highest density of tigers among protected areas in the world.",
      "The park began as a forest reserve in 1905 to protect the rhinoceros."
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