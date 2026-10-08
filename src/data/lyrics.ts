export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface TrackLyrics {
  videoId: string;
  lines: LyricLine[];
}

export const TRACK_LYRICS: Record<string, LyricLine[]> = {
  // Bone Thugs-N-Harmony - Thuggish Ruggish Bone (Acapella)
  'bone-thugs-thuggish': [
    { time: 0, text: "♪ [Acapella Vocals Starting] ♪" },
    { time: 4, text: "It's the thuggish ruggish bone..." },
    { time: 8, text: "It's the thuggish ruggish bone..." },
    { time: 13, text: "It's the thuggish ruggish bone..." },
    { time: 18, text: "We're not against rap, we're not against rappers" },
    { time: 22, text: "But we are against those thugs... (thuggish ruggish bone)" },
    { time: 28, text: "It's the first of the month, get up, get up, get up!" },
    { time: 33, text: "Cash your checks and get up! St. Clair East 99th Street!" },
    { time: 39, text: "Cleveland is where we lay, slangin' them thangs through the neighborhood" },
    { time: 45, text: "Execution double-nine style, straight from the wasteland" },
    { time: 51, text: "Bone, Bone, Bone, Bone, tell me what you're gonna do" },
    { time: 56, text: "When judgment comes for you? It's the thuggish ruggish bone!" },
    { time: 63, text: "Gotta get mine, gotta get mine, gotta get mine in a double-nine style" },
    { time: 70, text: "Creeping through the fog, gotta give it up to the No Surrender" },
    { time: 78, text: "It's the thuggish ruggish bone..." },
    { time: 86, text: "It's the thuggish ruggish bone..." },
    { time: 95, text: "East 99th Street forever in the heart of Cleveland, Ohio!" },
  ],

  // The Smashing Pumpkins - 1979
  'pumpkins-1979': [
    { time: 0, text: "♪ [Instrumental Drum & Guitar Groove] ♪" },
    { time: 14, text: "Shakedown 1979, cool kids never have the time" },
    { time: 22, text: "On a live wire right up off the street" },
    { time: 27, text: "You and I should meet" },
    { time: 33, text: "Junebug skipping on a groove" },
    { time: 38, text: "With the headlights blown, every night that you leave" },
    { time: 45, text: "Can you feel it? No one else can know..." },
    { time: 53, text: "And we don't even care, as restless as we are" },
    { time: 61, text: "We feel the pull in the rhythm of the city" },
    { time: 69, text: "The street heats up in the summer cool air" },
    { time: 78, text: "Shakedown 1979..." },
    { time: 87, text: "And we don't even care, to shake our little heads" },
  ],

  // The Weeknd - Blinding Lights (4NRXx6U8ABQ)
  '4NRXx6U8ABQ': [
    { time: 0, text: '♪ [Synth Intro Hook] ♪' },
    { time: 14, text: "Yeah..." },
    { time: 19, text: "I've been tryna call" },
    { time: 24, text: "I've been on my own for long enough" },
    { time: 28, text: "Maybe you can show me how to love, maybe" },
    { time: 35, text: "I'm going through withdrawals" },
    { time: 39, text: "You don't even have to do too much" },
    { time: 43, text: "You can turn me on with just a touch, baby" },
    { time: 51, text: "I look around and Sin City's cold and empty" },
    { time: 59, text: "No one's around to judge me" },
    { time: 64, text: "I can't see clearly when you're gone" },
    { time: 68, text: "I said, ooh, I'm blinded by the lights!" },
    { time: 76, text: "No, I can't sleep until I feel your touch" },
    { time: 83, text: "I said, ooh, I'm drowning in the night" },
    { time: 91, text: "Oh, when I'm like this, you're the one I trust" },
    { time: 100, text: "♪ [Blinding Synth Drop] ♪" },
  ],

  // a-ha - Take On Me (djV11Xbc914)
  'djV11Xbc914': [
    { time: 0, text: '♪ [Drum beat & Synth Intro] ♪' },
    { time: 15, text: "We're talking away..." },
    { time: 20, text: "I don't know what I'm to say" },
    { time: 24, text: "I'll say it anyway" },
    { time: 27, text: "Today's another day to find you" },
    { time: 32, text: "Shying away" },
    { time: 36, text: "I'll be coming for your love, okay?" },
    { time: 42, text: "Take on me! (Take on me)" },
    { time: 49, text: "Take me on! (Take on me)" },
    { time: 57, text: "I'll be gone..." },
    { time: 61, text: "In a day or two!" },
    { time: 70, text: "So needless to say, of the odds and ends" },
    { time: 77, text: "I'll be stumbling away" },
    { time: 82, text: "Slowly learning that life is okay" },
    { time: 88, text: "Say after me: It's no better to be safe than sorry!" },
    { time: 96, text: "Take on me! (Take on me)" },
  ],

  // Dua Lipa - Levitating (TUVcZfQe-Kw)
  'TUVcZfQe-Kw': [
    { time: 0, text: '♪ [Funky Disco Groove] ♪' },
    { time: 10, text: "If you wanna run away with me, I know a galaxy" },
    { time: 15, text: "And I can take you for a ride" },
    { time: 19, text: "I had a premonition that we fell into a rhythm" },
    { time: 24, text: "Where the music don't stop for life" },
    { time: 29, text: "Glitter in the sky, glitter in my eyes" },
    { time: 34, text: "Shining just the way I like" },
    { time: 38, text: "If you're feeling like you need a little bit of company" },
    { time: 43, text: "You met me at the perfect time" },
    { time: 48, text: "You want me, I want you, baby" },
    { time: 53, text: "My sugarboo, I'm levitating!" },
    { time: 57, text: "The Milky Way, we're renegading" },
    { time: 62, text: "Yeah, yeah, yeah, yeah, yeah!" },
  ],

  // Daft Punk - Around the World (dwDns8x3Jb4)
  'dwDns8x3Jb4': [
    { time: 0, text: '♪ [Bassline Groove Intro] ♪' },
    { time: 16, text: 'Around the world, around the world' },
    { time: 24, text: 'Around the world, around the world' },
    { time: 32, text: 'Around the world, around the world' },
    { time: 40, text: 'Around the world, around the world' },
    { time: 48, text: 'Around the world, around the world' },
    { time: 56, text: 'Around the world, around the world' },
    { time: 64, text: 'Around the world, around the world' },
    { time: 80, text: '♪ [Synth Filter Sweep] ♪' },
    { time: 96, text: 'Around the world, around the world' },
  ],

  // Mark Ronson ft. Bruno Mars - Uptown Funk (OPf0YbXqDm0)
  'OPf0YbXqDm0': [
    { time: 0, text: 'DOH! Doo-doo-doo-doo...' },
    { time: 12, text: "This hit, that ice cold, Michelle Pfeiffer, that white gold" },
    { time: 18, text: "This one for them hood girls, them good girls, straight masterpieces" },
    { time: 24, text: "Stylin', wilin', livin' it up in the city" },
    { time: 30, text: "Got Chucks on with Saint Laurent, gotta kiss myself, I'm so pretty!" },
    { time: 36, text: "I'm too hot! (Damn) Called a police and a fireman" },
    { time: 42, text: "I'm too hot! (Damn) Make a dragon wanna retire, man" },
    { time: 48, text: "Girls hit your hallelujah! (Whoo!) Cause Uptown Funk gon' give it to ya!" },
    { time: 58, text: "Saturday night and we in the spot, don't believe me just watch!" },
    { time: 66, text: '♪ [BRASS DROP] DOH! ♪' },
  ],

  // Earth, Wind & Fire - September (Gs069dndIYk)
  'Gs069dndIYk': [
    { time: 0, text: '♪ [Guitar groove & horn hit] ♪' },
    { time: 8, text: "Do you remember the 21st night of September?" },
    { time: 14, text: "Love was changin' the minds of pretenders" },
    { time: 18, text: "While chasin' the clouds away" },
    { time: 24, text: "Our hearts were ringin' in the key that our souls were singin'" },
    { time: 29, text: "As we danced in the night, remember" },
    { time: 33, text: "How the stars stole the night away, oh yeah!" },
    { time: 40, text: "Ba-de-ya, say, do you remember?" },
    { time: 46, text: "Ba-de-ya, dancin' in September!" },
    { time: 52, text: "Ba-de-ya, never was a cloudy day!" },
  ],

  // Gorillaz - Feel Good Inc. (HyHNuVaZJ-k)
  'HyHNuVaZJ-k': [
    { time: 0, text: 'Hahaha... Feel good...' },
    { time: 14, text: 'City’s breaking down on a camel’s back' },
    { time: 18, text: 'They just have to go ‘cause they don’t know wack' },
    { time: 22, text: 'So while you fill the streets, it’s appealing to see' },
    { time: 26, text: 'You won’t get out the county, ‘cause you’re bad and free' },
    { time: 30, text: 'Windmill, windmill for the land, turn forever hand in hand' },
    { time: 38, text: 'Take it all in on your stride, it is ticking, falling down' },
    { time: 46, text: 'Love forever, love is free, let’s turn forever, you and me' },
    { time: 54, text: 'Windmill, windmill for the land, is everybody in?' },
  ],

  // Eminem - Without Me (YVkUvmDQ3HY)
  'YVkUvmDQ3HY': [
    { time: 0, text: "Obie Trice, real name, no gimmicks!" },
    { time: 8, text: "Two trailer park girls go 'round the outside..." },
    { time: 14, text: "Guess who's back, back again?" },
    { time: 18, text: "Shady's back, tell a friend!" },
    { time: 24, text: "Now this looks like a job for me, so everybody, just follow me" },
    { time: 29, text: "'Cause we need a little controversy" },
    { time: 33, text: "'Cause it feels so empty without me!" },
    { time: 37, text: "I've created a monster, 'cause nobody wants to see Marshall no more" },
    { time: 42, text: "They want Shady, I'm chopped liver!" },
  ],

  // Billie Eilish - bad guy (DyDfgMOUjCI)
  'DyDfgMOUjCI': [
    { time: 0, text: '♪ [Punchy 808 Bass Groove] ♪' },
    { time: 9, text: "White shirt now red, my bloody nose" },
    { time: 13, text: "Sleeping, you're on your tippy-toes" },
    { time: 17, text: "Creeping around like no one knows" },
    { time: 21, text: "Think you're so criminal" },
    { time: 25, text: "So you're a tough guy, like it really rough guy" },
    { time: 29, text: "Just can't get enough guy, chest always so puffed guy" },
    { time: 34, text: "I'm that bad type, make your mama sad type" },
    { time: 38, text: "Make your girlfriend mad tight, might seduce your dad type" },
    { time: 42, text: "I'm the bad guy... duh!" },
    { time: 47, text: '♪ [Sub Bass Wobble] ♪' },
  ],

  // Queen - Another One Bites the Dust (rY0WEl9bF3Y)
  'rY0WEl9bF3Y': [
    { time: 0, text: '♪ [Legendary Bassline] ♪' },
    { time: 11, text: "Steve walks warily down the street" },
    { time: 15, text: "With the brim pulled way down low" },
    { time: 19, text: "Ain't no sound but the sound of his feet" },
    { time: 22, text: "Machine guns ready to go" },
    { time: 26, text: "Are you ready? Hey, are you ready for this?" },
    { time: 30, text: "Are you hanging on the edge of your seat?" },
    { time: 34, text: "Out of the doorway the bullets rip, to the sound of the beat, yeah!" },
    { time: 41, text: "Another one bites the dust!" },
    { time: 45, text: "Another one bites the dust!" },
    { time: 49, text: "And another one gone, and another one gone" },
    { time: 52, text: "Another one bites the dust, yeah!" },
  ],
};

export function getLyricsForTrack(videoId?: string, trackTitle?: string): LyricLine[] | null {
  if (videoId && TRACK_LYRICS[videoId]) {
    return TRACK_LYRICS[videoId];
  }

  if (trackTitle) {
    const lower = trackTitle.toLowerCase();
    if (lower.includes('thuggish') || lower.includes('bone thugs')) {
      return TRACK_LYRICS['bone-thugs-thuggish'];
    }
    if (lower.includes('1979') || lower.includes('smashing pumpkins')) {
      return TRACK_LYRICS['pumpkins-1979'];
    }
    if (lower.includes('blinding lights') || lower.includes('weeknd')) {
      return TRACK_LYRICS['4NRXx6U8ABQ'];
    }
    if (lower.includes('take on me') || lower.includes('a-ha')) {
      return TRACK_LYRICS['djV11Xbc914'];
    }
    if (lower.includes('levitating') || lower.includes('dua lipa')) {
      return TRACK_LYRICS['TUVcZfQe-Kw'];
    }
    if (lower.includes('around the world') || lower.includes('daft punk')) {
      return TRACK_LYRICS['dwDns8x3Jb4'];
    }
    if (lower.includes('uptown funk') || lower.includes('bruno mars')) {
      return TRACK_LYRICS['OPf0YbXqDm0'];
    }
    if (lower.includes('september') || lower.includes('earth wind')) {
      return TRACK_LYRICS['Gs069dndIYk'];
    }
    if (lower.includes('feel good') || lower.includes('gorillaz')) {
      return TRACK_LYRICS['HyHNuVaZJ-k'];
    }
    if (lower.includes('without me') || lower.includes('eminem')) {
      return TRACK_LYRICS['YVkUvmDQ3HY'];
    }
    if (lower.includes('bites the dust') || lower.includes('queen')) {
      return TRACK_LYRICS['rY0WEl9bF3Y'];
    }
    if (lower.includes('bad guy') || lower.includes('billie eilish')) {
      return TRACK_LYRICS['DyDfgMOUjCI'];
    }
  }

  return null;
}

export function getCurrentLyricLine(videoId: string, currentTime: number, trackTitle?: string): string | null {
  const lines = getLyricsForTrack(videoId, trackTitle);
  if (!lines || lines.length === 0) return null;

  let activeLine: LyricLine | null = null;
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      activeLine = lines[i];
    } else {
      break;
    }
  }

  return activeLine ? activeLine.text : null;
}
