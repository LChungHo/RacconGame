export default {
  "id": "moonlight",
  "width": 288,
  "height": 224,
  "timeLimitSeconds": 120,
  "spawn": {
    "x": 16,
    "y": 16
  },
  "platforms": [
    {
      "x": 0,
      "y": 8,
      "w": 288,
      "h": 8
    },
    {
      "x": 0,
      "y": 56,
      "w": 136,
      "h": 8
    },
    {
      "x": 152,
      "y": 56,
      "w": 136,
      "h": 8
    },
    {
      "x": 0,
      "y": 104,
      "w": 288,
      "h": 8
    },
    {
      "x": 0,
      "y": 152,
      "w": 288,
      "h": 8
    }
  ],
  "ladders": [
    {
      "x": 232,
      "y": 16,
      "w": 12,
      "h": 48
    },
    {
      "x": 32,
      "y": 64,
      "w": 12,
      "h": 48
    },
    {
      "x": 232,
      "y": 112,
      "w": 12,
      "h": 48
    }
  ],
  "foods": [
    {
      "id": "fruit-16-48",
      "x": 48,
      "y": 16,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-16-200",
      "x": 200,
      "y": 16,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-64-48",
      "x": 48,
      "y": 64,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-64-200",
      "x": 200,
      "y": 64,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-112-48",
      "x": 48,
      "y": 112,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-112-200",
      "x": 200,
      "y": 112,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-160-48",
      "x": 48,
      "y": 160,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "fruit-160-200",
      "x": 200,
      "y": 160,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "extra-64",
      "x": 80,
      "y": 64,
      "w": 8,
      "h": 8,
      "points": 100
    },
    {
      "id": "extra-160",
      "x": 80,
      "y": 160,
      "w": 8,
      "h": 8,
      "points": 100
    }
  ],
  "enemies": [
    {
      "id": "caterpillar-0",
      "x": 252,
      "y": 16,
      "w": 12,
      "h": 12,
      "minX": 248,
      "maxX": 272,
      "speed": 30,
      "direction": 1
    },
    {
      "id": "caterpillar-1",
      "x": 252,
      "y": 112,
      "w": 12,
      "h": 12,
      "minX": 248,
      "maxX": 272,
      "speed": 30,
      "direction": 1
    }
  ],
  "hazards": [],
  "pots": [
    {
      "id": "bonus-pot",
      "x": 264,
      "y": 64,
      "w": 10,
      "h": 12,
      "outcome": "bonus"
    }
  ]
};
