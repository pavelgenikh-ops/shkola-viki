/* Английский язык — 2 класс, первый год (Spotlight 2 «Английский в фокусе»).
   Один общий словарь WORDS + фабрики заданий; каждый урок берёт своё подмножество слов и свои фразы. */
(function () {
  const S = window.SCHOOL;
  const U = S.util;
  const V = S.vis;
  const EN = 'en-US';
  const N = U.rand;

  // ============================== СЛОВАРЬ ==============================
  // { en, ru, pic, topic, ...доп.поля }: sub — подгруппа еды, pl/acc — формы для «I like …» / «Я люблю …»,
  // can/no — что умеет / точно не умеет животное, wild — дикое, wear — для какой погоды одежда, g — род (m/f/n/p),
  // num — число, d — номер дня недели, room — комната, n — сколько таких частей тела, alt — другие верные написания.
  const WORDS = [
    // --- приветствия и вежливые слова ---
    { en: 'Hello', ru: 'Привет', pic: '👋', topic: 'hello' },
    { en: 'Good morning', ru: 'Доброе утро', pic: '🌅', topic: 'hello' },
    { en: 'Good afternoon', ru: 'Добрый день', pic: '☀️', topic: 'hello' },
    { en: 'Good evening', ru: 'Добрый вечер', pic: '🌇', topic: 'hello' },
    { en: 'Good night', ru: 'Спокойной ночи', pic: '🌙', topic: 'hello' },
    { en: 'Goodbye', ru: 'До свидания', topic: 'hello' },
    { en: 'Bye', ru: 'Пока', topic: 'hello' },
    { en: 'Thank you', ru: 'Спасибо', pic: '🙏', topic: 'hello' },
    { en: 'Please', ru: 'Пожалуйста', topic: 'hello' },
    { en: 'Yes', ru: 'Да', pic: '✅', topic: 'hello' },
    { en: 'No', ru: 'Нет', pic: '❌', topic: 'hello' },
    { en: 'Sorry', ru: 'Извини', topic: 'hello' },
    { en: 'Nice to meet you', ru: 'Приятно познакомиться', pic: '🤝', topic: 'hello' },
    { en: 'How are you?', ru: 'Как дела?', topic: 'hello' },
    { en: "What's your name?", ru: 'Как тебя зовут?', topic: 'hello' },
    { en: "I'm fine", ru: 'У меня всё хорошо', pic: '👍', topic: 'hello' },
    { en: 'See you', ru: 'Увидимся', topic: 'hello' },
    // --- семья ---
    { en: 'mummy', ru: 'мама', pic: '👩', topic: 'family', g: 'f', alt: ['mum'] },
    { en: 'daddy', ru: 'папа', pic: '👨', topic: 'family', g: 'm', alt: ['dad'] },
    { en: 'grandma', ru: 'бабушка', pic: '👵', topic: 'family', g: 'f', alt: ['granny', 'grandmother'] },
    { en: 'grandpa', ru: 'дедушка', pic: '👴', topic: 'family', g: 'm', alt: ['grandad', 'grandfather'] },
    { en: 'brother', ru: 'брат', pic: '👦', topic: 'family', g: 'm' },
    { en: 'sister', ru: 'сестра', pic: '👧', topic: 'family', g: 'f' },
    { en: 'family', ru: 'семья', pic: '👨‍👩‍👧', topic: 'family' },
    { en: 'baby', ru: 'малыш', pic: '👶', topic: 'family' },
    { en: 'uncle', ru: 'дядя', pic: '🧔', topic: 'family', g: 'm' },
    { en: 'aunt', ru: 'тётя', pic: '👩‍🦰', topic: 'family', g: 'f' },
    { en: 'friend', ru: 'друг', pic: '🧑‍🤝‍🧑', topic: 'family' },
    // --- цвета ---
    { en: 'red', ru: 'красный', pic: '🔴', topic: 'colour' },
    { en: 'yellow', ru: 'жёлтый', pic: '🟡', topic: 'colour' },
    { en: 'green', ru: 'зелёный', pic: '🟢', topic: 'colour' },
    { en: 'blue', ru: 'синий', pic: '🔵', topic: 'colour' },
    { en: 'white', ru: 'белый', pic: '⚪', topic: 'colour' },
    { en: 'black', ru: 'чёрный', pic: '⚫', topic: 'colour' },
    { en: 'purple', ru: 'фиолетовый', pic: '🟣', topic: 'colour' },
    { en: 'orange', ru: 'оранжевый', pic: '🟠', topic: 'colour' },
    { en: 'grey', ru: 'серый', pic: '🐘', topic: 'colour', alt: ['gray'] },
    { en: 'pink', ru: 'розовый', pic: '🌸', topic: 'colour' },
    { en: 'brown', ru: 'коричневый', pic: '🟤', topic: 'colour' },
    // --- дом ---
    { en: 'house', ru: 'дом', pic: '🏠', topic: 'home' },
    { en: 'tree house', ru: 'домик на дереве', pic: '🌳🏠', topic: 'home' },
    { en: 'garden', ru: 'сад', pic: '🌻', topic: 'home', room: true },
    { en: 'kitchen', ru: 'кухня', pic: '🍳', topic: 'home', room: true },
    { en: 'bathroom', ru: 'ванная комната', pic: '🚿', topic: 'home', room: true },
    { en: 'bedroom', ru: 'спальня', pic: '🛌', topic: 'home', room: true },
    { en: 'living room', ru: 'гостиная', pic: '🛋️📺', topic: 'home', room: true },
    { en: 'chair', ru: 'стул', pic: '🪑', topic: 'home' },
    { en: 'table', ru: 'стол', topic: 'home' },
    { en: 'bed', ru: 'кровать', pic: '🛏️', topic: 'home' },
    { en: 'door', ru: 'дверь', pic: '🚪', topic: 'home' },
    { en: 'window', ru: 'окно', pic: '🪟', topic: 'home' },
    { en: 'radio', ru: 'радио', pic: '📻', topic: 'home' },
    { en: 'TV', ru: 'телевизор', pic: '📺', topic: 'home' },
    { en: 'bath', ru: 'ванна', pic: '🛁', topic: 'home' },
    { en: 'sofa', ru: 'диван', pic: '🛋️', topic: 'home' },
    { en: 'lamp', ru: 'лампа', pic: '💡', topic: 'home' },
    { en: 'cupboard', ru: 'шкаф', topic: 'home' },
    { en: 'fridge', ru: 'холодильник', topic: 'home' },
    { en: 'cooker', ru: 'плита', topic: 'home' },
    { en: 'cup', ru: 'чашка', pic: '☕', topic: 'home' },
    { en: 'toothbrush', ru: 'зубная щётка', pic: '🪥', topic: 'home' },
    { en: 'mirror', ru: 'зеркало', pic: '🪞', topic: 'home' },
    { en: 'clock', ru: 'часы', pic: '⏰', topic: 'home' },
    // --- числа ---
    { en: 'one', ru: 'один', pic: '1️⃣', topic: 'number', num: 1 },
    { en: 'two', ru: 'два', pic: '2️⃣', topic: 'number', num: 2 },
    { en: 'three', ru: 'три', pic: '3️⃣', topic: 'number', num: 3 },
    { en: 'four', ru: 'четыре', pic: '4️⃣', topic: 'number', num: 4 },
    { en: 'five', ru: 'пять', pic: '5️⃣', topic: 'number', num: 5 },
    { en: 'six', ru: 'шесть', pic: '6️⃣', topic: 'number', num: 6 },
    { en: 'seven', ru: 'семь', pic: '7️⃣', topic: 'number', num: 7 },
    { en: 'eight', ru: 'восемь', pic: '8️⃣', topic: 'number', num: 8 },
    { en: 'nine', ru: 'девять', pic: '9️⃣', topic: 'number', num: 9 },
    { en: 'ten', ru: 'десять', pic: '🔟', topic: 'number', num: 10 },
    { en: 'eleven', ru: 'одиннадцать', topic: 'number', num: 11 },
    { en: 'twelve', ru: 'двенадцать', topic: 'number', num: 12 },
    { en: 'thirteen', ru: 'тринадцать', topic: 'number', num: 13 },
    { en: 'fourteen', ru: 'четырнадцать', topic: 'number', num: 14 },
    { en: 'fifteen', ru: 'пятнадцать', topic: 'number', num: 15 },
    { en: 'sixteen', ru: 'шестнадцать', topic: 'number', num: 16 },
    { en: 'seventeen', ru: 'семнадцать', topic: 'number', num: 17 },
    { en: 'eighteen', ru: 'восемнадцать', topic: 'number', num: 18 },
    { en: 'nineteen', ru: 'девятнадцать', topic: 'number', num: 19 },
    { en: 'twenty', ru: 'двадцать', topic: 'number', num: 20 },
    // --- день рождения ---
    { en: 'birthday', ru: 'день рождения', pic: '🎉', topic: 'birthday' },
    { en: 'present', ru: 'подарок', pic: '🎁', topic: 'birthday' },
    { en: 'candles', ru: 'свечки', pic: '🕯️', topic: 'birthday' },
    { en: 'party', ru: 'праздник', pic: '🥳', topic: 'birthday' },
    { en: 'happy', ru: 'весёлый', pic: '😊', topic: 'birthday' },
    { en: 'sad', ru: 'грустный', pic: '😢', topic: 'birthday' },
    // --- еда (sub: fruit / veg / drink / other; pl — форма после «I like», acc — после «Я люблю») ---
    { en: 'apple', ru: 'яблоко', pic: '🍎', topic: 'food', sub: 'fruit', pl: 'apples', acc: 'яблоки' },
    { en: 'banana', ru: 'банан', pic: '🍌', topic: 'food', sub: 'fruit', pl: 'bananas', acc: 'бананы' },
    { en: 'orange', ru: 'апельсин', pic: '🍊', topic: 'food', sub: 'fruit', pl: 'oranges', acc: 'апельсины' },
    { en: 'pear', ru: 'груша', pic: '🍐', topic: 'food', sub: 'fruit', pl: 'pears', acc: 'груши' },
    { en: 'lemon', ru: 'лимон', pic: '🍋', topic: 'food', sub: 'fruit', pl: 'lemons', acc: 'лимоны' },
    { en: 'grapes', ru: 'виноград', pic: '🍇', topic: 'food', sub: 'fruit' },
    { en: 'strawberry', ru: 'клубника', pic: '🍓', topic: 'food', sub: 'fruit', pl: 'strawberries', acc: 'клубнику' },
    { en: 'watermelon', ru: 'арбуз', pic: '🍉', topic: 'food', sub: 'fruit' },
    { en: 'cherry', ru: 'вишня', pic: '🍒', topic: 'food', sub: 'fruit', pl: 'cherries', acc: 'вишню' },
    { en: 'carrot', ru: 'морковка', pic: '🥕', topic: 'food', sub: 'veg', pl: 'carrots', acc: 'морковку' },
    { en: 'tomato', ru: 'помидор', pic: '🍅', topic: 'food', sub: 'veg', pl: 'tomatoes', acc: 'помидоры' },
    { en: 'potato', ru: 'картошка', pic: '🥔', topic: 'food', sub: 'veg', pl: 'potatoes', acc: 'картошку' },
    { en: 'corn', ru: 'кукуруза', pic: '🌽', topic: 'food', sub: 'veg', acc: 'кукурузу' },
    { en: 'cucumber', ru: 'огурец', pic: '🥒', topic: 'food', sub: 'veg', pl: 'cucumbers', acc: 'огурцы' },
    { en: 'juice', ru: 'сок', pic: '🧃', topic: 'food', sub: 'drink' },
    { en: 'milk', ru: 'молоко', pic: '🥛', topic: 'food', sub: 'drink' },
    { en: 'water', ru: 'вода', pic: '💧', topic: 'food', sub: 'drink', acc: 'воду' },
    { en: 'tea', ru: 'чай', pic: '🍵', topic: 'food', sub: 'drink' },
    { en: 'lemonade', ru: 'лимонад', pic: '🥤', topic: 'food', sub: 'drink' },
    { en: 'burger', ru: 'бургер', pic: '🍔', topic: 'food', sub: 'other', pl: 'burgers', acc: 'бургеры' },
    { en: 'sandwich', ru: 'бутерброд', pic: '🥪', topic: 'food', sub: 'other', pl: 'sandwiches', acc: 'бутерброды' },
    { en: 'chips', ru: 'картошка фри', pic: '🍟', topic: 'food', sub: 'other', acc: 'картошку фри' },
    { en: 'chocolate', ru: 'шоколад', pic: '🍫', topic: 'food', sub: 'other' },
    { en: 'ice cream', ru: 'мороженое', pic: '🍦', topic: 'food', sub: 'other' },
    { en: 'pizza', ru: 'пицца', pic: '🍕', topic: 'food', sub: 'other', acc: 'пиццу' },
    { en: 'cake', ru: 'торт', pic: '🎂', topic: 'food', sub: 'other' },
    { en: 'biscuits', ru: 'печенье', pic: '🍪', topic: 'food', sub: 'other' },
    { en: 'eggs', ru: 'яйца', pic: '🥚', topic: 'food', sub: 'other' },
    { en: 'cheese', ru: 'сыр', pic: '🧀', topic: 'food', sub: 'other' },
    { en: 'bread', ru: 'хлеб', pic: '🍞', topic: 'food', sub: 'other' },
    { en: 'sweets', ru: 'конфеты', pic: '🍬', topic: 'food', sub: 'other' },
    { en: 'rice', ru: 'рис', pic: '🍚', topic: 'food', sub: 'other' },
    { en: 'soup', ru: 'суп', pic: '🍲', topic: 'food', sub: 'other' },
    { en: 'honey', ru: 'мёд', pic: '🍯', topic: 'food', sub: 'other' },
    { en: 'popcorn', ru: 'попкорн', pic: '🍿', topic: 'food', sub: 'other' },
    { en: 'meat', ru: 'мясо', pic: '🍖', topic: 'food', sub: 'other' },
    { en: 'lollipop', ru: 'леденец', pic: '🍭', topic: 'food', sub: 'other', pl: 'lollipops', acc: 'леденцы' },
    // --- животные (can — умеет, no — точно не умеет; wild — дикое, pet — домашнее) ---
    { en: 'cat', ru: 'кот', pic: '🐱', topic: 'animal', can: ['run', 'jump', 'climb'], no: ['fly', 'sing', 'dance'], pet: true },
    { en: 'dog', ru: 'собака', pic: '🐶', topic: 'animal', can: ['run', 'jump', 'swim'], no: ['fly', 'sing', 'dance'], pet: true },
    { en: 'fish', ru: 'рыба', pic: '🐟', topic: 'animal', can: ['swim'], no: ['run', 'walk', 'climb', 'sing', 'dance'] },
    { en: 'bird', ru: 'птица', pic: '🐦', topic: 'animal', can: ['fly', 'sing'], no: ['dance'] },
    { en: 'horse', ru: 'лошадь', pic: '🐴', topic: 'animal', can: ['run', 'jump', 'walk'], no: ['fly', 'climb', 'sing'], pet: true },
    { en: 'frog', ru: 'лягушка', pic: '🐸', topic: 'animal', can: ['jump', 'swim'], no: ['fly', 'run', 'sing'] },
    { en: 'chimp', ru: 'шимпанзе', pic: '🐵', topic: 'animal', can: ['climb', 'jump', 'run'], no: ['fly', 'sing'], wild: true },
    { en: 'elephant', ru: 'слон', pic: '🐘', topic: 'animal', can: ['walk', 'swim'], no: ['fly', 'jump', 'climb'], wild: true },
    { en: 'kangaroo', ru: 'кенгуру', pic: '🦘', topic: 'animal', can: ['jump', 'run'], no: ['fly', 'climb', 'sing'], wild: true },
    { en: 'sheep', ru: 'овца', pic: '🐑', topic: 'animal', can: ['walk', 'run'], no: ['fly', 'climb', 'sing'], pet: true },
    { en: 'mouse', ru: 'мышь', pic: '🐭', topic: 'animal', can: ['run', 'climb'], no: ['fly', 'sing', 'dance'] },
    { en: 'rabbit', ru: 'кролик', pic: '🐰', topic: 'animal', can: ['jump', 'run'], no: ['fly', 'climb', 'sing'], pet: true },
    { en: 'cow', ru: 'корова', pic: '🐮', topic: 'animal', can: ['walk', 'run'], no: ['fly', 'climb', 'sing'], pet: true },
    { en: 'pig', ru: 'свинья', pic: '🐷', topic: 'animal', can: ['run', 'walk', 'swim'], no: ['fly', 'climb', 'sing'], pet: true },
    { en: 'duck', ru: 'утка', pic: '🦆', topic: 'animal', can: ['swim', 'fly', 'walk'], no: ['climb', 'sing'], pet: true },
    { en: 'bear', ru: 'медведь', pic: '🐻', topic: 'animal', can: ['climb', 'swim', 'walk', 'run'], no: ['fly', 'sing'], wild: true },
    { en: 'lion', ru: 'лев', pic: '🦁', topic: 'animal', can: ['run', 'jump'], no: ['fly', 'sing'], wild: true },
    { en: 'tiger', ru: 'тигр', pic: '🐯', topic: 'animal', can: ['run', 'swim', 'jump'], no: ['fly', 'sing'], wild: true },
    { en: 'monkey', ru: 'обезьяна', pic: '🐒', topic: 'animal', can: ['climb', 'jump'], no: ['fly', 'sing'], wild: true },
    { en: 'snake', ru: 'змея', pic: '🐍', topic: 'animal', can: ['swim', 'climb'], no: ['fly', 'run', 'jump', 'walk', 'dance'], wild: true },
    { en: 'parrot', ru: 'попугай', pic: '🦜', topic: 'animal', can: ['fly', 'sing', 'walk'], no: ['swim'] },
    { en: 'butterfly', ru: 'бабочка', pic: '🦋', topic: 'animal', can: ['fly'], no: ['run', 'swim', 'sing', 'jump'] },
    { en: 'bee', ru: 'пчела', pic: '🐝', topic: 'animal', can: ['fly'], no: ['run', 'swim', 'sing', 'climb'] },
    { en: 'owl', ru: 'сова', pic: '🦉', topic: 'animal', can: ['fly'], no: ['swim', 'run'], wild: true },
    // --- действия (I can …) ---
    { en: 'swim', ru: 'плавать', pic: '🏊', topic: 'verb' },
    { en: 'run', ru: 'бегать', pic: '🏃', topic: 'verb' },
    { en: 'jump', ru: 'прыгать', pic: '🤸', topic: 'verb' },
    { en: 'fly', ru: 'летать', topic: 'verb' },
    { en: 'climb', ru: 'лазать', pic: '🧗', topic: 'verb' },
    { en: 'dance', ru: 'танцевать', pic: '💃', topic: 'verb' },
    { en: 'sing', ru: 'петь', pic: '🎤', topic: 'verb' },
    { en: 'walk', ru: 'ходить', pic: '🚶', topic: 'verb' },
    // --- игрушки ---
    { en: 'teddy bear', ru: 'плюшевый мишка', pic: '🧸', topic: 'toy', g: 'm' },
    { en: 'doll', ru: 'кукла', pic: '🪆', topic: 'toy', g: 'f' },
    { en: 'ball', ru: 'мяч', pic: '⚽', topic: 'toy', g: 'm' },
    { en: 'car', ru: 'машинка', pic: '🚗', topic: 'toy', g: 'f', ride: true },
    { en: 'train', ru: 'поезд', pic: '🚂', topic: 'toy', g: 'm', ride: true },
    { en: 'plane', ru: 'самолёт', pic: '✈️', topic: 'toy', g: 'm', fly: true },
    { en: 'boat', ru: 'лодка', pic: '⛵', topic: 'toy', g: 'f' },
    { en: 'toy soldier', ru: 'солдатик', pic: '💂', topic: 'toy', g: 'm' },
    { en: 'ballerina', ru: 'балерина', pic: '🩰', topic: 'toy', g: 'f' },
    { en: 'puppet', ru: 'кукла-марионетка', topic: 'toy', g: 'f' },
    { en: 'toy box', ru: 'коробка для игрушек', pic: '📦', topic: 'toy', g: 'f' },
    { en: 'kite', ru: 'воздушный змей', pic: '🪁', topic: 'toy', g: 'm', fly: true },
    { en: 'robot', ru: 'робот', pic: '🤖', topic: 'toy', g: 'm' },
    { en: 'bike', ru: 'велосипед', pic: '🚲', topic: 'toy', g: 'm', ride: true },
    { en: 'drum', ru: 'барабан', pic: '🥁', topic: 'toy', g: 'm' },
    { en: 'puzzle', ru: 'пазл', pic: '🧩', topic: 'toy', g: 'm' },
    { en: 'balloon', ru: 'воздушный шарик', pic: '🎈', topic: 'toy', g: 'm', fly: true },
    // --- предлоги места ---
    { en: 'in', ru: 'в', topic: 'prep' },
    { en: 'on', ru: 'на', topic: 'prep' },
    { en: 'under', ru: 'под', topic: 'prep' },
    { en: 'next to', ru: 'рядом с', topic: 'prep' },
    { en: 'behind', ru: 'за', topic: 'prep' },
    // --- тело (n — сколько; head — на голове) ---
    { en: 'head', ru: 'голова', topic: 'body', n: 1, head: true },
    { en: 'hair', ru: 'волосы', pic: '💇', topic: 'body', head: true },
    { en: 'eyes', ru: 'глаза', pic: '👀', topic: 'body', n: 2, head: true },
    { en: 'ears', ru: 'уши', pic: '👂', topic: 'body', n: 2, head: true },
    { en: 'nose', ru: 'нос', pic: '👃', topic: 'body', n: 1, head: true },
    { en: 'mouth', ru: 'рот', pic: '👄', topic: 'body', n: 1, head: true },
    { en: 'face', ru: 'лицо', pic: '🙂', topic: 'body', n: 1, head: true },
    { en: 'teeth', ru: 'зубы', pic: '🦷', topic: 'body', head: true },
    { en: 'neck', ru: 'шея', topic: 'body', n: 1 },
    { en: 'shoulders', ru: 'плечи', topic: 'body', n: 2 },
    { en: 'arms', ru: 'руки (от плеча)', pic: '💪', topic: 'body', n: 2 },
    { en: 'hands', ru: 'ладони', pic: '👐', topic: 'body', n: 2 },
    { en: 'fingers', ru: 'пальцы на руках', pic: '🖐️', topic: 'body', n: 10 },
    { en: 'body', ru: 'тело', pic: '🧍', topic: 'body', n: 1 },
    { en: 'legs', ru: 'ноги', pic: '🦵', topic: 'body', n: 2 },
    { en: 'knees', ru: 'колени', topic: 'body', n: 2 },
    { en: 'feet', ru: 'ступни', pic: '🦶', topic: 'body', n: 2 },
    { en: 'toes', ru: 'пальцы на ногах', topic: 'body', n: 10 },
    // --- погода (temp: hot / cold), времена года, дни недели ---
    { en: 'sunny', ru: 'солнечно', pic: '☀️', topic: 'weather', temp: 'hot' },
    { en: 'hot', ru: 'жарко', pic: '🥵', topic: 'weather', temp: 'hot' },
    { en: 'warm', ru: 'тепло', pic: '🌤️', topic: 'weather', temp: 'hot' },
    { en: 'cold', ru: 'холодно', pic: '🥶', topic: 'weather', temp: 'cold' },
    { en: 'snowy', ru: 'снежно', pic: '❄️', topic: 'weather', temp: 'cold', ph: "It's snowing" },
    { en: 'rainy', ru: 'дождливо', pic: '🌧️', topic: 'weather', ph: "It's raining" },
    { en: 'windy', ru: 'ветрено', pic: '🌬️', topic: 'weather' },
    { en: 'cloudy', ru: 'облачно', pic: '☁️', topic: 'weather' },
    { en: 'spring', ru: 'весна', pic: '🌷', topic: 'season' },
    { en: 'summer', ru: 'лето', pic: '🏖️', topic: 'season' },
    { en: 'autumn', ru: 'осень', pic: '🍂', topic: 'season' },
    { en: 'winter', ru: 'зима', pic: '⛄', topic: 'season' },
    { en: 'Monday', ru: 'понедельник', topic: 'day', d: 1 },
    { en: 'Tuesday', ru: 'вторник', topic: 'day', d: 2 },
    { en: 'Wednesday', ru: 'среда', topic: 'day', d: 3 },
    { en: 'Thursday', ru: 'четверг', topic: 'day', d: 4 },
    { en: 'Friday', ru: 'пятница', topic: 'day', d: 5 },
    { en: 'Saturday', ru: 'суббота', topic: 'day', d: 6 },
    { en: 'Sunday', ru: 'воскресенье', topic: 'day', d: 7 },
    // --- одежда (wear: cold / hot; g: род для «На мне красная …»; part: где носят) ---
    { en: 'jacket', ru: 'куртка', pic: '🧥', topic: 'clothes', wear: 'cold', g: 'f' },
    { en: 'coat', ru: 'пальто', topic: 'clothes', wear: 'cold', g: 'n' },
    { en: 'jumper', ru: 'свитер', topic: 'clothes', wear: 'cold', g: 'm' },
    { en: 'shorts', ru: 'шорты', pic: '🩳', topic: 'clothes', wear: 'hot', g: 'p' },
    { en: 'hat', ru: 'шляпа', pic: '🎩', topic: 'clothes', g: 'f', part: 'head' },
    { en: 'cap', ru: 'кепка', pic: '🧢', topic: 'clothes', wear: 'hot', g: 'f', part: 'head' },
    { en: 'socks', ru: 'носки', pic: '🧦', topic: 'clothes', g: 'p', part: 'feet' },
    { en: 'T-shirt', ru: 'футболка', pic: '👕', topic: 'clothes', wear: 'hot', g: 'f' },
    { en: 'jeans', ru: 'джинсы', pic: '👖', topic: 'clothes', g: 'p' },
    { en: 'shoes', ru: 'туфли', pic: '👟', topic: 'clothes', g: 'p', part: 'feet' },
    { en: 'skirt', ru: 'юбка', topic: 'clothes', g: 'f' },
    { en: 'dress', ru: 'платье', pic: '👗', topic: 'clothes', g: 'n' },
    { en: 'boots', ru: 'сапоги', pic: '👢', topic: 'clothes', wear: 'cold', g: 'p', part: 'feet' },
    { en: 'scarf', ru: 'шарф', pic: '🧣', topic: 'clothes', wear: 'cold', g: 'm' },
    { en: 'gloves', ru: 'перчатки', pic: '🧤', topic: 'clothes', wear: 'cold', g: 'p' },
    { en: 'trousers', ru: 'брюки', topic: 'clothes', g: 'p' },
    { en: 'shirt', ru: 'рубашка', pic: '👔', topic: 'clothes', g: 'f' },
    { en: 'sandals', ru: 'сандалии', pic: '🩴', topic: 'clothes', wear: 'hot', g: 'p', part: 'feet' },
    { en: 'swimsuit', ru: 'купальник', pic: '🩱', topic: 'clothes', wear: 'hot', g: 'm' }
  ];

  // ============================== ПОМОЩНИКИ ==============================
  const byTopic = (...topics) => WORDS.filter(w => topics.includes(w.topic));
  const uniqBy = (arr, key) => { const seen = new Set(); return arr.filter(x => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
  /** без повторов по en и ru */
  const distinct = arr => uniqBy(uniqBy(arr, w => w.en), w => w.ru);
  /** только с картинкой, картинки не повторяются */
  const withPic = arr => uniqBy(distinct(arr).filter(w => w.pic), w => w.pic);
  /** годится для spell/gap/input: одно слово латиницей 3–12 букв */
  const spellable = arr => distinct(arr).filter(w => /^[A-Za-z-]{3,12}$/.test(w.en));
  const take = (arr, n) => U.pickN(arr, n);
  const ex = w => w.en + ' — ' + w.ru + (w.pic ? ' ' + w.pic : '');
  const q = s => '«' + s + '»';
  /** точка в конце, если её ещё нет (чтобы не получалось «Как дела?.») */
  const dot = s => /[.?!…]$/.test(s) ? s : s + '.';
  const YES = 'Yes ✅', NO = 'No ❌';
  const LET = 'abcdefghijklmnopqrstuvwxyz';
  const VOW = 'aeiou';
  const ENSET = new Set(WORDS.map(w => w.en.toLowerCase()));
  const art = s => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s;
  /** «I like …» — форма после like; «Я люблю …» — винительный падеж */
  const likeEn = w => w.pl || w.en;
  const likeRu = w => w.acc || w.ru;
  /** «со столом», «с кроватью» */
  const withRu = s => (/^ст/.test(s) ? 'со ' : 'с ') + s;
  const kind = fns => U.pick(fns)();

  // ============================== ФАБРИКИ ==============================
  /** слово → перевод */
  function fEnRu(pool, n, showPic) {
    const ws = take(distinct(pool), n); const w = ws[0];
    const t = { type: 'choice', prompt: 'Что значит слово <b>' + w.en + '</b>?', options: U.shuffle(ws.map(x => x.ru)), answer: w.ru,
      say: w.en, sayLang: EN, hint: 'Нажми 🔊 и послушай слово', explain: ex(w) };
    if (showPic && w.pic) t.visual = V.big(w.pic);
    return t;
  }
  /** перевод → слово */
  function fRuEn(pool, n) {
    const ws = take(distinct(pool), n); const w = ws[0];
    return { type: 'choice', prompt: 'Как по-английски ' + q(w.ru) + '?' + (w.pic ? ' ' + w.pic : ''), options: U.shuffle(ws.map(x => x.en)), answer: w.en,
      say: w.en, sayLang: EN, explain: ex(w) };
  }
  /** послушай и выбери: mode 'pic' | 'en' | 'ru' */
  function fListen(pool, n, mode) {
    const ws = take(mode === 'pic' ? withPic(pool) : distinct(pool), n); const w = ws[0];
    const f = x => mode === 'pic' ? x.pic : mode === 'ru' ? x.ru : x.en;
    return { type: 'choice', big: mode !== 'ru', prompt: 'Послушай 🔊 и выбери ' + (mode === 'pic' ? 'картинку' : mode === 'ru' ? 'перевод' : 'слово'),
      options: U.shuffle(ws.map(f)), answer: f(w), say: w.en, sayLang: EN, autoSay: true, hint: 'Нажми 🔊, чтобы послушать ещё раз', explain: ex(w) };
  }
  /** картинка → слово */
  function fPicWord(pool, n) {
    const ws = take(withPic(pool), n); const w = ws[0];
    return { type: 'choice', prompt: 'Что это по-английски?', visual: V.big(w.pic), options: U.shuffle(ws.map(x => x.en)), answer: w.en,
      say: w.en, sayLang: EN, hint: 'По-русски это ' + q(w.ru), explain: ex(w) };
  }
  /** собери слово (на уровне 3 — с лишними буквами) */
  function fSpell(pool, level) {
    const w = U.pick(spellable(pool));
    const t = { type: 'spell', prompt: 'Собери слово: ' + (w.pic ? w.pic + ' ' : '') + '<i>' + w.ru + '</i>', word: w.en, say: w.en, sayLang: EN, explain: ex(w) };
    if (level === 3) t.extra = U.pickN(LET.split('').filter(c => !w.en.toLowerCase().includes(c)), w.en.length > 6 ? 1 : 2);
    if (level === 1) t.hint = 'Первая буква — ' + w.en[0];
    return t;
  }
  /** пропущенные буквы: blanks — сколько пропусков, nOpts — сколько плиток */
  function fGap(pool, blanks, nOpts) {
    const w = U.pick(spellable(pool)); const en = w.en;
    const idx = U.range(0, en.length - 1).filter(i => /[a-z]/.test(en[i]));
    const picks = U.pickN(idx, Math.min(blanks, idx.length)).sort((a, b) => a - b);
    const chars = en.split(''); picks.forEach(i => { chars[i] = '_'; });
    const answers = picks.map(i => en[i]);
    const sameClass = c => picks.length > 1 || VOW.includes(c) === VOW.includes(answers[0]);
    const pool2 = LET.split('').filter(c => !answers.includes(c) && sameClass(c))
      .filter(c => picks.every(i => !ENSET.has((en.slice(0, i) + c + en.slice(i + 1)).toLowerCase())));
    const options = U.shuffle(U.uniq(answers.concat(U.pickN(pool2, nOpts - U.uniq(answers).length))));
    return { type: 'gap', prompt: 'Вставь пропущенн' + (picks.length > 1 ? 'ые буквы' : 'ую букву') + ': ' + (w.pic ? w.pic + ' ' : '') + '<i>' + w.ru + '</i>',
      text: chars.join(''), answers, options, say: en, sayLang: EN, hint: 'Нажми 🔊 и послушай слово', explain: ex(w) };
  }
  /** соедини слово и перевод */
  function fMatch(pool, n, prompt) {
    const ws = take(distinct(pool), n);
    return { type: 'match', prompt: prompt || 'Соедини слово и перевод', pairs: ws.map(w => [w.en, w.ru]), explain: ws.map(ex).join('; ') + '.' };
  }
  /** мемори: mode 'pic' (картинка—слово) или 'ru' (слово—перевод) */
  function fMemory(pool, n, mode) {
    const ws = take(mode === 'pic' ? withPic(pool) : distinct(pool), n);
    return { type: 'memory', prompt: mode === 'pic' ? 'Найди пары: картинка и слово' : 'Найди пары: слово и перевод',
      pairs: ws.map(w => mode === 'pic' ? [w.pic, w.en] : [w.en, w.ru]), explain: ws.map(ex).join('; ') + '.' };
  }
  /** разложи по группам: groups = [{ name, pool }], per — сколько из каждой, mode 'en' | 'pic' | 'ru' */
  function fSort(prompt, groups, per, mode) {
    const used = new Set(); const f = w => mode === 'pic' ? w.pic : mode === 'ru' ? w.ru : w.en;
    const gs = groups.map(g => {
      const items = U.shuffle(mode === 'pic' ? withPic(g.pool) : distinct(g.pool)).filter(w => !used.has(w.en) && !used.has(f(w))).slice(0, per);
      items.forEach(w => { used.add(w.en); used.add(f(w)); });
      return { name: g.name, items: items.map(f), words: items };
    });
    return { type: 'sort', prompt, groups: gs.map(g => ({ name: g.name, items: g.items })),
      explain: gs.map(g => g.name + ': ' + g.words.map(w => w.en + ' (' + w.ru + ')').join(', ')).join('; ') + '.' };
  }
  /** собери фразу: list = [{ en, ru }] — слова во фразе должны быть разными */
  function fOrder(list, prompt) {
    let ph = list[0], items = [];
    for (let i = 0; i < 30; i++) { ph = U.pick(list); items = ph.en.split(' '); if (U.uniq(items).length === items.length && items.length >= 3) break; }
    return { type: 'order', prompt: (prompt || 'Собери фразу') + ': ' + q(ph.ru), items, say: ph.en, sayLang: EN, hint: 'Нажми 🔊 и послушай фразу', explain: dot(ph.en + ' — ' + ph.ru) };
  }
  /** фраза → перевод */
  function fPhraseRu(list, n) {
    const ps = uniqBy(uniqBy(U.shuffle(list), p => p.en), p => p.ru).slice(0, n); const p = ps[0];
    return { type: 'choice', prompt: 'Что значит ' + q(p.en) + '?', options: U.shuffle(ps.map(x => x.ru)), answer: p.ru, say: p.en, sayLang: EN, explain: dot(p.en + ' — ' + p.ru) };
  }
  /** перевод → фраза */
  function fRuPhrase(list, n) {
    const ps = uniqBy(uniqBy(U.shuffle(list), p => p.en), p => p.ru).slice(0, n); const p = ps[0];
    return { type: 'choice', prompt: 'Как сказать по-английски ' + q(p.ru) + '?', options: U.shuffle(ps.map(x => x.en)), answer: p.en, say: p.en, sayLang: EN, explain: dot(p.en + ' — ' + p.ru) };
  }
  /** напиши слово по-английски */
  function fInput(pool) {
    const w = U.pick(spellable(pool));
    return { type: 'input', mode: 'text', prompt: 'Напиши по-английски: ' + (w.pic ? w.pic + ' ' : '') + '<b>' + w.ru + '</b>', answer: w.alt ? [w.en].concat(w.alt) : w.en,
      say: w.en, sayLang: EN, hint: 'Начинается на «' + w.en[0] + '», всего ' + U.count(w.en.length, ['буква', 'буквы', 'букв']), explain: ex(w) };
  }
  /** выбери все слова из группы: yesPool — верные, noPool — ловушки */
  function fMulti(prompt, yesPool, noPool, nYes, nNo, mode) {
    const f = w => mode === 'pic' ? w.pic : w.en;
    const ys = take(mode === 'pic' ? withPic(yesPool) : distinct(yesPool), nYes);
    const ns = take((mode === 'pic' ? withPic(noPool) : distinct(noPool)).filter(w => !ys.some(y => y.en === w.en || f(y) === f(w))), nNo);
    return { type: 'choice', multi: true, big: mode === 'pic', prompt, options: U.shuffle(ys.concat(ns).map(f)), answer: ys.map(f),
      explain: 'Верно: ' + ys.map(w => w.en + ' (' + w.ru + ')').join(', ') + '.' };
  }

  // ============================== 1. АЛФАВИТ ==============================
  const LNAME = { a: 'эй', b: 'би', c: 'си', d: 'ди', e: 'и', f: 'эф', g: 'джи', h: 'эйч', i: 'ай', j: 'джей', k: 'кей', l: 'эл', m: 'эм',
    n: 'эн', o: 'оу', p: 'пи', q: 'кью', r: 'ар', s: 'эс', t: 'ти', u: 'ю', v: 'ви', w: 'дабл-ю', x: 'экс', y: 'уай', z: 'зед' };
  const CONFUSE = [['b', 'd', 'p'], ['e', 'i', 'y'], ['g', 'j'], ['c', 's', 'z'], ['a', 'r', 'i'], ['u', 'w', 'q'], ['k', 'q'], ['m', 'n'], ['x', 's'], ['v', 'w'], ['t', 'd']];
  const up = c => c.toUpperCase();
  const lname = c => up(c) + ' [' + LNAME[c] + ']';
  /** ловушки-буквы: сначала похожие по звучанию, потом случайные */
  function letterOpts(c, n) {
    const sim = CONFUSE.filter(g => g.includes(c)).flat().filter(x => x !== c);
    const rest = LET.split('').filter(x => x !== c && !sim.includes(x));
    return U.opts(c, U.uniq(sim.concat(U.shuffle(rest))).slice(0, n));
  }
  /** слова с картинкой для «с какой буквы начинается» */
  const FIRST = withPic(WORDS.filter(w => /^[a-z]/.test(w.en) && !['hello', 'prep', 'verb', 'colour', 'weather'].includes(w.topic)));
  const ALPHA_FACTS = [
    ['Сколько букв в английском алфавите?', '26', ['33', '24', '30']],
    ['Какая буква первая в английском алфавите?', 'A', ['B', 'Z', 'E']],
    ['Какая буква последняя в английском алфавите?', 'Z', ['Y', 'X', 'A']],
    ['Сколько гласных букв в английском алфавите (a, e, i, o, u)?', '5', ['6', '4', '10']],
    ['Какая буква идёт в самой середине: после M?', 'N', ['L', 'O', 'K']]
  ];

  function genAlphabet(level) {
    const nextPrev = (nOpts, withHint) => {
      const after = U.chance(0.5); const i = after ? N(0, 24) : N(1, 25);
      const c = LET[i], ans = after ? LET[i + 1] : LET[i - 1];
      const near = [LET[i - 1], LET[i + 1], LET[i - 2], LET[i + 2], LET[i + 3], LET[i - 3]].filter(x => x && x !== ans && x !== c);
      const t = { type: 'choice', prompt: 'Какая буква идёт <b>' + (after ? 'после' : 'перед') + '</b> буквой <b>' + up(c) + '</b>?',
        options: U.opts(up(ans), U.uniq(near).slice(0, nOpts - 1).map(up)), answer: up(ans), say: up(ans), sayLang: EN,
        explain: (after ? 'После ' : 'Перед ') + up(c) + ' идёт ' + lname(ans) + '.' };
      if (withHint) t.hint = 'Вспомни песенку: ' + LET.slice(Math.max(0, i - 2), i + 3).toUpperCase().split('').join(' ');
      return t;
    };
    const bigSmall = nOpts => {
      const c = U.pick(LET); const toSmall = U.chance(0.5);
      const opts = letterOpts(c, nOpts - 1).map(x => toSmall ? x : up(x));
      return { type: 'choice', big: true, prompt: toSmall ? 'Найди <b>маленькую</b> букву для большой <b>' + up(c) + '</b>' : 'Найди <b>большую</b> букву для маленькой <b>' + c + '</b>',
        options: opts, answer: toSmall ? c : up(c), say: up(c), sayLang: EN, hint: 'Большая и маленькая — одна и та же буква ' + lname(c), explain: up(c) + ' и ' + c + ' — это буква ' + lname(c) + '.' };
    };
    const listen = nOpts => {
      const c = U.pick(LET);
      return { type: 'choice', big: true, prompt: 'Послушай 🔊 и выбери букву', options: letterOpts(c, nOpts - 1).map(up), answer: up(c), say: up(c), sayLang: EN, autoSay: true,
        hint: 'Нажми 🔊 ещё раз', explain: 'Это буква ' + lname(c) + '.' };
    };
    const firstLetter = (nOpts, showWord) => {
      const w = U.pick(FIRST); const c = w.en[0];
      return { type: 'choice', prompt: showWord ? 'С какой буквы начинается слово <b>' + w.en + '</b>?' : 'С какой буквы начинается это слово по-английски? <i>(' + w.ru + ')</i>',
        visual: V.big(w.pic), options: letterOpts(c, nOpts - 1), answer: c, say: w.en, sayLang: EN, hint: showWord ? 'Посмотри на первую букву слова' : 'По-английски это ' + w.en,
        explain: w.en + ' (' + w.ru + ') начинается с буквы ' + lname(c) + '.' };
    };
    if (level === 1) return kind([
      () => nextPrev(3, true), () => nextPrev(3, true), () => bigSmall(3), () => listen(3), () => firstLetter(3, true),
      () => { const cs = U.pickN(LET.split(''), 3); return { type: 'memory', prompt: 'Найди пары: большая и маленькая буква', pairs: cs.map(c => [up(c), c]), explain: cs.map(lname).join(', ') + '.' }; }
    ]);
    if (level === 2) return kind([
      () => nextPrev(4, false), () => bigSmall(4), () => listen(4), () => firstLetter(4, false),
      () => { const cs = U.pickN(LET.split(''), 4); return { type: 'match', prompt: 'Соедини большую и маленькую букву', pairs: cs.map(c => [up(c), c]), explain: cs.map(lname).join(', ') + '.' }; },
      () => { const i = N(0, 22); const items = LET.slice(i, i + 4).toUpperCase().split(''); return { type: 'order', prompt: 'Расставь буквы по алфавиту', items, say: items.join(', '), sayLang: EN, hint: 'Вспомни песенку про алфавит', explain: 'По порядку: ' + items.join(' ') + '.' }; },
      () => { const f = U.pick(ALPHA_FACTS); return { type: 'choice', prompt: f[0], options: U.opts(f[1], f[2]), answer: f[1], explain: f[0].replace('?', '') + ' — ' + f[1] + '.' }; },
      () => { const i = N(1, 23); const seq = LET.slice(i - 1, i + 3).split(''); const pos = N(1, 2); const ans = up(seq[pos]);
        const text = seq.map((c, k) => k === pos ? '_' : up(c)).join(' ');
        return { type: 'gap', prompt: 'Какой буквы не хватает?', text, answers: [ans], options: letterOpts(seq[pos], 3).map(up), say: ans, sayLang: EN, explain: 'По порядку: ' + seq.map(up).join(' ') + '. Пропущена ' + lname(seq[pos]) + '.' }; }
    ]);
    return kind([
      () => { const cs = U.pickN(LET.split(''), N(5, 6)).sort(); const items = cs.map(up); return { type: 'order', prompt: 'Расставь буквы по алфавиту', items, say: items.join(', '), sayLang: EN, explain: 'По алфавиту: ' + items.join(' ') + '.' }; },
      () => { const i = N(1, 24); const a = LET[i - 1], b = LET[i + 1], ans = LET[i]; return { type: 'input', mode: 'text', prompt: 'Какая буква стоит <b>между</b> <b>' + up(a) + '</b> и <b>' + up(b) + '</b>? Напиши её', answer: [up(ans), ans], say: up(ans), sayLang: EN, hint: 'Скажи алфавит от ' + up(a), explain: up(a) + ' ' + up(ans) + ' ' + up(b) + ' — между ними ' + lname(ans) + '.' }; },
      () => { const after = U.chance(0.5); const i = after ? N(0, 24) : N(1, 25); const c = LET[i], ans = after ? LET[i + 1] : LET[i - 1];
        return { type: 'input', mode: 'text', prompt: 'Напиши букву, которая идёт <b>' + (after ? 'после' : 'перед') + '</b> буквой <b>' + up(c) + '</b>', answer: [up(ans), ans], say: up(ans), sayLang: EN, explain: (after ? 'После ' : 'Перед ') + up(c) + ' идёт ' + lname(ans) + '.' }; },
      () => { const i = N(1, 12); const c = LET[i]; return { type: 'input', mode: 'num', prompt: 'Какая по счёту буква <b>' + up(c) + '</b> в алфавите?', answer: i + 1, hint: 'Считай от A: A — 1, B — 2, C — 3…', explain: LET.slice(0, i + 1).toUpperCase().split('').join(' ') + ' — буква ' + up(c) + ' идёт под номером ' + (i + 1) + '.' }; },
      () => { const vs = U.pickN(VOW.split(''), N(2, 3)); const cs = U.pickN(LET.split('').filter(c => !VOW.includes(c) && c !== 'y'), 3);
        return { type: 'choice', multi: true, big: true, prompt: 'Выбери <b>все гласные</b> буквы', options: U.shuffle(vs.concat(cs).map(up)), answer: vs.map(up), hint: 'Гласные: A, E, I, O, U', explain: 'Гласные буквы здесь: ' + vs.map(up).join(', ') + '. Всего гласных в английском алфавите пять: A, E, I, O, U.' }; },
      () => { const i = N(0, 21); const seq = LET.slice(i, i + 5).split(''); const pos = U.pickN([0, 1, 2, 3, 4], 2).sort(); const answers = pos.map(p => up(seq[p]));
        const text = seq.map((c, k) => pos.includes(k) ? '_' : up(c)).join(' ');
        const opts = U.shuffle(U.uniq(answers.concat(U.pickN(LET.split('').filter(c => !seq.includes(c)), 3).map(up))));
        return { type: 'gap', prompt: 'Каких букв не хватает?', text, answers, options: opts, say: answers.join(', '), sayLang: EN, explain: 'По порядку: ' + seq.map(up).join(' ') + '.' }; },
      () => ({ type: 'input', mode: 'num', prompt: 'Сколько букв в английском алфавите?', answer: 26, hint: 'В русском 33, в английском меньше', explain: 'В английском алфавите 26 букв: от A до Z.' }),
      () => firstLetter(5, false), () => listen(5),
      () => fSpell(WORDS.filter(w => w.pic && /^[a-z]{3,4}$/.test(w.en)), 3)
    ]);
  }

  // ============================== 2. HELLO ==============================
  const HELLO = byTopic('hello');
  const HELLO_BASIC = HELLO.filter(w => ['Hello', 'Good morning', 'Goodbye', 'Bye', 'Good night', 'Thank you', 'Please', 'Yes', 'No'].includes(w.en));
  const GREET = HELLO.filter(w => ['Hello', 'Good morning', 'Good afternoon', 'Good evening'].includes(w.en));
  const FAREWELL = HELLO.filter(w => ['Goodbye', 'Bye', 'See you', 'Good night'].includes(w.en));
  const HQ = [{ en: 'How are you?', ru: 'Как дела?' }, { en: "What's your name?", ru: 'Как тебя зовут?' }, { en: 'How old are you?', ru: 'Сколько тебе лет?' }];
  const HA = [{ en: "I'm fine, thank you", ru: 'У меня всё хорошо, спасибо' }, { en: 'My name is Vika', ru: 'Меня зовут Вика' }, { en: "I'm eight", ru: 'Мне восемь лет' }];
  const REPLIES = [
    { q: "What's your name?", ru: 'Как тебя зовут?', a: 'My name is Vika', wrong: ["I'm fine, thank you", "I'm eight", 'Good night', 'Yes, please'] },
    { q: 'How are you?', ru: 'Как дела?', a: "I'm fine, thank you", wrong: ['My name is Vika', "I'm eight", 'Goodbye', 'Nice to meet you'] },
    { q: 'How old are you?', ru: 'Сколько тебе лет?', a: "I'm eight", wrong: ['My name is Vika', "I'm fine, thank you", 'Good morning', 'No, thank you'] },
    { q: 'Hello!', ru: 'Привет!', a: 'Hello!', wrong: ['Goodbye!', 'Good night!', 'Thank you!'] },
    { q: 'Goodbye!', ru: 'До свидания!', a: 'Bye!', wrong: ['Hello!', 'Good morning!', "What's your name?"] },
    { q: 'Nice to meet you!', ru: 'Приятно познакомиться!', a: 'Nice to meet you too!', wrong: ["I'm eight", 'Goodbye!', 'Good night!'] },
    { q: 'Thank you!', ru: 'Спасибо!', a: "You're welcome!", wrong: ['Please!', 'Hello!', 'Bye!'] },
    { q: 'Good morning!', ru: 'Доброе утро!', a: 'Good morning!', wrong: ['Good night!', 'Goodbye!', 'Thank you!'] },
    { q: 'Good night!', ru: 'Спокойной ночи!', a: 'Good night!', wrong: ['Good morning!', 'Hello!', "What's your name?"] }
  ];
  const TIMES = [{ pic: '🌅', ru: 'утром', en: 'Good morning' }, { pic: '☀️', ru: 'днём', en: 'Good afternoon' }, { pic: '🌇', ru: 'вечером', en: 'Good evening' }, { pic: '🌙', ru: 'перед сном', en: 'Good night' }];
  const HELLO_PH = [
    { en: 'My name is Vika', ru: 'Меня зовут Вика' }, { en: 'Nice to meet you', ru: 'Приятно познакомиться' }, { en: 'How are you?', ru: 'Как дела?' },
    { en: "What's your name?", ru: 'Как тебя зовут?' }, { en: "I'm fine, thank you", ru: 'У меня всё хорошо, спасибо' }, { en: 'Good morning, Mummy', ru: 'Доброе утро, мама' },
    { en: 'See you later', ru: 'Увидимся позже' }, { en: 'Hello, I am Vika', ru: 'Привет, я Вика' }, { en: 'Good night, Daddy', ru: 'Спокойной ночи, папа' },
    { en: 'How old are you?', ru: 'Сколько тебе лет?' }, { en: 'I am eight', ru: 'Мне восемь лет' }, { en: 'Thank you very much', ru: 'Большое спасибо' },
    { en: 'Goodbye, my friend', ru: 'До свидания, мой друг' }, { en: 'Good afternoon, Grandma', ru: 'Добрый день, бабушка' }, { en: 'Yes, please', ru: 'Да, пожалуйста' }, { en: 'No, thank you', ru: 'Нет, спасибо' }
  ];
  const HELLO_GAP = [
    { t: "Hello! What's your _? — My name is Vika.", a: ['name'], o: ['name', 'fine', 'old', 'you'] },
    { t: "How _ you? — I'm fine, thank you.", a: ['are'], o: ['are', 'is', 'am', 'you'] },
    { t: "What's your name? — My _ is Vika.", a: ['name'], o: ['name', 'fine', 'eight', 'morning'] },
    { t: "How are you? — I'm _, thank you.", a: ['fine'], o: ['fine', 'name', 'night', 'eight'] },
    { t: 'Good _, Grandma! Sleep well.', a: ['night'], o: ['night', 'morning', 'afternoon', 'bye'] },
    { t: 'Nice to _ you!', a: ['meet'], o: ['meet', 'name', 'fine', 'are'] },
    { t: 'Hello! My name _ Vika.', a: ['is'], o: ['is', 'are', 'am', 'you'] },
    { t: "How old are you? — I'm _.", a: ['eight'], o: ['eight', 'fine', 'Vika', 'good'] },
    { t: 'Goodbye! _ you later!', a: ['See'], o: ['See', 'Thank', 'Good', 'Nice'] },
    { t: "What's _ name? — My name is Vika.", a: ['your'], o: ['your', 'my', 'you', 'is'] },
    { t: 'Hello, Vika! _ to meet you!', a: ['Nice'], o: ['Nice', 'Good', 'Thank', 'See'] },
    { t: '_ morning! How _ you?', a: ['Good', 'are'], o: ['Good', 'are', 'Nice', 'is'] },
    { t: "What's your _? — My _ is Vika.", a: ['name', 'name'], o: ['name', 'fine', 'old'] },
    { t: 'Good _! — Good night! _ you tomorrow!', a: ['night', 'See'], o: ['night', 'See', 'morning', 'Thank'] }
  ];
  const DIALOGS = [
    ['Hello!', "What's your name?", 'My name is Vika.', 'Nice to meet you!'],
    ['Good morning!', 'How are you?', "I'm fine, thank you.", 'Goodbye!'],
    ['Hi! I am Sam.', 'Hello, Sam! I am Vika.', 'How old are you, Vika?', 'I am eight.'],
    ['Good evening, Grandma!', 'Good evening, Vika! How are you?', "I'm fine. Thank you!", 'Good night!'],
    ['Hello, Mummy!', 'Hello, Vika! How are you?', "I'm fine, thank you.", 'See you later!']
  ];

  function genHello(level) {
    const reply = nOpts => { const r = U.pick(REPLIES); return { type: 'choice', prompt: 'Тебе говорят: <b>' + r.q + '</b> <i>(' + r.ru + ')</i>. Что ответишь?', options: U.opts(r.a, U.pickN(r.wrong, nOpts - 1)), answer: r.a, say: r.q, sayLang: EN, hint: 'Нажми 🔊 и послушай вопрос', explain: r.q + ' — ' + r.a + '.' }; };
    const timeOfDay = nOpts => { const ts = U.pickN(TIMES, nOpts); const t = ts[0]; return { type: 'choice', prompt: 'Что говорят <b>' + t.ru + '</b>?', visual: V.big(t.pic), options: U.shuffle(ts.map(x => x.en)), answer: t.en, say: t.en, sayLang: EN, hint: 'morning — утро, afternoon — день, evening — вечер, night — ночь', explain: U.cap(t.ru) + ' говорят ' + t.en + '.' }; };
    const fill = g => { let i = 0; return g.t.replace(/_/g, () => g.a[i++]); };
    const gap = list => { const g = U.pick(list); return { type: 'gap', prompt: 'Вставь пропущенн' + (g.a.length > 1 ? 'ые слова' : 'ое слово') + ' в разговор', text: g.t, answers: g.a, options: U.shuffle(g.o), say: fill(g), sayLang: EN, hint: 'Нажми 🔊 и послушай разговор целиком', explain: 'Правильно: ' + fill(g) }; };
    if (level === 1) return kind([
      () => fMatch(HELLO_BASIC, 3), () => fEnRu(HELLO_BASIC, 3), () => fListen(HELLO_BASIC, 3, 'ru'), () => reply(2), () => timeOfDay(2), () => timeOfDay(3),
      () => fMemory(HELLO_BASIC, 3, 'ru'), () => fRuEn(HELLO_BASIC, 3)
    ]);
    if (level === 2) return kind([
      () => fMatch(HELLO, 4), () => fListen(HELLO, 4, 'ru'), () => reply(3), () => reply(4), () => timeOfDay(4), () => fRuEn(HELLO, 4), () => fPhraseRu(HELLO_PH, 4),
      () => fSort('Разложи: так здороваются или прощаются?', [{ name: 'Здороваемся 👋', pool: GREET }, { name: 'Прощаемся 🚪', pool: FAREWELL }], 3, 'en'),
      () => { const qs = U.pickN(HQ, 3), as = U.pickN(HA, 3); return { type: 'sort', prompt: 'Разложи: это вопрос или ответ?', groups: [{ name: 'Вопрос ❓', items: qs.map(x => x.en) }, { name: 'Ответ 💬', items: as.map(x => x.en) }], explain: 'Вопросы: ' + qs.map(x => x.en).join(', ') + '. Ответы: ' + as.map(x => x.en).join(', ') + '.' }; },
      () => gap(HELLO_GAP.filter(g => g.a.length === 1))
    ]);
    return kind([
      () => fOrder(HELLO_PH), () => fOrder(HELLO_PH), () => gap(HELLO_GAP), () => gap(HELLO_GAP.filter(g => g.a.length === 2)), () => reply(4), () => fPhraseRu(HELLO_PH, 5),
      () => { const d = U.pick(DIALOGS); return { type: 'order', prompt: 'Расставь реплики разговора по порядку', items: d, say: d.join(' '), sayLang: EN, hint: 'Сначала здороваются, в конце прощаются', explain: d.join(' ') }; },
      () => { const w = U.pick(HELLO.filter(x => !/[?']/.test(x.en))); return { type: 'input', mode: 'text', prompt: 'Напиши по-английски: <b>' + w.ru + '</b>', answer: w.en, say: w.en, sayLang: EN, hint: 'Начинается на «' + w.en[0] + '»', explain: ex(w) }; },
      () => fMulti('Выбери <b>все</b> слова, которыми <b>прощаются</b>', FAREWELL, GREET.concat(HELLO.filter(x => ['Thank you', 'Please', 'Sorry'].includes(x.en))), N(2, 3), 3, 'en'),
      () => fMulti('Выбери <b>все</b> слова, которыми <b>здороваются</b>', GREET, FAREWELL.concat(HELLO.filter(x => ['Thank you', 'Please', 'Sorry'].includes(x.en))), N(2, 3), 3, 'en'),
      () => { const qa = U.pick(HQ.map((x, i) => [x, HA[i]])); const others = HA.filter(a => a !== qa[1]); return { type: 'choice', prompt: 'Что ответить на вопрос <b>' + qa[0].en + '</b>?', options: U.opts(qa[1].en, others.map(a => a.en)), answer: qa[1].en, say: qa[0].en, sayLang: EN, explain: qa[0].en + ' (' + qa[0].ru + ') — ' + qa[1].en + ' (' + qa[1].ru + ').' }; }
    ]);
  }

  // ============================== 3. СЕМЬЯ ==============================
  const FAMILY = byTopic('family');
  const PEOPLE = FAMILY.filter(w => w.g);
  const WOMEN = PEOPLE.filter(w => w.g === 'f'), MEN = PEOPLE.filter(w => w.g === 'm');
  const REL = [
    { q: 'Мама моей мамы — это…', a: 'grandma' }, { q: 'Папа моего папы — это…', a: 'grandpa' }, { q: 'Брат мамы или папы — это…', a: 'uncle' },
    { q: 'Сестра мамы или папы — это…', a: 'aunt' }, { q: 'Мальчик, сын моих родителей — это мой…', a: 'brother' }, { q: 'Девочка, дочка моих родителей — это моя…', a: 'sister' },
    { q: 'Самый маленький в семье — это…', a: 'baby' }, { q: 'Мама, папа, дети, бабушки и дедушки — все вместе это…', a: 'family' },
    { q: 'Жена дедушки — это…', a: 'grandma' }, { q: 'Муж бабушки — это…', a: 'grandpa' }, { q: 'Жена папы — это моя…', a: 'mummy' }, { q: 'Муж мамы — это мой…', a: 'daddy' }
  ];
  const FAMILY_PH = PEOPLE.map(w => ({ en: 'This is my ' + w.en, ru: 'Это ' + (w.g === 'f' ? 'моя ' : 'мой ') + w.ru })).concat([
    { en: 'I love my family', ru: 'Я люблю свою семью' }, { en: 'My family is big', ru: 'Моя семья большая' }, { en: 'I have got a sister', ru: 'У меня есть сестра' },
    { en: 'I have got a brother', ru: 'У меня есть брат' }, { en: 'Who is this?', ru: 'Кто это?' }, { en: 'This is my friend', ru: 'Это мой друг' },
    { en: 'My mummy is kind', ru: 'Моя мама добрая' }, { en: 'This is a baby', ru: 'Это малыш' }, { en: 'I love my grandma', ru: 'Я люблю свою бабушку' }
  ]);

  function genFamily(level) {
    const whoIs = n => { const ws = take(withPic(PEOPLE), n); const w = ws[0]; return { type: 'choice', prompt: 'Кто это? Выбери, что сказать', visual: V.big(w.pic), options: U.shuffle(ws.map(x => 'This is my ' + x.en)), answer: 'This is my ' + w.en, say: 'This is my ' + w.en, sayLang: EN, hint: 'По-русски это ' + w.ru, explain: 'This is my ' + w.en + ' — это ' + (w.g === 'f' ? 'моя ' : 'мой ') + w.ru + '.' }; };
    const rel = n => { const r = U.pick(REL); const w = FAMILY.find(x => x.en === r.a); return { type: 'choice', prompt: r.q, options: U.opts(r.a, take(FAMILY.filter(x => x.en !== r.a), n - 1).map(x => x.en)), answer: r.a, say: r.a, sayLang: EN, explain: r.q + ' ' + r.a + ' (' + w.ru + ').' }; };
    if (level === 1) return kind([
      () => fPicWord(FAMILY, 3), () => fListen(FAMILY, 3, 'pic'), () => fEnRu(FAMILY, 3, true), () => fMemory(FAMILY, 3, 'pic'), () => fMatch(FAMILY, 3), () => whoIs(2), () => whoIs(3)
    ]);
    if (level === 2) return kind([
      () => fMatch(FAMILY, 4), () => fGap(FAMILY, 1, 3), () => fListen(FAMILY, 4, 'en'), () => fRuEn(FAMILY, 4), () => rel(4), () => fPhraseRu(FAMILY_PH, 4), () => fMemory(FAMILY, 4, 'ru'),
      () => fSort('Разложи: кто в семье женщина, а кто мужчина?', [{ name: 'Женщины 👩', pool: WOMEN }, { name: 'Мужчины 👨', pool: MEN }], 3, 'en')
    ]);
    return kind([
      () => fSpell(FAMILY, 3), () => fOrder(FAMILY_PH), () => fInput(FAMILY), () => rel(5), () => fGap(FAMILY, 2, 5), () => fRuPhrase(FAMILY_PH, 4),
      () => fMulti('Выбери <b>всех женщин</b> в семье', WOMEN, MEN, N(2, 3), 3, 'en'), () => fMulti('Выбери <b>всех мужчин</b> в семье', MEN, WOMEN, N(2, 3), 3, 'en')
    ]);
  }

  // ============================== 4. ЦВЕТА ==============================
  const COL = byTopic('colour');
  const COLF = { red: ['красный', 'красная', 'красное', 'красные'], yellow: ['жёлтый', 'жёлтая', 'жёлтое', 'жёлтые'], green: ['зелёный', 'зелёная', 'зелёное', 'зелёные'],
    blue: ['синий', 'синяя', 'синее', 'синие'], white: ['белый', 'белая', 'белое', 'белые'], black: ['чёрный', 'чёрная', 'чёрное', 'чёрные'],
    purple: ['фиолетовый', 'фиолетовая', 'фиолетовое', 'фиолетовые'], orange: ['оранжевый', 'оранжевая', 'оранжевое', 'оранжевые'], grey: ['серый', 'серая', 'серое', 'серые'],
    pink: ['розовый', 'розовая', 'розовое', 'розовые'], brown: ['коричневый', 'коричневая', 'коричневое', 'коричневые'] };
  const GI = { m: 0, f: 1, n: 2, p: 3 };
  const colRu = (c, g) => COLF[c][GI[g || 'm']];
  const COL_OBJ = [
    { pic: '🍌', en: 'banana', ru: 'банан', g: 'm', c: 'yellow' }, { pic: '🐸', en: 'frog', ru: 'лягушка', g: 'f', c: 'green' }, { pic: '🍎', en: 'apple', ru: 'яблоко', g: 'n', c: 'red' },
    { pic: '🍊', en: 'orange', ru: 'апельсин', g: 'm', c: 'orange' }, { pic: '☁️', en: 'cloud', ru: 'облако', g: 'n', c: 'white' }, { pic: '🍇', en: 'grapes', ru: 'виноград', g: 'm', c: 'purple', noA: true },
    { pic: '🐻', en: 'bear', ru: 'медведь', g: 'm', c: 'brown' }, { pic: '🌊', en: 'sea', ru: 'море', g: 'n', c: 'blue', noA: true }, { pic: '🐘', en: 'elephant', ru: 'слон', g: 'm', c: 'grey' },
    { pic: '🐷', en: 'pig', ru: 'свинья', g: 'f', c: 'pink' }, { pic: '⛄', en: 'snowman', ru: 'снеговик', g: 'm', c: 'white' }, { pic: '🌳', en: 'tree', ru: 'дерево', g: 'n', c: 'green' },
    { pic: '🍓', en: 'strawberry', ru: 'клубника', g: 'f', c: 'red' }, { pic: '🥕', en: 'carrot', ru: 'морковка', g: 'f', c: 'orange' }, { pic: '☀️', en: 'sun', ru: 'солнце', g: 'n', c: 'yellow', noA: true },
    { pic: '🍆', en: 'aubergine', ru: 'баклажан', g: 'm', c: 'purple' }, { pic: '🍫', en: 'chocolate', ru: 'шоколад', g: 'm', c: 'brown', noA: true }, { pic: '🦩', en: 'flamingo', ru: 'фламинго', g: 'm', c: 'pink' },
    { pic: '🐭', en: 'mouse', ru: 'мышка', g: 'f', c: 'grey' }, { pic: '🦇', en: 'bat', ru: 'летучая мышь', g: 'f', c: 'black' }, { pic: '🍋', en: 'lemon', ru: 'лимон', g: 'm', c: 'yellow' },
    { pic: '🫐', en: 'blueberries', ru: 'черника', g: 'f', c: 'blue', noA: true }, { pic: '🐈‍⬛', en: 'black cat', ru: 'кошка', g: 'f', c: 'black' }, { pic: '🥒', en: 'cucumber', ru: 'огурец', g: 'm', c: 'green' },
    { pic: '🍅', en: 'tomato', ru: 'помидор', g: 'm', c: 'red' }, { pic: '🐬', en: 'dolphin', ru: 'дельфин', g: 'm', c: 'blue' }, { pic: '🌸', en: 'flower', ru: 'цветок', g: 'm', c: 'pink' }
  ];
  const colPhrase = o => ({ en: "It's " + art(o.c + ' ' + o.en), ru: 'Это ' + colRu(o.c, o.g) + ' ' + o.ru });
  const COL_PH = COL_OBJ.filter(o => !o.noA && o.en !== 'black cat').map(colPhrase).concat([
    { en: 'My favourite colour is pink', ru: 'Мой любимый цвет — розовый' }, { en: 'What colour is it?', ru: 'Какого это цвета?' }, { en: 'The sky is blue', ru: 'Небо синее' }, { en: 'I like red and yellow', ru: 'Я люблю красный и жёлтый' }
  ]);
  const colW = c => COL.find(w => w.en === c);

  function genColours(level) {
    const whatColour = n => { const o = U.pick(COL_OBJ); const others = take(COL.filter(w => w.en !== o.c), n - 1).map(w => w.en);
      return { type: 'choice', prompt: 'What colour is it? Какого цвета <b>' + o.en + '</b>?', visual: V.big(o.pic), options: U.opts(o.c, others), answer: o.c, say: o.c, sayLang: EN,
        hint: 'По-русски: ' + o.ru + ' — ' + colRu(o.c, o.g), explain: U.cap(o.en) + ' is ' + o.c + ' — ' + o.ru + ' ' + colRu(o.c, o.g) + '.' }; };
    const colourSort = nGroups => { const cs = U.pickN(COL, nGroups); return fSort('Разложи предметы по цветам', cs.map(c => ({ name: c.en + ' ' + c.pic, pool: COL_OBJ.filter(o => o.c === c.en) })), 2, 'pic'); };
    if (level === 1) return kind([
      () => fPicWord(COL, 3), () => fListen(COL, 3, 'pic'), () => fEnRu(COL, 3, true), () => fMemory(COL, 3, 'pic'), () => whatColour(2), () => whatColour(3), () => fMatch(COL, 3)
    ]);
    if (level === 2) return kind([
      () => fMatch(COL, 4), () => fGap(COL, 1, 3), () => whatColour(4), () => fListen(COL, 4, 'en'), () => fRuEn(COL, 4), () => colourSort(3), () => fPhraseRu(COL_PH, 4), () => fMemory(COL, 4, 'ru')
    ]);
    return kind([
      () => fSpell(COL, 3), () => fOrder(COL_PH), () => fInput(COL), () => fGap(COL, 2, 5), () => fRuPhrase(COL_PH, 4), () => whatColour(5), () => colourSort(3),
      () => { const o = U.pick(COL_OBJ.filter(x => !x.noA && x.c !== 'orange' && x.en !== 'black cat')); const opts = U.opts(o.c, take(COL.filter(w => w.en !== o.c && w.en !== 'orange'), 3).map(w => w.en));
        return { type: 'gap', prompt: 'Какого цвета? Вставь слово', visual: V.big(o.pic), text: "It's a _ " + o.en + '.', answers: [o.c], options: opts, say: "It's a " + o.c + ' ' + o.en, sayLang: EN, explain: "It's a " + o.c + ' ' + o.en + ' — это ' + colRu(o.c, o.g) + ' ' + o.ru + '.' }; },
      () => { const c = U.pick(COL); const ys = take(COL_OBJ.filter(o => o.c === c.en), N(2, 3)); const ns = take(COL_OBJ.filter(o => o.c !== c.en), 3);
        return { type: 'choice', multi: true, big: true, prompt: 'Выбери <b>все</b> предметы цвета <b>' + c.en + '</b>', options: U.shuffle(ys.concat(ns).map(o => o.pic)), answer: ys.map(o => o.pic), say: c.en, sayLang: EN, hint: c.en + ' — ' + c.ru, explain: U.cap(c.en) + ' (' + c.ru + '): ' + ys.map(o => o.pic + ' ' + o.en).join(', ') + '.' }; }
    ]);
  }

  // ============================== 5. ДОМ ==============================
  const HOME = byTopic('home');
  const ROOMS = HOME.filter(w => w.room);
  const THINGS = HOME.filter(w => !w.room && !['house', 'tree house'].includes(w.en));
  const IN_ROOM = [['bed', 'bedroom'], ['bath', 'bathroom'], ['fridge', 'kitchen'], ['cooker', 'kitchen'], ['sofa', 'living room'], ['TV', 'living room'], ['toothbrush', 'bathroom'], ['cup', 'kitchen']];
  const ROOM_LOC = { kitchen: 'на кухне', bathroom: 'в ванной', bedroom: 'в спальне', 'living room': 'в гостиной', garden: 'в саду' };
  const hw = en => WORDS.find(w => w.en === en);
  const PERS4 = FAMILY.filter(w => ['mummy', 'daddy', 'grandma', 'grandpa'].includes(w.en));
  const HOME_PH = THINGS.filter(w => w.pic && w.en !== 'TV').map(w => ({ en: "It's " + art(w.en), ru: 'Это ' + w.ru }))
    .concat(IN_ROOM.map(p => ({ en: 'The ' + p[0] + ' is in the ' + p[1], ru: U.cap(hw(p[0]).ru) + ' — ' + ROOM_LOC[p[1]] })))
    .concat(PERS4.map(p => ({ en: U.cap(p.en) + ' is in the ' + U.pick(ROOMS).en, ru: '' })).map(ph => { const r = ph.en.split(' in the ')[1]; const p = PERS4.find(x => ph.en.startsWith(U.cap(x.en))); return { en: ph.en, ru: U.cap(p.ru) + ' ' + ROOM_LOC[r] }; }))
    .concat([{ en: 'Where is Daddy?', ru: 'Где папа?' }, { en: 'Where is Mummy?', ru: 'Где мама?' }, { en: 'This is my house', ru: 'Это мой дом' }, { en: 'I like my bedroom', ru: 'Мне нравится моя спальня' },
      { en: 'Is he in the bathroom?', ru: 'Он в ванной?' }, { en: 'Open the door', ru: 'Открой дверь' }, { en: 'Close the window', ru: 'Закрой окно' }, { en: 'What is this?', ru: 'Что это?' }, { en: 'I am in the garden', ru: 'Я в саду' }]);

  function genHome(level) {
    const whereIs = n => { const p = U.pick(PERS4); const rs = take(ROOMS, n); const r = rs[0];
      return { type: 'choice', prompt: "Where's " + U.cap(p.en) + '? <i>(Где ' + p.ru + '?)</i>', visual: V.big(p.pic + ' ' + r.pic), options: U.shuffle(rs.map(x => 'In the ' + x.en)), answer: 'In the ' + r.en,
        say: "Where's " + p.en + '? In the ' + r.en + '.', sayLang: EN, hint: r.en + ' — ' + r.ru, explain: U.cap(p.en) + ' is in the ' + r.en + ' — ' + p.ru + ' ' + ROOM_LOC[r.en] + '.' }; };
    const whereThing = n => { const pr = U.pick(IN_ROOM); const w = hw(pr[0]); const others = take(ROOMS.filter(r => r.en !== pr[1]), n - 1).map(r => r.en);
      return { type: 'choice', prompt: 'Где обычно стоит <b>' + w.en + '</b>' + (w.pic ? ' ' + w.pic : '') + '? <i>(' + w.ru + ')</i>', options: U.opts(pr[1], others), answer: pr[1], say: 'The ' + w.en + ' is in the ' + pr[1], sayLang: EN, hint: pr[1] + ' — ' + hw(pr[1]).ru, explain: 'The ' + w.en + ' is in the ' + pr[1] + ' — ' + w.ru + ' ' + ROOM_LOC[pr[1]] + '.' }; };
    const isHe = () => { const p = U.pick(PERS4); const real = U.pick(ROOMS); const ask = U.chance(0.5) ? real : U.pickOther(ROOMS, real); const he = p.g === 'm' ? 'he' : 'she';
      const yes = 'Yes, ' + he + ' is', no = 'No, ' + he + " isn't"; const ans = ask === real ? yes : no;
      return { type: 'choice', prompt: 'Is ' + he + ' in the ' + ask.en + '? <i>(' + (he === 'he' ? 'Он' : 'Она') + ' ' + ROOM_LOC[ask.en] + '?)</i>', visual: V.big(p.pic + ' ' + real.pic), options: U.shuffle([yes, no]), answer: ans,
        say: 'Is ' + he + ' in the ' + ask.en + '? ' + ans + '.', sayLang: EN, hint: 'На картинке ' + p.ru + ' ' + ROOM_LOC[real.en], explain: U.cap(p.en) + ' is in the ' + real.en + ' — ' + p.ru + ' ' + ROOM_LOC[real.en] + '. Ответ: ' + ans + '.' }; };
    if (level === 1) return kind([
      () => fPicWord(HOME, 3), () => fListen(HOME, 3, 'pic'), () => fEnRu(HOME, 3, true), () => fMemory(HOME, 3, 'pic'), () => whereThing(2), () => whereThing(3), () => whereIs(2), () => fMatch(HOME, 3)
    ]);
    if (level === 2) return kind([
      () => fMatch(HOME, 4), () => fGap(HOME, 1, 3), () => fRuEn(HOME, 4), () => fListen(HOME, 4, 'en'), () => whereIs(4), () => whereThing(4), () => isHe(), () => fPhraseRu(HOME_PH, 4),
      () => fSort('Разложи: это комната или вещь в доме?', [{ name: 'Комнаты 🚪', pool: ROOMS }, { name: 'Вещи 🪑', pool: THINGS }], 3, 'en')
    ]);
    return kind([
      () => fSpell(HOME, 3), () => fOrder(HOME_PH), () => fInput(HOME), () => isHe(), () => fGap(HOME, 2, 5), () => fRuPhrase(HOME_PH, 4),
      () => fSort('Разложи вещи по комнатам', [{ name: 'Kitchen 🍳', pool: [hw('fridge'), hw('cooker'), hw('cup')] }, { name: 'Bedroom 🛌', pool: [hw('bed'), hw('teddy bear'), hw('toy box')] }, { name: 'Bathroom 🚿', pool: [hw('bath'), hw('toothbrush')] }], 2, 'en'),
      () => fMulti('Выбери <b>все комнаты</b>', ROOMS, THINGS, N(2, 3), 3, 'en'),
      () => { const pr = U.pick(IN_ROOM); const w = hw(pr[0]); const opts = U.opts(pr[1], take(ROOMS.filter(r => r.en !== pr[1]), 3).map(r => r.en));
        return { type: 'gap', prompt: 'В какой комнате? Вставь слово' + (w.pic ? ' ' + w.pic : ''), text: 'The ' + w.en + ' is in the _.', answers: [pr[1]], options: opts, say: 'The ' + w.en + ' is in the ' + pr[1], sayLang: EN, explain: 'The ' + w.en + ' is in the ' + pr[1] + ' — ' + w.ru + ' ' + ROOM_LOC[pr[1]] + '.' }; }
    ]);
  }

  // ============================== 6. ЧИСЛА ==============================
  const NUM = byTopic('number');
  const NUM10 = NUM.filter(w => w.num <= 10);
  const numW = n => NUM.find(w => w.num === n);
  const CNT_PIC = ['🍎', '⭐', '🎈', '🍬', '⚽', '🌸', '🐟', '🐱', '🍪', '🚗'];
  const NUM_PH = [
    { en: 'I am eight years old', ru: 'Мне восемь лет' }, { en: 'How old are you?', ru: 'Сколько тебе лет?' },
    { en: 'I have got two cats', ru: 'У меня два кота' }, { en: 'I can count to ten', ru: 'Я умею считать до десяти' },
    { en: 'How many apples?', ru: 'Сколько яблок?' }, { en: 'There are three balls', ru: 'Здесь три мяча' },
    { en: 'My sister is five', ru: 'Моей сестре пять лет' }, { en: 'One, two, three, go!', ru: 'Раз, два, три, начали!' },
    { en: 'I have got ten fingers', ru: 'У меня десять пальцев' }, { en: 'Give me four sweets', ru: 'Дай мне четыре конфеты' },
    { en: 'Six and one is seven', ru: 'Шесть и один — семь' }, { en: 'I am in class two', ru: 'Я во втором классе' },
    { en: 'Count the balloons', ru: 'Посчитай шарики' }, { en: 'Nine is a big number', ru: 'Девять — большое число' },
    { en: 'Twelve months in a year', ru: 'Двенадцать месяцев в году' }
  ];

  function genNumbers(level) {
    const countPic = (max, nOpts) => {
      const n = N(1, max); const pic = U.pick(CNT_PIC); const w = numW(n);
      const others = U.pickN(NUM.filter(x => x.num !== n && x.num <= max + 2), nOpts - 1).map(x => x.en);
      return { type: 'choice', prompt: 'How many? Сколько их?', visual: V.emojis(pic, n), options: U.opts(w.en, others), answer: w.en,
        say: w.en, sayLang: EN, hint: 'Посчитай картинки и вспомни английское число', explain: n + ' — ' + w.en + ' (' + w.ru + ').' };
    };
    const digitWord = (max, nOpts) => {
      const n = N(1, max); const w = numW(n);
      const others = U.pickN(NUM.filter(x => x.num !== n && x.num <= max + 2), nOpts - 1).map(x => x.en);
      return { type: 'choice', prompt: 'Как по-английски число <b>' + n + '</b>?', options: U.opts(w.en, others), answer: w.en,
        say: w.en, sayLang: EN, explain: n + ' — ' + w.en + ' (' + w.ru + ').' };
    };
    const wordDigit = (max, nOpts) => {
      const n = N(1, max); const w = numW(n);
      return { type: 'choice', big: true, prompt: 'Какое это число: <b>' + w.en + '</b>?', options: U.numOpts(n, nOpts - 1, 1, max + 2), answer: n,
        say: w.en, sayLang: EN, hint: 'Нажми 🔊 и послушай слово', explain: w.en + ' — это ' + n + ' (' + w.ru + ').' };
    };
    const listenNum = (max, nOpts) => {
      const n = N(1, max); const w = numW(n);
      return { type: 'choice', big: true, prompt: 'Послушай 🔊 и выбери число', options: U.numOpts(n, nOpts - 1, 1, max + 2), answer: n,
        say: w.en, sayLang: EN, autoSay: true, hint: 'Нажми 🔊, чтобы послушать ещё раз', explain: w.en + ' — это ' + n + '.' };
    };
    const nextNum = nOpts => {
      const after = U.chance(0.5); const i = after ? N(1, 9) : N(2, 10); const ans = numW(after ? i + 1 : i - 1);
      return { type: 'choice', prompt: 'Какое число идёт <b>' + (after ? 'после' : 'перед') + '</b> числа <b>' + numW(i).en + '</b>?',
        options: U.opts(ans.en, U.pickN(NUM10.filter(x => x.num !== ans.num && x.num !== i), nOpts - 1).map(x => x.en)), answer: ans.en,
        say: ans.en, sayLang: EN, hint: numW(i).en + ' — это ' + i, explain: (after ? 'После ' : 'Перед ') + numW(i).en + ' (' + i + ') идёт ' + ans.en + ' (' + ans.num + ').' };
    };
    const sumTask = () => {
      const a = N(1, 5), b = N(1, 5); const s = a + b; const ans = numW(s);
      return { type: 'choice', prompt: '<b>' + numW(a).en + ' + ' + numW(b).en + ' = ?</b>',
        options: U.opts(ans.en, U.pickN(NUM10.filter(x => x.num !== s), 3).map(x => x.en)), answer: ans.en,
        say: numW(a).en + ' plus ' + numW(b).en, sayLang: EN, hint: 'По-русски это ' + a + ' + ' + b, explain: a + ' + ' + b + ' = ' + s + ' — ' + ans.en + ' (' + ans.ru + ').' };
    };
    const orderNums = n => {
      const ws = U.pickN(NUM.filter(x => x.num <= 12), n).sort((a, b) => a.num - b.num);
      return { type: 'order', prompt: 'Расставь числа от меньшего к большему', items: ws.map(x => x.en), say: ws.map(x => x.en).join(', '), sayLang: EN,
        explain: ws.map(x => x.en + ' — ' + x.num).join(', ') + '.' };
    };
    if (level === 1) return kind([
      () => countPic(5, 2), () => countPic(5, 3), () => digitWord(5, 3), () => wordDigit(5, 3), () => listenNum(5, 3),
      () => fMemory(NUM.filter(x => x.num <= 6), 3, 'ru'), () => fMatch(NUM10, 3), () => fEnRu(NUM10, 3)
    ]);
    if (level === 2) return kind([
      () => countPic(10, 4), () => digitWord(10, 4), () => wordDigit(10, 4), () => listenNum(10, 4), () => nextNum(4),
      () => fMatch(NUM10, 4), () => orderNums(4), () => fGap(NUM10, 1, 3), () => fPhraseRu(NUM_PH, 4), () => fMemory(NUM10, 4, 'ru')
    ]);
    return kind([
      () => orderNums(5), () => sumTask(), () => nextNum(5), () => digitWord(20, 5), () => listenNum(12, 5),
      () => fSpell(NUM, 3), () => fGap(NUM, 2, 5), () => fRuPhrase(NUM_PH, 4), () => fOrder(NUM_PH),
      () => { const n = N(1, 20); const w = numW(n); return { type: 'input', mode: 'num', prompt: 'Напиши цифрой: <b>' + w.en + '</b>', answer: n, say: w.en, sayLang: EN, hint: 'Нажми 🔊 и послушай слово', explain: w.en + ' — это ' + n + ' (' + w.ru + ').' }; },
      () => { const n = N(1, 12); const w = numW(n); return { type: 'input', mode: 'text', prompt: 'Напиши по-английски число <b>' + n + '</b>', answer: w.en, say: w.en, sayLang: EN, hint: 'Начинается на «' + w.en[0] + '»', explain: n + ' — ' + w.en + '.' }; },
      () => { const a = N(2, 9), b = N(1, a - 1); const s = a - b; const ans = numW(s);
        return { type: 'choice', prompt: '<b>' + numW(a).en + ' − ' + numW(b).en + ' = ?</b>', options: U.opts(ans.en, U.pickN(NUM10.filter(x => x.num !== s && x.num <= 10), 3).map(x => x.en)), answer: ans.en,
          say: numW(a).en + ' minus ' + numW(b).en, sayLang: EN, hint: 'По-русски это ' + a + ' − ' + b, explain: a + ' − ' + b + ' = ' + s + ' — ' + ans.en + '.' }; },
      () => { const ws = U.pickN(NUM.filter(x => x.num >= 11), N(2, 3)); const ns = U.pickN(NUM10, 3);
        return { type: 'choice', multi: true, prompt: 'Выбери <b>все</b> числа <b>больше десяти</b>', options: U.shuffle(ws.concat(ns).map(x => x.en)), answer: ws.map(x => x.en),
          explain: 'Больше десяти: ' + ws.map(x => x.en + ' (' + x.num + ')').join(', ') + '.' }; }
    ]);
  }

  // ============================== 7. ЕДА ==============================
  const FOOD = byTopic('food');
  const FRUIT = FOOD.filter(w => w.sub === 'fruit'), VEG = FOOD.filter(w => w.sub === 'veg');
  const DRINK = FOOD.filter(w => w.sub === 'drink'), SNACK = FOOD.filter(w => w.sub === 'other');
  const MASS = new Set(['grapes', 'juice', 'milk', 'water', 'tea', 'lemonade', 'chocolate', 'ice cream', 'biscuits', 'eggs', 'cheese', 'bread', 'sweets', 'rice', 'soup', 'honey', 'popcorn', 'meat', 'chips', 'corn']);
  const someEn = w => MASS.has(w.en) ? 'some ' + w.en : art(w.en);
  const FOOD_PH = distinct(FOOD).map(w => ({ en: 'I like ' + likeEn(w), ru: 'Я люблю ' + likeRu(w) })).concat([
    { en: "I don't like tomatoes", ru: 'Я не люблю помидоры' }, { en: "I don't like soup", ru: 'Я не люблю суп' },
    { en: 'What is your favourite food?', ru: 'Какая твоя любимая еда?' }, { en: 'My favourite food is pizza', ru: 'Моя любимая еда — пицца' },
    { en: 'Can I have a sandwich, please?', ru: 'Можно мне бутерброд, пожалуйста?' }, { en: 'Can I have some juice, please?', ru: 'Можно мне сока, пожалуйста?' },
    { en: 'I am hungry', ru: 'Я хочу есть' }, { en: 'I am thirsty', ru: 'Я хочу пить' },
    { en: 'It is yummy', ru: 'Это вкусно' }, { en: 'It is yucky', ru: 'Это невкусно' },
    { en: 'The cake is very big', ru: 'Торт очень большой' }, { en: 'I eat an apple every day', ru: 'Я ем яблоко каждый день' },
    { en: 'Milk is white', ru: 'Молоко белое' }, { en: 'I drink milk in the morning', ru: 'Я пью молоко утром' },
    { en: 'Here you are', ru: 'Вот, держи' }
  ]);

  function genFood(level) {
    const wantFood = n => {
      const ws = take(withPic(FOOD), n); const w = ws[0];
      return { type: 'choice', prompt: 'Что попросить? <i>(' + w.ru + ')</i>', visual: V.big(w.pic),
        options: U.shuffle(ws.map(x => 'Can I have ' + someEn(x) + ', please?')), answer: 'Can I have ' + someEn(w) + ', please?',
        say: 'Can I have ' + someEn(w) + ', please?', sayLang: EN, hint: w.ru + ' — это ' + w.en, explain: 'Can I have ' + someEn(w) + ', please? — Можно мне ' + w.ru + ', пожалуйста?' };
    };
    const likeIt = n => {
      const ws = take(distinct(FOOD), n); const w = ws[0];
      return { type: 'choice', prompt: 'Как сказать: <b>я люблю ' + likeRu(w) + '</b>?' + (w.pic ? ' ' + w.pic : ''),
        options: U.shuffle(ws.map(x => 'I like ' + likeEn(x))), answer: 'I like ' + likeEn(w), say: 'I like ' + likeEn(w), sayLang: EN,
        hint: w.ru + ' по-английски — ' + w.en, explain: 'I like ' + likeEn(w) + ' — я люблю ' + likeRu(w) + '.' };
    };
    const foodSort = () => U.pick([
      () => fSort('Разложи: фрукты и овощи', [{ name: 'Fruit 🍎', pool: FRUIT }, { name: 'Vegetables 🥕', pool: VEG }], 3, 'pic'),
      () => fSort('Разложи: что едят, а что пьют?', [{ name: 'Едим 🍽️', pool: SNACK }, { name: 'Пьём 🥤', pool: DRINK }], 3, 'en'),
      () => fSort('Разложи еду по группам', [{ name: 'Fruit 🍎', pool: FRUIT }, { name: 'Vegetables 🥕', pool: VEG }, { name: 'Drinks 🥤', pool: DRINK }], 2, 'en')
    ])();
    if (level === 1) return kind([
      () => fPicWord(FOOD, 3), () => fListen(FOOD, 3, 'pic'), () => fEnRu(FOOD, 3, true), () => fMemory(FOOD, 3, 'pic'),
      () => fMatch(FRUIT, 3), () => fMatch(FOOD, 3), () => likeIt(2), () => wantFood(2)
    ]);
    if (level === 2) return kind([
      () => fMatch(FOOD, 4), () => fRuEn(FOOD, 4), () => fListen(FOOD, 4, 'en'), () => fGap(FOOD, 1, 3), () => likeIt(3),
      () => wantFood(3), () => foodSort(), () => fPhraseRu(FOOD_PH, 4), () => fMemory(FOOD, 4, 'ru'),
      () => fMulti('Выбери <b>все фрукты</b>', FRUIT, VEG.concat(DRINK), N(2, 3), 3, 'pic')
    ]);
    return kind([
      () => fSpell(FOOD, 3), () => fInput(FOOD), () => fGap(FOOD, 2, 5), () => fOrder(FOOD_PH), () => fRuPhrase(FOOD_PH, 4),
      () => wantFood(4), () => likeIt(4), () => foodSort(),
      () => fMulti('Выбери <b>всё, что пьют</b>', DRINK, FRUIT.concat(VEG), N(2, 3), 3, 'en'),
      () => fMulti('Выбери <b>все овощи</b>', VEG, FRUIT.concat(SNACK), N(2, 3), 3, 'en'),
      () => { const w = U.pick(distinct(FOOD).filter(x => x.pic)); const opts = U.opts(likeEn(w), take(distinct(FOOD).filter(x => x.en !== w.en), 3).map(likeEn));
        return { type: 'gap', prompt: 'Вставь слово: ' + w.pic, text: 'I like _.', answers: [likeEn(w)], options: opts, say: 'I like ' + likeEn(w), sayLang: EN,
          explain: 'I like ' + likeEn(w) + ' — я люблю ' + likeRu(w) + '.' }; }
    ]);
  }

  // ============================== 8. ЖИВОТНЫЕ И I CAN ==============================
  const ANIM = byTopic('animal');
  const ACT = byTopic('verb');
  const actW = en => ACT.find(w => w.en === en);
  const PETS = ANIM.filter(w => w.pet), WILD = ANIM.filter(w => w.wild);
  const canFly = ANIM.filter(w => w.can.includes('fly')), cantFly = ANIM.filter(w => w.no.includes('fly'));
  const canSwim = ANIM.filter(w => w.can.includes('swim'));
  const ANIM_PH = ANIM.map(w => ({ en: U.cap(art(w.en)) + ' can ' + w.can[0], ru: U.cap(w.ru) + ' умеет ' + actW(w.can[0]).ru })).concat([
    { en: 'I can jump', ru: 'Я умею прыгать' }, { en: 'I can swim very well', ru: 'Я очень хорошо плаваю' },
    { en: "I can't fly", ru: 'Я не умею летать' }, { en: 'Can you swim?', ru: 'Ты умеешь плавать?' },
    { en: 'I have got a dog', ru: 'У меня есть собака' }, { en: 'Look at the monkey', ru: 'Посмотри на обезьяну' },
    { en: 'My cat is black', ru: 'Мой кот чёрный' }, { en: 'The elephant is very big', ru: 'Слон очень большой' },
    { en: 'Birds can sing', ru: 'Птицы умеют петь' }, { en: 'What is your favourite animal?', ru: 'Какое твоё любимое животное?' },
    { en: 'The fish lives in water', ru: 'Рыба живёт в воде' }, { en: 'I like cats and dogs', ru: 'Я люблю кошек и собак' }
  ]);

  function genAnimals(level) {
    const canQ = () => {
      const a = U.pick(ANIM); const yes = U.chance(0.5); const v = U.pick(yes ? a.can : a.no);
      const yesA = 'Yes, it can', noA = "No, it can't"; const ans = yes ? yesA : noA;
      return { type: 'choice', prompt: 'Can ' + art(a.en) + ' ' + v + '? <i>(' + a.ru + ' умеет ' + actW(v).ru + '?)</i>', visual: V.big(a.pic),
        options: U.shuffle([yesA, noA]), answer: ans, say: 'Can ' + art(a.en) + ' ' + v + '?', sayLang: EN,
        hint: a.en + ' — ' + a.ru + ', ' + v + ' — ' + actW(v).ru,
        explain: U.cap(art(a.en)) + (yes ? ' can ' : " can't ") + v + ' — ' + a.ru + (yes ? ' умеет ' : ' не умеет ') + actW(v).ru + '.' };
    };
    const whatCan = n => {
      const a = U.pick(ANIM.filter(x => x.no.length >= n - 1)); const v = U.pick(a.can);
      return { type: 'choice', prompt: 'What can ' + art(a.en) + ' do? <i>(Что умеет ' + a.ru + '?)</i>', visual: V.big(a.pic),
        options: U.opts(v, U.pickN(a.no, n - 1)), answer: v, say: art(a.en) + ' can ' + v, sayLang: EN,
        hint: 'Подумай, что это животное делает каждый день', explain: U.cap(art(a.en)) + ' can ' + v + ' — ' + a.ru + ' умеет ' + actW(v).ru + '.' };
    };
    const verbPic = n => {
      const vs = take(withPic(ACT), n); const v = vs[0];
      return { type: 'choice', prompt: 'Что я умею? Выбери слово', visual: V.big(v.pic), options: U.shuffle(vs.map(x => 'I can ' + x.en)), answer: 'I can ' + v.en,
        say: 'I can ' + v.en, sayLang: EN, hint: v.ru + ' — это ' + v.en, explain: 'I can ' + v.en + ' — я умею ' + v.ru + '.' };
    };
    if (level === 1) return kind([
      () => fPicWord(ANIM, 3), () => fListen(ANIM, 3, 'pic'), () => fEnRu(ANIM, 3, true), () => fMemory(ANIM, 3, 'pic'),
      () => fMatch(ANIM, 3), () => fMatch(ACT, 3), () => canQ(), () => verbPic(2), () => verbPic(3)
    ]);
    if (level === 2) return kind([
      () => fMatch(ANIM, 4), () => fRuEn(ANIM, 4), () => fListen(ANIM, 4, 'en'), () => fGap(ANIM, 1, 3), () => canQ(), () => whatCan(3),
      () => verbPic(4), () => fEnRu(ACT, 4), () => fPhraseRu(ANIM_PH, 4), () => fMemory(ANIM, 4, 'ru'),
      () => fSort('Разложи: домашние и дикие животные', [{ name: 'Домашние 🏠', pool: PETS }, { name: 'Дикие 🌳', pool: WILD }], 3, 'en')
    ]);
    return kind([
      () => fSpell(ANIM, 3), () => fInput(ANIM), () => fGap(ANIM, 2, 5), () => fOrder(ANIM_PH), () => fRuPhrase(ANIM_PH, 4),
      () => whatCan(4), () => canQ(), () => fInput(ACT),
      () => fMulti('Выбери <b>всех, кто умеет летать</b>', canFly, cantFly, N(2, 3), 3, 'pic'),
      () => fMulti('Выбери <b>всех, кто умеет плавать</b>', canSwim, ANIM.filter(x => x.no.includes('swim')), N(2, 3), 3, 'pic'),
      () => fSort('Разложи: домашние и дикие животные', [{ name: 'Домашние 🏠', pool: PETS }, { name: 'Дикие 🌳', pool: WILD }], 3, 'pic'),
      () => { const a = U.pick(ANIM); const v = U.pick(a.can); const opts = U.opts(v, U.pickN(a.no, 3));
        return { type: 'gap', prompt: 'Вставь слово: что умеет это животное?', visual: V.big(a.pic), text: U.cap(art(a.en)) + ' can _.', answers: [v], options: opts,
          say: art(a.en) + ' can ' + v, sayLang: EN, explain: U.cap(art(a.en)) + ' can ' + v + ' — ' + a.ru + ' умеет ' + actW(v).ru + '.' }; }
    ]);
  }

  // ============================== 9. ИГРУШКИ И ПРЕДЛОГИ ==============================
  const TOY = byTopic('toy');
  const PREP = byTopic('prep');
  const FURN = [
    { en: 'box', ru: 'коробка', pic: '📦', loc: { in: 'в коробке', on: 'на коробке', under: 'под коробкой', 'next to': 'рядом с коробкой', behind: 'за коробкой' } },
    { en: 'bed', ru: 'кровать', pic: '🛏️', loc: { on: 'на кровати', under: 'под кроватью', 'next to': 'рядом с кроватью', behind: 'за кроватью' } },
    { en: 'table', ru: 'стол', pic: '🍽️', loc: { on: 'на столе', under: 'под столом', 'next to': 'рядом со столом', behind: 'за столом' } },
    { en: 'chair', ru: 'стул', pic: '🪑', loc: { on: 'на стуле', under: 'под стулом', 'next to': 'рядом со стулом', behind: 'за стулом' } },
    { en: 'toy box', ru: 'ящик для игрушек', pic: '🧰', loc: { in: 'в ящике для игрушек', on: 'на ящике для игрушек', under: 'под ящиком для игрушек', behind: 'за ящиком для игрушек' } }
  ];
  const placeEn = (t, f, p) => 'The ' + t.en + ' is ' + p + ' the ' + f.en;
  const placeRu = (t, f, p) => U.cap(t.ru) + ' ' + f.loc[p];
  const myToyRu = w => (w.g === 'f' ? 'моя ' : 'мой ') + w.ru;
  const TOY_PH = withPic(TOY).map(w => ({ en: 'This is my ' + w.en, ru: 'Это ' + myToyRu(w) })).concat([
    { en: 'My favourite toy is the ball', ru: 'Моя любимая игрушка — мяч' }, { en: 'I have got a new doll', ru: 'У меня есть новая кукла' },
    { en: 'Where is my ball?', ru: 'Где мой мяч?' }, { en: 'My ball is under the bed', ru: 'Мой мяч под кроватью' },
    { en: 'Look at my kite', ru: 'Посмотри на моего воздушного змея' }, { en: 'I like my robot', ru: 'Мне нравится мой робот' },
    { en: 'My doll is in the box', ru: 'Моя кукла в коробке' }, { en: 'Put your toys in the box', ru: 'Убери игрушки в коробку' },
    { en: 'It is a big ball', ru: 'Это большой мяч' }, { en: 'I play with my toys', ru: 'Я играю со своими игрушками' },
    { en: 'My teddy bear is brown', ru: 'Мой плюшевый мишка коричневый' }, { en: 'The plane can fly', ru: 'Самолёт умеет летать' },
    { en: 'This is a red car', ru: 'Это красная машинка' }, { en: 'I have got two dolls', ru: 'У меня две куклы' },
    { en: 'Whose ball is this?', ru: 'Чей это мяч?' }
  ]);

  function genToys(level) {
    const whereToy = n => {
      const t = U.pick(withPic(TOY)); const f = U.pick(FURN); const ks = U.pickN(Object.keys(f.loc), n); const p = ks[0];
      return { type: 'choice', prompt: 'Как сказать по-английски: ' + q(placeRu(t, f, p)) + '?', visual: V.big(t.pic + ' ' + f.pic),
        options: U.shuffle(ks.map(k => placeEn(t, f, k))), answer: placeEn(t, f, p), say: placeEn(t, f, p), sayLang: EN,
        hint: 'in — в, on — на, under — под, next to — рядом с, behind — за', explain: placeEn(t, f, p) + ' — ' + placeRu(t, f, p) + '.' };
    };
    const whereRu = n => {
      const t = U.pick(withPic(TOY)); const f = U.pick(FURN); const ks = U.pickN(Object.keys(f.loc), n); const p = ks[0];
      return { type: 'choice', prompt: 'Что значит ' + q(placeEn(t, f, p)) + '?', options: U.shuffle(ks.map(k => placeRu(t, f, k))), answer: placeRu(t, f, p),
        say: placeEn(t, f, p), sayLang: EN, hint: 'Нажми 🔊 и послушай фразу', explain: placeEn(t, f, p) + ' — ' + placeRu(t, f, p) + '.' };
    };
    const prepGap = () => {
      const t = U.pick(withPic(TOY)); const f = U.pick(FURN); const p = U.pick(Object.keys(f.loc));
      return { type: 'gap', prompt: 'Вставь предлог: ' + q(placeRu(t, f, p)), visual: V.big(t.pic + ' ' + f.pic), text: 'The ' + t.en + ' is _ the ' + f.en + '.',
        answers: [p], options: U.opts(p, U.pickN(PREP.filter(x => x.en !== p), 3).map(x => x.en)), say: placeEn(t, f, p), sayLang: EN,
        explain: placeEn(t, f, p) + ' — ' + placeRu(t, f, p) + '.' };
    };
    const myToy = n => {
      const ws = take(withPic(TOY), n); const w = ws[0];
      return { type: 'choice', prompt: 'Скажи про свою игрушку', visual: V.big(w.pic), options: U.shuffle(ws.map(x => 'This is my ' + x.en)), answer: 'This is my ' + w.en,
        say: 'This is my ' + w.en, sayLang: EN, hint: 'По-русски это ' + w.ru, explain: 'This is my ' + w.en + ' — это ' + myToyRu(w) + '.' };
    };
    if (level === 1) return kind([
      () => fPicWord(TOY, 3), () => fListen(TOY, 3, 'pic'), () => fEnRu(TOY, 3, true), () => fMemory(TOY, 3, 'pic'),
      () => fMatch(TOY, 3), () => fMatch(PREP, 3), () => myToy(2), () => myToy(3), () => whereRu(2)
    ]);
    if (level === 2) return kind([
      () => fMatch(TOY, 4), () => fRuEn(TOY, 4), () => fListen(TOY, 4, 'en'), () => fGap(TOY, 1, 3), () => whereToy(3), () => whereRu(3),
      () => prepGap(), () => fEnRu(PREP, 4), () => myToy(4), () => fPhraseRu(TOY_PH, 4), () => fMemory(TOY, 4, 'ru'),
      () => fSort('Разложи: на чём можно кататься, а что летает?', [{ name: 'Катаемся 🛞', pool: TOY.filter(w => w.ride) }, { name: 'Летает 🪁', pool: TOY.filter(w => w.fly) }], 3, 'en')
    ]);
    return kind([
      () => fSpell(TOY, 3), () => fInput(TOY), () => fGap(TOY, 2, 5), () => fOrder(TOY_PH), () => fRuPhrase(TOY_PH, 4),
      () => whereToy(4), () => whereRu(4), () => prepGap(), () => fInput(PREP),
      () => fMulti('Выбери <b>всё, что умеет летать</b>', TOY.filter(w => w.fly), TOY.filter(w => !w.fly), N(2, 3), 3, 'en'),
      () => { const ws = take(withPic(TOY), 5); return { type: 'match', prompt: 'Соедини игрушку и слово', pairs: ws.map(w => [w.pic, w.en]), explain: ws.map(ex).join('; ') + '.' }; },
      () => { const t = U.pick(withPic(TOY.filter(w => w.en !== 'toy box'))); const f = U.pick(FURN); const p = U.pick(Object.keys(f.loc));
        return { type: 'order', prompt: 'Собери фразу: ' + q(placeRu(t, f, p)), items: ['The ' + t.en, 'is', p, 'the ' + f.en], say: placeEn(t, f, p), sayLang: EN,
          hint: 'Сначала — про что говорим, потом is, потом предлог', explain: placeEn(t, f, p) + ' — ' + placeRu(t, f, p) + '.' }; }
    ]);
  }

  // ============================== 10. ТЕЛО ==============================
  const BODY = byTopic('body');
  const GB = { head: 'f', hair: 'p', eyes: 'p', ears: 'p', nose: 'm', mouth: 'm', face: 'n', teeth: 'p', neck: 'f', shoulders: 'p',
    arms: 'p', hands: 'p', fingers: 'p', body: 'n', legs: 'p', knees: 'p', feet: 'p', toes: 'p' };
  const CNT = { head: 'одна голова', eyes: 'два глаза', ears: 'два уха', nose: 'один нос', mouth: 'один рот', face: 'одно лицо',
    neck: 'одна шея', shoulders: 'два плеча', arms: 'две руки', hands: 'две ладони', fingers: 'десять пальцев на руках',
    body: 'одно тело', legs: 'две ноги', knees: 'два колена', feet: 'две ступни', toes: 'десять пальцев на ногах' };
  const myBodyRu = w => (GB[w.en] === 'f' ? 'моя ' : GB[w.en] === 'n' ? 'моё ' : GB[w.en] === 'p' ? 'мои ' : 'мой ') + w.ru;
  /** множественное число в английском (hair — всегда единственное: This is my hair) */
  const ENPL = new Set(['eyes', 'ears', 'teeth', 'shoulders', 'arms', 'hands', 'fingers', 'legs', 'knees', 'feet', 'toes']);
  const thisIs = w => (ENPL.has(w.en) ? 'These are my ' : 'This is my ') + w.en;
  const HEAD_P = BODY.filter(w => w.head && w.en !== 'head');
  const REST_P = BODY.filter(w => !w.head && w.en !== 'body');
  const SENSE = [
    { ru: 'видим', ru1: 'вижу', v: 'see', a: 'eyes', pic: '👀', ins: 'глазами', en: 'I can see with my eyes', bad: ['ears', 'nose', 'hands', 'feet', 'knees'] },
    { ru: 'слышим', ru1: 'слышу', v: 'hear', a: 'ears', pic: '👂', ins: 'ушами', en: 'I can hear with my ears', bad: ['eyes', 'nose', 'legs', 'fingers', 'hair'] },
    { ru: 'нюхаем', ru1: 'нюхаю', v: 'smell', a: 'nose', pic: '👃', ins: 'носом', en: 'I can smell with my nose', bad: ['eyes', 'ears', 'hands', 'feet', 'teeth'] },
    { ru: 'кусаем', ru1: 'кусаю', v: 'bite', a: 'teeth', pic: '🦷', ins: 'зубами', en: 'I can bite with my teeth', bad: ['eyes', 'ears', 'hands', 'feet', 'hair'] },
    { ru: 'хлопаем в ладоши', ru1: 'хлопаю в ладоши', v: 'clap', a: 'hands', pic: '👐', ins: '', en: 'I can clap with my hands', bad: ['eyes', 'ears', 'nose', 'teeth', 'hair'] },
    { ru: 'бегаем', ru1: 'бегаю', v: 'run', a: 'legs', pic: '🦵', ins: 'ногами', en: 'I can run with my legs', bad: ['eyes', 'ears', 'nose', 'teeth', 'hair'] }
  ];
  const senseRu = s => ('Я ' + s.ru1 + ' ' + s.ins).trim();
  const BODY_PH = BODY.map(w => ({ en: thisIs(w), ru: 'Это ' + myBodyRu(w) }))
    .concat(SENSE.map(s => ({ en: s.en, ru: senseRu(s) })))
    .concat([
      { en: 'I have got two eyes', ru: 'У меня два глаза' }, { en: 'I have got blue eyes', ru: 'У меня голубые глаза' },
      { en: 'I have got long hair', ru: 'У меня длинные волосы' }, { en: 'My nose is small', ru: 'Мой нос маленький' },
      { en: 'Touch your nose', ru: 'Потрогай свой нос' }, { en: 'Wash your hands', ru: 'Помой руки' },
      { en: 'Clap your hands', ru: 'Похлопай в ладоши' }, { en: 'Stamp your feet', ru: 'Потопай ногами' },
      { en: 'Open your mouth', ru: 'Открой рот' }, { en: 'Close your eyes', ru: 'Закрой глаза' },
      { en: 'Shake your head', ru: 'Покачай головой' }, { en: 'My hands are clean', ru: 'Мои руки чистые' },
      { en: 'Look at my face', ru: 'Посмотри на моё лицо' }, { en: 'I have got ten fingers', ru: 'У меня десять пальцев' }
    ]);

  function genBody(level) {
    const senseQ = n => {
      const s = U.pick(SENSE);
      return { type: 'choice', prompt: 'Чем мы <b>' + s.ru + '</b>? ' + s.pic, options: U.opts(s.a, U.pickN(s.bad, n - 1)), answer: s.a, say: s.en, sayLang: EN,
        hint: 'Нажми 🔊 и послушай фразу целиком', explain: s.en + ' — ' + senseRu(s) + '.' };
    };
    const howMany = n => {
      const w = U.pick(BODY.filter(x => x.n === 2 || x.n === 10)); const ans = numW(w.n);
      return { type: 'choice', prompt: 'How many <b>' + w.en + '</b> have you got? <i>(' + w.ru + ')</i>', options: U.opts(ans.en, U.pickN(NUM10.filter(x => x.num !== w.n), n - 1).map(x => x.en)),
        answer: ans.en, say: 'How many ' + w.en + '? ' + ans.en + '.', sayLang: EN, hint: 'Посмотри на себя в зеркало и посчитай', explain: 'У человека ' + CNT[w.en] + ' — ' + ans.en + ' ' + w.en + '.' };
    };
    const showMy = n => {
      const ws = take(withPic(BODY), n); const w = ws[0]; const f = thisIs;
      return { type: 'choice', prompt: 'Скажи про себя', visual: V.big(w.pic), options: U.shuffle(ws.map(f)), answer: f(w), say: f(w), sayLang: EN,
        hint: 'По-русски это ' + w.ru, explain: f(w) + ' — это ' + myBodyRu(w) + '.' };
    };
    if (level === 1) return kind([
      () => fPicWord(BODY, 3), () => fListen(BODY, 3, 'pic'), () => fEnRu(BODY, 3, true), () => fMemory(BODY, 3, 'pic'),
      () => fMatch(BODY, 3), () => senseQ(2), () => senseQ(3), () => showMy(2), () => showMy(3)
    ]);
    if (level === 2) return kind([
      () => fMatch(BODY, 4), () => fRuEn(BODY, 4), () => fListen(BODY, 4, 'en'), () => fGap(BODY, 1, 3), () => senseQ(4), () => howMany(3),
      () => howMany(4), () => showMy(4), () => fPhraseRu(BODY_PH, 4), () => fMemory(BODY, 4, 'ru'),
      () => fSort('Разложи: что на голове, а что нет?', [{ name: 'На голове 🙂', pool: HEAD_P }, { name: 'Остальное 🧍', pool: REST_P }], 3, 'en')
    ]);
    return kind([
      () => fSpell(BODY, 3), () => fInput(BODY), () => fGap(BODY, 2, 5), () => fOrder(BODY_PH), () => fRuPhrase(BODY_PH, 4),
      () => senseQ(5), () => howMany(4),
      () => fMulti('Выбери <b>всё, чего у тебя по два</b>', BODY.filter(w => w.n === 2), BODY.filter(w => w.n === 1 || w.n === 10), N(2, 3), 3, 'en'),
      () => fSort('Разложи: что на голове, а что нет?', [{ name: 'На голове 🙂', pool: HEAD_P }, { name: 'Остальное 🧍', pool: REST_P }], 3, 'en'),
      () => { const s = U.pick(SENSE); return { type: 'gap', prompt: 'Вставь слово ' + s.pic, text: 'I can ' + s.v + ' with my _.', answers: [s.a],
        options: U.opts(s.a, U.pickN(s.bad, 3)), say: s.en, sayLang: EN, explain: s.en + ' — ' + senseRu(s) + '.' }; },
      () => { const w = U.pick(BODY.filter(x => x.n === 2 || x.n === 10)); const ans = numW(w.n);
        return { type: 'input', mode: 'num', prompt: 'How many <b>' + w.en + '</b> have you got? <i>(' + w.ru + ')</i> Напиши цифрой', answer: w.n, say: 'How many ' + w.en + '?', sayLang: EN,
          hint: w.en + ' — это ' + w.ru, explain: 'У человека ' + CNT[w.en] + ' — ' + ans.en + '.' }; }
    ]);
  }

  // ============================== 11. ПОГОДА И ВРЕМЕНА ГОДА ==============================
  const WEA = byTopic('weather');
  const SEA = byTopic('season');
  const DAY = byTopic('day');
  const WRU = { sunny: 'Солнечно', hot: 'Жарко', warm: 'Тепло', cold: 'Холодно', windy: 'Ветрено', cloudy: 'Облачно', rainy: 'Дождливо', snowy: 'Снежно' };
  const dayW = d => DAY.find(x => x.d === d);
  const SEA_Q = [
    { q: 'Когда идёт снег и очень холодно?', a: 'winter' }, { q: 'Когда жарко и мы купаемся в море?', a: 'summer' },
    { q: 'Когда листья жёлтые и часто идёт дождь?', a: 'autumn' }, { q: 'Когда тает снег и растут первые цветы?', a: 'spring' },
    { q: 'Когда бывает Новый год?', a: 'winter' }, { q: 'Когда начинаются летние каникулы?', a: 'summer' },
    { q: 'Когда мы идём в школу первого сентября?', a: 'autumn' }, { q: 'Когда прилетают птицы и зеленеет трава?', a: 'spring' }
  ];
  const WEA_PH = WEA.map(w => ({ en: "It's " + w.en, ru: WRU[w.en] })).concat([
    { en: "It's raining", ru: 'Идёт дождь' }, { en: "It's snowing", ru: 'Идёт снег' },
    { en: "What's the weather like today?", ru: 'Какая сегодня погода?' }, { en: 'It is a sunny day', ru: 'Сегодня солнечный день' },
    { en: 'I like summer very much', ru: 'Я очень люблю лето' }, { en: 'It is cold in winter', ru: 'Зимой холодно' },
    { en: 'The sun is hot in summer', ru: 'Летом солнце жаркое' }, { en: 'My favourite season is spring', ru: 'Моё любимое время года — весна' },
    { en: 'We play in the snow', ru: 'Мы играем в снегу' }, { en: 'Spring is warm and sunny', ru: 'Весна тёплая и солнечная' },
    { en: 'Autumn is windy and rainy', ru: 'Осень ветреная и дождливая' }, { en: 'Winter is cold and snowy', ru: 'Зима холодная и снежная' },
    { en: 'Summer is hot and sunny', ru: 'Лето жаркое и солнечное' }, { en: 'Today is Monday', ru: 'Сегодня понедельник' },
    { en: 'I can swim in summer', ru: 'Летом я умею плавать' }, { en: 'Put on your warm coat', ru: 'Надень тёплое пальто' }
  ]);

  function genWeather(level) {
    const weatherQ = n => {
      const ws = take(withPic(WEA), n); const w = ws[0];
      return { type: 'choice', prompt: "What's the weather like? <i>(Какая погода?)</i>", visual: V.big(w.pic), options: U.shuffle(ws.map(x => "It's " + x.en)),
        answer: "It's " + w.en, say: "It's " + w.en, sayLang: EN, hint: w.en + ' — ' + w.ru, explain: "It's " + w.en + ' — ' + WRU[w.en] + '.' };
    };
    const seasonQ = n => {
      const s = U.pick(SEA_Q); const w = SEA.find(x => x.en === s.a);
      return { type: 'choice', prompt: s.q, options: U.opts(s.a, U.pickN(SEA.filter(x => x.en !== s.a), n - 1).map(x => x.en)), answer: s.a, say: s.a, sayLang: EN,
        hint: 'spring — весна, summer — лето, autumn — осень, winter — зима', explain: s.q + ' ' + U.cap(w.ru) + ' — ' + w.en + ' ' + w.pic + '.' };
    };
    const dayNext = n => {
      const after = U.chance(0.5); const i = after ? N(1, 6) : N(2, 7); const d = dayW(i); const ans = dayW(after ? i + 1 : i - 1);
      return { type: 'choice', prompt: 'Какой день идёт <b>' + (after ? 'после' : 'перед') + '</b> <b>' + d.en + '</b>?',
        options: U.opts(ans.en, U.pickN(DAY.filter(x => x.en !== ans.en && x.en !== d.en), n - 1).map(x => x.en)), answer: ans.en, say: ans.en, sayLang: EN,
        hint: d.en + ' — это ' + d.ru, explain: (after ? 'После ' : 'Перед ') + d.en + ' (' + d.ru + ') идёт ' + ans.en + ' (' + ans.ru + ').' };
    };
    const dayOrder = n => {
      const i = N(1, 8 - n); const ws = U.range(i, i + n - 1).map(dayW);
      return { type: 'order', prompt: 'Расставь дни недели по порядку', items: ws.map(x => x.en), say: ws.map(x => x.en).join(', '), sayLang: EN,
        hint: 'Неделя начинается с Monday', explain: ws.map(x => x.en + ' — ' + x.ru).join(', ') + '.' };
    };
    if (level === 1) return kind([
      () => fPicWord(WEA, 3), () => fListen(WEA, 3, 'pic'), () => fEnRu(WEA, 3, true), () => fMemory(WEA, 3, 'pic'),
      () => fPicWord(SEA, 3), () => fMatch(SEA, 4), () => fMatch(WEA, 3), () => weatherQ(2), () => weatherQ(3), () => seasonQ(2)
    ]);
    if (level === 2) return kind([
      () => fMatch(WEA, 4), () => fRuEn(WEA, 4), () => fListen(WEA, 4, 'en'), () => fGap(WEA, 1, 3), () => weatherQ(4), () => seasonQ(3),
      () => seasonQ(4), () => fListen(SEA, 4, 'pic'), () => fMemory(SEA, 4, 'ru'), () => fPhraseRu(WEA_PH, 4),
      () => fSort('Разложи: когда жарко, а когда холодно?', [{ name: 'Hot 🥵', pool: WEA.filter(w => w.temp === 'hot') }, { name: 'Cold 🥶', pool: WEA.filter(w => w.temp === 'cold') }], 3, 'en'),
      () => fMatch(DAY, 4, 'Соедини день недели и перевод')
    ]);
    return kind([
      () => fSpell(WEA, 3), () => fSpell(SEA, 3), () => fInput(WEA), () => fGap(WEA, 2, 5), () => fOrder(WEA_PH), () => fRuPhrase(WEA_PH, 4),
      () => weatherQ(5), () => seasonQ(4), () => dayNext(4), () => dayNext(5), () => dayOrder(4), () => dayOrder(5),
      () => fMatch(DAY, 5, 'Соедини день недели и перевод'),
      () => fSort('Разложи: школьные дни и выходные', [{ name: 'Школьные дни 🎒', pool: DAY.filter(x => x.d <= 5) }, { name: 'Выходные 🎈', pool: DAY.filter(x => x.d >= 6) }], 2, 'en'),
      () => fMulti('Выбери <b>всё, что бывает зимой</b>', WEA.filter(w => w.temp === 'cold'), WEA.filter(w => w.temp === 'hot'), N(2, 3), 3, 'en'),
      () => { const s = U.pick(SEA); const opts = U.opts(s.en, SEA.filter(x => x.en !== s.en).map(x => x.en));
        return { type: 'gap', prompt: 'Вставь время года', visual: V.big(s.pic), text: 'My favourite season is _.', answers: [s.en], options: opts,
          say: 'My favourite season is ' + s.en, sayLang: EN, explain: 'My favourite season is ' + s.en + ' — моё любимое время года ' + s.ru + '.' }; }
    ]);
  }

  // ============================== 12. ОДЕЖДА ==============================
  const CLO = byTopic('clothes');
  const CLO_COLD = CLO.filter(w => w.wear === 'cold'), CLO_HOT = CLO.filter(w => w.wear === 'hot');
  const CLO_FEET = CLO.filter(w => w.part === 'feet'), CLO_HEAD = CLO.filter(w => w.part === 'head');
  const CACC = { jacket: 'куртку', coat: 'пальто', jumper: 'свитер', shorts: 'шорты', hat: 'шляпу', cap: 'кепку', socks: 'носки',
    'T-shirt': 'футболку', jeans: 'джинсы', shoes: 'туфли', skirt: 'юбку', dress: 'платье', boots: 'сапоги', scarf: 'шарф',
    gloves: 'перчатки', trousers: 'брюки', shirt: 'рубашку', sandals: 'сандалии', swimsuit: 'купальник' };
  const cloEn = w => w.g === 'p' ? w.en : art(w.en);
  const wearEn = w => "I'm wearing " + cloEn(w);
  const wearRu = w => 'На мне ' + w.ru;
  const CLO_COL = ['red', 'blue', 'green', 'yellow', 'pink', 'black', 'white', 'brown'];
  const CLO_PH = distinct(CLO).map(w => ({ en: wearEn(w), ru: wearRu(w) }))
    .concat(distinct(CLO).filter(w => w.pic).map(w => { const c = CLO_COL[w.en.length % CLO_COL.length];
      return { en: 'I am wearing ' + (w.g === 'p' ? c + ' ' + w.en : art(c + ' ' + w.en)), ru: 'На мне ' + colRu(c, w.g) + ' ' + w.ru }; }))
    .concat([
      { en: 'Put on your jacket', ru: 'Надень куртку' }, { en: 'Take off your boots', ru: 'Сними сапоги' },
      { en: 'Where are my socks?', ru: 'Где мои носки?' }, { en: 'It is cold today', ru: 'Сегодня холодно' },
      { en: 'I like my new shoes', ru: 'Мне нравятся мои новые туфли' }, { en: 'My dress is pink', ru: 'Моё платье розовое' },
      { en: 'This is my blue hat', ru: 'Это моя синяя шляпа' }, { en: 'These are my gloves', ru: 'Это мои перчатки' },
      { en: 'My scarf is long', ru: 'Мой шарф длинный' }, { en: 'I have got new jeans', ru: 'У меня новые джинсы' },
      { en: 'She is wearing a dress', ru: 'На ней платье' }, { en: 'He is wearing a cap', ru: 'На нём кепка' },
      { en: 'My shoes are black', ru: 'Мои туфли чёрные' }, { en: 'What are you wearing?', ru: 'Что на тебе надето?' }
    ]);

  function genClothes(level) {
    const wearQ = n => {
      const ws = take(withPic(CLO), n); const w = ws[0];
      return { type: 'choice', prompt: 'What are you wearing? <i>(Что на тебе надето?)</i>', visual: V.big(w.pic), options: U.shuffle(ws.map(wearEn)), answer: wearEn(w),
        say: wearEn(w), sayLang: EN, hint: 'По-русски это ' + w.ru, explain: wearEn(w) + ' — ' + wearRu(w) + '.' };
    };
    const forWeather = n => {
      const cold = U.chance(0.5); const yes = cold ? CLO_COLD : CLO_HOT; const no = cold ? CLO_HOT : CLO_COLD;
      const w = U.pick(withPic(yes));
      return { type: 'choice', prompt: cold ? 'На улице <b>холодно</b> 🥶. Что наденешь?' : 'На улице <b>жарко</b> 🥵. Что наденешь?',
        options: U.opts(w.en, take(no, n - 1).map(x => x.en)), answer: w.en, say: w.en, sayLang: EN, hint: w.en + ' — ' + w.ru,
        explain: (cold ? 'Когда холодно, надеваем ' : 'Когда жарко, надеваем ') + w.en + ' — ' + w.ru + ' ' + w.pic + '.' };
    };
    const putOn = () => {
      const w = U.pick(distinct(CLO)); const opts = U.opts(w.en, take(CLO.filter(x => x.en !== w.en), 3).map(x => x.en));
      return { type: 'gap', prompt: 'Вставь слово: ' + q('Надень ' + CACC[w.en]) + (w.pic ? ' ' + w.pic : ''), text: 'Put on your _.', answers: [w.en], options: opts,
        say: 'Put on your ' + w.en, sayLang: EN, explain: 'Put on your ' + w.en + ' — надень ' + CACC[w.en] + '.' };
    };
    const cloSort = () => U.pick([
      () => fSort('Разложи: что надеть в холод, а что в жару?', [{ name: 'Холодно 🥶', pool: CLO_COLD }, { name: 'Жарко 🥵', pool: CLO_HOT }], 3, 'en'),
      () => fSort('Разложи: что надеть в холод, а что в жару?', [{ name: 'Холодно 🥶', pool: CLO_COLD }, { name: 'Жарко 🥵', pool: CLO_HOT }], 3, 'pic'),
      () => fSort('Разложи: что носят на ногах, а что на голове?', [{ name: 'На ногах 🦶', pool: CLO_FEET }, { name: 'На голове 🙂', pool: CLO_HEAD }], 2, 'en')
    ])();
    if (level === 1) return kind([
      () => fPicWord(CLO, 3), () => fListen(CLO, 3, 'pic'), () => fEnRu(CLO, 3, true), () => fMemory(CLO, 3, 'pic'),
      () => fMatch(CLO, 3), () => wearQ(2), () => wearQ(3), () => forWeather(2), () => forWeather(3)
    ]);
    if (level === 2) return kind([
      () => fMatch(CLO, 4), () => fRuEn(CLO, 4), () => fListen(CLO, 4, 'en'), () => fGap(CLO, 1, 3), () => wearQ(4), () => forWeather(4),
      () => putOn(), () => cloSort(), () => fPhraseRu(CLO_PH, 4), () => fMemory(CLO, 4, 'ru')
    ]);
    return kind([
      () => fSpell(CLO, 3), () => fInput(CLO), () => fGap(CLO, 2, 5), () => fOrder(CLO_PH), () => fOrder(CLO_PH), () => fRuPhrase(CLO_PH, 4),
      () => wearQ(5), () => forWeather(5), () => putOn(), () => cloSort(),
      () => fMulti('Выбери <b>всё, что носят на ногах</b>', CLO_FEET, CLO.filter(w => w.part !== 'feet'), N(2, 3), 3, 'en'),
      () => fMulti('Выбери <b>всё, что надевают в холод</b>', CLO_COLD, CLO_HOT, N(2, 3), 3, 'en'),
      () => { const w = U.pick(withPic(CLO)); const c = U.pick(CLO_COL); const en = 'I am wearing ' + (w.g === 'p' ? c + ' ' + w.en : art(c + ' ' + w.en));
        return { type: 'order', prompt: 'Собери фразу: ' + q('На мне ' + colRu(c, w.g) + ' ' + w.ru), items: en.split(' '), say: en, sayLang: EN,
          hint: 'Сначала I am wearing, потом цвет, потом вещь', explain: en + ' — на мне ' + colRu(c, w.g) + ' ' + w.ru + '.' }; }
    ]);
  }

  // ============================== 13. ПОВТОРЕНИЕ ==============================
  const ALL = distinct(WORDS.filter(w => ['family', 'colour', 'home', 'number', 'food', 'animal', 'toy', 'body', 'weather', 'season', 'clothes', 'verb'].includes(w.topic)));
  const ALL_PIC = withPic(ALL);
  const ALL_PH = FOOD_PH.concat(ANIM_PH, TOY_PH, BODY_PH, WEA_PH, CLO_PH, HELLO_PH, FAMILY_PH, COL_PH, HOME_PH, NUM_PH);
  const TOPICS = [
    { name: 'Food 🍎', pool: FOOD }, { name: 'Animals 🐱', pool: ANIM }, { name: 'Clothes 👕', pool: CLO },
    { name: 'Toys 🧸', pool: TOY }, { name: 'Body 👀', pool: BODY }, { name: 'Family 👨‍👩‍👧', pool: FAMILY },
    { name: 'Colours 🎨', pool: COL }, { name: 'Home 🏠', pool: HOME }, { name: 'Weather ☀️', pool: WEA }
  ];

  function genReview(level) {
    const topicSort = (nG, per, mode) => fSort('Разложи слова по темам', U.pickN(TOPICS, nG), per, mode);
    if (level === 1) return kind([
      () => fPicWord(ALL_PIC, 3), () => fListen(ALL_PIC, 3, 'pic'), () => fEnRu(ALL, 3, true), () => fMemory(ALL_PIC, 3, 'pic'),
      () => fMatch(ALL, 3), () => fRuEn(ALL, 3), () => topicSort(2, 2, 'en'), () => fMemory(ALL, 3, 'ru')
    ]);
    if (level === 2) return kind([
      () => fListen(ALL_PIC, 4, 'pic'), () => fMatch(ALL, 5), () => fRuEn(ALL, 4), () => fEnRu(ALL, 4), () => fGap(ALL, 1, 3),
      () => fMemory(ALL, 4, 'ru'), () => fMemory(ALL_PIC, 4, 'pic'), () => topicSort(3, 2, 'en'), () => fPhraseRu(ALL_PH, 4), () => fSpell(ALL, 2)
    ]);
    return kind([
      () => fMemory(ALL, N(5, 6), 'ru'), () => fListen(ALL_PIC, 4, 'pic'), () => fSpell(ALL, 3), () => fSpell(ALL, 3),
      () => topicSort(3, 3, 'en'), () => topicSort(3, 2, 'pic'), () => fMatch(ALL, N(5, 6)), () => fInput(ALL),
      () => fGap(ALL, 2, 5), () => fOrder(ALL_PH), () => fPhraseRu(ALL_PH, 5), () => fRuPhrase(ALL_PH, 5),
      () => fMulti('Выбери <b>всех животных</b>', ANIM, FOOD.concat(CLO), N(2, 3), 3, 'en'),
      () => fMulti('Выбери <b>всю еду</b>', FOOD, ANIM.concat(TOY), N(2, 3), 3, 'en')
    ]);
  }

  // ============================== РЕГИСТРАЦИЯ ==============================
  S.registerSubject({
    id: 'english',
    title: 'Английский',
    emoji: '🔠',
    color: '#8b6cf6',
    desc: 'Слова, фразы и алфавит',
    sections: [
      { title: 'Первые слова', lessons: [
        { id: 'en-alphabet', title: 'Алфавит ABC', emoji: '🔤',
          rule: 'В английском алфавите <b>26 букв</b>: от <b>A</b> [эй] до <b>Z</b> [зед]. У каждой буквы есть большая и маленькая пара: <b>A — a</b>, <b>B — b</b>.<br>' +
                'Гласных всего пять: <b>A, E, I, O, U</b>.',
          gen: genAlphabet },
        { id: 'en-hello', title: 'Hello! Знакомство', emoji: '👋',
          rule: 'Утром говорят <b>Good morning</b>, днём — <b>Good afternoon</b>, вечером — <b>Good evening</b>, перед сном — <b>Good night</b>.<br>' +
                'Знакомимся так: <i>— What\'s your name? — My name is Vika. — Nice to meet you!</i>',
          gen: genHello },
        { id: 'en-numbers', title: 'Numbers 1–10', emoji: '🔢',
          rule: 'Числа по-английски: <b>one, two, three, four, five, six, seven, eight, nine, ten</b>.<br>' +
                'Спрашиваем «сколько?» так: <i>How many apples? — Five apples.</i>',
          gen: genNumbers },
        { id: 'en-colours', title: 'Colours', emoji: '🎨',
          rule: 'Цвет ставим <b>перед</b> предметом: <i>a <b>red</b> apple</i> — красное яблоко.<br>' +
                'Спрашиваем: <i>What colour is it? — It\'s blue.</i> По-британски пишем <b>colour</b> и <b>grey</b>.',
          gen: genColours }
      ]},
      { title: 'Я и мои вещи', lessons: [
        { id: 'en-family', title: 'My family', emoji: '👨‍👩‍👧',
          rule: 'Родные по-английски: <b>mummy</b> — мама, <b>daddy</b> — папа, <b>brother</b> — брат, <b>sister</b> — сестра, <b>grandma</b> — бабушка, <b>grandpa</b> — дедушка.<br>' +
                'Показываем на человека: <i>This is my sister.</i>',
          gen: genFamily },
        { id: 'en-home', title: 'My home', emoji: '🏠',
          rule: 'Комнаты: <b>kitchen</b> — кухня, <b>bedroom</b> — спальня, <b>bathroom</b> — ванная, <b>living room</b> — гостиная, <b>garden</b> — сад.<br>' +
                'Где кто-то находится: <i>Mummy is <b>in the</b> kitchen.</i> Спрашиваем: <i>Where\'s Daddy?</i>',
          gen: genHome },
        { id: 'en-toys', title: 'My toys & in / on / under', emoji: '🧸',
          rule: 'Предлоги места: <b>in</b> — в, <b>on</b> — на, <b>under</b> — под, <b>next to</b> — рядом с, <b>behind</b> — за.<br>' +
                'Говорим так: <i>The ball is <b>under</b> the bed.</i> — Мяч под кроватью.',
          gen: genToys },
        { id: 'en-clothes', title: 'Clothes', emoji: '👕',
          rule: 'Про одежду на себе говорим <b>I\'m wearing…</b>: <i>I\'m wearing a red T-shirt.</i> — На мне красная футболка.<br>' +
                'По-британски штаны — <b>trousers</b>, а <b>jumper</b> — это свитер.',
          gen: genClothes },
        { id: 'en-body', title: 'My body', emoji: '🙂',
          rule: 'Части тела: <b>head</b> — голова, <b>eyes</b> — глаза, <b>ears</b> — уши, <b>nose</b> — нос, <b>hands</b> — ладони, <b>legs</b> — ноги.<br>' +
                'Про одну вещь говорим <i>This is my nose</i>, а про две и больше — <i>These are my eyes</i>.',
          gen: genBody }
      ]},
      { title: 'Мир вокруг', lessons: [
        { id: 'en-food', title: 'Food', emoji: '🍎',
          rule: 'О любимой еде: <i>I like apples</i> — я люблю яблоки, <i>I don\'t like soup</i> — я не люблю суп.<br>' +
                'Вежливая просьба: <i>Can I have a sandwich, please?</i> По-британски печенье — <b>biscuits</b>, картошка фри — <b>chips</b>, конфеты — <b>sweets</b>.',
          gen: genFood },
        { id: 'en-animals', title: 'Animals & I can', emoji: '🐱',
          rule: 'Умение показываем словом <b>can</b>: <i>A bird <b>can</b> fly</i> — птица умеет летать, <i>A fish <b>can\'t</b> run</i> — рыба не умеет бегать.<br>' +
                'Спрашиваем: <i>Can a cat swim? — No, it can\'t.</i>',
          gen: genAnimals },
        { id: 'en-weather', title: 'Weather & seasons', emoji: '☀️',
          rule: 'О погоде говорим <b>It\'s…</b>: <i>What\'s the weather like? — It\'s sunny.</i><br>' +
                'Времена года: <b>spring</b> 🌷, <b>summer</b> 🏖️, <b>autumn</b> 🍂, <b>winter</b> ⛄. Неделя начинается с <b>Monday</b>, а дни недели пишутся с большой буквы.',
          gen: genWeather }
      ]},
      { title: 'Повторение', lessons: [
        { id: 'en-review', title: 'Всё вместе: большая игра', emoji: '🏆',
          rule: 'Здесь встречаются слова из всех уроков: семья, цвета, дом, числа, еда, животные, игрушки, тело, погода и одежда.<br>' +
                'Слушай 🔊, вспоминай перевод и собирай слова из букв.',
          gen: genReview }
      ]}
    ]
  });
})();
