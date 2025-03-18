const positionsByDepartment  ={ 
    "Boshqaruv Apparati": {
    positions: [
      { name: "Gidroelektrostansiya direktori", max: 1 },
      { name: "Bosh muxandis", max: 1 },
      { name: "Direktor o'rinbosari", max: 2 },
      { name: "Bosh xisobchi", max: 1 },
      { name: "Yetakchi iqtisodchi", max: 3 },
    ],
    maxEmployees: 5, // Bo'lim bo'yicha umumiy cheklov
  },
    "Buxgalteriya": {
    positions: [
      { name: "Xisobchi", max: 2 },
      { name: "Material xisobchi", max: 1 },
    ],
    maxEmployees: 3,
  },
    "Inson resurslari bo'limi": {
    maxEmployees: 5, // Bo'lim bo'yicha umumiy cheklov
    positions: [
      { name: "Inson resurslari bo'limi boshlig'i", max: 1 },
      { name: "Inson resurslari bo'yicha menejer", max: 4 },
    ],
  },
    "Yuristkonsul": {
    maxEmployees: 1,
    positions: [{ name: "Yuristkonsul", max: 1 }],
  },
    "Mutaxassislar": {
    maxEmployees: 3,
    positions: [
      { name: "Favqulotda vaziyatlar bo'yicha muhandis", max: 1 },
      { name: "Mexnat muhofazasi va texnika xavfsizligi bo'yicha muhandis", max: 1 },
      { name: "Ish yuritish bo'yicha, Arxivarus", max: 1 },
    ],
  },
    "AKTni joriy etish va axborot xavfsizligi bo'limi": {
    maxEmployees: 3,
    positions: [
      { name: "AKT bo'lim boshlig'i", max: 1 },
      { name: "AKT bo'lim bosh mutaxassisi", max: 2 },
    ],
  },
  "Ishlab chiqarish bo'limi": {
    maxEmployees: 5,
    positions: [
      { name: "Ishlab chiqarish va texnika bo'limi boshlig'i", max: 1 },
      { name: "Ishlab chiqarish va texnika bo'limi muhandisi", max: 4 },
    ],
  },
    "Gidromexanika sexi": {
    maxEmployees: 15,
    positions: [
      { name: "Sex boshlig'i", max: 1 },
      { name: "Usta-mexanik", max: 1 },
      { name: "Jihozlarni ekspluatasiya qilish muhandisi", max: 2 },
      { name: "Ishlab chiqarish uchastkasi ustasi", max: 2 },
      { name: "Gidroagregatlar mashinisti", max: 4 },
      { name: "Gidroturbina jihozlarini ta'mirlash bo'yicha chilangar", max: 2 },
      { name: "Qo'lda payvandlash elektrogazpayvandchisi", max: 2 },
      { name: "Tokar", max: 1 },
    ],
  },
    "Tezkor dispecherlik hizmati bo'limi": {
    maxEmployees: 5,
    positions: [
      { name: "Dispetchirlik (ishlab chiqarish-dispetchirlik xizmati) boshlig'i", max: 1 },
      { name: "Smena boshlig'i", max: 2 },
      { name: "Elektrostansiya smena boshlig'i", max: 2 },
    ],
  },
    "Avtomatika va rele himoyasi bo'limi": {
    maxEmployees: 6,
    positions: [
      { name: "Ishlab chiqarish-texnologik laboratoriyasi boshlig'i", max: 1 },
      { name: "Texnologik jarayonlarning avtomatlashtirilgan boshqaruv tizimi bo'yicha muhandis", max: 2 },
      { name: "Elektroavtomatikasini releli himoyalash xizmati yetakchi muhandisi", max: 1 },
      { name: "Releyli muhofaza bo'yicha muhandis", max: 1 },
      { name: "Nazorat-o'lchov asboblari va avtomatika bo'yicha muhandis", max: 1 },
    ],
  },
  "Elektro sexi": {
    maxEmployees: 10,
    positions: [
      { name: "Sex boshlig'i", max: 1 },
      { name: "Elektr jihozlarini ta'mirlash va ularga xizmat ko'rsatish bo'yicha elektrmontyor", max: 4 },
      { name: "Avtomatlashtirilgan boshqaruv tizimi bo'yicha bosh mutaxasis", max: 2 },
      { name: "Texnologik jarayonlarni avtomatik tarzda boshqarish tizimlari bo'yicha texnik", max: 3 },
    ],
  },
    "Suv omborini xavfsiz eksplatatsiya qilish boshqarmasi": {
    maxEmployees: 5,
    positions: [
      { name: "Bosh muxandis", max: 1 },
      { name: "Bosh muxandis o'rinbosari", max: 1 },
    ],
  },
    "Mutaxassislar suv ombor": {
    maxEmployees: 6,
    positions: [
      { name: "Ishlab chiqarish- texnika bo'lim muxandisi", max: 2 },
      { name: "Elektrostansiya sexi boshlig'i", max: 1 },
      { name: "Xavfsizlik va maxsus ishlari bo'yicha bosh mutaxasis", max: 2 },
      { name: "Ombor mudiri", max: 1 },
    ],
  },
  "To'g'on bo'limi": {
    maxEmployees: 12,
    positions: [
      { name: "Bo'lim boshlig'i", max: 1 },
      { name: "Bosh gidrotexnik (dispecher)", max: 1 },
      { name: "Muxandis gidrotexnik (TB)", max: 1 },
      { name: "Muxandis gidrotexnik", max: 2 },
      { name: "Muxandis gidrotexnik (Dispecher)", max: 1 },
      { name: "Nazorat-o'lchov asboblari nazoratchisi", max: 2 },
      { name: "Usta-elektromexanik", max: 1 },
      { name: "Chilangar-ta'mirlovchi", max: 2 },
      { name: "Navbatchi elektromontyor", max: 1 },
      { name: "Kran mashinisti (kranchi)", max: 1 },
    ],
  },
  "Nazorat o'lchov qurilmalari va suvdan foydalanish bo'limi": {
    maxEmployees: 20,
    positions: [
      { name: "Bo'lim boshlig'i", max: 1 },
      { name: "Muxandis geodezist", max: 2 },
      { name: "Muxandis gidrolog", max: 2 },
      { name: "Muxandis gidrometor", max: 2 },
      { name: "1- toifali muxandis gidrometrolog", max: 2 },
      { name: "2- toifali muxandis gidrometrolog", max: 2 },
      { name: "Texnik", max: 2 },
      { name: "Telemexanika va nazorat o'lchov asboblari va aloqa yetakchi muxadisi", max: 2 },
      { name: "Elektrostatik ishlash operatori", max: 1 },
      { name: "Elektron jixozlari va dastur taminoti bo'yicha muxandis", max: 2 },
      { name: "2- toifali telemexanika va nazorat o'lchov asboblari aloka muxandisi", max: 1 },
      { name: "2 toifali muxandis sesmolog", max: 1 },
      { name: "Aloqa telemexanika va KIA buyicha muxandis", max: 1 },
      { name: "1- toifali geodezist", max: 1 },
      { name: "Texnik gidrotexnik", max: 1 },
      { name: "Gidrotexnik inshoatlarga karovchi", max: 2 },
    ],
  },
  "Inshoatlarni tiklash va nazorat qilish bo'limi": {
    maxEmployees: 10,
    positions: [
      { name: "Gidrotexnik inshootlarni nazorat qiluvchi", max: 3 },
      { name: "Qo'lda payvandlash elektrogazpayvandchi", max: 2 },
      { name: "Ko'kalamzorlashtiruvchi", max: 2 },
      { name: "Gidrotexnik obyektlarga qarovchi", max: 2 },
      { name: "Qurilmalarni tozalovchi", max: 1 },
    ],
  },
  "Texnik xodimlar bo'limi": {
    maxEmployees: 15,
    positions: [
      { name: "Bo'lim boshlig'i", max: 1 },
      { name: "Avtomobil haydovchisi (yengil)", max: 3 },
      { name: "Avtobus haydovchisi", max: 2 },
      { name: "Avtomobil haydovchisi (yuk tashuvchi)", max: 3 },
      { name: "Xizmat xonalar farroshi", max: 3 },
      { name: "Qo'riqchi", max: 2 },
      { name: "Bog'bon", max: 1 },
    ],
  },
    "Andijon-2 gidroelektrstansiyasi": {
    maxEmployees: 5,
    positions: [
      { name: "Ekspluatasiya (GES) boshlig'i", max: 1 },
      { name: "Elektrostansiya smena boshlig'i", max: 2 },
      { name: "Elektrostansiya sexi smena boshlig'i", max: 2 },
    ],
  },
    "Kudash gidroelektrstansiyasi": {
    maxEmployees: 4,
    positions: [
      { name: "Ekspluatasiya (GES) boshlig'i", max: 1 },
      { name: "Elektrostansiya smena boshlig'i", max: 2 },
      { name: "Gidroagregat mashinisti", max: 1 },
      { name: "Texnik - gidrotexnik", max: 1 },
    ],
  },
  "Xonobod mikro gidroelektrstansiyasi": {
    maxEmployees: 1,
    positions: [{ name: "Elektrostansiya smena boshlig'i", max: 1 }],
  },
    "Xizmat ko'rsatuvchi hodimlar bo'limi": {
    maxEmployees: 12,
    positions: [
      { name: "Mexanik", max: 1 },
      { name: "Ombor (markaziy ombor) mudiri", max: 1 },
      { name: "Avtobus xaydovchisi", max: 2 },
      { name: "Avtomobil xaydovchisi (yuk tashuvchi)", max: 3 },
      { name: "Avtomobil xaydovchisi (yengil)", max: 3 },
      { name: "Traktorchi", max: 1 },
      { name: "Qoravul", max: 2 },
      { name: "Tibbiyot xamshirasi", max: 1 },
      { name: "Ishlab chiqarish farroshi", max: 2 },
      { name: "Xizmat xonalar farroshi", max: 3 },
      { name: "Bog'bon", max: 2 },
    ],
  }
};
module.exports = positionsByDepartment;