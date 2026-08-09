# Safar-e-UP: 90s Vibes

## YouTube music discovery and Vercel setup

Safar-e-UP discovers embeddable YouTube videos from its predefined song searches through a server-side endpoint. Playback uses the official YouTube IFrame Player API; the application never downloads, proxies, or converts YouTube media.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. Enable **YouTube Data API v3** under **APIs & Services → Library**.
3. Open **APIs & Services → Credentials**, create an **API key**, and restrict it to YouTube Data API v3. Apply appropriate application/IP restrictions for your deployment policy.
4. In Vercel, open the project’s **Settings → Environment Variables**, add `YOUTUBE_API_KEY`, and apply it to Production, Preview, and Development as needed. Do not prefix it with `VITE_`.
5. Redeploy after saving the variable. For local development, copy `.env.example` to `.env.local` and add your key; `.env.local` is ignored by Git.

The key is read only by `/api/youtube-discovery` on the server. The browser receives only candidate video IDs, titles, and thumbnail URLs. The current session caches discovery results to minimize YouTube Data API calls.

Build a highly polished interactive nostalgia website called "Safar-e-UP".

IMPORTANT:

This should NOT look like a normal modern SaaS/portfolio website.

It should feel like an interactive digital experience where the user is physically standing at an old Uttar Pradesh bus stop, boards a bus, gets a window seat, and then discovers a nostalgic 90s Hindi music playlist.

The core experience is:

BUS STOP → BOARD BUS → ENTER BUS → WINDOW SEAT → 90s MUSIC STARTS

The website should feel like:

Indian street illustration + old UP Roadways bus + 90s Bollywood nostalgia + vintage Indian graphic design.

DESIGN DIRECTION

---

Use the visual aesthetic of the attached reference image as inspiration:

- hand-painted Indian street illustration

- warm, slightly dusty colors

- textured paper / film grain

- imperfect painted surfaces

- flat illustrated shapes

- strong red / terracotta architecture

- dusty blue sky

- olive and dark green trees

- warm cream/off-white typography

- dark brown shadows

- vintage Indian atmosphere

Do NOT copy the reference website or its exact artwork.

Create an original Uttar Pradesh-specific visual world.

COLOR PALETTE

---

Primary:

- Brick red

- Deep terracotta

- Burnt orange

- Mustard yellow

- Dusty blue

- Olive green

- Warm cream

- Dark brown / charcoal

Avoid:

- neon gradients

- glassmorphism

- corporate blue

- excessive purple

- futuristic UI

- generic startup aesthetics

The interface should look slightly aged, tactile and physical.

TYPOGRAPHY

---

Use expressive Devanagari typography for major Hindi headings.

Main title:

"सफ़र-ए-UP"

Supporting line:

"एक सफ़र, कुछ पुराने गाने।"

Use a combination of:

- bold expressive Hindi display typography

- simple readable sans-serif for small UI text

The Hindi typography should feel like old painted Indian signboards, not like a generic Google font website.

PAGE 1: BUS STOP

---

The entire first viewport should feel like the user is physically standing at a small-town Uttar Pradesh bus stop.

Create a full-screen illustrated environment.

Scene elements:

- old UP Roadways-style bus in the background

- dusty road

- bus stop shelter

- tea stall

- paan shop

- old cycle

- rickshaw

- people waiting for the bus

- luggage

- trees

- electric poles and wires

- old Hindi wall advertisements

- hand-painted signboards

- small-town buildings

- warm afternoon sunlight

- subtle atmospheric dust

- paper/film grain texture

Do not make it photorealistic.

Use a stylized illustrated / painted aesthetic.

The main visual focus should be an old red/cream public bus.

CENTER SCREEN:

"अगली बस आ गई है।"

Under it:

"खिड़की वाली सीट खाली है।"

Then a large tactile button:

"🚌 बस में चढ़ें"

The button should look like a physical old sign/button rather than a modern rounded SaaS button.

On hover:

- bus doors should slightly open

- button should move subtly as if physically pressed

- subtle ambient sound effect if possible

Add small top-left text:

"सफ़र-ए-UP"

Add subtle top-right text:

"Lucknow • UP"

Do NOT overcrowd the screen with navigation.

PAGE TRANSITION

---

When the user clicks "बस में चढ़ें":

Do NOT simply change pages.

Create a cinematic transition.

The camera should:

1. move toward the bus

2. bus becomes larger

3. doors open

4. screen briefly passes through the bus entrance

5. transition into the interior of the bus

Use smooth animation.

The transition should feel like the user actually boarded the bus.

PAGE 2: INSIDE THE BUS

---

Create a full-screen illustrated interior of an old Uttar Pradesh public bus.

Visual elements:

- old red/blue/cream seats

- metal window frames

- slightly dusty windows

- conductor

- ticket machine

- hanging handles

- old bus ceiling

- sunlight entering through windows

- passengers

- small details like bags, steel water bottle, newspapers, etc.

The scene should remain illustrated and vintage.

The user should feel like they are sitting inside the bus.

Make the WINDOW SEAT the main interactive area.

Show outside scenery moving slowly through the windows:

- Lucknow

- Unnao

- Kanpur

- small towns

- fields

- trees

- roadside shops

Use parallax and subtle movement to create the feeling that the bus is moving.

Add subtle ambient bus sounds if possible:

- engine hum

- road vibration

- distant horn

- conductor ambience

Keep these subtle.

CONDUCTOR INTERACTION

---

Add a small conductor interaction.

The conductor can say:

"कहाँ जाना है?"

Show small destination options:

"लखनऊ"

"कानपुर"

"वाराणसी"

"प्रयागराज"

"गोरखपुर"

These don't need to actually route the website somewhere.

They should mainly enhance the experience.

After selecting a destination, show a small vintage paper bus ticket.

Example:

उत्तर प्रदेश परिवहन

LUCKNOW → KANPUR

WINDOW SEAT

₹ 42

09 AUG 1998

This is a fictional nostalgic ticket and should NOT look like an official government ticket.

Animate the ticket appearing from the conductor's hand.

MUSIC EXPERIENCE

---

After the user enters the bus, introduce the music experience.

The first song should begin playing through a music player UI.

IMPORTANT:

Browser autoplay restrictions must be respected.

If actual music cannot autoplay, show a clear "Play" interaction and start audio after the user's interaction.

For the demo, use placeholder/royalty-free audio or integrate music through a legal embed/source.

Do NOT bundle copyrighted Bollywood audio files into the project.

Create a playlist UI inspired by an old cassette / portable music player rather than Spotify's modern interface.

NOW PLAYING:

"90s का सफ़र"

Example song titles can be displayed as playlist placeholders:

Pehla Nasha

Aankhon Se Tune Kya Keh Diya

Kaho Naa Pyaar Hai

Ek Ladki Ko Dekha

Do Dil Mil Rahe Hain

Tujhe Dekha To

Humko Humise Chura Lo

Aankhon Ki Gustakhiyan

Mere Khwabon Mein

Kuch Kuch Hota Hai

Clearly structure the code so real legal audio/embed URLs can be added later.

MUSIC PLAYER UI

---

Create a beautiful vintage player at the bottom of the screen.

It should include:

- album artwork

- song title

- artist/movie

- play/pause

- previous

- next

- progress bar

- volume

- playlist button

Visual style:

- warm cream

- dark brown

- terracotta

- subtle shadows

- slightly rounded but tactile

- vintage cassette/player feeling

Do NOT make it look like a modern Spotify clone.

PLAYLIST

---

When the user clicks the playlist button, open a physical-looking panel resembling a cassette booklet / old music collection.

Categories:

"90s का सफ़र"

"खिड़की वाली सीट"

"बारिश वाला सफ़र"

"मोहब्बत का सफ़र"

"दिल टूट गया"

"लंबा रूट"

Each playlist should contain 8-15 placeholder songs.

Allow the user to select songs.

The currently playing song should be visually highlighted.

INTERACTIONS

---

Make the entire bus interactive.

Clickable elements:

WINDOW:

Changes the outside scenery / destination atmosphere.

CONDUCTOR:

Shows ticket interaction.

TICKET:

Opens ticket animation.

RADIO / MUSIC PLAYER:

Opens playlist.

BUS WINDOW:

Can trigger subtle scenery changes.

BUS STOP SIGN:

Returns to the initial bus stop.

SEAT:

Shows a small message:

"यही वाली सीट ठीक है।"

Add subtle micro-interactions throughout.

SCROLLING

---

Prefer a full-screen cinematic experience instead of a traditional scrolling website.

The first screen is the bus stop.

The second state is inside the bus.

Avoid excessive scrolling.

The experience should work especially well on desktop.

RESPONSIVE DESIGN

---

Desktop should be the primary experience.

Also create a responsive mobile version.

On mobile:

- preserve the bus-stop composition

- allow horizontal/vertical positioning where necessary

- make the boarding interaction easy

- keep the music player accessible

- don't let important UI get hidden

ANIMATION

---

Use smooth, subtle animations.

Important animations:

- moving clouds

- tree movement

- slight dust

- bus idle movement

- bus door opening

- camera boarding transition

- passing scenery

- slight seat/bus vibration

- conductor interaction

- ticket animation

- music player progress

Avoid excessive flashy animations.

The animation should feel cinematic and nostalgic.

TEXTURE

---

Add a subtle film grain / paper texture overlay across the entire website.

It should be visible but very subtle.

Also use:

- imperfect edges

- slight noise

- painted textures

- vintage shadows

Do not make the website look dirty or low quality.

UI PHILOSOPHY

---

The UI should feel like objects inside the world rather than UI placed on top of a website.

For example:

- playlist = cassette booklet

- destination = bus stop sign

- music player = old portable player

- ticket = physical paper ticket

- navigation = bus environment

Avoid traditional navbar/cards/dashboard layouts.

TECHNICAL

---

Build this as a polished React + TypeScript + Tailwind application.

Use reusable components.

Suggested components:

BusStopScene

BoardBusButton

BoardingTransition

BusInterior

BusWindow

Conductor

BusTicket

MusicPlayer

PlaylistPanel

DestinationSign

AmbientLayer

FilmGrainOverlay

Keep the code clean and modular.

Make the initial experience fully functional, not just a static mockup.

IMPORTANT FINAL FEEL

---

When someone opens the website, they should immediately think:

"I am standing at an old UP bus stop."

After clicking the button:

"I just boarded the bus."

After sitting down:

"Now I'm on a nostalgic UP road journey listening to 90s songs."

The final emotional feeling should be:

nostalgia + warmth + Indian childhood memories + bus journeys + old Bollywood music.

The website should feel like a tiny interactive short film.

Do not create a generic landing page.

Do not create a generic music streaming dashboard.

Create an EXPERIENCE.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
