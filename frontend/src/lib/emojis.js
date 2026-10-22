/**
 * Curated emoji set for the composer picker — kept dependency-free on purpose.
 * Format: "😀 grinning 😃 smiley ..." (emoji + keyword pairs).
 */

function parseEmojis(pairString) {
  const tokens = pairString.trim().split(/\s+/);
  const out = [];
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    out.push({ emoji: tokens[i], keywords: tokens[i + 1] });
  }
  return out;
}

export const EMOJI_GROUPS = [
  {
    id: "smileys",
    label: "Smileys",
    icon: "😀",
    emojis: parseEmojis(`
      😀 grinning 😃 smiley 😄 grin 😁 beaming 😆 satisfied 😅 sweat_smile 🤣 rofl 😂 joy
      🙂 slight_smile 🙃 upside_down 😉 wink 😊 blush 😇 halo 🥰 smiling_hearts 😍 heart_eyes
      🤩 star_struck 😘 kiss 😗 neutral 😚 kissing_closed 😙 kissing_smile 😋 yum 😛 tongue_out
      😜 wink_tongue 🤪 zany 😝 squint_tongue 🤗 hug 🤭 quiet 🤫 shush 🤔 thinking 🤐 zipper
      😐 expressionless 😑 mute 😏 smirk 😒 unamused 🙄 eye_roll 😬 grimace 🤥 lie 😌 relieved
      😔 pensive 😪 sleepy 🤤 drool 😴 sleep 😷 mask 🤒 fever 🤢 vomit 🤮 sick 🤯 mind_blown
      🥵 hot 🥶 cold 😎 cool 🤓 geek 🧐 monocle 😢 cry 😭 sob 😤 steam 😠 angry 🤬 cursing
      😳 flushed 🥺 pleading 🙈 see_no_evil 🙉 hear_no_evil 🙊 speak_no_evil 💀 skull
      👻 ghost 💩 poop 🤖 robot
    `),
  },
  {
    id: "people",
    label: "Gestures & people",
    icon: "👍",
    emojis: parseEmojis(`
      👍 thumbs_up 👎 thumbs_down 👌 ok 🤌 pinched 🤏 small ✌️ victory 🤞 crossed_fingers
      🤟 love_you 🤘 rock 🤙 call_me 👈 left 👉 right 👆 up 👇 down ☝️ point_up ✋ high_five
      🤚 raised_back 🖐️ palm 🖖 vulcan 👋 wave 🤝 handshake 🙏 pray 💪 flex 🦾 robot_arm
      ✍️ writing 💅 nails 👏 clap 🙌 raise_hands 👐 open_hands 🤲 palms_up 🫶 heart_hands
      🙇 bow 🙆 ok_person 🙅 no_person 🧎 kneeling 🧘 yoga 🏃 running 🚶 walking 👶 baby
      👧 girl 👦 boy 👨 man 👩 woman 👴 grandpa 👵 grandma 🧔 beard 👱 blond 🧑 person
      👩‍💻 woman_technologist 👨‍💻 man_technologist 🦸 hero 🧙 wizard 🧚 fairy 👼 angel 👽 alien
    `),
  },
  {
    id: "animals",
    label: "Animals & nature",
    icon: "🐶",
    emojis: parseEmojis(`
      🐶 dog 🐱 cat 🐭 mouse 🐹 hamster 🐰 rabbit 🦊 fox 🐻 bear 🐼 panda 🐨 koala 🐯 tiger
      🦁 lion 🐮 cow 🐷 pig 🐸 frog 🐵 monkey 🐔 chicken 🐧 penguin 🐦 bird 🦅 eagle 🦉 owl
      🦋 butterfly 🐝 bee 🐞 ladybug 🐢 turtle 🐍 snake 🐙 octopus 🦀 crab 🐬 dolphin 🐳 whale
      🦈 shark 🐴 horse 🦄 unicorn 🐘 elephant 🦒 giraffe 🦔 hedgehog 🌵 cactus 🌲 evergreen
      🌳 tree 🌴 palm 🌸 blossom 🌺 hibiscus 🌻 sunflower 🌼 bloom 🌷 tulip 🌹 rose 🥀 wilted
      🌿 herb 🍀 clover 🍁 maple 🌙 moon ⭐ star ☀️ sun ⛅ partly_cloudy 🌧️ rain ⛈️ storm
      ❄️ snowflake 🌈 rainbow ⚡ zap 💨 dash 💧 droplet 🌊 wave
    `),
  },
  {
    id: "food",
    label: "Food & drink",
    icon: "🍔",
    emojis: parseEmojis(`
      🍏 green_apple 🍎 apple 🍐 pear 🍊 orange 🍋 lemon 🍌 banana 🍉 watermelon 🍇 grapes
      🍓 strawberry 🫐 blueberries 🥝 kiwi 🍑 peach 🍒 cherries 🥭 mango 🍍 pineapple 🥥 coconut
      🥑 avocado 🍅 tomato 🥕 carrot 🥦 broccoli 🌽 corn 🌶️ hot_pepper 🥔 potato 🍄 mushroom
      🥐 croissant 🍞 bread 🥪 sandwich 🍕 pizza 🍔 burger 🌮 taco 🌯 burrito 🍜 ramen 🍣 sushi
      🍥 fish_cake 🍙 rice_ball 🥟 dumpling 🍩 doughnut 🍪 cookie 🎂 cake 🍰 shortcake 🧁 cupcake
      🍫 chocolate 🍬 candy 🍭 lollipop 🍯 honey 🥛 milk ☕ coffee 🧃 juice 🥤 soda 🍺 beer 🍷 wine
      🥂 cheers
    `),
  },
  {
    id: "activities",
    label: "Activities",
    icon: "⚽",
    emojis: parseEmojis(`
      ⚽ soccer 🏀 basketball 🏈 football ⚾ baseball 🎾 tennis 🏐 volleyball 🏉 rugby 🎱 pool_ball
      🥊 boxing 🎳 bowling 🎿 skiing 🛹 skateboard 🏋️ lifter 🤸 cartwheel 🏊 swimming 🚴 cycling
      🏆 trophy 🎫 ticket 🎪 circus 🎭 masks 🎨 art 🎬 clapper 🎧 headphones 🎤 microphone 🎸 guitar
      🥁 drum 🎮 gamepad 🎯 dart 🛝 swing 🎠 carousel 🎢 coaster 🎡 ferris_wheel 🕺 dancer 💃 dancer_woman
      🛼 roller_skates 🃏 joker 🎲 dice 🧩 puzzle 🏵️ rosette 🎖️ medal 📣 megaphone 🎟️ admission
    `),
  },
  {
    id: "travel",
    label: "Travel & places",
    icon: "✈️",
    emojis: parseEmojis(`
      ✈️ airplane 🚗 car 🚕 taxi 🚌 bus 🚎 trolleybus 🚓 police_car 🚑 ambulance 🚒 fire_truck
      🚲 bicycle 🛵 scooter 🏍️ motorcycle 🚇 metro 🚆 train 🚄 bullet_train 🚀 rocket 🛸 ufo
      🚁 helicopter ⛵ sailboat 🚢 ship 🗺️ map 🗿 moai 🗽 liberty 🗼 tower 🏰 castle 🏯 japanese_castle
      🌋 volcano ⛰️ mountain 🏔️ snowy_mountain 🏕️ camping 🌅 sunrise 🌇 sunset 🌆 cityscape
      🌃 night 🌉 bridge ⛪ church 🕌 mosque 🕍 synagogue 🏟️ stadium 🏠 house 🏢 office 🏗️ construction
      🚦 traffic_light ⛽ fuel 🚧 construction_bar
    `),
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: parseEmojis(`
      💡 bulb 🔦 flashlight 📱 phone 💻 laptop ⌨️ keyboard 🖥️ desktop 🖨️ printer 🕹️ joystick
      💿 disc 💾 floppy 📷 camera 🎥 movie_camera 📺 television 📻 radio 🎙️ mic ⏰ alarm ⏳ hourglass
      🔔 bell 🎁 gift 🎄 tree_light 🎈 balloon 🎉 confetti 🎊 balls 🔮 crystal_ball 🧿 nazar 🪄 magic_wand
      📚 books ✂️ scissors 📌 pin 📍 pin_drop ✏️ pencil 🖊️ pen 📝 memo 🔑 key 🔒 locked 🔓 unlocked
      🪑 chair 🚪 door 🚽 toilet 🧻 tissue 🧼 soap 🧽 sponge 🗑️ trash 🪥 toothbrush 🔪 knife 🍴 fork_knife
      🥄 spoon 🧲 magnet 🪞 mirror
    `),
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "💯",
    emojis: parseEmojis(`
      ✅ check ❌ cross ⚠️ warning 🚫 prohibited ♻️ recycle 🔱 trident 🔰 beginner 🅿️ parking
      ✳️ eight_pointed ✴️ eight_star ❇️ sparkle ➕ plus ➖ minus ➗ divide ✖️ multiply
      ➰ curly_loop ➿ double_curl 〰️ wavy 🔺 red_triangle 🔻 down_triangle ◼️ black_square
      ◽ white_square 🔵 blue_circle 🟢 green_circle 🟡 yellow_circle 🔴 red_circle ⚫ black_circle
      ⚪ white_circle 💯 hundred ❤️ red_heart 💔 broken_heart 💕 hearts 💞 revolving_hearts
      ❣️ exclamation_heart 💢 anger ❗ exclamation ❓ question ‼️ bangbang 💬 balloon 💭 thought
      🕊️ dove 💤 sleep_z ✨ sparkles 🎇 sparkler 💥 collision 🆗 ok_button 🆕 new
    `),
  },
];

/** Search every group; matches the glyph itself or its keywords. */
export function searchEmojis(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits = [];
  for (const group of EMOJI_GROUPS) {
    for (const item of group.emojis) {
      if (item.emoji === q || item.keywords.includes(q)) hits.push(item);
    }
  }
  return hits;
}
